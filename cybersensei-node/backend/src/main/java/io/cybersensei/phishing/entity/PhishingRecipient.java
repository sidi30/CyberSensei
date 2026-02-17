package io.cybersensei.phishing.entity;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Entity representing a recipient of a phishing email in a campaign run.
 * Each recipient gets a unique token for tracking.
 */
@Entity
@Table(name = "phishing_recipients", indexes = {
    @Index(name = "idx_recipients_token", columnList = "token"),
    @Index(name = "idx_recipients_campaign", columnList = "campaign_id"),
    @Index(name = "idx_recipients_run", columnList = "campaign_run_id"),
    @Index(name = "idx_recipients_user", columnList = "userId"),
    @Index(name = "idx_recipients_status", columnList = "status")
})
public class PhishingRecipient {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    private PhishingCampaign campaign;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_run_id", nullable = false)
    private PhishingCampaignRun campaignRun;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String email;

    @Column(length = 100)
    private String firstName;

    @Column(length = 100)
    private String lastName;

    @Column(length = 100)
    private String department;

    @Column(nullable = false, unique = true, length = 128)
    private String token;

    private OffsetDateTime sentAt;

    private OffsetDateTime deliveredAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private RecipientStatus status = RecipientStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @Column(nullable = false)
    private Integer retryCount = 0;

    public enum RecipientStatus {
        PENDING, SENDING, SENT, DELIVERED, FAILED, BOUNCED
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public PhishingCampaign getCampaign() { return campaign; }
    public void setCampaign(PhishingCampaign campaign) { this.campaign = campaign; }

    public PhishingCampaignRun getCampaignRun() { return campaignRun; }
    public void setCampaignRun(PhishingCampaignRun campaignRun) { this.campaignRun = campaignRun; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public OffsetDateTime getSentAt() { return sentAt; }
    public void setSentAt(OffsetDateTime sentAt) { this.sentAt = sentAt; }

    public OffsetDateTime getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(OffsetDateTime deliveredAt) { this.deliveredAt = deliveredAt; }

    public RecipientStatus getStatus() { return status; }
    public void setStatus(RecipientStatus status) { this.status = status; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public Integer getRetryCount() { return retryCount; }
    public void setRetryCount(Integer retryCount) { this.retryCount = retryCount; }

    // Utility methods
    public String getFullName() {
        if (firstName != null && lastName != null) {
            return firstName + " " + lastName;
        } else if (firstName != null) {
            return firstName;
        } else if (lastName != null) {
            return lastName;
        }
        return email;
    }

    public void markAsSent() {
        this.status = RecipientStatus.SENT;
        this.sentAt = OffsetDateTime.now();
    }

    public void markAsDelivered() {
        this.status = RecipientStatus.DELIVERED;
        this.deliveredAt = OffsetDateTime.now();
    }

    public void markAsFailed(String error) {
        this.status = RecipientStatus.FAILED;
        this.errorMessage = error;
    }
}

