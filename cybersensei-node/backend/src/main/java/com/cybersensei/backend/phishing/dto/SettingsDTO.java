package com.cybersensei.backend.phishing.dto;

import com.cybersensei.backend.phishing.entity.SettingsBranding;
import com.cybersensei.backend.phishing.entity.SettingsSmtp;

import java.util.UUID;

/**
 * DTOs for settings configuration
 */
public class SettingsDTO {

    // SMTP Settings DTO
    public static class SmtpSettingsDTO {
        private UUID id;
        private String name;
        private String host;
        private Integer port;
        private String username;
        private String password; // Only for input, never returned
        private String fromEmail;
        private String fromName;
        private String replyTo;
        private Boolean tlsEnabled;
        private Boolean sslEnabled;
        private Integer maxRatePerMinute;
        private Boolean isActive;
        private Boolean lastTestSuccess;

        public static SmtpSettingsDTO fromEntity(SettingsSmtp entity) {
            SmtpSettingsDTO dto = new SmtpSettingsDTO();
            dto.setId(entity.getId());
            dto.setName(entity.getName());
            dto.setHost(entity.getHost());
            dto.setPort(entity.getPort());
            dto.setUsername(entity.getUsername());
            // Password is never returned
            dto.setFromEmail(entity.getFromEmail());
            dto.setFromName(entity.getFromName());
            dto.setReplyTo(entity.getReplyTo());
            dto.setTlsEnabled(entity.getTlsEnabled());
            dto.setSslEnabled(entity.getSslEnabled());
            dto.setMaxRatePerMinute(entity.getMaxRatePerMinute());
            dto.setIsActive(entity.getIsActive());
            dto.setLastTestSuccess(entity.getLastTestSuccess());
            return dto;
        }

        public SettingsSmtp toEntity() {
            SettingsSmtp entity = new SettingsSmtp();
            entity.setId(this.id);
            entity.setName(this.name != null ? this.name : "default");
            entity.setHost(this.host);
            entity.setPort(this.port != null ? this.port : 587);
            entity.setUsername(this.username);
            entity.setFromEmail(this.fromEmail);
            entity.setFromName(this.fromName);
            entity.setReplyTo(this.replyTo);
            entity.setTlsEnabled(this.tlsEnabled != null ? this.tlsEnabled : true);
            entity.setSslEnabled(this.sslEnabled != null ? this.sslEnabled : false);
            entity.setMaxRatePerMinute(this.maxRatePerMinute != null ? this.maxRatePerMinute : 30);
            entity.setIsActive(this.isActive != null ? this.isActive : true);
            return entity;
        }

        // Getters and Setters
        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getHost() { return host; }
        public void setHost(String host) { this.host = host; }

        public Integer getPort() { return port; }
        public void setPort(Integer port) { this.port = port; }

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getFromEmail() { return fromEmail; }
        public void setFromEmail(String fromEmail) { this.fromEmail = fromEmail; }

        public String getFromName() { return fromName; }
        public void setFromName(String fromName) { this.fromName = fromName; }

        public String getReplyTo() { return replyTo; }
        public void setReplyTo(String replyTo) { this.replyTo = replyTo; }

        public Boolean getTlsEnabled() { return tlsEnabled; }
        public void setTlsEnabled(Boolean tlsEnabled) { this.tlsEnabled = tlsEnabled; }

        public Boolean getSslEnabled() { return sslEnabled; }
        public void setSslEnabled(Boolean sslEnabled) { this.sslEnabled = sslEnabled; }

        public Integer getMaxRatePerMinute() { return maxRatePerMinute; }
        public void setMaxRatePerMinute(Integer maxRatePerMinute) { this.maxRatePerMinute = maxRatePerMinute; }

        public Boolean getIsActive() { return isActive; }
        public void setIsActive(Boolean isActive) { this.isActive = isActive; }

        public Boolean getLastTestSuccess() { return lastTestSuccess; }
        public void setLastTestSuccess(Boolean lastTestSuccess) { this.lastTestSuccess = lastTestSuccess; }
    }

