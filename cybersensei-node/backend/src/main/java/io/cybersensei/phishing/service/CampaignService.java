package io.cybersensei.phishing.service;

import io.cybersensei.api.exception.ResourceNotFoundException;
import io.cybersensei.api.exception.BusinessRuleException;
import io.cybersensei.phishing.dto.PhishingCampaignDTO;
import io.cybersensei.phishing.entity.*;
import io.cybersensei.phishing.entity.PhishingCampaign.*;
import io.cybersensei.phishing.entity.PhishingCampaignRun.RunStatus;
import io.cybersensei.phishing.repository.*;
import io.cybersensei.phishing.service.TargetingService.TargetUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for managing phishing campaigns.
 */
@Service
@Transactional
public class CampaignService {

    private static final Logger log = LoggerFactory.getLogger(CampaignService.class);

    private final PhishingCampaignRepository campaignRepository;
    private final PhishingCampaignRunRepository runRepository;
    private final PhishingRecipientRepository recipientRepository;
    private final PhishingTemplateRepository templateRepository;
    private final TargetingService targetingService;
    private final TokenService tokenService;
    private final MailDeliveryService mailDeliveryService;
    private final AuditService auditService;

    @Value("${cybersensei.phishing.tracking-base-url:http://localhost:8080}")
    private String trackingBaseUrl;

    public CampaignService(PhishingCampaignRepository campaignRepository,
                          PhishingCampaignRunRepository runRepository,
                          PhishingRecipientRepository recipientRepository,
                          PhishingTemplateRepository templateRepository,
                          TargetingService targetingService,
                          TokenService tokenService,
                          MailDeliveryService mailDeliveryService,
                          AuditService auditService) {
        this.campaignRepository = campaignRepository;
        this.runRepository = runRepository;
        this.recipientRepository = recipientRepository;
        this.templateRepository = templateRepository;
        this.targetingService = targetingService;
        this.tokenService = tokenService;
        this.mailDeliveryService = mailDeliveryService;
        this.auditService = auditService;
    }

    public PhishingCampaignDTO createCampaign(PhishingCampaignDTO dto, UUID createdBy) {
        PhishingCampaign entity = dto.toEntity();
        entity.setCreatedBy(createdBy);
        entity.setStatus(CampaignStatus.DRAFT);

        if (dto.getTemplateId() != null) {
            PhishingTemplate template = templateRepository.findById(dto.getTemplateId())
                    .orElseThrow(() -> new ResourceNotFoundException("Template", "id", dto.getTemplateId()));
            entity.setTemplate(template);
        }

        entity = campaignRepository.save(entity);

        auditService.logAction(PhishingAuditLog.ACTION_CAMPAIGN_CREATED, "CAMPAIGN", 
                entity.getId(), createdBy, null, null, Map.of("name", entity.getName()));

        return PhishingCampaignDTO.fromEntity(entity);
    }

    public PhishingCampaignDTO updateCampaign(UUID id, PhishingCampaignDTO dto) {
        PhishingCampaign existing = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign", "id", id));

        if (existing.getStatus() != CampaignStatus.DRAFT) {
            throw new BusinessRuleException("Can only update campaigns in DRAFT status");
        }

        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setTheme(dto.getTheme());
        existing.setDifficulty(dto.getDifficulty());
        
        if (dto.getScheduleFrequency() != null) {
            existing.setScheduleFrequency(ScheduleFrequency.valueOf(dto.getScheduleFrequency()));
        }
        existing.setScheduleStartDate(dto.getScheduleStartDate());
        existing.setScheduleEndDate(dto.getScheduleEndDate());
        existing.setScheduleWindowStart(dto.getScheduleWindowStart());
        existing.setScheduleWindowEnd(dto.getScheduleWindowEnd());
        existing.setTimezone(dto.getTimezone());
        existing.setSamplingPercent(dto.getSamplingPercent());
        
        if (dto.getTemplateStrategy() != null) {
            existing.setTemplateStrategy(TemplateStrategy.valueOf(dto.getTemplateStrategy()));
        }
        if (dto.getPrivacyMode() != null) {
            existing.setPrivacyMode(PrivacyMode.valueOf(dto.getPrivacyMode()));
        }
        existing.setRetentionDays(dto.getRetentionDays());

        if (dto.getTargeting() != null) {
            existing.setTargetingJson(dto.getTargeting().toEntity());
        }

        if (dto.getTemplateId() != null) {
            PhishingTemplate template = templateRepository.findById(dto.getTemplateId())
                    .orElseThrow(() -> new ResourceNotFoundException("Template", "id", dto.getTemplateId()));
            existing.setTemplate(template);
        }

        existing = campaignRepository.save(existing);
        return PhishingCampaignDTO.fromEntity(existing);
    }

    public PhishingCampaignDTO getCampaign(UUID id) {
        PhishingCampaign entity = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign", "id", id));
        return PhishingCampaignDTO.fromEntity(entity);
    }

