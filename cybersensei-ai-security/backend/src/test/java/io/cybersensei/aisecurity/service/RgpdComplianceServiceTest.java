package io.cybersensei.aisecurity.service;

import io.cybersensei.aisecurity.domain.entity.PromptEvent;
import io.cybersensei.aisecurity.domain.entity.RetentionPolicy;
import io.cybersensei.aisecurity.domain.entity.RgpdAuditLog;
import io.cybersensei.aisecurity.domain.entity.RiskDetection;
import io.cybersensei.aisecurity.domain.enums.AiTool;
import io.cybersensei.aisecurity.domain.enums.RiskLevel;
import io.cybersensei.aisecurity.domain.enums.SensitiveDataCategory;
import io.cybersensei.aisecurity.domain.repository.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("RgpdComplianceService")
class RgpdComplianceServiceTest {

    @Mock
    private PromptEventRepository promptEventRepository;

    @Mock
    private RiskDetectionRepository riskDetectionRepository;

    @Mock
    private AlertRepository alertRepository;

    @Mock
    private RetentionPolicyRepository retentionPolicyRepository;

    @Mock
    private RgpdAuditLogRepository auditLogRepository;

    @InjectMocks
    private RgpdComplianceService service;

    private PromptEvent buildEvent(Long id, Long userId) {
        return PromptEvent.builder()
                .id(id)
                .companyId(1L)
                .userId(userId)
                .promptHash("hash-" + id)
                .promptLength(50)
                .aiTool(AiTool.CHATGPT)
                .riskScore(30)
                .riskLevel(RiskLevel.LOW)
                .wasSanitized(false)
                .wasBlocked(false)
                .userAcceptedRisk(false)
                .containsArticle9(false)
                .createdAt(LocalDateTime.of(2025, 6, 15, 10, 0))
                .build();
    }

    private RiskDetection buildDetection(Long id, PromptEvent event) {
        return RiskDetection.builder()
                .id(id)
                .promptEvent(event)
                .category(SensitiveDataCategory.PERSONAL_DATA)
                .confidence(80)
                .detectionMethod("regex")
                .matchedPattern("email")
                .dataSnippetRedacted("te****om")
                .build();
    }

    // ── accessUserData ──

    @Nested
    @DisplayName("accessUserData (Art. 15)")
    class AccessUserData {

        @Test
        @DisplayName("should return user data map with events")
        void shouldReturnUserDataWithEvents() {
            // Arrange
            Long userId = 42L;
            PromptEvent event = buildEvent(1L, userId);
            when(promptEventRepository.findByUserIdOrderByCreatedAtDesc(userId))
                    .thenReturn(List.of(event));
            when(riskDetectionRepository.findByPromptEventId(1L))
                    .thenReturn(List.of(buildDetection(1L, event)));
            when(auditLogRepository.save(any(RgpdAuditLog.class))).thenReturn(new RgpdAuditLog());

            // Act
            Map<String, Object> result = service.accessUserData(userId, 0L, 1L);

            // Assert
            assertThat(result).containsKey("user_id");
            assertThat(result.get("user_id")).isEqualTo(userId);
            assertThat(result).containsKey("total_events");
            assertThat(result.get("total_events")).isEqualTo(1);
            assertThat(result).containsKey("events");
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> events = (List<Map<String, Object>>) result.get("events");
            assertThat(events).hasSize(1);
            assertThat(events.get(0).get("event_id")).isEqualTo(1L);
        }

        @Test
        @DisplayName("should log ACCESS audit entry")
        void shouldLogAccessAuditEntry() {
            // Arrange
            when(promptEventRepository.findByUserIdOrderByCreatedAtDesc(42L))
                    .thenReturn(List.of());
            when(auditLogRepository.save(any(RgpdAuditLog.class))).thenReturn(new RgpdAuditLog());

            // Act
            service.accessUserData(42L, 0L, 1L);

            // Assert
            ArgumentCaptor<RgpdAuditLog> captor = ArgumentCaptor.forClass(RgpdAuditLog.class);
            verify(auditLogRepository).save(captor.capture());
            assertThat(captor.getValue().getOperation()).isEqualTo("ACCESS");
            assertThat(captor.getValue().getTargetUserId()).isEqualTo(42L);
        }
    }

    // ── eraseUserData ──

    @Nested
    @DisplayName("eraseUserData (Art. 17)")
    class EraseUserData {

