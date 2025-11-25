package io.cybersensei.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Phishing campaign tracking sent emails and results
 */
@Entity
@Table(name = "phishing_campaigns", indexes = {
    @Index(name = "idx_campaign_template", columnList = "templateId"),
    @Index(name = "idx_campaign_date", columnList = "sentAt")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhishingCampaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long templateId;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime sentAt;

    @Column(nullable = false)
    private Integer totalSent;

    @Column(nullable = false)
    private Integer totalClicked = 0;

    @Column(nullable = false)
    private Integer totalOpened = 0;

    @Column(nullable = false)
    private Integer totalReported = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "templateId", insertable = false, updatable = false)
    private PhishingTemplate template;
}