    public List<PhishingCampaignDTO> getAllCampaigns() {
        return campaignRepository.findAllOrderByCreatedAtDesc().stream()
                .map(PhishingCampaignDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public PhishingCampaignDTO scheduleCampaign(UUID id, UUID userId) {
        PhishingCampaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign", "id", id));

        if (campaign.getTemplate() == null) {
            throw new BusinessRuleException("Campaign must have a template before scheduling");
        }
        if (campaign.getStatus() != CampaignStatus.DRAFT) {
            throw new BusinessRuleException("Can only schedule campaigns in DRAFT status");
        }

        campaign.setStatus(CampaignStatus.SCHEDULED);
        campaign = campaignRepository.save(campaign);

        auditService.logAction(PhishingAuditLog.ACTION_CAMPAIGN_SCHEDULED, "CAMPAIGN",
                id, userId, null, null, null);

        return PhishingCampaignDTO.fromEntity(campaign);
    }

    public PhishingCampaignDTO pauseCampaign(UUID id, UUID userId) {
        PhishingCampaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign", "id", id));

        if (campaign.getStatus() != CampaignStatus.RUNNING && campaign.getStatus() != CampaignStatus.SCHEDULED) {
            throw new BusinessRuleException("Can only pause RUNNING or SCHEDULED campaigns");
        }

        campaign.setStatus(CampaignStatus.PAUSED);
        campaign = campaignRepository.save(campaign);

        auditService.logAction(PhishingAuditLog.ACTION_CAMPAIGN_PAUSED, "CAMPAIGN",
                id, userId, null, null, null);

        return PhishingCampaignDTO.fromEntity(campaign);
    }

    public PhishingCampaignDTO resumeCampaign(UUID id, UUID userId) {
        PhishingCampaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign", "id", id));

        if (campaign.getStatus() != CampaignStatus.PAUSED) {
            throw new BusinessRuleException("Can only resume PAUSED campaigns");
        }

        campaign.setStatus(CampaignStatus.SCHEDULED);
        campaign = campaignRepository.save(campaign);

        auditService.logAction(PhishingAuditLog.ACTION_CAMPAIGN_RESUMED, "CAMPAIGN",
                id, userId, null, null, null);

        return PhishingCampaignDTO.fromEntity(campaign);
    }

    public PhishingCampaignDTO stopCampaign(UUID id, UUID userId) {
        PhishingCampaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign", "id", id));

        campaign.setStatus(CampaignStatus.COMPLETED);
        campaign = campaignRepository.save(campaign);

        auditService.logAction(PhishingAuditLog.ACTION_CAMPAIGN_STOPPED, "CAMPAIGN",
                id, userId, null, null, null);

        return PhishingCampaignDTO.fromEntity(campaign);
    }

    /**
     * Run a campaign immediately (manual trigger).
     */
    public PhishingCampaignDTO runCampaignNow(UUID id, UUID userId, List<TargetUser> allUsers) {
        PhishingCampaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign", "id", id));

        if (campaign.getTemplate() == null) {
            throw new BusinessRuleException("Campaign must have a template");
        }

        // Change status to RUNNING
        campaign.setStatus(CampaignStatus.RUNNING);
        campaign = campaignRepository.save(campaign);

        // Execute the campaign run
        executeCampaignRun(campaign, allUsers);

        auditService.logAction(PhishingAuditLog.ACTION_CAMPAIGN_STARTED, "CAMPAIGN",
                id, userId, null, null, Map.of("trigger", "manual"));

        return PhishingCampaignDTO.fromEntity(campaign);
    }

    /**
     * Execute a campaign run.
     */
    public void executeCampaignRun(PhishingCampaign campaign, List<TargetUser> allUsers) {
        // Create run record
        PhishingCampaignRun run = new PhishingCampaignRun();
        run.setCampaign(campaign);
        run.setStatus(RunStatus.IN_PROGRESS);
        run = runRepository.save(run);

        try {
            // Compute targets
            List<TargetUser> targets = targetingService.computeTargets(campaign, allUsers);
            run.setTargetCount(targets.size());
            runRepository.save(run);

            log.info("Campaign {} run started with {} targets", campaign.getName(), targets.size());

            // Create recipients and send emails
            for (TargetUser target : targets) {
                try {
                    // Create recipient
                    PhishingRecipient recipient = new PhishingRecipient();
                    recipient.setCampaign(campaign);
                    recipient.setCampaignRun(run);
                    recipient.setUserId(target.getUserId());
                    recipient.setEmail(target.getEmail());
                    recipient.setFirstName(target.getFirstName());
                    recipient.setLastName(target.getLastName());
                    recipient.setDepartment(target.getDepartment());
                    recipient.setToken(tokenService.generateUniqueToken());
                    recipient = recipientRepository.save(recipient);

                    // Send email
                    MailDeliveryService.SendResult result = mailDeliveryService.sendEmail(
                            recipient, campaign.getTemplate(), trackingBaseUrl);

                    if (result.success()) {
                        run.incrementSentCount();
                    } else {
                        run.incrementErrorCount();
                    }
                } catch (Exception e) {
                    log.error("Error sending to {}: {}", target.getEmail(), e.getMessage());
                    run.incrementErrorCount();
                }
            }

            // Complete the run
            run.setStatus(RunStatus.COMPLETED);
            run.setCompletedAt(OffsetDateTime.now());
            runRepository.save(run);

            log.info("Campaign {} run completed: {} sent, {} errors", 
                    campaign.getName(), run.getSentCount(), run.getErrorCount());

        } catch (Exception e) {
            log.error("Campaign run failed: {}", e.getMessage());
            run.setStatus(RunStatus.FAILED);
            run.setErrorDetails(Map.of("error", e.getMessage()));
            run.setCompletedAt(OffsetDateTime.now());
            runRepository.save(run);
        }
    }

    public void deleteCampaign(UUID id) {
        PhishingCampaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign", "id", id));

        if (campaign.getStatus() == CampaignStatus.RUNNING) {
            throw new BusinessRuleException("Cannot delete a running campaign");
        }

        campaignRepository.deleteById(id);
    }
}

