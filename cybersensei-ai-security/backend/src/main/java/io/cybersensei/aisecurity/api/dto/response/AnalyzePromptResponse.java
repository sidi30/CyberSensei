package io.cybersensei.aisecurity.api.dto.response;

import io.cybersensei.aisecurity.domain.enums.RiskLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyzePromptResponse {

    private Long eventId;
    private int riskScore;
    private RiskLevel riskLevel;
    private boolean blocked;
    private String sanitizedPrompt;
    private List<DetectionDetail> detections;
    private String recommendation;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DetectionDetail {
        private String category;
        private int confidence;
        private String method;
        private String snippet;
    }
}
