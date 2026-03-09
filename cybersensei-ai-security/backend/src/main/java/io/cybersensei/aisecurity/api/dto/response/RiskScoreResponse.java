package io.cybersensei.aisecurity.api.dto.response;

import io.cybersensei.aisecurity.domain.enums.RiskLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskScoreResponse {

    private Long companyId;
    private int overallScore;
    private RiskLevel riskLevel;
    private LocalDate computedDate;
    private Stats stats;
    private List<Map<String, Object>> categoryBreakdown;
    private List<Map<String, Object>> trend;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Stats {
        private long totalPrompts;
        private long riskyPrompts;
        private long blockedPrompts;
        private long sanitizedPrompts;
        private long uniqueUsers;
    }
}
