package io.cybersensei.aisecurity.domain.entity;

import io.cybersensei.aisecurity.domain.enums.RiskLevel;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "company_risk_scores", indexes = {
        @Index(name = "idx_risk_score_company_date", columnList = "company_id, computed_date", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyRiskScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "computed_date", nullable = false)
    private LocalDate computedDate;

    @Column(name = "overall_score", nullable = false)
    private Integer overallScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", nullable = false)
    private RiskLevel riskLevel;

    @Column(name = "total_prompts")
    private Integer totalPrompts;

    @Column(name = "risky_prompts")
    private Integer riskyPrompts;

    @Column(name = "blocked_prompts")
    private Integer blockedPrompts;

    @Column(name = "sanitized_prompts")
    private Integer sanitizedPrompts;

    @Column(name = "unique_users")
    private Integer uniqueUsers;

    @Column(name = "top_category", length = 50)
    private String topCategory;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
