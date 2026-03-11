package io.cybersensei.phishing.controller;

import io.cybersensei.phishing.dto.SettingsDTO.*;
import io.cybersensei.phishing.service.SettingsService;
import io.cybersensei.security.UserPrincipal;
import io.cybersensei.util.HttpUtils;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * REST Controller for phishing module settings.
 */
@RestController
@RequestMapping("/api/phishing/settings")
@PreAuthorize("hasRole('ADMIN')")
public class PhishingSettingsController {

    private final SettingsService settingsService;

    public PhishingSettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PhishingSettingsResponseDTO> getPhishingSettings() {
        return ResponseEntity.ok(settingsService.getSettings());
    }

    @PostMapping("/smtp")
    public ResponseEntity<SmtpSettingsDTO> saveSmtpSettings(
            @RequestBody SmtpSettingsDTO dto,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request) {

        UUID userId = UUID.fromString(principal.getId().toString());
        String userEmail = principal.getEmail();
        String userIp = HttpUtils.getClientIpAddress(request);

        SmtpSettingsDTO saved = settingsService.saveSmtpSettings(dto, userId, userEmail, userIp);
        return ResponseEntity.ok(saved);
    }

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

    @GetMapping("/smtp")
    public ResponseEntity<SmtpSettingsDTO> getSmtpSettings() {
        SmtpSettingsDTO settings = settingsService.getSmtpSettings();
        if (settings == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(settings);
    }

    @PostMapping("/branding")
    public ResponseEntity<BrandingSettingsDTO> saveBrandingSettings(
            @RequestBody BrandingSettingsDTO dto,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request) {

        UUID userId = UUID.fromString(principal.getId().toString());
        String userEmail = principal.getEmail();
        String userIp = HttpUtils.getClientIpAddress(request);

        BrandingSettingsDTO saved = settingsService.saveBrandingSettings(dto, userId, userEmail, userIp);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/branding")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<BrandingSettingsDTO> getBrandingSettings() {
        BrandingSettingsDTO settings = settingsService.getBrandingSettings();
        if (settings == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(settings);
    }

}
