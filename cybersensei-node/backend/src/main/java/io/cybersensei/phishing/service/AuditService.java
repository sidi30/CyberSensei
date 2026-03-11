package io.cybersensei.phishing.service;

import io.cybersensei.phishing.entity.PhishingAuditLog;
import io.cybersensei.phishing.repository.PhishingAuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Service for audit logging.
 */
@Service
@Transactional
public class AuditService {

    private final PhishingAuditLogRepository auditLogRepository;

    public AuditService(PhishingAuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * Log an audit action.
     */
    public PhishingAuditLog logAction(String action, String entityType, UUID entityId,
            UUID actorUserId, String actorEmail, String actorIp, Map<String, Object> details) {
        
        PhishingAuditLog log = PhishingAuditLog.create(
                action, entityType, entityId, actorUserId, actorEmail, actorIp, details);
        
        return auditLogRepository.save(log);
    }

    /**
     * Get audit logs for a campaign.
     */
    public List<PhishingAuditLog> getCampaignAuditLogs(UUID campaignId) {
        return auditLogRepository.findCampaignAuditLogs(campaignId);
    }

    /**
     * Get recent audit logs.
     */
    public Page<PhishingAuditLog> getRecentAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    /**
     * Get audit logs by date range.
     */
    public List<PhishingAuditLog> getAuditLogsByDateRange(OffsetDateTime startDate, OffsetDateTime endDate) {
        return auditLogRepository.findByDateRange(startDate, endDate);
    }

    /**
     * Get audit logs by actor.
     */
    public List<PhishingAuditLog> getAuditLogsByActor(UUID actorUserId) {
        return auditLogRepository.findByActorUserId(actorUserId);
    }
}

