package io.cybersensei.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Individual phishing email tracking per user
 */
@Entity
@Table(name = "phishing_trackers", indexes = {
    @Index(name = "idx_tracker_token", columnList = "token", unique = true),
    @Index(name = "idx_tracker_user", columnList = "userId"),
    @Index(name = "idx_tracker_campaign", columnList = "campaignId")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhishingTracker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token; // Unique tracking token

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long campaignId;

    @Column(nullable = false)
    private Boolean clicked = false;

    private LocalDateTime clickedAt;

    @Column(nullable = false)
    private Boolean opened = false;

    private LocalDateTime openedAt;

    @Column(nullable = false)
    private Boolean reported = false;

    private LocalDateTime reportedAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime sentAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaignId", insertable = false, updatable = false)
    private PhishingCampaign campaign;
}


