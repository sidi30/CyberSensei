package io.cybersensei.phishing.service;

import io.cybersensei.phishing.entity.*;
import io.cybersensei.phishing.entity.PhishingEvent.EventType;
import io.cybersensei.phishing.repository.*;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for tracking phishing email interactions.
 * Handles opens, clicks, form submissions, and reports.
 */
@Service
@Transactional
public class TrackingService {

    private static final Logger log = LoggerFactory.getLogger(TrackingService.class);

    private final PhishingRecipientRepository recipientRepository;
    private final PhishingEventRepository eventRepository;
    private final PhishingTemplateRepository templateRepository;

    // Rate limiting per token (prevent flooding)
    private final ConcurrentHashMap<String, Bucket> rateLimitBuckets = new ConcurrentHashMap<>();

    public TrackingService(PhishingRecipientRepository recipientRepository,
                          PhishingEventRepository eventRepository,
                          PhishingTemplateRepository templateRepository) {
        this.recipientRepository = recipientRepository;
        this.eventRepository = eventRepository;
        this.templateRepository = templateRepository;
    }

    /**
     * Track email open event (from tracking pixel).
     */
    public TrackingResult trackOpen(String token, String ipAddress, String userAgent) {
        if (!checkRateLimit(token)) {
            return new TrackingResult(false, "Rate limited", null);
        }

        Optional<PhishingRecipient> recipientOpt = recipientRepository.findByToken(token);
        if (recipientOpt.isEmpty()) {
            log.warn("Open tracking: invalid token {}", token);
            return new TrackingResult(false, "Invalid token", null);
        }

        PhishingRecipient recipient = recipientOpt.get();

        // Check if already tracked (deduplicate)
        if (!eventRepository.existsByTokenAndEventType(token, EventType.OPENED)) {
            PhishingEvent event = PhishingEvent.createOpenedEvent(recipient, ipAddress, userAgent);
            eventRepository.save(event);
            log.info("Tracked OPENED for token {}", token.substring(0, 8));
        }

        return new TrackingResult(true, null, null);
    }

    /**
     * Track link click event.
     */
    public TrackingResult trackClick(String token, String linkId, String ipAddress, String userAgent) {
        if (!checkRateLimit(token)) {
            return new TrackingResult(false, "Rate limited", null);
        }

        Optional<PhishingRecipient> recipientOpt = recipientRepository.findByToken(token);
        if (recipientOpt.isEmpty()) {
            log.warn("Click tracking: invalid token {}", token);
            return new TrackingResult(false, "Invalid token", null);
        }

        PhishingRecipient recipient = recipientOpt.get();

        // Record click event (allow multiple clicks for different links)
        PhishingEvent event = PhishingEvent.createClickedEvent(recipient, linkId, ipAddress, userAgent);
        eventRepository.save(event);
        log.info("Tracked CLICKED for token {} link {}", token.substring(0, 8), linkId);

        // Get landing page content
        PhishingTemplate template = recipient.getCampaign().getTemplate();
        String landingPage = template != null ? template.getLandingPageHtml() : null;

        return new TrackingResult(true, null, landingPage);
    }

    /**
     * Track form data submission (NEVER store actual credentials).
     */
    public TrackingResult trackFormSubmit(String token, String ipAddress, String userAgent) {
        if (!checkRateLimit(token)) {
            return new TrackingResult(false, "Rate limited", null);
        }

        Optional<PhishingRecipient> recipientOpt = recipientRepository.findByToken(token);
        if (recipientOpt.isEmpty()) {
            log.warn("Form submit tracking: invalid token {}", token);
            return new TrackingResult(false, "Invalid token", null);
        }

        PhishingRecipient recipient = recipientOpt.get();

        // Only record that a submission happened (no actual data stored)
        if (!eventRepository.existsByTokenAndEventType(token, EventType.DATA_SUBMITTED)) {
            PhishingEvent event = new PhishingEvent();
            event.setCampaign(recipient.getCampaign());
            event.setCampaignRun(recipient.getCampaignRun());
            event.setRecipient(recipient);
            event.setUserId(recipient.getUserId());
            event.setToken(token);
            event.setEventType(EventType.DATA_SUBMITTED);
            event.setIpAddress(ipAddress);
            event.setUserAgent(userAgent);
            // Explicitly NOT storing form data for security
            event.setMetadata(Map.of("note", "Form submission detected - no credentials stored"));
            eventRepository.save(event);
            log.info("Tracked DATA_SUBMITTED for token {}", token.substring(0, 8));
        }

        return new TrackingResult(true, null, getFormSubmitLandingPage());
    }

