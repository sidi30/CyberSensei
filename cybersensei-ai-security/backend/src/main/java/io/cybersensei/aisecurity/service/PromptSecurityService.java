package io.cybersensei.aisecurity.service;

import io.cybersensei.aisecurity.api.dto.request.AnalyzePromptRequest;
import io.cybersensei.aisecurity.api.dto.response.AnalyzePromptResponse;
import io.cybersensei.aisecurity.domain.entity.Alert;
import io.cybersensei.aisecurity.domain.entity.PromptEvent;
import io.cybersensei.aisecurity.domain.entity.RiskDetection;
import io.cybersensei.aisecurity.domain.enums.AlertStatus;
import io.cybersensei.aisecurity.domain.enums.RiskLevel;
import io.cybersensei.aisecurity.domain.repository.AlertRepository;
import io.cybersensei.aisecurity.domain.repository.PromptEventRepository;
import io.cybersensei.aisecurity.domain.repository.RiskDetectionRepository;
import io.cybersensei.aisecurity.service.analyzer.PromptRiskAnalyzer;
import io.cybersensei.aisecurity.service.sanitizer.PromptSanitizer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Main orchestrator service for prompt security analysis.
 * Coordinates analysis, sanitization, persistence, and alerting.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PromptSecurityService {

    private final PromptRiskAnalyzer analyzer;
    private final PromptSanitizer sanitizer;
    private final PromptEventRepository promptEventRepository;
    private final RiskDetectionRepository riskDetectionRepository;
    private final AlertRepository alertRepository;

    @Value("${ai-security.analyzer.risk-threshold-block:80}")
    private int blockThreshold;

    @Value("${ai-security.analyzer.risk-threshold-warn:40}")
    private int warnThreshold;

    @Transactional
    public AnalyzePromptResponse analyzeAndProcess(AnalyzePromptRequest request) {
        // 1. Analyze prompt for risks
        var result = analyzer.analyze(request.getPrompt());

        boolean shouldBlock = result.getRiskScore() >= blockThreshold;
        boolean shouldSanitize = result.getRiskScore() >= warnThreshold && !shouldBlock;

        // 2. Generate sanitized version if needed
        String sanitizedPrompt = null;
        if (shouldSanitize || shouldBlock) {
            sanitizedPrompt = sanitizer.sanitize(request.getPrompt(), result.getDetections());
        }

        // 3. Persist event (never store raw prompt - only hash)
        String promptHash = DigestUtils.sha256Hex(request.getPrompt());

        PromptEvent event = PromptEvent.builder()
                .companyId(request.getCompanyId())
                .userId(request.getUserId())
                .promptHash(promptHash)
                .promptLength(request.getPrompt().length())
                .aiTool(request.getAiTool())
                .riskScore(result.getRiskScore())
                .riskLevel(result.getRiskLevel())
                .wasSanitized(shouldSanitize)
                .wasBlocked(shouldBlock)
                .userAcceptedRisk(false)
                .sourceUrl(request.getSourceUrl())
                .build();

        event = promptEventRepository.save(event);

        // 4. Persist detections
        for (var detection : result.getDetections()) {
            riskDetectionRepository.save(RiskDetection.builder()
                    .promptEvent(event)
                    .category(detection.getCategory())
                    .confidence(detection.getConfidence())
                    .detectionMethod(detection.getMethod())
                    .matchedPattern(detection.getMatchedPattern())
                    .dataSnippetRedacted(detection.getRedactedSnippet())
                    .build());
        }

        // 5. Create alert for high/critical risks
        if (result.getRiskLevel() == RiskLevel.HIGH || result.getRiskLevel() == RiskLevel.CRITICAL) {
            createAlert(event, result);
        }

        // 6. Build response
        List<AnalyzePromptResponse.DetectionDetail> detectionDetails = result.getDetections().stream()
                .map(d -> AnalyzePromptResponse.DetectionDetail.builder()
                        .category(d.getCategory().name())
                        .confidence(d.getConfidence())
                        .method(d.getMethod())
                        .snippet(d.getRedactedSnippet())
                        .build())
                .toList();

        String recommendation = buildRecommendation(result.getRiskLevel(), shouldBlock);

        return AnalyzePromptResponse.builder()
                .eventId(event.getId())
                .riskScore(result.getRiskScore())
                .riskLevel(result.getRiskLevel())
                .blocked(shouldBlock)
                .sanitizedPrompt(sanitizedPrompt)
                .detections(detectionDetails)
                .recommendation(recommendation)
                .build();
    }

    private void createAlert(PromptEvent event, PromptRiskAnalyzer.AnalysisResult result) {
        String categories = result.getDetections().stream()
                .map(d -> d.getCategory().name())
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
                        result.getRiskLevel(), result.getRiskScore(), categories,
                        event.getWasBlocked() ? "BLOQUÉ" : "AVERTI"))
                .severity(result.getRiskLevel())
                .status(AlertStatus.OPEN)
                .build();

        alertRepository.save(alert);
        log.warn("Alert created for company {} - risk level: {}", event.getCompanyId(), result.getRiskLevel());
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
}
