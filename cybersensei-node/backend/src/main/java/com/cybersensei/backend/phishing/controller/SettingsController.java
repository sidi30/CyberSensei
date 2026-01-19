package com.cybersensei.backend.phishing.controller;

import com.cybersensei.backend.phishing.dto.SettingsDTO.*;
import com.cybersensei.backend.phishing.service.SettingsService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * REST Controller for phishing module settings.
 */
@RestController
@RequestMapping("/api/settings")
@PreAuthorize("hasRole('ADMIN')")
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    /**
     * Get all phishing settings.
     */
    @GetMapping("/phishing")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PhishingSettingsResponseDTO> getPhishingSettings() {
        return ResponseEntity.ok(settingsService.getSettings());
    }

    /**
     * Save SMTP settings.
     */
    @PostMapping("/smtp")
    public ResponseEntity<SmtpSettingsDTO> saveSmtpSettings(
            @RequestBody SmtpSettingsDTO dto,
            @AuthenticationPrincipal Jwt jwt,
            HttpServletRequest request) {
        
        UUID userId = UUID.fromString(jwt.getSubject());
        String userEmail = jwt.getClaimAsString("email");
        String userIp = getClientIpAddress(request);

        SmtpSettingsDTO saved = settingsService.saveSmtpSettings(dto, userId, userEmail, userIp);
        return ResponseEntity.ok(saved);
    }

    /**
     * Test SMTP settings.
     */
    @PostMapping("/smtp/{id}/test")
    public ResponseEntity<Map<String, Object>> testSmtpSettings(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request) {
        
        String testEmail = request.get("testEmail");
        if (testEmail == null || testEmail.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Test email is required"));
        }

        boolean success = settingsService.testSmtpSettings(id, testEmail);
        
        return ResponseEntity.ok(Map.of(
                "success", success,
                "message", success ? "Test email sent successfully" : "Failed to send test email"
        ));
    }

    /**
     * Get SMTP settings.
     */
    @GetMapping("/smtp")
    public ResponseEntity<SmtpSettingsDTO> getSmtpSettings() {
        SmtpSettingsDTO settings = settingsService.getSmtpSettings();
        if (settings == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(settings);
    }

    /**
     * Save branding settings.
     */
    @PostMapping("/branding")
    public ResponseEntity<BrandingSettingsDTO> saveBrandingSettings(
            @RequestBody BrandingSettingsDTO dto,
            @AuthenticationPrincipal Jwt jwt,
            HttpServletRequest request) {
        
        UUID userId = UUID.fromString(jwt.getSubject());
        String userEmail = jwt.getClaimAsString("email");
        String userIp = getClientIpAddress(request);

        BrandingSettingsDTO saved = settingsService.saveBrandingSettings(dto, userId, userEmail, userIp);
        return ResponseEntity.ok(saved);
    }

    /**
     * Get branding settings.
     */
    @GetMapping("/branding")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<BrandingSettingsDTO> getBrandingSettings() {
        BrandingSettingsDTO settings = settingsService.getBrandingSettings();
        if (settings == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(settings);
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