    // Branding Settings DTO
    public static class BrandingSettingsDTO {
        private UUID id;
        private String companyName;
        private String logoUrl;
        private String defaultSenderName;
        private String defaultSenderEmail;
        private String primaryColor;
        private String secondaryColor;
        private String footerText;
        private String privacyPolicyUrl;
        private String supportEmail;

        public static BrandingSettingsDTO fromEntity(SettingsBranding entity) {
            BrandingSettingsDTO dto = new BrandingSettingsDTO();
            dto.setId(entity.getId());
            dto.setCompanyName(entity.getCompanyName());
            dto.setLogoUrl(entity.getLogoUrl());
            dto.setDefaultSenderName(entity.getDefaultSenderName());
            dto.setDefaultSenderEmail(entity.getDefaultSenderEmail());
            dto.setPrimaryColor(entity.getPrimaryColor());
            dto.setSecondaryColor(entity.getSecondaryColor());
            dto.setFooterText(entity.getFooterText());
            dto.setPrivacyPolicyUrl(entity.getPrivacyPolicyUrl());
            dto.setSupportEmail(entity.getSupportEmail());
            return dto;
        }

        public SettingsBranding toEntity() {
            SettingsBranding entity = new SettingsBranding();
            entity.setId(this.id);
            entity.setCompanyName(this.companyName);
            entity.setLogoUrl(this.logoUrl);
            entity.setDefaultSenderName(this.defaultSenderName);
            entity.setDefaultSenderEmail(this.defaultSenderEmail);
            entity.setPrimaryColor(this.primaryColor);
            entity.setSecondaryColor(this.secondaryColor);
            entity.setFooterText(this.footerText);
            entity.setPrivacyPolicyUrl(this.privacyPolicyUrl);
            entity.setSupportEmail(this.supportEmail);
            return entity;
        }

        // Getters and Setters
        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }

        public String getCompanyName() { return companyName; }
        public void setCompanyName(String companyName) { this.companyName = companyName; }

        public String getLogoUrl() { return logoUrl; }
        public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

        public String getDefaultSenderName() { return defaultSenderName; }
        public void setDefaultSenderName(String defaultSenderName) { this.defaultSenderName = defaultSenderName; }

        public String getDefaultSenderEmail() { return defaultSenderEmail; }
        public void setDefaultSenderEmail(String defaultSenderEmail) { this.defaultSenderEmail = defaultSenderEmail; }

        public String getPrimaryColor() { return primaryColor; }
        public void setPrimaryColor(String primaryColor) { this.primaryColor = primaryColor; }

        public String getSecondaryColor() { return secondaryColor; }
        public void setSecondaryColor(String secondaryColor) { this.secondaryColor = secondaryColor; }

        public String getFooterText() { return footerText; }
        public void setFooterText(String footerText) { this.footerText = footerText; }

        public String getPrivacyPolicyUrl() { return privacyPolicyUrl; }
        public void setPrivacyPolicyUrl(String privacyPolicyUrl) { this.privacyPolicyUrl = privacyPolicyUrl; }

        public String getSupportEmail() { return supportEmail; }
        public void setSupportEmail(String supportEmail) { this.supportEmail = supportEmail; }
    }

    // Combined phishing settings response
    public static class PhishingSettingsResponseDTO {
        private SmtpSettingsDTO smtp;
        private BrandingSettingsDTO branding;
        private Long activeTemplatesCount;
        private Long activeCampaignsCount;

        public SmtpSettingsDTO getSmtp() { return smtp; }
        public void setSmtp(SmtpSettingsDTO smtp) { this.smtp = smtp; }

        public BrandingSettingsDTO getBranding() { return branding; }
        public void setBranding(BrandingSettingsDTO branding) { this.branding = branding; }

        public Long getActiveTemplatesCount() { return activeTemplatesCount; }
        public void setActiveTemplatesCount(Long activeTemplatesCount) { this.activeTemplatesCount = activeTemplatesCount; }

        public Long getActiveCampaignsCount() { return activeCampaignsCount; }
        public void setActiveCampaignsCount(Long activeCampaignsCount) { this.activeCampaignsCount = activeCampaignsCount; }
    }
}

