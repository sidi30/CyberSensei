package io.cybersensei.service;

import io.cybersensei.api.dto.PhishingCampaignDto;
import io.cybersensei.api.mapper.PhishingCampaignMapper;
import io.cybersensei.domain.entity.*;
import io.cybersensei.domain.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Phishing Campaign Service
 * Handles sending phishing training emails and tracking interactions
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PhishingService {

    private final PhishingTemplateRepository templateRepository;
    private final PhishingCampaignRepository campaignRepository;
    private final PhishingTrackerRepository trackerRepository;
    private final UserRepository userRepository;
    private final PhishingCampaignMapper campaignMapper;
    private final JavaMailSender mailSender;

    @Value("${cybersensei.phishing.tracking-url}")
    private String trackingUrl;

    @Value("${cybersensei.phishing.enabled}")
    private boolean phishingEnabled;

    @Scheduled(cron = "${cybersensei.phishing.daily-send-cron}")
    @Transactional
    public void sendDailyPhishingCampaign() {
        if (!phishingEnabled) {
            log.info("Phishing campaigns are disabled");
            return;
        }

        log.info("Starting daily phishing campaign");

        PhishingTemplate template = templateRepository.findRandomActiveTemplate();
        if (template == null) {
            log.warn("No active phishing templates found");
            return;
        }

        List<User> activeUsers = userRepository.findAll().stream()
                .filter(User::getActive)
                .collect(Collectors.toList());

        if (activeUsers.isEmpty()) {
            log.warn("No active users found for phishing campaign");
            return;
        }

        PhishingCampaign campaign = PhishingCampaign.builder()
                .templateId(template.getId())
                .totalSent(activeUsers.size())
                .totalClicked(0)
                .totalOpened(0)
                .totalReported(0)
                .build();

        campaign = campaignRepository.save(campaign);

        for (User user : activeUsers) {
            sendPhishingEmail(user, template, campaign);
        }

        log.info("Phishing campaign {} sent to {} users", campaign.getId(), activeUsers.size());
    }

    @Transactional
    public void sendPhishingEmail(User user, PhishingTemplate template, PhishingCampaign campaign) {
        String token = UUID.randomUUID().toString();

        PhishingTracker tracker = PhishingTracker.builder()
                .token(token)
                .userId(user.getId())
                .campaignId(campaign.getId())
                .clicked(false)
                .opened(false)
                .reported(false)
                .build();

        trackerRepository.save(tracker);

        String trackingPixelUrl = trackingUrl + "/api/phishing/track/pixel/" + token;
        String phishingLinkUrl = trackingUrl + "/api/phishing/track/click/" + token;

        String htmlContent = template.getHtmlContent()
                .replace("{{TRACKING_PIXEL}}", trackingPixelUrl)
                .replace("{{PHISHING_LINK}}", phishingLinkUrl)
                .replace("{{USER_NAME}}", user.getName());

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(user.getEmail());
            helper.setSubject(template.getSubject());
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Phishing email sent to user {} ({})", user.getName(), user.getEmail());

        } catch (Exception e) {
            log.error("Failed to send phishing email to {}: {}", user.getEmail(), e.getMessage());
        }
    }

    @Transactional
    public void trackPixelOpen(String token) {
        PhishingTracker tracker = trackerRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Tracker not found"));

        if (!tracker.getOpened()) {
            tracker.setOpened(true);
            tracker.setOpenedAt(LocalDateTime.now());
            trackerRepository.save(tracker);

            updateCampaignStats(tracker.getCampaignId());
            log.info("Email opened by user {}", tracker.getUserId());
        }
    }

    @Transactional
    public void trackLinkClick(String token) {
        PhishingTracker tracker = trackerRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Tracker not found"));

        if (!tracker.getClicked()) {
            tracker.setClicked(true);
            tracker.setClickedAt(LocalDateTime.now());
            trackerRepository.save(tracker);

            updateCampaignStats(tracker.getCampaignId());
            log.warn("Phishing link clicked by user {}", tracker.getUserId());
        }
    }

    @Transactional
    public void reportPhishing(String token) {
        PhishingTracker tracker = trackerRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Tracker not found"));

        if (!tracker.getReported()) {
            tracker.setReported(true);
            tracker.setReportedAt(LocalDateTime.now());
            trackerRepository.save(tracker);

            updateCampaignStats(tracker.getCampaignId());
            log.info("Phishing email reported by user {} - Good job!", tracker.getUserId());
        }
    }

    private void updateCampaignStats(Long campaignId) {
        PhishingCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));

        campaign.setTotalClicked(trackerRepository.countClickedByCampaignId(campaignId));
        campaign.setTotalOpened(trackerRepository.countOpenedByCampaignId(campaignId));
        campaign.setTotalReported(trackerRepository.countReportedByCampaignId(campaignId));

        campaignRepository.save(campaign);
    }

    @Transactional(readOnly = true)
    public List<PhishingCampaignDto> getRecentCampaigns(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return campaignRepository.findBySentAtAfterOrderBySentAtDesc(since).stream()
                .map(campaignMapper::toDto)
                .collect(Collectors.toList());
    }
}


