package io.cybersensei.aisecurity.domain.entity;

import io.cybersensei.aisecurity.domain.enums.SensitiveDataCategory;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "risk_detections", indexes = {
        @Index(name = "idx_risk_detection_event", columnList = "prompt_event_id"),
        @Index(name = "idx_risk_detection_category", columnList = "category")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskDetection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prompt_event_id", nullable = false)
    private PromptEvent promptEvent;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SensitiveDataCategory category;

    @Column(nullable = false)
    private Integer confidence;

    @Column(name = "detection_method", length = 50)
    private String detectionMethod;

    @Column(name = "matched_pattern", length = 200)
    private String matchedPattern;

    @Column(name = "data_snippet_redacted", length = 500)
    private String dataSnippetRedacted;
}
