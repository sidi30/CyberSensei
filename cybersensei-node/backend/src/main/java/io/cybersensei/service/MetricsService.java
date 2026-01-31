package io.cybersensei.service;

import io.cybersensei.api.dto.CompanyMetricsDto;
import io.cybersensei.api.mapper.CompanyMetricsMapper;
import io.cybersensei.domain.entity.CompanyMetrics;
import io.cybersensei.domain.entity.User;
import io.cybersensei.domain.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Metrics Service - calculates company-wide security metrics
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MetricsService {

    private final CompanyMetricsRepository metricsRepository;
    private final UserExerciseResultRepository resultRepository;
    private final UserRepository userRepository;
    private final CompanyMetricsMapper metricsMapper;

    @Scheduled(cron = "${cybersensei.metrics.calculation-cron}")
    @Transactional
    public void calculateMetrics() {
        log.info("Calculating company metrics");

        LocalDateTime lastWeek = LocalDateTime.now().minusWeeks(1);

        // Calculate average quiz score
        Double avgQuizScore = resultRepository.findAverageScoreSince(lastWeek);
        if (avgQuizScore == null) avgQuizScore = 0.0;

        // Phishing metrics are now handled by the dedicated Phishing module
        // Using default placeholder until phishing module integration
        Double phishingClickRate = 0.0;

        // Count active users
        Long activeUsers = userRepository.findAll().stream()
                .filter(User::getActive)
                .count();

        // Count completed exercises
        Long completedExercises = resultRepository.countResultsSince(lastWeek);

        // Calculate overall security score (0-100)
        double score = calculateSecurityScore(avgQuizScore, phishingClickRate);

        // Determine risk level
        CompanyMetrics.RiskLevel riskLevel = determineRiskLevel(score, phishingClickRate);

        CompanyMetrics metrics = CompanyMetrics.builder()
                .score(score)
                .riskLevel(riskLevel)
                .averageQuizScore(avgQuizScore)
                .phishingClickRate(phishingClickRate)
                .activeUsers(activeUsers.intValue())
                .completedExercises(completedExercises.intValue())
                .build();

        metricsRepository.save(metrics);

        log.info("Company metrics updated - Score: {}, Risk: {}", score, riskLevel);
    }

    @Transactional
    public CompanyMetricsDto getLatestMetrics() {
        CompanyMetrics metrics = metricsRepository.findLatest()
                .orElseGet(() -> {
                    // Calculate immediately if no metrics exist
                    calculateMetrics();
                    return metricsRepository.findLatest()
                            .orElseThrow(() -> new RuntimeException("Failed to calculate metrics"));
                });

        return metricsMapper.toDto(metrics);
    }

    private double calculateSecurityScore(double avgQuizScore, double phishingClickRate) {
        // Weighted calculation:
        // - 60% from quiz performance
        // - 40% from phishing awareness (inverse of click rate)
        double quizComponent = avgQuizScore * 0.6;
        double phishingComponent = (100.0 - phishingClickRate) * 0.4;
        
        return Math.max(0, Math.min(100, quizComponent + phishingComponent));
    }

    private CompanyMetrics.RiskLevel determineRiskLevel(double score, double phishingClickRate) {
        if (score >= 80.0 && phishingClickRate < 10.0) {
            return CompanyMetrics.RiskLevel.LOW;
        } else if (score >= 60.0 && phishingClickRate < 25.0) {
            return CompanyMetrics.RiskLevel.MEDIUM;
        } else if (score >= 40.0 && phishingClickRate < 50.0) {
            return CompanyMetrics.RiskLevel.HIGH;
        } else {
            return CompanyMetrics.RiskLevel.CRITICAL;
        }
    }
}
