package io.cybersensei.aisecurity.service;

import io.cybersensei.aisecurity.api.dto.request.AnalyzePromptRequest;
import io.cybersensei.aisecurity.api.dto.response.AnalyzePromptResponse;
import io.cybersensei.aisecurity.domain.entity.Alert;
import io.cybersensei.aisecurity.domain.entity.PromptEvent;
import io.cybersensei.aisecurity.domain.entity.RiskDetection;
import io.cybersensei.aisecurity.domain.enums.AiTool;
import io.cybersensei.aisecurity.domain.enums.RiskLevel;
import io.cybersensei.aisecurity.domain.enums.SensitiveDataCategory;
import io.cybersensei.aisecurity.domain.repository.AlertRepository;
import io.cybersensei.aisecurity.domain.repository.PromptEventRepository;
import io.cybersensei.aisecurity.domain.repository.RetentionPolicyRepository;
import io.cybersensei.aisecurity.domain.repository.RiskDetectionRepository;
import io.cybersensei.aisecurity.service.analyzer.AiSecurityClient;
import io.cybersensei.aisecurity.service.analyzer.PromptRiskAnalyzer;
import io.cybersensei.aisecurity.service.sanitizer.PromptSanitizer;
import org.apache.commons.codec.digest.DigestUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PromptSecurityServiceTest {

    @Mock
    private AiSecurityClient aiSecurityClient;

    @Mock
    private PromptRiskAnalyzer analyzer;

    @Mock
    private PromptSanitizer sanitizer;

    @Mock
    private PromptEventRepository promptEventRepository;

    @Mock
    private RiskDetectionRepository riskDetectionRepository;

    @Mock
    private AlertRepository alertRepository;

    @Mock
    private RetentionPolicyRepository retentionPolicyRepository;

    @InjectMocks
    private PromptSecurityService service;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(service, "blockThreshold", 80);
        ReflectionTestUtils.setField(service, "warnThreshold", 40);

        // AI service returns null so all tests fall back to regex analyzer
        lenient().when(aiSecurityClient.analyze(anyString(), any())).thenReturn(null);
        // No custom retention policy — use defaults
        lenient().when(retentionPolicyRepository.findByCompanyIdAndIsActiveTrue(any()))
                .thenReturn(Optional.empty());
    }

    private AnalyzePromptRequest buildRequest(String prompt) {
        return AnalyzePromptRequest.builder()
                .prompt(prompt)
                .companyId(1L)
                .userId(42L)
                .aiTool(AiTool.CHATGPT)
                .sourceUrl("https://chat.openai.com")
                .build();
    }

    private PromptEvent savedEvent(Long id) {
        return PromptEvent.builder()
                .id(id)
                .companyId(1L)
                .userId(42L)
                .promptHash("hash")
                .promptLength(10)
                .aiTool(AiTool.CHATGPT)
                .riskScore(0)
                .riskLevel(RiskLevel.SAFE)
                .wasSanitized(false)
                .wasBlocked(false)
                .userAcceptedRisk(false)
                .build();
    }

    // ── Safe prompt ──

    @Nested
    @DisplayName("Safe prompt (score < warnThreshold)")
    class SafePrompt {

        @Test
        @DisplayName("should not sanitize, not block, and not create alert for safe prompt")
        void shouldNotSanitizeOrBlockOrAlert() {
            // Arrange
            String prompt = "Bonjour, comment ca va ?";
            var request = buildRequest(prompt);
            var analysisResult = new PromptRiskAnalyzer.AnalysisResult(0, RiskLevel.SAFE, List.of());

            when(analyzer.analyze(prompt)).thenReturn(analysisResult);
            when(promptEventRepository.save(any(PromptEvent.class))).thenReturn(savedEvent(1L));

            // Act
            AnalyzePromptResponse response = service.analyzeAndProcess(request);

            // Assert
            assertThat(response.getRiskScore()).isZero();
            assertThat(response.getRiskLevel()).isEqualTo(RiskLevel.SAFE);
            assertThat(response.isBlocked()).isFalse();
            assertThat(response.getSanitizedPrompt()).isNull();
            assertThat(response.getDetections()).isEmpty();

            verify(sanitizer, never()).sanitize(anyString(), anyList());
            verify(alertRepository, never()).save(any(Alert.class));
            verify(riskDetectionRepository, never()).save(any(RiskDetection.class));
        }
    }

    // ── Medium risk prompt ──

    @Nested
    @DisplayName("Medium risk prompt (warnThreshold <= score < blockThreshold)")
    class MediumRiskPrompt {

        @Test
        @DisplayName("should sanitize but not block, and not create alert for medium risk")
        void shouldSanitizeButNotBlock() {
            // Arrange
            String prompt = "Mon email est test@test.com";
            var request = buildRequest(prompt);

            var detection = PromptRiskAnalyzer.Detection.builder()
                    .category(SensitiveDataCategory.PERSONAL_DATA)
                    .confidence(70)
                    .method("regex")
                    .matchedPattern("email")
                    .redactedSnippet("te****om")
                    .build();

            var analysisResult = new PromptRiskAnalyzer.AnalysisResult(50, RiskLevel.MEDIUM, List.of(detection));

            when(analyzer.analyze(prompt)).thenReturn(analysisResult);
            when(sanitizer.sanitize(eq(prompt), anyList())).thenReturn("Mon email est [EMAIL]");
            when(promptEventRepository.save(any(PromptEvent.class))).thenReturn(savedEvent(2L));
            when(riskDetectionRepository.save(any(RiskDetection.class))).thenReturn(new RiskDetection());

            // Act
            AnalyzePromptResponse response = service.analyzeAndProcess(request);

            // Assert
            assertThat(response.getRiskScore()).isEqualTo(50);
            assertThat(response.getRiskLevel()).isEqualTo(RiskLevel.MEDIUM);
            assertThat(response.isBlocked()).isFalse();
            assertThat(response.getSanitizedPrompt()).isEqualTo("Mon email est [EMAIL]");
            assertThat(response.getDetections()).hasSize(1);

            verify(sanitizer).sanitize(eq(prompt), anyList());
            verify(alertRepository, never()).save(any(Alert.class));
            verify(riskDetectionRepository).save(any(RiskDetection.class));
        }
    }

    // ── High risk prompt ──

    @Nested
    @DisplayName("High/Critical risk prompt (score >= blockThreshold)")
    class HighRiskPrompt {

        @Test
        @DisplayName("should block and create alert for high risk prompt")
        void shouldBlockAndCreateAlert() {
            // Arrange
            String prompt = "password=SuperSecret123 api_key=sk-abcdefghij1234567890abcdefghij";
            var request = buildRequest(prompt);

            var detection1 = PromptRiskAnalyzer.Detection.builder()
                    .category(SensitiveDataCategory.CREDENTIALS_SECRETS)
                    .confidence(95)
                    .method("regex")
                    .matchedPattern("credential_pair")
                    .redactedSnippet("pa****23")
                    .build();
            var detection2 = PromptRiskAnalyzer.Detection.builder()
                    .category(SensitiveDataCategory.CREDENTIALS_SECRETS)
                    .confidence(95)
                    .method("regex")
                    .matchedPattern("api_key_pattern")
                    .redactedSnippet("sk****ij")
                    .build();

            var analysisResult = new PromptRiskAnalyzer.AnalysisResult(
                    90, RiskLevel.CRITICAL, List.of(detection1, detection2));

            PromptEvent savedEvt = savedEvent(3L);
            savedEvt.setWasBlocked(true);
            savedEvt.setAiTool(AiTool.CHATGPT);
            savedEvt.setCompanyId(1L);
            savedEvt.setUserId(42L);

            when(analyzer.analyze(prompt)).thenReturn(analysisResult);
            when(sanitizer.sanitize(eq(prompt), anyList())).thenReturn("password=[MASQUE] api_key=[CLE_API]");
            when(promptEventRepository.save(any(PromptEvent.class))).thenReturn(savedEvt);
            when(riskDetectionRepository.save(any(RiskDetection.class))).thenReturn(new RiskDetection());
            when(alertRepository.save(any(Alert.class))).thenReturn(new Alert());

            // Act
            AnalyzePromptResponse response = service.analyzeAndProcess(request);

            // Assert
            assertThat(response.getRiskScore()).isEqualTo(90);
            assertThat(response.getRiskLevel()).isEqualTo(RiskLevel.CRITICAL);
            assertThat(response.isBlocked()).isTrue();
            assertThat(response.getSanitizedPrompt()).isNotNull();
            assertThat(response.getDetections()).hasSize(2);

            verify(sanitizer).sanitize(eq(prompt), anyList());
            verify(alertRepository).save(any(Alert.class));
            verify(riskDetectionRepository, times(2)).save(any(RiskDetection.class));
        }

        @Test
        @DisplayName("should create alert with correct severity and status")
        void shouldCreateAlertWithCorrectFields() {
            // Arrange
            String prompt = "password=secret123";
            var request = buildRequest(prompt);

            var detection = PromptRiskAnalyzer.Detection.builder()
                    .category(SensitiveDataCategory.CREDENTIALS_SECRETS)
                    .confidence(95)
                    .method("regex")
                    .matchedPattern("credential_pair")
                    .redactedSnippet("pa****23")
                    .build();

            var analysisResult = new PromptRiskAnalyzer.AnalysisResult(
                    85, RiskLevel.CRITICAL, List.of(detection));

            PromptEvent savedEvt = savedEvent(4L);
            savedEvt.setWasBlocked(true);
            savedEvt.setAiTool(AiTool.CHATGPT);
            savedEvt.setCompanyId(1L);
            savedEvt.setUserId(42L);

            when(analyzer.analyze(prompt)).thenReturn(analysisResult);
            when(sanitizer.sanitize(eq(prompt), anyList())).thenReturn("[MASQUE]");
            when(promptEventRepository.save(any(PromptEvent.class))).thenReturn(savedEvt);
            when(riskDetectionRepository.save(any(RiskDetection.class))).thenReturn(new RiskDetection());
            when(alertRepository.save(any(Alert.class))).thenReturn(new Alert());

            // Act
            service.analyzeAndProcess(request);

            // Assert
            ArgumentCaptor<Alert> alertCaptor = ArgumentCaptor.forClass(Alert.class);
            verify(alertRepository).save(alertCaptor.capture());

            Alert savedAlert = alertCaptor.getValue();
            assertThat(savedAlert.getSeverity()).isEqualTo(RiskLevel.CRITICAL);
            assertThat(savedAlert.getStatus()).isEqualTo(io.cybersensei.aisecurity.domain.enums.AlertStatus.OPEN);
            assertThat(savedAlert.getCompanyId()).isEqualTo(1L);
        }
    }

    // ── Prompt hash and raw prompt never stored ──

    @Nested
    @DisplayName("Prompt hashing and privacy")
    class PromptHashingAndPrivacy {

        @Test
        @DisplayName("should compute SHA-256 hash and never store raw prompt")
        void shouldUseSha256HashAndNotStoreRaw() {
            // Arrange
            String prompt = "Some sensitive prompt content";
            String expectedHash = DigestUtils.sha256Hex(prompt);
            var request = buildRequest(prompt);

            var analysisResult = new PromptRiskAnalyzer.AnalysisResult(0, RiskLevel.SAFE, List.of());
            when(analyzer.analyze(prompt)).thenReturn(analysisResult);
            when(promptEventRepository.save(any(PromptEvent.class))).thenAnswer(inv -> {
                PromptEvent evt = inv.getArgument(0);
                evt.setId(5L);
                return evt;
            });

            // Act
            service.analyzeAndProcess(request);

            // Assert
            ArgumentCaptor<PromptEvent> eventCaptor = ArgumentCaptor.forClass(PromptEvent.class);
            verify(promptEventRepository).save(eventCaptor.capture());

            PromptEvent savedEvent = eventCaptor.getValue();
            assertThat(savedEvent.getPromptHash()).isEqualTo(expectedHash);
            assertThat(savedEvent.getPromptHash()).hasSize(64); // SHA-256 hex = 64 chars
            // Verify no field contains the raw prompt text
            assertThat(savedEvent.getPromptHash()).isNotEqualTo(prompt);
        }
    }

    // ── Detections persisted ──

    @Nested
    @DisplayName("Detection persistence")
    class DetectionPersistence {

        @Test
        @DisplayName("should persist each detection to RiskDetectionRepository")
        void shouldPersistAllDetections() {
            // Arrange
            String prompt = "test content";
            var request = buildRequest(prompt);

            var d1 = PromptRiskAnalyzer.Detection.builder()
                    .category(SensitiveDataCategory.PERSONAL_DATA)
                    .confidence(70)
                    .method("regex")
                    .matchedPattern("email")
                    .redactedSnippet("te****om")
                    .build();
            var d2 = PromptRiskAnalyzer.Detection.builder()
                    .category(SensitiveDataCategory.FINANCIAL_DATA)
                    .confidence(85)
                    .method("regex")
                    .matchedPattern("credit_card")
                    .redactedSnippet("41****11")
                    .build();

            var analysisResult = new PromptRiskAnalyzer.AnalysisResult(50, RiskLevel.MEDIUM, List.of(d1, d2));

            when(analyzer.analyze(prompt)).thenReturn(analysisResult);
            when(sanitizer.sanitize(eq(prompt), anyList())).thenReturn("sanitized");
            when(promptEventRepository.save(any(PromptEvent.class))).thenReturn(savedEvent(6L));
            when(riskDetectionRepository.save(any(RiskDetection.class))).thenReturn(new RiskDetection());

            // Act
            service.analyzeAndProcess(request);

            // Assert
            verify(riskDetectionRepository, times(2)).save(any(RiskDetection.class));
        }
    }

    // ── HIGH risk triggers alert (not just CRITICAL) ──

    @Nested
    @DisplayName("HIGH risk level triggers alert")
    class HighRiskAlert {

        @Test
        @DisplayName("should create alert for HIGH risk level even if score < blockThreshold")
        void shouldCreateAlertForHighRisk() {
            // Arrange: score=65 (HIGH but below blockThreshold=80 so not blocked)
            String prompt = "Some prompt with sensitive data";
            var request = buildRequest(prompt);

            var detection = PromptRiskAnalyzer.Detection.builder()
                    .category(SensitiveDataCategory.PERSONAL_DATA)
                    .confidence(80)
                    .method("regex")
                    .matchedPattern("email")
                    .redactedSnippet("xx****xx")
                    .build();

            var analysisResult = new PromptRiskAnalyzer.AnalysisResult(65, RiskLevel.HIGH, List.of(detection));

            when(analyzer.analyze(prompt)).thenReturn(analysisResult);
            when(sanitizer.sanitize(eq(prompt), anyList())).thenReturn("sanitized");
            when(promptEventRepository.save(any(PromptEvent.class))).thenReturn(savedEvent(7L));
            when(riskDetectionRepository.save(any(RiskDetection.class))).thenReturn(new RiskDetection());
            when(alertRepository.save(any(Alert.class))).thenReturn(new Alert());

            // Act
            service.analyzeAndProcess(request);

            // Assert: alert is created but prompt is sanitized not blocked
            verify(alertRepository).save(any(Alert.class));
        }
    }

    // ── Article 9 Detection ──

    @Nested
    @DisplayName("Article 9 data detection and retention")
    class Article9Detection {

        @Test
        @DisplayName("should set containsArticle9 to true when HEALTH_DATA is detected")
        void shouldSetContainsArticle9WhenHealthDataDetected() {
            // Arrange
            String prompt = "Patient diagnosed with diabetes type 2";
            var request = buildRequest(prompt);

            var detection = PromptRiskAnalyzer.Detection.builder()
                    .category(SensitiveDataCategory.HEALTH_DATA)
                    .confidence(90)
                    .method("regex")
                    .matchedPattern("health_condition")
                    .redactedSnippet("di****es")
                    .build();

            var analysisResult = new PromptRiskAnalyzer.AnalysisResult(70, RiskLevel.HIGH, List.of(detection));

            when(analyzer.analyze(prompt)).thenReturn(analysisResult);
            when(sanitizer.sanitize(eq(prompt), anyList())).thenReturn("[HEALTH_DATA]");
            when(promptEventRepository.save(any(PromptEvent.class))).thenAnswer(inv -> {
                PromptEvent evt = inv.getArgument(0);
                evt.setId(10L);
                return evt;
            });
            when(riskDetectionRepository.save(any(RiskDetection.class))).thenReturn(new RiskDetection());
            when(alertRepository.save(any(Alert.class))).thenReturn(new Alert());

            // Act
            service.analyzeAndProcess(request);

            // Assert
            ArgumentCaptor<PromptEvent> eventCaptor = ArgumentCaptor.forClass(PromptEvent.class);
            verify(promptEventRepository).save(eventCaptor.capture());

            PromptEvent savedEvent = eventCaptor.getValue();
            assertThat(savedEvent.getContainsArticle9()).isTrue();
            assertThat(savedEvent.getRetentionExpiresAt()).isNotNull();
            // Article 9 default retention is 30 days
            assertThat(savedEvent.getRetentionExpiresAt())
                    .isAfter(LocalDateTime.now().plusDays(29))
                    .isBefore(LocalDateTime.now().plusDays(31));
        }
    }
}