    /**
     * Track phishing report (user reported the email).
     */
    public TrackingResult trackReport(String token, String ipAddress, String userAgent) {
        if (!checkRateLimit(token)) {
            return new TrackingResult(false, "Rate limited", null);
        }

        Optional<PhishingRecipient> recipientOpt = recipientRepository.findByToken(token);
        if (recipientOpt.isEmpty()) {
            log.warn("Report tracking: invalid token {}", token);
            return new TrackingResult(false, "Invalid token", null);
        }

        PhishingRecipient recipient = recipientOpt.get();

        // Record report
        if (!eventRepository.existsByTokenAndEventType(token, EventType.REPORTED)) {
            PhishingEvent event = new PhishingEvent();
            event.setCampaign(recipient.getCampaign());
            event.setCampaignRun(recipient.getCampaignRun());
            event.setRecipient(recipient);
            event.setUserId(recipient.getUserId());
            event.setToken(token);
            event.setEventType(EventType.REPORTED);
            event.setIpAddress(ipAddress);
            event.setUserAgent(userAgent);
            eventRepository.save(event);
            log.info("Tracked REPORTED for token {}", token.substring(0, 8));
        }

        return new TrackingResult(true, null, getReportConfirmationPage());
    }

    /**
     * Calculate time-to-click in seconds from sent time.
     */
    public Integer calculateTimeToClick(String token) {
        Optional<PhishingRecipient> recipientOpt = recipientRepository.findByToken(token);
        if (recipientOpt.isEmpty() || recipientOpt.get().getSentAt() == null) {
            return null;
        }

        var clickEvents = eventRepository.findByTokenAndEventType(token, EventType.CLICKED);
        if (clickEvents.isEmpty()) {
            return null;
        }

        OffsetDateTime sentAt = recipientOpt.get().getSentAt();
        OffsetDateTime firstClickAt = clickEvents.stream()
                .map(PhishingEvent::getEventAt)
                .min(OffsetDateTime::compareTo)
                .orElse(null);

        if (firstClickAt == null) {
            return null;
        }

        return (int) Duration.between(sentAt, firstClickAt).getSeconds();
    }

    /**
     * Simple rate limiting using token bucket.
     */
    private boolean checkRateLimit(String token) {
        Bucket bucket = rateLimitBuckets.computeIfAbsent(token, k -> 
            Bucket.builder()
                .addLimit(Bandwidth.classic(20, Refill.greedy(20, Duration.ofMinutes(1))))
                .build()
        );
        return bucket.tryConsume(1);
    }

    private String getFormSubmitLandingPage() {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Security Training</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 700px; margin: 50px auto; padding: 20px; }
                    .critical { background: #f8d7da; border: 1px solid #f5c6cb; padding: 25px; border-radius: 8px; }
                    h1 { color: #721c24; }
                </style>
            </head>
            <body>
                <div class="critical">
                    <h1>🚨 This was a simulation!</h1>
                    <p>You submitted information to a simulated phishing page.</p>
                    <p><strong>Don't worry:</strong> This was a training exercise and no real data was captured or stored.</p>
                    <p>In a real attack, your credentials would have been stolen. Always verify the legitimacy of login pages before entering sensitive information.</p>
                </div>
            </body>
            </html>
            """;
    }

    private String getReportConfirmationPage() {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Thank You!</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 700px; margin: 50px auto; padding: 20px; }
                    .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 25px; border-radius: 8px; }
                    h1 { color: #155724; }
                </style>
            </head>
            <body>
                <div class="success">
                    <h1>✅ Excellent work!</h1>
                    <p>You correctly identified and reported this simulated phishing email.</p>
                    <p>This vigilance is exactly what protects our organization from real threats.</p>
                    <p>Thank you for being security-conscious!</p>
                </div>
            </body>
            </html>
            """;
    }

    /**
     * Result of a tracking operation.
     */
    public record TrackingResult(boolean success, String errorMessage, String landingPageHtml) {}
}

