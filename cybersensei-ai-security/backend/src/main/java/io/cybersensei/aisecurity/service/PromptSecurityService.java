package io.cybersensei.aisecurity.service;

import io.cybersensei.aisecurity.api.dto.request.AnalyzePromptRequest;
import io.cybersensei.aisecurity.api.dto.response.AnalyzePromptResponse;
import io.cybersensei.aisecurity.domain.entity.Alert;
import io.cybersensei.aisecurity.domain.entity.PromptEvent;
import io.cybersensei.aisecurity.domain.entity.RiskDetection;
import io.cybersensei.aisecurity.domain.enums.AlertStatus;
import io.cybersensei.aisecurity.domain.enums.RiskLevel;
import io.cybersensei.aisecurity.domain.enums.SensitiveDataCategory;
import io.cybersensei.aisecurity.domain.entity.RetentionPolicy;
import io.cybersensei.aisecurity.domain.repository.AlertRepository;
import io.cybersensei.aisecurity.domain.repository.PromptEventRepository;
import io.cybersensei.aisecurity.domain.repository.RetentionPolicyRepository;
import io.cybersensei.aisecurity.domain.repository.RiskDetectionRepository;
import io.cybersensei.aisecurity.service.analyzer.AiSecurityClient;
import io.cybersensei.aisecurity.service.analyzer.AiSecurityClient.AiAnalysisResponse;
import io.cybersensei.aisecurity.service.analyzer.AiSecurityClient.AiDetection;
import io.cybersensei.aisecurity.service.analyzer.PromptRiskAnalyzer;
import io.cybersensei.aisecurity.service.sanitizer.PromptSanitizer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Main orchestrator service for prompt security analysis.
 *
 * Strategy:
 * 1. Primary: AI Security Service (LLM Guard NER + Mistral semantic) via Python FastAPI
 * 2. Fallback: Local regex-based PromptRiskAnalyzer (if AI service is unavailable)
 *
 * This ensures analysis always works, even when the AI service is down.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PromptSecurityService {

    private final AiSecurityClient aiSecurityClient;
    private final PromptRiskAnalyzer regexAnalyzer; // fallback
    private final PromptSanitizer sanitizer;
    private final PromptEventRepository promptEventRepository;
    private final RiskDetectionRepository riskDetectionRepository;
    private final AlertRepository alertRepository;
    private final RetentionPolicyRepository retentionPolicyRepository;

    @Value("${ai-security.analyzer.risk-threshold-block:80}")
    private int blockThreshold;

    @Value("${ai-security.analyzer.risk-threshold-warn:40}")
    private int warnThreshold;

    @Transactional
    public AnalyzePromptResponse analyzeAndProcess(AnalyzePromptRequest request) {
        // 1. Try AI Security Service (dual-layer: LLM Guard + Mistral)
        AiAnalysisResponse aiResult = aiSecurityClient.analyze(
                request.getPrompt(),
                request.getAiTool() != null ? request.getAiTool().name() : null
        );

        int riskScore;
        RiskLevel riskLevel;
        String sanitizedPrompt;
        List<AnalyzePromptResponse.DetectionDetail> detectionDetails;
        List<DetectionRecord> detectionRecords;

        boolean usedAiService = aiResult != null && aiResult.getDetections() != null
                && !"AI service unavailable".equals(aiResult.getSemanticAnalysis());

        if (usedAiService) {
            // ── Primary path: AI Service response ──
            log.info("Using AI Security Service (LLM Guard + Mistral)");
            riskScore = aiResult.getRiskScore();
            riskLevel = toRiskLevel(riskScore);
            sanitizedPrompt = aiResult.getSanitizedPrompt();

            detectionDetails = new ArrayList<>();
            detectionRecords = new ArrayList<>();

            for (AiDetection d : aiResult.getDetections()) {
                detectionDetails.add(AnalyzePromptResponse.DetectionDetail.builder()
                        .category(d.getCategory())
                        .confidence(d.getConfidence())
                        .method(d.getMethod())
                        .snippet(d.getSnippet())
                        .build());

                detectionRecords.add(new DetectionRecord(
                        toCategory(d.getCategory()),
                        d.getConfidence(),
                        d.getMethod(),
                        d.getCategory(),
                        d.getSnippet()
                ));
            }
        } else {
            // ── Fallback: local regex analyzer ──
            log.warn("AI Service unavailable, falling back to regex analyzer");
            var result = regexAnalyzer.analyze(request.getPrompt());
            riskScore = result.getRiskScore();
            riskLevel = result.getRiskLevel();

            detectionDetails = result.getDetections().stream()
                    .map(d -> AnalyzePromptResponse.DetectionDetail.builder()
                            .category(d.getCategory().name())
                            .confidence(d.getConfidence())
                            .method(d.getMethod())
                            .snippet(d.getRedactedSnippet())
                            .build())
                    .toList();

            detectionRecords = result.getDetections().stream()
                    .map(d -> new DetectionRecord(
                            d.getCategory(),
                            d.getConfidence(),
                            d.getMethod(),
                            d.getMatchedPattern(),
                            d.getRedactedSnippet()))
                    .toList();

            // Use local sanitizer as fallback
            sanitizedPrompt = (riskScore >= warnThreshold)
                    ? sanitizer.sanitize(request.getPrompt(), result.getDetections())
                    : null;
        }

        boolean shouldBlock = riskScore >= blockThreshold;
        boolean shouldSanitize = riskScore >= warnThreshold && !shouldBlock;

        // If AI service didn't provide sanitized version but we need one
        if (sanitizedPrompt == null && (shouldSanitize || shouldBlock)) {
            var fallbackResult = regexAnalyzer.analyze(request.getPrompt());
            sanitizedPrompt = sanitizer.sanitize(request.getPrompt(), fallbackResult.getDetections());
        }

        // 2. Detect Article 9 data and compute retention
        boolean containsArticle9 = detectionRecords.stream()
                .anyMatch(d -> d.category().isArticle9());

        Optional<RetentionPolicy> retentionPolicy = retentionPolicyRepository
                .findByCompanyIdAndIsActiveTrue(request.getCompanyId());
        int retentionDays = containsArticle9
                ? retentionPolicy.map(RetentionPolicy::getArticle9RetentionDays).orElse(30)
                : retentionPolicy.map(RetentionPolicy::getRetentionDays).orElse(90);
        LocalDateTime retentionExpiresAt = LocalDateTime.now().plusDays(retentionDays);

        // 3. Persist event (never store raw prompt - only hash)
        String promptHash = DigestUtils.sha256Hex(request.getPrompt());

        PromptEvent event = PromptEvent.builder()
                .companyId(request.getCompanyId())
                .userId(request.getUserId())
                .promptHash(promptHash)
                .promptLength(request.getPrompt().length())
                .aiTool(request.getAiTool())
                .riskScore(riskScore)
                .riskLevel(riskLevel)
                .wasSanitized(shouldSanitize)
                .wasBlocked(shouldBlock)
                .userAcceptedRisk(false)
                .sourceUrl(request.getSourceUrl())
                .containsArticle9(containsArticle9)
                .retentionExpiresAt(retentionExpiresAt)
                .build();

        event = promptEventRepository.save(event);

        if (containsArticle9) {
            log.warn("Article 9 data detected for company {} — retention: {} days (expires: {})",
                    request.getCompanyId(), retentionDays, retentionExpiresAt);
        }

        // 4. Persist detections
        for (var dr : detectionRecords) {
            riskDetectionRepository.save(RiskDetection.builder()
                    .promptEvent(event)
                    .category(dr.category())
                    .confidence(dr.confidence())
                    .detectionMethod(dr.method())
                    .matchedPattern(dr.matchedPattern())
                    .dataSnippetRedacted(dr.snippet())
                    .build());
        }

        // 5. Create alert for high/critical risks
        if (riskLevel == RiskLevel.HIGH || riskLevel == RiskLevel.CRITICAL) {
            createAlert(event, riskScore, riskLevel, detectionRecords);
        }

        // 6. Build response
        String recommendation = buildRecommendation(riskLevel, shouldBlock);

        return AnalyzePromptResponse.builder()
                .eventId(event.getId())
                .riskScore(riskScore)
                .riskLevel(riskLevel)
                .blocked(shouldBlock)
                .sanitizedPrompt(sanitizedPrompt)
                .detections(detectionDetails)
                .recommendation(recommendation)
                .build();
    }

    private void createAlert(PromptEvent event, int riskScore, RiskLevel riskLevel,
                             List<DetectionRecord> detections) {
        String categories = detections.stream()
                .map(d -> d.category().name())
                .distinct()
                .reduce((a, b) -> a + ", " + b)
                .orElse("UNKNOWN");

        Alert alert = Alert.builder()
                .companyId(event.getCompanyId())
                .userId(event.getUserId())
                .promptEvent(event)
                .title("Données sensibles détectées - " + event.getAiTool())
                .description(String.format(
                        "Un prompt à risque %s (score: %d/100) a été détecté. " +
                                "Catégories: %s. Action: %s.",
                        riskLevel, riskScore, categories,
                        event.getWasBlocked() ? "BLOQUÉ" : "AVERTI"))
                .severity(riskLevel)
                .status(AlertStatus.OPEN)
                .build();

        alertRepository.save(alert);
        log.warn("Alert created for company {} - risk level: {}", event.getCompanyId(), riskLevel);
    }

    private RiskLevel toRiskLevel(int score) {
        if (score >= 80) return RiskLevel.CRITICAL;
        if (score >= 60) return RiskLevel.HIGH;
        if (score >= 40) return RiskLevel.MEDIUM;
        if (score >= 20) return RiskLevel.LOW;
        return RiskLevel.SAFE;
    }

    private SensitiveDataCategory toCategory(String categoryName) {
        try {
            return SensitiveDataCategory.valueOf(categoryName);
        } catch (IllegalArgumentException e) {
            return SensitiveDataCategory.COMPANY_CONFIDENTIAL;
        }
    }

    private String buildRecommendation(RiskLevel level, boolean blocked) {
        return switch (level) {
            case CRITICAL -> blocked
                    ? "Ce prompt contient des données hautement sensibles et a été bloqué. Utilisez la version anonymisée ou reformulez votre requête."
                    : "Attention : données critiques détectées. Veuillez anonymiser avant envoi.";
            case HIGH -> "Des données sensibles ont été détectées. Une version anonymisée vous est proposée. Vérifiez avant envoi.";
            case MEDIUM -> "Quelques éléments potentiellement sensibles détectés. Vérifiez le contenu avant envoi.";
            case LOW -> "Risque faible détecté. Vous pouvez procéder avec prudence.";
            case SAFE -> "Aucun risque détecté. Vous pouvez envoyer ce prompt.";
        };
    }

    private record DetectionRecord(
            SensitiveDataCategory category,
            int confidence,
            String method,
            String matchedPattern,
            String snippet
    ) {}
}
