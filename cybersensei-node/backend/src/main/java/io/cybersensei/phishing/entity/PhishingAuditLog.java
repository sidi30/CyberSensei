package io.cybersensei.phishing.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Entity for audit logging of phishing module actions.
 * Provides a complete audit trail for security and compliance.
 */
@Entity
@Table(name = "phishing_audit_logs", indexes = {
    @Index(name = "idx_audit_action", columnList = "action"),
    @Index(name = "idx_audit_entity", columnList = "entityType, entityId"),
    @Index(name = "idx_audit_actor", columnList = "actorUserId"),
    @Index(name = "idx_audit_created", columnList = "createdAt")
})
public class PhishingAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(length = 100)
    private String entityType;

    private UUID entityId;

    private UUID actorUserId;

    private String actorEmail;

    @Column(length = 45)
    private String actorIp;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> details;

    @Column(nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public UUID getEntityId() { return entityId; }
    public void setEntityId(UUID entityId) { this.entityId = entityId; }

    public UUID getActorUserId() { return actorUserId; }
    public void setActorUserId(UUID actorUserId) { this.actorUserId = actorUserId; }

    public String getActorEmail() { return actorEmail; }
    public void setActorEmail(String actorEmail) { this.actorEmail = actorEmail; }

    public String getActorIp() { return actorIp; }
    public void setActorIp(String actorIp) { this.actorIp = actorIp; }

    public Map<String, Object> getDetails() { return details; }
    public void setDetails(Map<String, Object> details) { this.details = details; }

    public OffsetDateTime getCreatedAt() { return createdAt; }

    // Audit action constants
    public static final String ACTION_CAMPAIGN_CREATED = "CAMPAIGN_CREATED";
    public static final String ACTION_CAMPAIGN_SCHEDULED = "CAMPAIGN_SCHEDULED";
    public static final String ACTION_CAMPAIGN_STARTED = "CAMPAIGN_STARTED";
    public static final String ACTION_CAMPAIGN_PAUSED = "CAMPAIGN_PAUSED";
    public static final String ACTION_CAMPAIGN_RESUMED = "CAMPAIGN_RESUMED";
    public static final String ACTION_CAMPAIGN_STOPPED = "CAMPAIGN_STOPPED";
    public static final String ACTION_CAMPAIGN_COMPLETED = "CAMPAIGN_COMPLETED";
    public static final String ACTION_TEMPLATE_CREATED = "TEMPLATE_CREATED";
    public static final String ACTION_TEMPLATE_UPDATED = "TEMPLATE_UPDATED";
    public static final String ACTION_TEMPLATE_DELETED = "TEMPLATE_DELETED";
    public static final String ACTION_SMTP_CONFIGURED = "SMTP_CONFIGURED";
    public static final String ACTION_BRANDING_UPDATED = "BRANDING_UPDATED";
    public static final String ACTION_DATA_PURGED = "DATA_PURGED";

    // Factory methods
    public static PhishingAuditLog create(String action, String entityType, UUID entityId, 
            UUID actorUserId, String actorEmail, String actorIp, Map<String, Object> details) {
        PhishingAuditLog log = new PhishingAuditLog();
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setActorUserId(actorUserId);
        log.setActorEmail(actorEmail);
        log.setActorIp(actorIp);
        log.setDetails(details);
        return log;
    }
}