        @Test
        @DisplayName("should delete detections, alerts, events in cascade order")
        void shouldDeleteInCascadeOrder() {
            // Arrange
            Long userId = 42L;
            when(promptEventRepository.countByUserId(userId)).thenReturn(3L);
            when(auditLogRepository.save(any(RgpdAuditLog.class))).thenReturn(new RgpdAuditLog());

            // Act
            Map<String, Object> result = service.eraseUserData(userId, 0L, 1L);

            // Assert — verify cascade deletion order
            var inOrder = inOrder(riskDetectionRepository, alertRepository, promptEventRepository);
            inOrder.verify(riskDetectionRepository).deleteByPromptEventUserId(userId);
            inOrder.verify(alertRepository).deleteByUserId(userId);
            inOrder.verify(promptEventRepository).deleteByUserId(userId);

            assertThat(result.get("events_deleted")).isEqualTo(3L);
            assertThat(result.get("status")).isEqualTo("COMPLETED");
        }

        @Test
        @DisplayName("should log ERASURE audit entry")
        void shouldLogErasureAuditEntry() {
            // Arrange
            when(promptEventRepository.countByUserId(42L)).thenReturn(1L);
            when(auditLogRepository.save(any(RgpdAuditLog.class))).thenReturn(new RgpdAuditLog());

            // Act
            service.eraseUserData(42L, 0L, 1L);

            // Assert
            ArgumentCaptor<RgpdAuditLog> captor = ArgumentCaptor.forClass(RgpdAuditLog.class);
            verify(auditLogRepository).save(captor.capture());
            assertThat(captor.getValue().getOperation()).isEqualTo("ERASURE");
        }
    }

    // ── exportUserData ──

    @Nested
    @DisplayName("exportUserData (Art. 20)")
    class ExportUserData {

        @Test
        @DisplayName("should include portability metadata")
        void shouldIncludePortabilityMetadata() {
            // Arrange
            when(promptEventRepository.findByUserIdOrderByCreatedAtDesc(42L))
                    .thenReturn(List.of());
            when(auditLogRepository.save(any(RgpdAuditLog.class))).thenReturn(new RgpdAuditLog());

            // Act
            Map<String, Object> result = service.exportUserData(42L, 0L, 1L);

            // Assert
            assertThat(result.get("export_format")).isEqualTo("JSON");
            assertThat(result.get("data_controller")).isEqualTo("CyberSensei AI Security");
        }

        @Test
        @DisplayName("should log both ACCESS and EXPORT audit entries")
        void shouldLogAccessAndExportAuditEntries() {
            // Arrange
            when(promptEventRepository.findByUserIdOrderByCreatedAtDesc(42L))
                    .thenReturn(List.of());
            when(auditLogRepository.save(any(RgpdAuditLog.class))).thenReturn(new RgpdAuditLog());

            // Act
            service.exportUserData(42L, 0L, 1L);

            // Assert — exportUserData calls accessUserData (ACCESS) then logs EXPORT
            ArgumentCaptor<RgpdAuditLog> captor = ArgumentCaptor.forClass(RgpdAuditLog.class);
            verify(auditLogRepository, times(2)).save(captor.capture());

            List<String> operations = captor.getAllValues().stream()
                    .map(RgpdAuditLog::getOperation)
                    .toList();
            assertThat(operations).containsExactly("ACCESS", "EXPORT");
        }
    }

    // ── getProcessingRegistry ──

    @Nested
    @DisplayName("getProcessingRegistry (Art. 30)")
    class GetProcessingRegistry {

        @Test
        @DisplayName("should return registry with correct structure")
        void shouldReturnRegistryWithCorrectStructure() {
            // Arrange
            when(retentionPolicyRepository.findByCompanyIdAndIsActiveTrue(1L))
                    .thenReturn(Optional.empty());

            // Act
            Map<String, Object> registry = service.getProcessingRegistry(1L);

            // Assert
            assertThat(registry).containsKeys(
                    "treatment_name", "data_controller", "data_processor",
                    "purpose", "legal_basis", "data_categories",
                    "retention_policy", "security_measures", "generated_at"
            );
        }

        @Test
        @DisplayName("should use default retention when no policy exists")
        void shouldUseDefaultRetentionWhenNoPolicyExists() {
            // Arrange
            when(retentionPolicyRepository.findByCompanyIdAndIsActiveTrue(1L))
                    .thenReturn(Optional.empty());

            // Act
            Map<String, Object> registry = service.getProcessingRegistry(1L);

            // Assert
            @SuppressWarnings("unchecked")
            Map<String, Object> retention = (Map<String, Object>) registry.get("retention_policy");
            assertThat(retention.get("standard_events")).isEqualTo("90 jours");
            assertThat(retention.get("article9_events")).isEqualTo("30 jours");
        }

