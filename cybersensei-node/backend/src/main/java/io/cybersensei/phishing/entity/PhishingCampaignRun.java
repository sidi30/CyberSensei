package io.cybersensei.phishing.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Entity representing a single execution run of a campaign.
 * Tracks the sending status and statistics for each campaign execution.
 */
@Entity
@Table(name = "phishing_campaign_runs", indexes = {
    @Index(name = "idx_campaign_runs_campaign", columnList = "campaign_id"),
    @Index(name = "idx_campaign_runs_status", columnList = "status"),
    @Index(name = "idx_campaign_runs_run_at", columnList = "runAt")
})
public class PhishingCampaignRun {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    private PhishingCampaign campaign;

    @Column(nullable = false)
    private OffsetDateTime runAt;

    private OffsetDateTime completedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private RunStatus status = RunStatus.STARTED;

    @Column(nullable = false)
    private Integer sentCount = 0;

    @Column(nullable = false)
    private Integer errorCount = 0;

    @Column(nullable = false)
    private Integer targetCount = 0;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> errorDetails;

    @PrePersist
    protected void onCreate() {
        if (runAt == null) {
            runAt = OffsetDateTime.now();
        }
    }

    public enum RunStatus {
        STARTED, IN_PROGRESS, COMPLETED, FAILED, CANCELLED
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public PhishingCampaign getCampaign() { return campaign; }
    public void setCampaign(PhishingCampaign campaign) { this.campaign = campaign; }

    public OffsetDateTime getRunAt() { return runAt; }
    public void setRunAt(OffsetDateTime runAt) { this.runAt = runAt; }

    public OffsetDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(OffsetDateTime completedAt) { this.completedAt = completedAt; }

    public RunStatus getStatus() { return status; }
    public void setStatus(RunStatus status) { this.status = status; }

    public Integer getSentCount() { return sentCount; }
    public void setSentCount(Integer sentCount) { this.sentCount = sentCount; }

    public Integer getErrorCount() { return errorCount; }
    public void setErrorCount(Integer errorCount) { this.errorCount = errorCount; }

    public Integer getTargetCount() { return targetCount; }
    public void setTargetCount(Integer targetCount) { this.targetCount = targetCount; }

    public Map<String, Object> getErrorDetails() { return errorDetails; }
    public void setErrorDetails(Map<String, Object> errorDetails) { this.errorDetails = errorDetails; }

    // Utility methods
    public void incrementSentCount() {
        this.sentCount++;
    }

    public void incrementErrorCount() {
        this.errorCount++;
    }

    public boolean isCompleted() {
        return status == RunStatus.COMPLETED || status == RunStatus.FAILED;
    }

    public double getSuccessRate() {
        if (targetCount == 0) return 0;
        return (double) sentCount / targetCount * 100;
    }
}

