package io.cybersensei.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Company-wide security metrics and risk assessment
 */
@Entity
@Table(name = "company_metrics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyMetrics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double score; // Overall security score 0-100

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RiskLevel riskLevel;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Additional metrics
    private Double averageQuizScore;
    private Double phishingClickRate;
    private Integer activeUsers;
    private Integer completedExercises;

    public enum RiskLevel {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }
}