        @Test
        @DisplayName("should use custom retention when policy exists")
        void shouldUseCustomRetentionWhenPolicyExists() {
            // Arrange
            RetentionPolicy policy = RetentionPolicy.builder()
                    .companyId(1L)
                    .policyName("default")
                    .retentionDays(60)
                    .article9RetentionDays(15)
                    .build();
            when(retentionPolicyRepository.findByCompanyIdAndIsActiveTrue(1L))
                    .thenReturn(Optional.of(policy));

            // Act
            Map<String, Object> registry = service.getProcessingRegistry(1L);

            // Assert
            @SuppressWarnings("unchecked")
            Map<String, Object> retention = (Map<String, Object>) registry.get("retention_policy");
            assertThat(retention.get("standard_events")).isEqualTo("60 jours");
            assertThat(retention.get("article9_events")).isEqualTo("15 jours");
        }
    }

    // ── upsertRetentionPolicy ──

    @Nested
    @DisplayName("upsertRetentionPolicy")
    class UpsertRetentionPolicy {

        @Test
        @DisplayName("should create new policy when none exists")
        void shouldCreateNewPolicyWhenNoneExists() {
            // Arrange
            when(retentionPolicyRepository.findByCompanyIdAndPolicyName(1L, "default"))
                    .thenReturn(Optional.empty());
            when(retentionPolicyRepository.save(any(RetentionPolicy.class)))
                    .thenAnswer(inv -> inv.getArgument(0));

            // Act
            RetentionPolicy result = service.upsertRetentionPolicy(1L, 60, 15);

            // Assert
            assertThat(result.getCompanyId()).isEqualTo(1L);
            assertThat(result.getPolicyName()).isEqualTo("default");
            assertThat(result.getRetentionDays()).isEqualTo(60);
            assertThat(result.getArticle9RetentionDays()).isEqualTo(15);
        }

        @Test
        @DisplayName("should update existing policy")
        void shouldUpdateExistingPolicy() {
            // Arrange
            RetentionPolicy existing = RetentionPolicy.builder()
                    .id(1L)
                    .companyId(1L)
                    .policyName("default")
                    .retentionDays(90)
                    .article9RetentionDays(30)
                    .build();
            when(retentionPolicyRepository.findByCompanyIdAndPolicyName(1L, "default"))
                    .thenReturn(Optional.of(existing));
            when(retentionPolicyRepository.save(any(RetentionPolicy.class)))
                    .thenAnswer(inv -> inv.getArgument(0));

            // Act
            RetentionPolicy result = service.upsertRetentionPolicy(1L, 120, 45);

            // Assert
            assertThat(result.getId()).isEqualTo(1L);
            assertThat(result.getRetentionDays()).isEqualTo(120);
            assertThat(result.getArticle9RetentionDays()).isEqualTo(45);
        }
    }

    // ── getAuditLog ──

    @Nested
    @DisplayName("getAuditLog")
    class GetAuditLog {

        @Test
        @DisplayName("should return formatted audit entries")
        void shouldReturnFormattedAuditEntries() {
            // Arrange
            RgpdAuditLog entry = RgpdAuditLog.builder()
                    .id(1L)
                    .requestedByUserId(0L)
                    .targetUserId(42L)
                    .companyId(1L)
                    .operation("ACCESS")
                    .details("Test access")
                    .status("COMPLETED")
                    .createdAt(LocalDateTime.of(2025, 6, 15, 10, 0))
                    .build();
            when(auditLogRepository.findByCompanyIdOrderByCreatedAtDesc(1L))
                    .thenReturn(List.of(entry));

            // Act
            List<Map<String, Object>> result = service.getAuditLog(1L);

            // Assert
            assertThat(result).hasSize(1);
            Map<String, Object> first = result.get(0);
            assertThat(first.get("id")).isEqualTo(1L);
            assertThat(first.get("operation")).isEqualTo("ACCESS");
            assertThat(first.get("requested_by")).isEqualTo(0L);
            assertThat(first.get("target_user")).isEqualTo(42L);
            assertThat(first.get("details")).isEqualTo("Test access");
            assertThat(first.get("status")).isEqualTo("COMPLETED");
            assertThat(first.get("timestamp")).isEqualTo("2025-06-15T10:00");
        }
    }
}
