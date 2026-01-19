package com.cybersensei.backend.phishing.service;

import com.cybersensei.backend.phishing.entity.*;
import com.cybersensei.backend.phishing.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Properties;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Service for sending phishing simulation emails with throttling and retry support.
 */
@Service
public class MailDeliveryService {

    private static final Logger log = LoggerFactory.getLogger(MailDeliveryService.class);
    private static final int MAX_RETRY_ATTEMPTS = 3;

    private final SettingsSmtpRepository smtpRepository;
    private final PhishingRecipientRepository recipientRepository;
    private final PhishingEventRepository eventRepository;
    private final EncryptionService encryptionService;
    private final TemplateService templateService;

    // Rate limiting
    private final ConcurrentHashMap<String, RateLimiter> rateLimiters = new ConcurrentHashMap<>();

    public MailDeliveryService(SettingsSmtpRepository smtpRepository,
                              PhishingRecipientRepository recipientRepository,
                              PhishingEventRepository eventRepository,
                              EncryptionService encryptionService,
                              TemplateService templateService) {
        this.smtpRepository = smtpRepository;
        this.recipientRepository = recipientRepository;
        this.eventRepository = eventRepository;
        this.encryptionService = encryptionService;
        this.templateService = templateService;
    }

    /**
     * Send phishing email to a recipient.
     */
    public SendResult sendEmail(PhishingRecipient recipient, PhishingTemplate template, 
            String trackingBaseUrl) {
        
        SettingsSmtp smtpSettings = smtpRepository.findFirstByIsActiveTrueOrderByCreatedAtDesc()
                .orElseThrow(() -> new RuntimeException("No active SMTP configuration found"));

        // Apply rate limiting
        RateLimiter limiter = rateLimiters.computeIfAbsent(
                smtpSettings.getId().toString(),
                k -> new RateLimiter(smtpSettings.getMaxRatePerMinute()));

        if (!limiter.tryAcquire()) {
            log.debug("Rate limited, waiting...");
            try {
                Thread.sleep(2000); // Wait 2 seconds before retry
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }

        try {
            // Prepare variables
            Map<String, String> variables = Map.of(
                    "firstName", recipient.getFirstName() != null ? recipient.getFirstName() : "",
                    "lastName", recipient.getLastName() != null ? recipient.getLastName() : "",
                    "email", recipient.getEmail(),
                    "department", recipient.getDepartment() != null ? recipient.getDepartment() : ""
            );

            // Render template
            Map<String, String> rendered = templateService.renderTemplate(
                    template, new java.util.HashMap<>(variables), trackingBaseUrl, recipient.getToken());

            // Create mail sender
            JavaMailSender mailSender = createMailSender(smtpSettings);

            // Create message
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(smtpSettings.getFromEmail(), 
                    smtpSettings.getFromName() != null ? smtpSettings.getFromName() : "");
            helper.setTo(recipient.getEmail());
            helper.setSubject(rendered.get("subject"));
            helper.setText(rendered.get("textBody"), rendered.get("htmlBody"));

            if (smtpSettings.getReplyTo() != null) {
                helper.setReplyTo(smtpSettings.getReplyTo());
            }

            // Send
            mailSender.send(message);

            // Update recipient status
            recipient.markAsSent();
            recipientRepository.save(recipient);

            // Log delivered event
            PhishingEvent event = PhishingEvent.createDeliveredEvent(recipient);
            eventRepository.save(event);

            log.info("Email sent successfully to {}", recipient.getEmail());
            return new SendResult(true, null);

        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", recipient.getEmail(), e.getMessage());
            
            recipient.setRetryCount(recipient.getRetryCount() + 1);
            if (recipient.getRetryCount() >= MAX_RETRY_ATTEMPTS) {
                recipient.markAsFailed(e.getMessage());
            }
            recipientRepository.save(recipient);

            return new SendResult(false, e.getMessage());
        }
    }

    private JavaMailSender createMailSender(SettingsSmtp settings) {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(settings.getHost());
        mailSender.setPort(settings.getPort());
        mailSender.setUsername(settings.getUsername());

        if (settings.getPasswordEncrypted() != null) {
            mailSender.setPassword(encryptionService.decrypt(settings.getPasswordEncrypted()));
        }

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        
        if (settings.getTlsEnabled()) {
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.starttls.required", "true");
        }
        if (settings.getSslEnabled()) {
            props.put("mail.smtp.ssl.enable", "true");
        }
        
        props.put("mail.smtp.auth", settings.getUsername() != null && !settings.getUsername().isEmpty());
        props.put("mail.smtp.connectiontimeout", "5000");
        props.put("mail.smtp.timeout", "5000");
        props.put("mail.smtp.writetimeout", "5000");

        return mailSender;
    }

    /**
     * Test SMTP configuration by sending a test email.
     */
    public boolean testSmtpConnection(SettingsSmtp settings, String testEmail) {
        try {
            JavaMailSender mailSender = createMailSender(settings);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

            helper.setFrom(settings.getFromEmail());
            helper.setTo(testEmail);
            helper.setSubject("CyberSensei - SMTP Test");
            helper.setText("This is a test email from CyberSensei phishing module.");

            mailSender.send(message);
            
            settings.markTestSuccess();
            smtpRepository.save(settings);
            
            return true;
        } catch (Exception e) {
            log.error("SMTP test failed: {}", e.getMessage());
            settings.markTestFailure();
            smtpRepository.save(settings);
            return false;
        }
    }

    /**
     * Simple rate limiter for email sending.
     */
    private static class RateLimiter {
        private final int maxPerMinute;
        private final AtomicInteger count = new AtomicInteger(0);
        private volatile long windowStart = System.currentTimeMillis();

        RateLimiter(int maxPerMinute) {
            this.maxPerMinute = maxPerMinute;
        }

        boolean tryAcquire() {
            long now = System.currentTimeMillis();
            if (now - windowStart > 60000) {
                // New minute window
                windowStart = now;
                count.set(0);
            }
            return count.incrementAndGet() <= maxPerMinute;
        }
    }

    /**
     * Result of a send attempt.
     */
    public record SendResult(boolean success, String errorMessage) {}
}

