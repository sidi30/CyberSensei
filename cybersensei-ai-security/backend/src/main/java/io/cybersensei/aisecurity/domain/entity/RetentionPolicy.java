package io.cybersensei.aisecurity.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "retention_policies",
        uniqueConstraints = @UniqueConstraint(columnNames = {"company_id", "policy_name"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RetentionPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "policy_name", nullable = false, length = 100)
    private String policyName;

    @Column(name = "retention_days", nullable = false)
    @Builder.Default
    private Integer retentionDays = 90;

    @Column(name = "article9_retention_days", nullable = false)
    @Builder.Default
    private Integer article9RetentionDays = 30;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
