package com.cybersensei.backend.phishing.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Entity for aggregated daily phishing campaign results.
 * Used for reporting and trend analysis.
 */
@Entity
@Table(name = "phishing_results_daily", 
    indexes = {
        @Index(name = "idx_results_campaign_day", columnList = "campaign_id, day"),
        @Index(name = "idx_results_day", columnList = "day"),
        @Index(name = "idx_results_department", columnList = "department")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_results_campaign_day_dept", 
            columnNames = {"campaign_id", "day", "department"})
    }
)
public class PhishingResultsDaily {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    private PhishingCampaign campaign;

    @Column(nullable = false)
    private LocalDate day;

    @Column(length = 100)
    private String department;

    @Column(nullable = false)
    private Integer sentCount = 0;

    @Column(nullable = false)
    private Integer deliveredCount = 0;

    @Column(nullable = false)
    private Integer openedCount = 0;

    @Column(nullable = false)
    private Integer clickedCount = 0;

    @Column(nullable = false)
    private Integer reportedCount = 0;

    @Column(nullable = false)
    private Integer dataSubmittedCount = 0;

    @Column(nullable = false)
    private Float clickRate = 0f;

    @Column(nullable = false)
    private Float reportRate = 0f;

    @Column(nullable = false)
    private Float riskScore = 0f;

    private Integer avgTimeToClickSeconds;

    @Column(nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        calculateRates();
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public PhishingCampaign getCampaign() { return campaign; }
    public void setCampaign(PhishingCampaign campaign) { this.campaign = campaign; }

    public LocalDate getDay() { return day; }
    public void setDay(LocalDate day) { this.day = day; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Integer getSentCount() { return sentCount; }
    public void setSentCount(Integer sentCount) { this.sentCount = sentCount; }

    public Integer getDeliveredCount() { return deliveredCount; }
    public void setDeliveredCount(Integer deliveredCount) { this.deliveredCount = deliveredCount; }

    public Integer getOpenedCount() { return openedCount; }
    public void setOpenedCount(Integer openedCount) { this.openedCount = openedCount; }

    public Integer getClickedCount() { return clickedCount; }
    public void setClickedCount(Integer clickedCount) { this.clickedCount = clickedCount; }

    public Integer getReportedCount() { return reportedCount; }
    public void setReportedCount(Integer reportedCount) { this.reportedCount = reportedCount; }

    public Integer getDataSubmittedCount() { return dataSubmittedCount; }
    public void setDataSubmittedCount(Integer dataSubmittedCount) { this.dataSubmittedCount = dataSubmittedCount; }

    public Float getClickRate() { return clickRate; }
    public void setClickRate(Float clickRate) { this.clickRate = clickRate; }

    public Float getReportRate() { return reportRate; }
    public void setReportRate(Float reportRate) { this.reportRate = reportRate; }

    public Float getRiskScore() { return riskScore; }
    public void setRiskScore(Float riskScore) { this.riskScore = riskScore; }

    public Integer getAvgTimeToClickSeconds() { return avgTimeToClickSeconds; }
    public void setAvgTimeToClickSeconds(Integer avgTimeToClickSeconds) { this.avgTimeToClickSeconds = avgTimeToClickSeconds; }

    public OffsetDateTime getCreatedAt() { return createdAt; }

    // Utility methods
    public void calculateRates() {
        if (deliveredCount != null && deliveredCount > 0) {
            this.clickRate = (float) clickedCount / deliveredCount * 100;
            this.reportRate = (float) reportedCount / deliveredCount * 100;
        }
        calculateRiskScore();
    }

    /**
     * Calculate risk score based on click rate and report rate.
     * Lower click rate + higher report rate = lower risk.
     * Risk score is between 0 (excellent) and 100 (critical).
     */
    public void calculateRiskScore() {
        if (deliveredCount == null || deliveredCount == 0) {
            this.riskScore = 0f;
            return;
        }

        // Click weight (higher = more risk)
        float clickWeight = 0.7f;
        // Data submitted weight (highest risk)
        float dataSubmitWeight = 0.2f;
        // Report bonus (higher = less risk)
        float reportBonus = 0.1f;

        float clickContribution = (clickRate != null ? clickRate : 0) * clickWeight;
        float dataSubmitRate = (float) dataSubmittedCount / deliveredCount * 100;
        float dataSubmitContribution = dataSubmitRate * dataSubmitWeight * 2; // Double weight for data submission
        float reportContribution = (reportRate != null ? reportRate : 0) * reportBonus;

        this.riskScore = Math.min(100, Math.max(0, 
            clickContribution + dataSubmitContribution - reportContribution));
    }

    public String getRiskLevel() {
        if (riskScore < 10) return "EXCELLENT";
        if (riskScore < 25) return "GOOD";
        if (riskScore < 50) return "MODERATE";
        if (riskScore < 75) return "HIGH";
        return "CRITICAL";
    }
}

