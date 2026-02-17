package io.cybersensei.phishing.dto;

import io.cybersensei.phishing.entity.PhishingCampaign;
import io.cybersensei.phishing.entity.PhishingCampaign.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class PhishingCampaignDTO {

    private UUID id;
    @NotBlank(message = "Campaign name is required")
    private String name;
    private String description;
    @NotBlank(message = "Theme is required")
    private String theme;
    private Integer difficulty;
    private String status;
    private UUID templateId;
    private String templateName;
    private String scheduleFrequency;
    private LocalDate scheduleStartDate;
    private LocalDate scheduleEndDate;
    private LocalTime scheduleWindowStart;
    private LocalTime scheduleWindowEnd;
    private String timezone;
    private TargetingConfigDTO targeting;
    private Integer samplingPercent;
    private String templateStrategy;
    private String privacyMode;
    private Integer retentionDays;
    private UUID createdBy;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    // Statistics (for responses)
    private Long totalSent;
    private Long totalClicked;
    private Long totalReported;
    private Float avgClickRate;

    public PhishingCampaignDTO() {}

    public static PhishingCampaignDTO fromEntity(PhishingCampaign entity) {
        PhishingCampaignDTO dto = new PhishingCampaignDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setTheme(entity.getTheme());
        dto.setDifficulty(entity.getDifficulty());
        dto.setStatus(entity.getStatus().name());
        dto.setScheduleFrequency(entity.getScheduleFrequency().name());
        dto.setScheduleStartDate(entity.getScheduleStartDate());
        dto.setScheduleEndDate(entity.getScheduleEndDate());
        dto.setScheduleWindowStart(entity.getScheduleWindowStart());
        dto.setScheduleWindowEnd(entity.getScheduleWindowEnd());
        dto.setTimezone(entity.getTimezone());
        dto.setSamplingPercent(entity.getSamplingPercent());
        dto.setTemplateStrategy(entity.getTemplateStrategy().name());
        dto.setPrivacyMode(entity.getPrivacyMode().name());
        dto.setRetentionDays(entity.getRetentionDays());
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        if (entity.getTemplate() != null) {
            dto.setTemplateId(entity.getTemplate().getId());
            dto.setTemplateName(entity.getTemplate().getName());
        }

        if (entity.getTargetingJson() != null) {
            dto.setTargeting(TargetingConfigDTO.fromEntity(entity.getTargetingJson()));
        }

        return dto;
    }

    public PhishingCampaign toEntity() {
        PhishingCampaign entity = new PhishingCampaign();
        entity.setId(this.id);
        entity.setName(this.name);
        entity.setDescription(this.description);
        entity.setTheme(this.theme);
        entity.setDifficulty(this.difficulty != null ? this.difficulty : 1);
        
        if (this.status != null) {
            entity.setStatus(CampaignStatus.valueOf(this.status));
        }
        if (this.scheduleFrequency != null) {
            entity.setScheduleFrequency(ScheduleFrequency.valueOf(this.scheduleFrequency));
        }
        
        entity.setScheduleStartDate(this.scheduleStartDate);
        entity.setScheduleEndDate(this.scheduleEndDate);
        entity.setScheduleWindowStart(this.scheduleWindowStart);
        entity.setScheduleWindowEnd(this.scheduleWindowEnd);
        entity.setTimezone(this.timezone != null ? this.timezone : "Europe/Paris");
        entity.setSamplingPercent(this.samplingPercent != null ? this.samplingPercent : 100);
        
        if (this.templateStrategy != null) {
            entity.setTemplateStrategy(TemplateStrategy.valueOf(this.templateStrategy));
        }
        if (this.privacyMode != null) {
            entity.setPrivacyMode(PrivacyMode.valueOf(this.privacyMode));
        }
        
        entity.setRetentionDays(this.retentionDays != null ? this.retentionDays : 90);

        if (this.targeting != null) {
            entity.setTargetingJson(this.targeting.toEntity());
        }

        return entity;
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

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public UUID getTemplateId() { return templateId; }
    public void setTemplateId(UUID templateId) { this.templateId = templateId; }

    public String getTemplateName() { return templateName; }
    public void setTemplateName(String templateName) { this.templateName = templateName; }

    public String getScheduleFrequency() { return scheduleFrequency; }
    public void setScheduleFrequency(String scheduleFrequency) { this.scheduleFrequency = scheduleFrequency; }

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

    public TargetingConfigDTO getTargeting() { return targeting; }
    public void setTargeting(TargetingConfigDTO targeting) { this.targeting = targeting; }

    public Integer getSamplingPercent() { return samplingPercent; }
    public void setSamplingPercent(Integer samplingPercent) { this.samplingPercent = samplingPercent; }

    public String getTemplateStrategy() { return templateStrategy; }
    public void setTemplateStrategy(String templateStrategy) { this.templateStrategy = templateStrategy; }

    public String getPrivacyMode() { return privacyMode; }
    public void setPrivacyMode(String privacyMode) { this.privacyMode = privacyMode; }

    public Integer getRetentionDays() { return retentionDays; }
    public void setRetentionDays(Integer retentionDays) { this.retentionDays = retentionDays; }

    public UUID getCreatedBy() { return createdBy; }
    public void setCreatedBy(UUID createdBy) { this.createdBy = createdBy; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Long getTotalSent() { return totalSent; }
    public void setTotalSent(Long totalSent) { this.totalSent = totalSent; }

    public Long getTotalClicked() { return totalClicked; }
    public void setTotalClicked(Long totalClicked) { this.totalClicked = totalClicked; }

    public Long getTotalReported() { return totalReported; }
    public void setTotalReported(Long totalReported) { this.totalReported = totalReported; }

    public Float getAvgClickRate() { return avgClickRate; }
    public void setAvgClickRate(Float avgClickRate) { this.avgClickRate = avgClickRate; }

    // Nested DTO for targeting config
    public static class TargetingConfigDTO {
        private List<String> departments;
        private List<String> roles;
        private List<UUID> includeUsers;
        private List<UUID> excludeUsers;

        public static TargetingConfigDTO fromEntity(TargetingConfig entity) {
            TargetingConfigDTO dto = new TargetingConfigDTO();
            dto.setDepartments(entity.getDepartments());
            dto.setRoles(entity.getRoles());
            dto.setIncludeUsers(entity.getIncludeUsers());
            dto.setExcludeUsers(entity.getExcludeUsers());
            return dto;
        }

        public TargetingConfig toEntity() {
            TargetingConfig entity = new TargetingConfig();
            entity.setDepartments(this.departments);
            entity.setRoles(this.roles);
            entity.setIncludeUsers(this.includeUsers);
            entity.setExcludeUsers(this.excludeUsers);
            return entity;
        }

        public List<String> getDepartments() { return departments; }
        public void setDepartments(List<String> departments) { this.departments = departments; }

        public List<String> getRoles() { return roles; }
        public void setRoles(List<String> roles) { this.roles = roles; }

        public List<UUID> getIncludeUsers() { return includeUsers; }
        public void setIncludeUsers(List<UUID> includeUsers) { this.includeUsers = includeUsers; }

        public List<UUID> getExcludeUsers() { return excludeUsers; }
        public void setExcludeUsers(List<UUID> excludeUsers) { this.excludeUsers = excludeUsers; }
    }
}

