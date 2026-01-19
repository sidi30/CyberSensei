package com.cybersensei.backend.phishing.entity;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Entity for company branding configuration.
 * Used to personalize phishing emails with company identity.
 */
@Entity
@Table(name = "settings_branding")
public class SettingsBranding {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String companyName;

    @Column(length = 500)
    private String logoUrl;

    private String defaultSenderName;

    private String defaultSenderEmail;

    @Column(length = 7)
    private String primaryColor;

    @Column(length = 7)
    private String secondaryColor;

    @Column(columnDefinition = "TEXT")
    private String footerText;

    @Column(length = 500)
    private String privacyPolicyUrl;

    private String supportEmail;

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

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}

