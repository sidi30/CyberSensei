package io.cybersensei.phishing.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Entity representing a phishing simulation campaign.
 * Campaigns define targeting, scheduling, and template configuration.
 */
@Entity
@Table(name = "phishing_campaigns", indexes = {
    @Index(name = "idx_phishing_campaigns_status", columnList = "status"),
    @Index(name = "idx_phishing_campaigns_theme", columnList = "theme"),
    @Index(name = "idx_phishing_campaigns_frequency", columnList = "scheduleFrequency")
})
public class PhishingCampaign {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 100)
    private String theme;

    @Column(nullable = false)
    private Integer difficulty = 1;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private CampaignStatus status = CampaignStatus.DRAFT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id")
    private PhishingTemplate template;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ScheduleFrequency scheduleFrequency = ScheduleFrequency.ONCE;

    private LocalDate scheduleStartDate;
    private LocalDate scheduleEndDate;
    private LocalTime scheduleWindowStart;
    private LocalTime scheduleWindowEnd;

    @Column(nullable = false, length = 100)
    private String timezone = "Europe/Paris";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private TargetingConfig targetingJson;

    @Column(nullable = false)
    private Integer samplingPercent = 100;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private TemplateStrategy templateStrategy = TemplateStrategy.FIXED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private PrivacyMode privacyMode = PrivacyMode.ANONYMIZED;

    @Column(nullable = false)
    private Integer retentionDays = 90;

    private UUID createdBy;

    @Column(nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    // Enums
    public enum CampaignStatus {
        DRAFT, SCHEDULED, RUNNING, PAUSED, COMPLETED, CANCELLED
    }

    public enum ScheduleFrequency {
        ONCE, DAILY, WEEKLY, MONTHLY
    }

    public enum TemplateStrategy {
        FIXED, ROTATING, ADAPTIVE
    }

    public enum PrivacyMode {
        ANONYMIZED, IDENTIFIED
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }

    public Integer getDifficulty() { return difficulty; }
    public void setDifficulty(Integer difficulty) { this.difficulty = difficulty; }

    public CampaignStatus getStatus() { return status; }
    public void setStatus(CampaignStatus status) { this.status = status; }

    public PhishingTemplate getTemplate() { return template; }
    public void setTemplate(PhishingTemplate template) { this.template = template; }

    public ScheduleFrequency getScheduleFrequency() { return scheduleFrequency; }
    public void setScheduleFrequency(ScheduleFrequency scheduleFrequency) { this.scheduleFrequency = scheduleFrequency; }

    public LocalDate getScheduleStartDate() { return scheduleStartDate; }
    public void setScheduleStartDate(LocalDate scheduleStartDate) { this.scheduleStartDate = scheduleStartDate; }

    public LocalDate getScheduleEndDate() { return scheduleEndDate; }
    public void setScheduleEndDate(LocalDate scheduleEndDate) { this.scheduleEndDate = scheduleEndDate; }

    public LocalTime getScheduleWindowStart() { return scheduleWindowStart; }
    public void setScheduleWindowStart(LocalTime scheduleWindowStart) { this.scheduleWindowStart = scheduleWindowStart; }

    public LocalTime getScheduleWindowEnd() { return scheduleWindowEnd; }
    public void setScheduleWindowEnd(LocalTime scheduleWindowEnd) { this.scheduleWindowEnd = scheduleWindowEnd; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public TargetingConfig getTargetingJson() { return targetingJson; }
    public void setTargetingJson(TargetingConfig targetingJson) { this.targetingJson = targetingJson; }

    public Integer getSamplingPercent() { return samplingPercent; }
    public void setSamplingPercent(Integer samplingPercent) { this.samplingPercent = samplingPercent; }

    public TemplateStrategy getTemplateStrategy() { return templateStrategy; }
    public void setTemplateStrategy(TemplateStrategy templateStrategy) { this.templateStrategy = templateStrategy; }

    public PrivacyMode getPrivacyMode() { return privacyMode; }
    public void setPrivacyMode(PrivacyMode privacyMode) { this.privacyMode = privacyMode; }

    public Integer getRetentionDays() { return retentionDays; }
    public void setRetentionDays(Integer retentionDays) { this.retentionDays = retentionDays; }

    public UUID getCreatedBy() { return createdBy; }
    public void setCreatedBy(UUID createdBy) { this.createdBy = createdBy; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }

    /**
     * Embedded targeting configuration
     */
    public static class TargetingConfig {
        private java.util.List<String> departments;
        private java.util.List<String> roles;
        private java.util.List<UUID> includeUsers;
        private java.util.List<UUID> excludeUsers;

        public java.util.List<String> getDepartments() { return departments; }
        public void setDepartments(java.util.List<String> departments) { this.departments = departments; }

        public java.util.List<String> getRoles() { return roles; }
        public void setRoles(java.util.List<String> roles) { this.roles = roles; }

        public java.util.List<UUID> getIncludeUsers() { return includeUsers; }
        public void setIncludeUsers(java.util.List<UUID> includeUsers) { this.includeUsers = includeUsers; }

        public java.util.List<UUID> getExcludeUsers() { return excludeUsers; }
        public void setExcludeUsers(java.util.List<UUID> excludeUsers) { this.excludeUsers = excludeUsers; }
    }
}

