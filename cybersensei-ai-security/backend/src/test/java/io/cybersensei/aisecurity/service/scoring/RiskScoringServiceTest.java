package io.cybersensei.aisecurity.service.scoring;

import io.cybersensei.aisecurity.api.dto.response.RiskScoreResponse;
import io.cybersensei.aisecurity.domain.entity.CompanyRiskScore;
import io.cybersensei.aisecurity.domain.enums.RiskLevel;
import io.cybersensei.aisecurity.domain.repository.CompanyRiskScoreRepository;
import io.cybersensei.aisecurity.domain.repository.PromptEventRepository;
import io.cybersensei.aisecurity.domain.repository.RiskDetectionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RiskScoringServiceTest {

    @Mock
    private PromptEventRepository promptEventRepository;

    @Mock
    private RiskDetectionRepository riskDetectionRepository;

    @Mock
    private CompanyRiskScoreRepository riskScoreRepository;

    @InjectMocks
    private RiskScoringService riskScoringService;

    private void stubCommonRepositoryCalls(Long companyId, long total, long risky, long blocked,
                                            long sanitized, long uniqueUsers) {
        when(promptEventRepository.countByCompanyIdAndCreatedAtAfter(eq(companyId), any(LocalDateTime.class)))
                .thenReturn(total);
        when(promptEventRepository.countByCompanyIdAndRiskLevelInAndCreatedAtAfter(eq(companyId), anyList(), any(LocalDateTime.class)))
                .thenReturn(risky);
        when(promptEventRepository.countByCompanyIdAndWasBlockedTrueAndCreatedAtAfter(eq(companyId), any(LocalDateTime.class)))
                .thenReturn(blocked);
        when(promptEventRepository.countByCompanyIdAndWasSanitizedTrueAndCreatedAtAfter(eq(companyId), any(LocalDateTime.class)))
                .thenReturn(sanitized);
        when(promptEventRepository.countDistinctUsersByCompanyIdAndCreatedAtAfter(eq(companyId), any(LocalDateTime.class)))
                .thenReturn(uniqueUsers);
        when(riskDetectionRepository.countByCategoryAndCompany(eq(companyId), any(LocalDateTime.class)))
                .thenReturn(List.of());
        when(promptEventRepository.dailyStatsForCompany(eq(companyId), any(LocalDateTime.class)))
                .thenReturn(List.of());
    }

    // ── getRiskScore with cached score ──

    @Nested
    @DisplayName("getRiskScore with cached score")
    class GetRiskScoreWithCache {

        @Test
        @DisplayName("should use cached score when available for today")
        void shouldUseCachedScore() {
            // Arrange
            Long companyId = 1L;
            CompanyRiskScore cachedScore = CompanyRiskScore.builder()
                    .companyId(companyId)
                    .computedDate(LocalDate.now())
                    .overallScore(45)
                    .riskLevel(RiskLevel.MEDIUM)
                    .build();

            when(riskScoreRepository.findByCompanyIdAndComputedDate(eq(companyId), eq(LocalDate.now())))
                    .thenReturn(Optional.of(cachedScore));
            stubCommonRepositoryCalls(companyId, 100, 10, 5, 8, 3);

            // Act
            RiskScoreResponse response = riskScoringService.getRiskScore(companyId, 30);

            // Assert
            assertThat(response.getOverallScore()).isEqualTo(45);
            assertThat(response.getRiskLevel()).isEqualTo(RiskLevel.MEDIUM);
            assertThat(response.getCompanyId()).isEqualTo(companyId);
            assertThat(response.getComputedDate()).isEqualTo(LocalDate.now());
        }

        @Test
        @DisplayName("should populate stats even when using cached score")
        void shouldPopulateStatsWithCachedScore() {
            // Arrange
            Long companyId = 1L;
            CompanyRiskScore cachedScore = CompanyRiskScore.builder()
                    .overallScore(30)
                    .riskLevel(RiskLevel.LOW)
                    .build();

            when(riskScoreRepository.findByCompanyIdAndComputedDate(eq(companyId), any()))
                    .thenReturn(Optional.of(cachedScore));
            stubCommonRepositoryCalls(companyId, 200, 20, 10, 15, 5);

            // Act
            RiskScoreResponse response = riskScoringService.getRiskScore(companyId, 30);

            // Assert
            assertThat(response.getStats().getTotalPrompts()).isEqualTo(200);
            assertThat(response.getStats().getRiskyPrompts()).isEqualTo(20);
            assertThat(response.getStats().getBlockedPrompts()).isEqualTo(10);
            assertThat(response.getStats().getSanitizedPrompts()).isEqualTo(15);
            assertThat(response.getStats().getUniqueUsers()).isEqualTo(5);
        }
    }

    // ── getRiskScore without cached score ──

    @Nested
    @DisplayName("getRiskScore without cached score (computes on the fly)")
    class GetRiskScoreWithoutCache {

        @Test
        @DisplayName("should compute score on-the-fly when no cache exists")
        void shouldComputeScoreOnTheFly() {
            // Arrange
            Long companyId = 2L;
            when(riskScoreRepository.findByCompanyIdAndComputedDate(eq(companyId), any()))
                    .thenReturn(Optional.empty());
            // total=100, risky=50, blocked=10
            // formula: riskyRatio * 80 + blockedRatio * 10 + min(total,100) * 0.1
            //        = 0.5 * 80 + 0.1 * 10 + 100 * 0.1 = 40 + 1 + 10 = 51
            stubCommonRepositoryCalls(companyId, 100, 50, 10, 20, 4);

            // Act
            RiskScoreResponse response = riskScoringService.getRiskScore(companyId, 30);

            // Assert
            assertThat(response.getOverallScore()).isEqualTo(51);
            assertThat(response.getRiskLevel()).isEqualTo(RiskLevel.MEDIUM);
        }

        @Test
        @DisplayName("should return score 0 when no prompts exist")
        void shouldReturnZeroWhenNoPrompts() {
            // Arrange
            Long companyId = 3L;
            when(riskScoreRepository.findByCompanyIdAndComputedDate(eq(companyId), any()))
                    .thenReturn(Optional.empty());
            stubCommonRepositoryCalls(companyId, 0, 0, 0, 0, 0);

            // Act
            RiskScoreResponse response = riskScoringService.getRiskScore(companyId, 30);

            // Assert
            assertThat(response.getOverallScore()).isZero();
            assertThat(response.getRiskLevel()).isEqualTo(RiskLevel.SAFE);
        }
    }

    // ── computeCompanyScore formula ──

    @Nested
    @DisplayName("computeCompanyScore formula verification")
    class ComputeCompanyScoreFormula {

        @Test
        @DisplayName("should compute correct score: all risky prompts")
        void shouldComputeAllRisky() {
            // total=10, risky=10, blocked=0
            // score = 1.0 * 80 + 0.0 * 10 + min(10,100)*0.1 = 80 + 0 + 1 = 81
            Long companyId = 10L;
            when(riskScoreRepository.findByCompanyIdAndComputedDate(eq(companyId), any()))
                    .thenReturn(Optional.empty());
            stubCommonRepositoryCalls(companyId, 10, 10, 0, 0, 1);

            RiskScoreResponse response = riskScoringService.getRiskScore(companyId, 30);

            assertThat(response.getOverallScore()).isEqualTo(81);
            assertThat(response.getRiskLevel()).isEqualTo(RiskLevel.CRITICAL);
        }

        @Test
        @DisplayName("should cap score at 100")
        void shouldCapAt100() {
            // total=200, risky=200, blocked=200
            // score = 1.0 * 80 + 1.0 * 10 + min(200,100)*0.1 = 80 + 10 + 10 = 100
            Long companyId = 11L;
            when(riskScoreRepository.findByCompanyIdAndComputedDate(eq(companyId), any()))
                    .thenReturn(Optional.empty());
            stubCommonRepositoryCalls(companyId, 200, 200, 200, 0, 1);

            RiskScoreResponse response = riskScoringService.getRiskScore(companyId, 30);

            assertThat(response.getOverallScore()).isLessThanOrEqualTo(100);
        }

        @Test
        @DisplayName("should compute small score for few risky prompts")
        void shouldComputeSmallScore() {
            // total=100, risky=5, blocked=2
            // score = 0.05 * 80 + 0.02 * 10 + 100 * 0.1 = 4 + 0.2 + 10 = 14.2 -> 14
            Long companyId = 12L;
            when(riskScoreRepository.findByCompanyIdAndComputedDate(eq(companyId), any()))
                    .thenReturn(Optional.empty());
            stubCommonRepositoryCalls(companyId, 100, 5, 2, 3, 2);

            RiskScoreResponse response = riskScoringService.getRiskScore(companyId, 30);

            assertThat(response.getOverallScore()).isEqualTo(14);
            assertThat(response.getRiskLevel()).isEqualTo(RiskLevel.SAFE);
        }
    }

    // ── toRiskLevel thresholds ──

    @Nested
    @DisplayName("toRiskLevel threshold mapping")
    class ToRiskLevelThresholds {

        private RiskLevel computeAndGetLevel(long total, long risky, long blocked) {
            Long companyId = 99L;
            when(riskScoreRepository.findByCompanyIdAndComputedDate(eq(companyId), any()))
                    .thenReturn(Optional.empty());
            stubCommonRepositoryCalls(companyId, total, risky, blocked, 0, 1);
            return riskScoringService.getRiskScore(companyId, 30).getRiskLevel();
        }

        @Test
        @DisplayName("score 0 -> SAFE")
        void scoreSafe() {
            assertThat(computeAndGetLevel(0, 0, 0)).isEqualTo(RiskLevel.SAFE);
        }

        @Test
        @DisplayName("score >= 80 -> CRITICAL")
        void scoreCritical() {
            // total=10, risky=10, blocked=0 -> score=81
            assertThat(computeAndGetLevel(10, 10, 0)).isEqualTo(RiskLevel.CRITICAL);
        }

        @Test
        @DisplayName("score >= 60 -> HIGH")
        void scoreHigh() {
            // total=100, risky=75, blocked=0 -> 0.75*80 + 0 + 10 = 70
            assertThat(computeAndGetLevel(100, 75, 0)).isEqualTo(RiskLevel.HIGH);
        }
    }

    // ── Category breakdown and trend ──

    @Nested
    @DisplayName("Category breakdown and trend data")
    class CategoryAndTrend {

        @Test
        @DisplayName("should include category breakdown from repository")
        void shouldIncludeCategoryBreakdown() {
            Long companyId = 20L;
            when(riskScoreRepository.findByCompanyIdAndComputedDate(eq(companyId), any()))
                    .thenReturn(Optional.empty());
            stubCommonRepositoryCalls(companyId, 10, 2, 1, 1, 1);

            Object[] row = new Object[]{"PERSONAL_DATA", 5L};
            when(riskDetectionRepository.countByCategoryAndCompany(eq(companyId), any()))
                    .thenReturn(List.of(row));

            RiskScoreResponse response = riskScoringService.getRiskScore(companyId, 30);

            assertThat(response.getCategoryBreakdown()).hasSize(1);
            assertThat(response.getCategoryBreakdown().get(0).get("category")).isEqualTo("PERSONAL_DATA");
            assertThat(response.getCategoryBreakdown().get(0).get("count")).isEqualTo(5L);
        }

        @Test
        @DisplayName("should include daily trend from repository")
        void shouldIncludeDailyTrend() {
            Long companyId = 21L;
            when(riskScoreRepository.findByCompanyIdAndComputedDate(eq(companyId), any()))
                    .thenReturn(Optional.empty());
            stubCommonRepositoryCalls(companyId, 10, 2, 1, 1, 1);

            Object[] row = new Object[]{LocalDate.now(), 10L, 25.5};
            when(promptEventRepository.dailyStatsForCompany(eq(companyId), any()))
                    .thenReturn(List.of(row));

            RiskScoreResponse response = riskScoringService.getRiskScore(companyId, 30);

            assertThat(response.getTrend()).hasSize(1);
            assertThat(response.getTrend().get(0).get("totalPrompts")).isEqualTo(10L);
        }
    }
}
