package io.cybersensei.aisecurity.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsageStatsResponse {

    private Long companyId;
    private String period;
    private long totalPrompts;
    private long uniqueUsers;
    private double averageRiskScore;
    private List<Map<String, Object>> byAiTool;
    private List<Map<String, Object>> dailyTrend;
    private List<Map<String, Object>> topCategories;
}
