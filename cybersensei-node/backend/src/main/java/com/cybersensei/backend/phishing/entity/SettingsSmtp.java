package com.cybersensei.backend.phishing.entity;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Entity for SMTP server configuration.
 * Password is stored encrypted for security.
 */
@Entity
@Table(name = "settings_smtp")
public class SettingsSmtp {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 100)
    private String name = "default";

    @Column(nullable = false)
    private String host;

    @Column(nullable = false)
    private Integer port = 587;

    private String username;

    @Column(columnDefinition = "TEXT")
    private String passwordEncrypted;

    @Column(nullable = false)
    private String fromEmail;

    private String fromName;

    private String replyTo;

    @Column(nullable = false)
    private Boolean tlsEnabled = true;

    @Column(nullable = false)
    private Boolean sslEnabled = false;

    @Column(nullable = false)
    private Integer maxRatePerMinute = 30;

    @Column(nullable = false)
    private Boolean isActive = true;

    private OffsetDateTime lastTestAt;

    private Boolean lastTestSuccess;

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

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getHost() { return host; }
    public void setHost(String host) { this.host = host; }

    public Integer getPort() { return port; }
    public void setPort(Integer port) { this.port = port; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPasswordEncrypted() { return passwordEncrypted; }
    public void setPasswordEncrypted(String passwordEncrypted) { this.passwordEncrypted = passwordEncrypted; }

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

    public OffsetDateTime getLastTestAt() { return lastTestAt; }
    public void setLastTestAt(OffsetDateTime lastTestAt) { this.lastTestAt = lastTestAt; }

    public Boolean getLastTestSuccess() { return lastTestSuccess; }
    public void setLastTestSuccess(Boolean lastTestSuccess) { this.lastTestSuccess = lastTestSuccess; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }

    // Utility methods
    public void markTestSuccess() {
        this.lastTestAt = OffsetDateTime.now();
        this.lastTestSuccess = true;
    }

    public void markTestFailure() {
        this.lastTestAt = OffsetDateTime.now();
        this.lastTestSuccess = false;
    }
}

