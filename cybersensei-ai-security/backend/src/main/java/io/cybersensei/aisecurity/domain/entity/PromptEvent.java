package io.cybersensei.aisecurity.domain.entity;

import io.cybersensei.aisecurity.domain.enums.AiTool;
import io.cybersensei.aisecurity.domain.enums.RiskLevel;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "prompt_events", indexes = {
        @Index(name = "idx_prompt_event_company", columnList = "company_id"),
        @Index(name = "idx_prompt_event_user", columnList = "user_id"),
        @Index(name = "idx_prompt_event_timestamp", columnList = "created_at"),
        @Index(name = "idx_prompt_event_risk", columnList = "risk_level")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromptEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "prompt_hash", nullable = false, length = 64)
    private String promptHash;

    @Column(name = "prompt_length")
    private Integer promptLength;

    @Enumerated(EnumType.STRING)
    @Column(name = "ai_tool", nullable = false)
    private AiTool aiTool;

    @Column(name = "risk_score", nullable = false)
    private Integer riskScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", nullable = false)
    private RiskLevel riskLevel;

    @Column(name = "was_sanitized")
    private Boolean wasSanitized;

    @Column(name = "was_blocked")
    private Boolean wasBlocked;

    @Column(name = "user_accepted_risk")
    private Boolean userAcceptedRisk;

    @Column(name = "source_url", length = 500)
    private String sourceUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "retention_expires_at")
    private LocalDateTime retentionExpiresAt;

    @Column(name = "contains_article9")
    @Builder.Default
    private Boolean containsArticle9 = false;
}
