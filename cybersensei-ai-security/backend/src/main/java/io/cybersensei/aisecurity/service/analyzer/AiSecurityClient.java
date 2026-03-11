package io.cybersensei.aisecurity.service.analyzer;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

/**
 * Client for the Python AI Security Service (LLM Guard + Mistral dual-layer).
 * Calls POST /api/analyze on the Python FastAPI service.
 */
@Slf4j
@Service
public class AiSecurityClient {

    private final RestClient restClient;

    public AiSecurityClient(
            @Value("${ai-security.ai-service.url:http://localhost:8000}") String aiServiceUrl,
            @Value("${ai-security.ai-service.timeout:30000}") int timeout,
            RestClient.Builder restClientBuilder
    ) {
        this.restClient = restClientBuilder
                .baseUrl(aiServiceUrl)
                .build();
        log.info("AI Security Client initialized: {}", aiServiceUrl);
    }

    /**
     * Send a prompt to the AI Security Service for dual-layer analysis.
     */
    public AiAnalysisResponse analyze(String prompt, String source) {
        try {
            var request = new AiAnalysisRequest(prompt, source);

            AiAnalysisResponse response = restClient.post()
                    .uri("/api/analyze")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(AiAnalysisResponse.class);

            if (response != null) {
                log.info("AI analysis complete: score={}, level={}, detections={}",
                        response.getRiskScore(), response.getRiskLevel(),
                        response.getDetections() != null ? response.getDetections().size() : 0);
            }

            return response;

        } catch (Exception e) {
            log.error("AI Security Service call failed: {}", e.getMessage());
            // Return a safe fallback — do not block on service failure
            return AiAnalysisResponse.builder()
                    .riskScore(0)
                    .riskLevel("SAFE")
                    .detections(List.of())
                    .sanitizedPrompt(null)
                    .semanticAnalysis("AI service unavailable")
                    .build();
        }
    }

    /**
     * Check if the AI Security Service is healthy.
     */
    public boolean isHealthy() {
        try {
            restClient.get()
                    .uri("/health")
                    .retrieve()
                    .body(String.class);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // ── DTOs ──

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AiAnalysisRequest {
        private String prompt;
        private String source;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AiAnalysisResponse {
        @JsonProperty("risk_score")
        private int riskScore;

        @JsonProperty("risk_level")
        private String riskLevel;

        private List<AiDetection> detections;

        @JsonProperty("sanitized_prompt")
        private String sanitizedPrompt;

        @JsonProperty("semantic_analysis")
        private String semanticAnalysis;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AiDetection {
        private String category;
        private int confidence;
        private String method;
        private String snippet;
    }
}
