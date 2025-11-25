package io.cybersensei.service;

import io.cybersensei.domain.entity.*;
import io.cybersensei.domain.repository.*;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.UnsupportedEncodingException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Phishing Mailer Service
 * 
 * Handles:
 * - SMTP configuration from database
 * - HTML template rendering with Thymeleaf
 * - Unique tracking token generation
 * - Campaign scheduling and sending
 * - Metrics tracking integration
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PhishingMailerService {

    private final JavaMailSender mailSender;
    private final PhishingTemplateRepository templateRepository;
    private final PhishingCampaignRepository campaignRepository;
    private final PhishingTrackerRepository trackerRepository;
    private final UserRepository userRepository;
    private final ConfigRepository configRepository;
    private final UserExerciseResultRepository resultRepository;

    @Value("${cybersensei.phishing.tracking-url}")
    private String trackingBaseUrl;

    @Value("${cybersensei.phishing.enabled}")
    private boolean phishingEnabled;

    /**
     * Scheduled job: Send phishing campaign every morning at 9:00 AM (Monday-Friday)
     */
    @Scheduled(cron = "${cybersensei.phishing.daily-send-cron:0 0 9 * * MON-FRI}")
    @Transactional
    public void sendDailyPhishingCampaign() {
        if (!phishingEnabled) {
            log.info("Phishing campaigns are disabled via configuration");
            return;
        }

        // Check if phishing is enabled in DB config
        String configEnabled = configRepository.findByKey("phishing.enabled")
                .map(Config::getValue)
                .orElse("false");
        
        if (!"true".equalsIgnoreCase(configEnabled)) {
            log.info("Phishing campaigns are disabled in database config");
            return;
        }

        log.info("🚀 Starting daily phishing campaign at {}", LocalDateTime.now());

        try {
            // Select a random active template
            PhishingTemplate template = templateRepository.findRandomActiveTemplate();
            if (template == null) {
                log.warn("No active phishing templates found");
                return;
            }

            log.info("Selected template: {} ({})", template.getLabel(), template.getType());

            // Get all active users
            List<User> activeUsers = userRepository.findAll().stream()
                    .filter(User::getActive)
                    .collect(Collectors.toList());

            if (activeUsers.isEmpty()) {
                log.warn("No active users found for phishing campaign");
                return;
            }

            // Create campaign
            PhishingCampaign campaign = PhishingCampaign.builder()
                    .templateId(template.getId())
                    .totalSent(activeUsers.size())
                    .totalClicked(0)
                    .totalOpened(0)
                    .totalReported(0)
                    .build();

            campaign = campaignRepository.save(campaign);
            log.info("Created campaign ID: {}", campaign.getId());

            // Send emails to all users
            int successCount = 0;
            int failureCount = 0;

            for (User user : activeUsers) {
                try {
                    sendPhishingEmail(user, template, campaign);
                    successCount++;
                } catch (Exception e) {
                    log.error("Failed to send phishing email to {}: {}", user.getEmail(), e.getMessage());
                    failureCount++;
                }
            }

            log.info("✅ Phishing campaign completed: {} sent, {} failed", successCount, failureCount);

        } catch (Exception e) {
            log.error("❌ Error in daily phishing campaign: {}", e.getMessage(), e);
        }
    }

    /**
     * Send phishing email to a specific user
     */
    @Transactional
    public void sendPhishingEmail(User user, PhishingTemplate template, PhishingCampaign campaign) 
            throws MessagingException {
        
        log.debug("Sending phishing email to: {}", user.getEmail());

        // Generate unique tracking token
        String token = generateUniqueToken();

        // Create tracker record
        PhishingTracker tracker = PhishingTracker.builder()
                .token(token)
                .userId(user.getId())
                .campaignId(campaign.getId())
                .clicked(false)
                .opened(false)
                .reported(false)
                .build();

        trackerRepository.save(tracker);

        // Build tracking URLs
        String trackingPixelUrl = trackingBaseUrl + "/api/phishing/pixel/" + token;
        String phishingLinkUrl = trackingBaseUrl + "/api/phishing/click/" + token;

        // Get SMTP configuration from database
        String fromEmail = getConfigValue("smtp.from_email", "noreply@cybersensei.io");
        String fromName = getConfigValue("smtp.from_name", "CyberSensei");
        String companyName = getConfigValue("company.name", "CyberSensei");

        // Render HTML email with variable replacement
        String htmlContent = renderTemplate(template, user, trackingPixelUrl, phishingLinkUrl, companyName);

        // Create and send email
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        try {
            helper.setFrom(fromEmail, fromName);
        } catch (UnsupportedEncodingException e) {
            log.warn("Could not set from name, using email only: {}", e.getMessage());
            helper.setFrom(fromEmail);
        }
        helper.setTo(user.getEmail());
        helper.setSubject(template.getSubject());
        helper.setText(template.getTextContent(), htmlContent);

        mailSender.send(message);

        log.debug("✅ Phishing email sent successfully to: {}", user.getEmail());
    }

    /**
     * Render HTML template with variable replacement
     */
    private String renderTemplate(PhishingTemplate template, User user, String trackingPixel, 
                                  String phishingLink, String companyName) {
        String htmlContent = template.getHtmlContent();
        
        // Simple variable replacement
        htmlContent = htmlContent.replace("{{USER_NAME}}", user.getName());
        htmlContent = htmlContent.replace("{{USER_EMAIL}}", user.getEmail());
        htmlContent = htmlContent.replace("{{TRACKING_PIXEL}}", trackingPixel);
        htmlContent = htmlContent.replace("{{PHISHING_LINK}}", phishingLink);
        htmlContent = htmlContent.replace("{{COMPANY_NAME}}", companyName);

        return htmlContent;
    }

    /**
     * Generate unique tracking token
     */
    private String generateUniqueToken() {
        String token;
        do {
            token = UUID.randomUUID().toString();
        } while (trackerRepository.findByToken(token).isPresent());
        
        return token;
    }

    /**
     * Get configuration value from database
     */
    private String getConfigValue(String key, String defaultValue) {
        return configRepository.findByKey(key)
                .map(Config::getValue)
                .orElse(defaultValue);
    }

    /**
     * Track email open (tracking pixel)
     */
    @Transactional
    public void trackEmailOpen(String token) {
        PhishingTracker tracker = trackerRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid tracking token"));

        if (!tracker.getOpened()) {
            tracker.setOpened(true);
            tracker.setOpenedAt(LocalDateTime.now());
            trackerRepository.save(tracker);

            // Update campaign statistics
            updateCampaignStats(tracker.getCampaignId());

            log.info("📧 Email opened by user {} (token: {})", tracker.getUserId(), token);
        }
    }

    /**
     * Track phishing link click
     */
    @Transactional
    public PhishingTracker trackLinkClick(String token) {
        PhishingTracker tracker = trackerRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid tracking token"));

        if (!tracker.getClicked()) {
            tracker.setClicked(true);
            tracker.setClickedAt(LocalDateTime.now());
            
            // Also mark as opened if not already
            if (!tracker.getOpened()) {
                tracker.setOpened(true);
                tracker.setOpenedAt(LocalDateTime.now());
            }
            
            trackerRepository.save(tracker);

            // Update campaign statistics
            updateCampaignStats(tracker.getCampaignId());

            // Create exercise result (user failed the phishing test)
            createPhishingExerciseResult(tracker);

            log.warn("⚠️ Phishing link CLICKED by user {} (token: {})", tracker.getUserId(), token);
        }

        return tracker;
    }

    /**
     * Track phishing email report (user reported it as suspicious)
     */
    @Transactional
    public void trackPhishingReport(String token) {
        PhishingTracker tracker = trackerRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid tracking token"));

        if (!tracker.getReported()) {
            tracker.setReported(true);
            tracker.setReportedAt(LocalDateTime.now());
            trackerRepository.save(tracker);

            // Update campaign statistics
            updateCampaignStats(tracker.getCampaignId());

            // Create exercise result (user passed the phishing test)
            createPhishingReportResult(tracker);

            log.info("✅ Phishing email REPORTED by user {} (token: {}) - Good job!", 
                    tracker.getUserId(), token);
        }
    }

    /**
     * Update campaign statistics
     */
    private void updateCampaignStats(Long campaignId) {
        PhishingCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));

        Integer clicked = trackerRepository.countClickedByCampaignId(campaignId);
        Integer opened = trackerRepository.countOpenedByCampaignId(campaignId);
        Integer reported = trackerRepository.countReportedByCampaignId(campaignId);
        
        campaign.setTotalClicked(clicked != null ? clicked : 0);
        campaign.setTotalOpened(opened != null ? opened : 0);
        campaign.setTotalReported(reported != null ? reported : 0);

        campaignRepository.save(campaign);
    }

    /**
     * Create exercise result when user clicks phishing link (failure)
     */
    private void createPhishingExerciseResult(PhishingTracker tracker) {
        // Find or create a phishing exercise
        // This links the phishing campaign to the exercise system
        
        UserExerciseResult result = UserExerciseResult.builder()
                .userId(tracker.getUserId())
                .exerciseId(1L) // Phishing exercise ID (should be dynamic)
                .score(0.0) // User failed by clicking
                .success(false)
                .duration(calculateDuration(tracker))
                .detailsJSON(java.util.Map.of(
                    "type", "phishing_campaign",
                    "campaignId", tracker.getCampaignId(),
                    "templateId", tracker.getCampaign().getTemplateId(),
                    "action", "clicked"
                ))
                .build();

        resultRepository.save(result);
        
        log.info("Created exercise result (FAILED) for user {} - clicked phishing link", 
                tracker.getUserId());
    }

    /**
     * Create exercise result when user reports phishing (success)
     */
    private void createPhishingReportResult(PhishingTracker tracker) {
        UserExerciseResult result = UserExerciseResult.builder()
                .userId(tracker.getUserId())
                .exerciseId(1L) // Phishing exercise ID
                .score(100.0) // User succeeded by reporting
                .success(true)
                .duration(calculateDuration(tracker))
                .detailsJSON(java.util.Map.of(
                    "type", "phishing_campaign",
                    "campaignId", tracker.getCampaignId(),
                    "templateId", tracker.getCampaign().getTemplateId(),
                    "action", "reported"
                ))
                .build();

        resultRepository.save(result);
        
        log.info("Created exercise result (PASSED) for user {} - reported phishing", 
                tracker.getUserId());
    }

    /**
     * Calculate duration between email sent and action
     */
    private Integer calculateDuration(PhishingTracker tracker) {
        LocalDateTime sentAt = tracker.getSentAt();
        LocalDateTime actionAt = tracker.getClickedAt() != null 
                ? tracker.getClickedAt() 
                : tracker.getReportedAt();

        if (sentAt == null || actionAt == null) {
            return 0;
        }

        return (int) java.time.Duration.between(sentAt, actionAt).getSeconds();
    }

    /**
     * Manual trigger for phishing campaign (for testing or admin)
     */
    @Transactional
    public void triggerManualCampaign(Long templateId) {
        log.info("🚀 Manual phishing campaign triggered for template ID: {}", templateId);

        PhishingTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        List<User> activeUsers = userRepository.findAll().stream()
                .filter(User::getActive)
                .collect(Collectors.toList());

        PhishingCampaign campaign = PhishingCampaign.builder()
                .templateId(template.getId())
                .totalSent(activeUsers.size())
                .totalClicked(0)
                .totalOpened(0)
                .totalReported(0)
                .build();

        campaign = campaignRepository.save(campaign);

        for (User user : activeUsers) {
            try {
                sendPhishingEmail(user, template, campaign);
            } catch (Exception e) {
                log.error("Failed to send email to {}: {}", user.getEmail(), e.getMessage());
            }
        }

        log.info("✅ Manual campaign completed");
    }
}

