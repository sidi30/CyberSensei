package io.cybersensei.phishing.service;

import io.cybersensei.phishing.entity.PhishingAuditLog;
import io.cybersensei.phishing.entity.PhishingCampaign;
import io.cybersensei.phishing.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

/**
 * Service for data retention and cleanup.
 */
@Service
@Transactional
public class RetentionService {

    private static final Logger log = LoggerFactory.getLogger(RetentionService.class);

    private final PhishingCampaignRepository campaignRepository;
    private final PhishingEventRepository eventRepository;
    private final PhishingRecipientRepository recipientRepository;
    private final AuditService auditService;

    public RetentionService(PhishingCampaignRepository campaignRepository,
                           PhishingEventRepository eventRepository,
                           PhishingRecipientRepository recipientRepository,
                           AuditService auditService) {
        this.campaignRepository = campaignRepository;
        this.eventRepository = eventRepository;
        this.recipientRepository = recipientRepository;
        this.auditService = auditService;
    }

    /**
     * Purge old data based on campaign retention settings.
     */
    public void purgeOldData() {
        log.info("Starting data retention purge...");

        List<PhishingCampaign> campaigns = campaignRepository.findAll();
        int totalEventsDeleted = 0;
        int totalRecipientsDeleted = 0;

        for (PhishingCampaign campaign : campaigns) {
            if (campaign.getRetentionDays() == null || campaign.getRetentionDays() <= 0) {
                continue; // No retention policy
            }

            OffsetDateTime cutoffDate = OffsetDateTime.now().minusDays(campaign.getRetentionDays());

            // Delete old events
            int eventsDeleted = eventRepository.deleteOldEvents(campaign.getId(), cutoffDate);
            totalEventsDeleted += eventsDeleted;

            // Delete old recipients
            int recipientsDeleted = recipientRepository.deleteOldRecipients(campaign.getId(), cutoffDate);
            totalRecipientsDeleted += recipientsDeleted;

            if (eventsDeleted > 0 || recipientsDeleted > 0) {
                log.info("Campaign {}: purged {} events, {} recipients (retention: {} days)",
                        campaign.getName(), eventsDeleted, recipientsDeleted, campaign.getRetentionDays());

                auditService.logAction(PhishingAuditLog.ACTION_DATA_PURGED, "CAMPAIGN",
                        campaign.getId(), null, "SYSTEM", null,
                        Map.of("eventsDeleted", eventsDeleted, 
                               "recipientsDeleted", recipientsDeleted,
                               "retentionDays", campaign.getRetentionDays()));
            }
        }

        log.info("Data retention purge completed: {} events, {} recipients deleted",
                totalEventsDeleted, totalRecipientsDeleted);
    }

    /**
     * Manually purge data for a specific campaign.
     */
    public int purgeCampaignData(java.util.UUID campaignId, int olderThanDays) {
        OffsetDateTime cutoffDate = OffsetDateTime.now().minusDays(olderThanDays);
        
        int eventsDeleted = eventRepository.deleteOldEvents(campaignId, cutoffDate);
        int recipientsDeleted = recipientRepository.deleteOldRecipients(campaignId, cutoffDate);

        log.info("Manual purge for campaign {}: {} events, {} recipients deleted",
                campaignId, eventsDeleted, recipientsDeleted);

        return eventsDeleted + recipientsDeleted;
    }
}

