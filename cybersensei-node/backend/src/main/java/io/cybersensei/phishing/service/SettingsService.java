package io.cybersensei.phishing.service;

import io.cybersensei.api.exception.ResourceNotFoundException;
import io.cybersensei.api.exception.BusinessRuleException;
import io.cybersensei.phishing.dto.SettingsDTO.*;
import io.cybersensei.phishing.entity.*;
import io.cybersensei.phishing.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Service for managing phishing module settings.
 */
@Service
@Transactional
public class SettingsService {

    private final SettingsSmtpRepository smtpRepository;
    private final SettingsBrandingRepository brandingRepository;
    private final PhishingTemplateRepository templateRepository;
    private final PhishingCampaignRepository campaignRepository;
    private final EncryptionService encryptionService;
    private final MailDeliveryService mailDeliveryService;
    private final AuditService auditService;

    public SettingsService(SettingsSmtpRepository smtpRepository,
                          SettingsBrandingRepository brandingRepository,
                          PhishingTemplateRepository templateRepository,
                          PhishingCampaignRepository campaignRepository,
                          EncryptionService encryptionService,
                          MailDeliveryService mailDeliveryService,
                          AuditService auditService) {
        this.smtpRepository = smtpRepository;
        this.brandingRepository = brandingRepository;
        this.templateRepository = templateRepository;
        this.campaignRepository = campaignRepository;
        this.encryptionService = encryptionService;
        this.mailDeliveryService = mailDeliveryService;
        this.auditService = auditService;
    }

    /**
     * Get all phishing settings.
     */
    public PhishingSettingsResponseDTO getSettings() {
        PhishingSettingsResponseDTO response = new PhishingSettingsResponseDTO();

        smtpRepository.findFirstByIsActiveTrueOrderByCreatedAtDesc()
                .ifPresent(smtp -> response.setSmtp(SmtpSettingsDTO.fromEntity(smtp)));

        brandingRepository.findFirstByOrderByCreatedAtDesc()
                .ifPresent(branding -> response.setBranding(BrandingSettingsDTO.fromEntity(branding)));

        response.setActiveTemplatesCount(templateRepository.countByIsActiveTrue());
        response.setActiveCampaignsCount(campaignRepository.countByStatus(
                PhishingCampaign.CampaignStatus.RUNNING));

        return response;
    }

    /**
     * Save or update SMTP settings.
     */
    public SmtpSettingsDTO saveSmtpSettings(SmtpSettingsDTO dto, UUID userId, String userEmail, String userIp) {
        SettingsSmtp entity;
        
        if (dto.getId() != null) {
            entity = smtpRepository.findById(dto.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("SMTP settings not found"));
        } else {
            entity = dto.toEntity();
        }

        entity.setHost(dto.getHost());
        entity.setPort(dto.getPort());
        entity.setUsername(dto.getUsername());
        entity.setFromEmail(dto.getFromEmail());
        entity.setFromName(dto.getFromName());
        entity.setReplyTo(dto.getReplyTo());
        entity.setTlsEnabled(dto.getTlsEnabled());
        entity.setSslEnabled(dto.getSslEnabled());
        entity.setMaxRatePerMinute(dto.getMaxRatePerMinute());
        entity.setIsActive(dto.getIsActive());

        // Encrypt password if provided
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            entity.setPasswordEncrypted(encryptionService.encrypt(dto.getPassword()));
        }

        entity = smtpRepository.save(entity);

        auditService.logAction(PhishingAuditLog.ACTION_SMTP_CONFIGURED, "SMTP_SETTINGS",
                entity.getId(), userId, userEmail, userIp, null);

        return SmtpSettingsDTO.fromEntity(entity);
    }

    /**
     * Test SMTP configuration.
     */
    public boolean testSmtpSettings(UUID smtpId, String testEmail) {
        SettingsSmtp settings = smtpRepository.findById(smtpId)
                .orElseThrow(() -> new ResourceNotFoundException("SMTP settings not found"));
        
        return mailDeliveryService.testSmtpConnection(settings, testEmail);
    }

    /**
     * Save or update branding settings.
     */
    public BrandingSettingsDTO saveBrandingSettings(BrandingSettingsDTO dto, UUID userId, 
            String userEmail, String userIp) {
        
        SettingsBranding entity;
        
        if (dto.getId() != null) {
            entity = brandingRepository.findById(dto.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Branding settings not found"));
        } else {
            entity = dto.toEntity();
        }

        entity.setCompanyName(dto.getCompanyName());
        entity.setLogoUrl(dto.getLogoUrl());
        entity.setDefaultSenderName(dto.getDefaultSenderName());
        entity.setDefaultSenderEmail(dto.getDefaultSenderEmail());
        entity.setPrimaryColor(dto.getPrimaryColor());
        entity.setSecondaryColor(dto.getSecondaryColor());
        entity.setFooterText(dto.getFooterText());
        entity.setPrivacyPolicyUrl(dto.getPrivacyPolicyUrl());
        entity.setSupportEmail(dto.getSupportEmail());

        entity = brandingRepository.save(entity);

        auditService.logAction(PhishingAuditLog.ACTION_BRANDING_UPDATED, "BRANDING_SETTINGS",
                entity.getId(), userId, userEmail, userIp, null);

        return BrandingSettingsDTO.fromEntity(entity);
    }

    /**
     * Get SMTP settings.
     */
    public SmtpSettingsDTO getSmtpSettings() {
        return smtpRepository.findFirstByIsActiveTrueOrderByCreatedAtDesc()
                .map(SmtpSettingsDTO::fromEntity)
                .orElse(null);
    }

    /**
     * Get branding settings.
     */
    public BrandingSettingsDTO getBrandingSettings() {
        return brandingRepository.findFirstByOrderByCreatedAtDesc()
                .map(BrandingSettingsDTO::fromEntity)
                .orElse(null);
    }
}

