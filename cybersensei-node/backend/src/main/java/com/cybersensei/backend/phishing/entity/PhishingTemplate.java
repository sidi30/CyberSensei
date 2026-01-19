package com.cybersensei.backend.phishing.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Entity representing a phishing email template.
 * Templates contain the email content with variable placeholders
 * and educational landing page content.
 */
@Entity
@Table(name = "phishing_templates", indexes = {
    @Index(name = "idx_phishing_templates_theme", columnList = "theme"),
    @Index(name = "idx_phishing_templates_difficulty", columnList = "difficulty"),
    @Index(name = "idx_phishing_templates_active", columnList = "isActive")
})
public class PhishingTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 100)
    private String theme;

    @Column(nullable = false)
    private Integer difficulty = 1;

    @Column(nullable = false, length = 500)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String htmlBody;

    @Column(columnDefinition = "TEXT")
    private String textBody;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private List<LinkDefinition> linkDefinitions;

    @Column(columnDefinition = "TEXT")
    private String landingPageHtml;

    @Column(nullable = false)
    private Boolean isActive = true;

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

    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }

    public Integer getDifficulty() { return difficulty; }
    public void setDifficulty(Integer difficulty) { this.difficulty = difficulty; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getHtmlBody() { return htmlBody; }
    public void setHtmlBody(String htmlBody) { this.htmlBody = htmlBody; }

    public String getTextBody() { return textBody; }
    public void setTextBody(String textBody) { this.textBody = textBody; }

    public List<LinkDefinition> getLinkDefinitions() { return linkDefinitions; }
    public void setLinkDefinitions(List<LinkDefinition> linkDefinitions) { this.linkDefinitions = linkDefinitions; }

    public String getLandingPageHtml() { return landingPageHtml; }
    public void setLandingPageHtml(String landingPageHtml) { this.landingPageHtml = landingPageHtml; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }

    /**
     * Embedded class for link definitions in templates
     */
    public static class LinkDefinition {
        private String linkId;
        private String label;
        private String type; // primary, danger, info

        public String getLinkId() { return linkId; }
        public void setLinkId(String linkId) { this.linkId = linkId; }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
    }
}

