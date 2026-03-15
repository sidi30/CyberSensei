package io.cybersensei.phishing.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Entity representing a tracking event for phishing emails.
 * Tracks opens, clicks, data submissions, and reports.
 */
@Entity
@Table(name = "phishing_events", indexes = {
    @Index(name = "idx_events_token", columnList = "token"),
    @Index(name = "idx_events_campaign_event", columnList = "campaign_id, eventAt"),
    @Index(name = "idx_events_type", columnList = "eventType"),
    @Index(name = "idx_events_user", columnList = "userId"),
    @Index(name = "idx_events_run", columnList = "campaign_run_id")
})
public class PhishingEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    private PhishingCampaign campaign;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_run_id")
    private PhishingCampaignRun campaignRun;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id")
    private PhishingRecipient recipient;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 128)
    private String token;

    @Column(length = 100)
    private String linkId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private EventType eventType;

    @Column(nullable = false)
    private OffsetDateTime eventAt;

    @Column(length = 45)
    private String ipAddress;

    @Column(columnDefinition = "TEXT")
    private String userAgent;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> metadata;

    @PrePersist
    protected void onCreate() {
        if (eventAt == null) {
            eventAt = OffsetDateTime.now();
        }
    }

    public enum EventType {
        DELIVERED,
        OPENED,
        CLICKED,
        DATA_SUBMITTED,
        REPORTED
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public PhishingCampaign getCampaign() { return campaign; }
    public void setCampaign(PhishingCampaign campaign) { this.campaign = campaign; }

    public PhishingCampaignRun getCampaignRun() { return campaignRun; }
    public void setCampaignRun(PhishingCampaignRun campaignRun) { this.campaignRun = campaignRun; }

    public PhishingRecipient getRecipient() { return recipient; }
    public void setRecipient(PhishingRecipient recipient) { this.recipient = recipient; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getLinkId() { return linkId; }
    public void setLinkId(String linkId) { this.linkId = linkId; }

    public EventType getEventType() { return eventType; }
    public void setEventType(EventType eventType) { this.eventType = eventType; }

    public OffsetDateTime getEventAt() { return eventAt; }
    public void setEventAt(OffsetDateTime eventAt) { this.eventAt = eventAt; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }

    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }

    // Factory methods for creating events
    public static PhishingEvent createDeliveredEvent(PhishingRecipient recipient) {
        PhishingEvent event = new PhishingEvent();
        event.setCampaign(recipient.getCampaign());
        event.setCampaignRun(recipient.getCampaignRun());
        event.setRecipient(recipient);
        event.setUserId(recipient.getUserId());
        event.setToken(recipient.getToken());
        event.setEventType(EventType.DELIVERED);
        return event;
    }

    public static PhishingEvent createOpenedEvent(PhishingRecipient recipient, String ipAddress, String userAgent) {
        PhishingEvent event = new PhishingEvent();
        event.setCampaign(recipient.getCampaign());
        event.setCampaignRun(recipient.getCampaignRun());
        event.setRecipient(recipient);
        event.setUserId(recipient.getUserId());
        event.setToken(recipient.getToken());
        event.setEventType(EventType.OPENED);
        event.setIpAddress(ipAddress);
        event.setUserAgent(userAgent);
        return event;
    }

    public static PhishingEvent createClickedEvent(PhishingRecipient recipient, String linkId, String ipAddress, String userAgent) {
        PhishingEvent event = new PhishingEvent();
        event.setCampaign(recipient.getCampaign());
        event.setCampaignRun(recipient.getCampaignRun());
        event.setRecipient(recipient);
        event.setUserId(recipient.getUserId());
        event.setToken(recipient.getToken());
        event.setEventType(EventType.CLICKED);
        event.setLinkId(linkId);
        event.setIpAddress(ipAddress);
        event.setUserAgent(userAgent);
        return event;
    }
}

