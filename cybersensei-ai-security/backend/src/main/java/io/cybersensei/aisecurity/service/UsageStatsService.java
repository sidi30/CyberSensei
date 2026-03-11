package io.cybersensei.aisecurity.service;

import io.cybersensei.aisecurity.api.dto.response.UsageStatsResponse;
import io.cybersensei.aisecurity.domain.repository.PromptEventRepository;
import io.cybersensei.aisecurity.domain.repository.RiskDetectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UsageStatsService {

    private final PromptEventRepository promptEventRepository;
    private final RiskDetectionRepository riskDetectionRepository;

    public UsageStatsResponse getUsageStats(Long companyId, int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);

        long totalPrompts = promptEventRepository.countByCompanyIdAndCreatedAtAfter(companyId, since);
        long uniqueUsers = promptEventRepository.countDistinctUsersByCompanyIdAndCreatedAtAfter(companyId, since);

        // By AI tool
        var toolStats = promptEventRepository.countByAiToolAndCompany(companyId, since);
        List<Map<String, Object>> byAiTool = new ArrayList<>();
        for (Object[] row : toolStats) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("tool", row[0].toString());
            entry.put("count", row[1]);
            byAiTool.add(entry);
        }

        // Daily trend
        var dailyStats = promptEventRepository.dailyStatsForCompany(companyId, since);
        List<Map<String, Object>> dailyTrend = new ArrayList<>();
        double totalAvgRisk = 0;
        for (Object[] row : dailyStats) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("date", row[0].toString());
            entry.put("count", row[1]);
            entry.put("avgRiskScore", row[2]);
            dailyTrend.add(entry);
            if (row[2] != null) {
                totalAvgRisk += ((Number) row[2]).doubleValue();
            }
        }
        double averageRiskScore = dailyTrend.isEmpty() ? 0 : totalAvgRisk / dailyTrend.size();

        // Top categories
        var categoryStats = riskDetectionRepository.countByCategoryAndCompany(companyId, since);
        List<Map<String, Object>> topCategories = new ArrayList<>();
        for (Object[] row : categoryStats) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("category", row[0].toString());
            entry.put("count", row[1]);
            topCategories.add(entry);
        }

        return UsageStatsResponse.builder()
                .companyId(companyId)
                .period(days + "d")
                .totalPrompts(totalPrompts)
                .uniqueUsers(uniqueUsers)
                .averageRiskScore(Math.round(averageRiskScore * 10.0) / 10.0)
                .byAiTool(byAiTool)
                .dailyTrend(dailyTrend)
                .topCategories(topCategories)
                .build();
    }
}
