package io.cybersensei.aisecurity.service.scoring;

import io.cybersensei.aisecurity.api.dto.response.RiskScoreResponse;
import io.cybersensei.aisecurity.domain.entity.CompanyRiskScore;
import io.cybersensei.aisecurity.domain.enums.RiskLevel;
import io.cybersensei.aisecurity.domain.repository.CompanyRiskScoreRepository;
import io.cybersensei.aisecurity.domain.repository.PromptEventRepository;
import io.cybersensei.aisecurity.domain.repository.RiskDetectionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class RiskScoringService {

    private final PromptEventRepository promptEventRepository;
    private final RiskDetectionRepository riskDetectionRepository;
    private final CompanyRiskScoreRepository riskScoreRepository;

    /**
     * Get current risk score for a company. Uses latest computed or computes on-the-fly.
     */
    public RiskScoreResponse getRiskScore(Long companyId, int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        LocalDate today = LocalDate.now();

        // Try to use cached score
        var cachedScore = riskScoreRepository.findByCompanyIdAndComputedDate(companyId, today);

        long totalPrompts = promptEventRepository.countByCompanyIdAndCreatedAtAfter(companyId, since);
        long riskyPrompts = promptEventRepository.countByCompanyIdAndRiskLevelInAndCreatedAtAfter(
                companyId, List.of(RiskLevel.HIGH, RiskLevel.CRITICAL), since);
        long blockedPrompts = promptEventRepository.countByCompanyIdAndWasBlockedTrueAndCreatedAtAfter(companyId, since);
        long sanitizedPrompts = promptEventRepository.countByCompanyIdAndWasSanitizedTrueAndCreatedAtAfter(companyId, since);
        long uniqueUsers = promptEventRepository.countDistinctUsersByCompanyIdAndCreatedAtAfter(companyId, since);

        int overallScore;
        RiskLevel riskLevel;

        if (cachedScore.isPresent()) {
            overallScore = cachedScore.get().getOverallScore();
            riskLevel = cachedScore.get().getRiskLevel();
        } else {
            overallScore = computeCompanyScore(totalPrompts, riskyPrompts, blockedPrompts);
            riskLevel = toRiskLevel(overallScore);
        }

        // Category breakdown
        var categoryStats = riskDetectionRepository.countByCategoryAndCompany(companyId, since);
        List<Map<String, Object>> categoryBreakdown = new ArrayList<>();
        for (Object[] row : categoryStats) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("category", row[0].toString());
            entry.put("count", row[1]);
            categoryBreakdown.add(entry);
        }

        // Daily trend
        var dailyStats = promptEventRepository.dailyStatsForCompany(companyId, since);
        List<Map<String, Object>> trend = new ArrayList<>();
        for (Object[] row : dailyStats) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("date", row[0].toString());
            entry.put("totalPrompts", row[1]);
            entry.put("avgRiskScore", row[2]);
            trend.add(entry);
        }

        return RiskScoreResponse.builder()
                .companyId(companyId)
                .overallScore(overallScore)
                .riskLevel(riskLevel)
                .computedDate(today)
                .stats(RiskScoreResponse.Stats.builder()
                        .totalPrompts(totalPrompts)
                        .riskyPrompts(riskyPrompts)
                        .blockedPrompts(blockedPrompts)
                        .sanitizedPrompts(sanitizedPrompts)
                        .uniqueUsers(uniqueUsers)
                        .build())
                .categoryBreakdown(categoryBreakdown)
                .trend(trend)
                .build();
    }

    /**
     * Nightly batch: compute and persist risk scores for all active companies.
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void computeDailyScores() {
        log.info("Starting nightly risk score computation");
        LocalDate today = LocalDate.now();
        LocalDateTime since = today.minusDays(30).atStartOfDay();

        // Get all distinct companies that had events in the last 30 days
        // This is a simplified approach; a real impl would iterate companies
        var allEvents = promptEventRepository.findAll();
        var companyIds = allEvents.stream()
                .map(e -> e.getCompanyId())
                .distinct()
                .toList();

        for (Long companyId : companyIds) {
            try {
                long total = promptEventRepository.countByCompanyIdAndCreatedAtAfter(companyId, since);
                long risky = promptEventRepository.countByCompanyIdAndRiskLevelInAndCreatedAtAfter(
                        companyId, List.of(RiskLevel.HIGH, RiskLevel.CRITICAL), since);
                long blocked = promptEventRepository.countByCompanyIdAndWasBlockedTrueAndCreatedAtAfter(companyId, since);
                long sanitized = promptEventRepository.countByCompanyIdAndWasSanitizedTrueAndCreatedAtAfter(companyId, since);
                long users = promptEventRepository.countDistinctUsersByCompanyIdAndCreatedAtAfter(companyId, since);

                int score = computeCompanyScore(total, risky, blocked);

                // Find top category
                var categories = riskDetectionRepository.countByCategoryAndCompany(companyId, since);
                String topCategory = categories.isEmpty() ? null : categories.get(0)[0].toString();

                var riskScore = CompanyRiskScore.builder()
                        .companyId(companyId)
                        .computedDate(today)
                        .overallScore(score)
                        .riskLevel(toRiskLevel(score))
                        .totalPrompts((int) total)
                        .riskyPrompts((int) risky)
                        .blockedPrompts((int) blocked)
                        .sanitizedPrompts((int) sanitized)
                        .uniqueUsers((int) users)
                        .topCategory(topCategory)
                        .build();

                riskScoreRepository.findByCompanyIdAndComputedDate(companyId, today)
                        .ifPresentOrElse(
                                existing -> {
                                    existing.setOverallScore(score);
                                    existing.setRiskLevel(toRiskLevel(score));
                                    existing.setTotalPrompts((int) total);
                                    existing.setRiskyPrompts((int) risky);
                                    existing.setBlockedPrompts((int) blocked);
                                    existing.setSanitizedPrompts((int) sanitized);
                                    existing.setUniqueUsers((int) users);
                                    existing.setTopCategory(topCategory);
                                    riskScoreRepository.save(existing);
                                },
                                () -> riskScoreRepository.save(riskScore)
                        );

                log.info("Risk score computed for company {}: score={}", companyId, score);
            } catch (Exception e) {
                log.error("Failed to compute risk score for company {}", companyId, e);
            }
        }
    }

    private int computeCompanyScore(long total, long risky, long blocked) {
        if (total == 0) return 0;
        double riskyRatio = (double) risky / total;
        double blockedRatio = (double) blocked / total;
        // Higher ratio of risky prompts = higher risk score
        // Blocked prompts slightly reduce score (shows the system works)
        return (int) Math.min(100, Math.round(riskyRatio * 80 + blockedRatio * 10 + Math.min(total, 100) * 0.1));
    }

    private RiskLevel toRiskLevel(int score) {
        if (score >= 80) return RiskLevel.CRITICAL;
        if (score >= 60) return RiskLevel.HIGH;
        if (score >= 40) return RiskLevel.MEDIUM;
        if (score >= 20) return RiskLevel.LOW;
        return RiskLevel.SAFE;
    }
}
