package io.cybersensei.api.dto;

import io.cybersensei.domain.entity.CompanyMetrics;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyMetricsDto {
    private Long id;
    private Double score;
    private CompanyMetrics.RiskLevel riskLevel;
    private LocalDateTime updatedAt;
    private Double averageQuizScore;
    private Double phishingClickRate;
    private Integer activeUsers;
    private Integer completedExercises;
}


