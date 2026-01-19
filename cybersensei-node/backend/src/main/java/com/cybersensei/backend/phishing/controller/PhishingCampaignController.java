package com.cybersensei.backend.phishing.controller;

import com.cybersensei.backend.phishing.dto.CampaignResultsDTO;
import com.cybersensei.backend.phishing.dto.PhishingCampaignDTO;
import com.cybersensei.backend.phishing.dto.UserResultDTO;
import com.cybersensei.backend.phishing.service.CampaignService;
import com.cybersensei.backend.phishing.service.ReportingService;
import com.cybersensei.backend.phishing.service.TargetingService.TargetUser;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * REST Controller for phishing campaigns.
 */
@RestController
@RequestMapping("/api/phishing/campaigns")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class PhishingCampaignController {

    private final CampaignService campaignService;
    private final ReportingService reportingService;

    public PhishingCampaignController(CampaignService campaignService,
                                      ReportingService reportingService) {
        this.campaignService = campaignService;
        this.reportingService = reportingService;
    }

    @PostMapping
    public ResponseEntity<PhishingCampaignDTO> createCampaign(
            @RequestBody PhishingCampaignDTO dto,
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        PhishingCampaignDTO created = campaignService.createCampaign(dto, userId);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<PhishingCampaignDTO>> getAllCampaigns() {
        return ResponseEntity.ok(campaignService.getAllCampaigns());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PhishingCampaignDTO> getCampaign(@PathVariable UUID id) {
        return ResponseEntity.ok(campaignService.getCampaign(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PhishingCampaignDTO> updateCampaign(
            @PathVariable UUID id,
            @RequestBody PhishingCampaignDTO dto) {
        return ResponseEntity.ok(campaignService.updateCampaign(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCampaign(@PathVariable UUID id) {
        campaignService.deleteCampaign(id);
        return ResponseEntity.noContent().build();
    }

    // Campaign lifecycle actions

    @PostMapping("/{id}/schedule")
    public ResponseEntity<PhishingCampaignDTO> scheduleCampaign(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(campaignService.scheduleCampaign(id, userId));
    }

    @PostMapping("/{id}/pause")
    public ResponseEntity<PhishingCampaignDTO> pauseCampaign(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(campaignService.pauseCampaign(id, userId));
    }

    @PostMapping("/{id}/resume")
    public ResponseEntity<PhishingCampaignDTO> resumeCampaign(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(campaignService.resumeCampaign(id, userId));
    }

    @PostMapping("/{id}/stop")
    public ResponseEntity<PhishingCampaignDTO> stopCampaign(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(campaignService.stopCampaign(id, userId));
    }

    @PostMapping("/{id}/run-now")
    public ResponseEntity<PhishingCampaignDTO> runCampaignNow(
            @PathVariable UUID id,
            @RequestBody(required = false) List<TargetUser> targetUsers,
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        // In production, targetUsers would come from your user service
        // For now, we accept them in the request body for flexibility
        List<TargetUser> users = targetUsers != null ? targetUsers : List.of();
        return ResponseEntity.ok(campaignService.runCampaignNow(id, userId, users));
    }

    // Reporting endpoints

    @GetMapping("/{id}/results")
    public ResponseEntity<CampaignResultsDTO> getCampaignResults(@PathVariable UUID id) {
        return ResponseEntity.ok(reportingService.getCampaignResults(id));
    }

    @GetMapping("/{id}/results/daily")
    public ResponseEntity<List<CampaignResultsDTO.DailyResultDTO>> getDailyResults(
            @PathVariable UUID id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportingService.getDailyResults(id, startDate, endDate));
    }

    @GetMapping("/{id}/results/segments")
    public ResponseEntity<List<CampaignResultsDTO.DepartmentResultDTO>> getDepartmentResults(
            @PathVariable UUID id) {
        return ResponseEntity.ok(reportingService.getDepartmentBreakdown(id));
    }

    @GetMapping("/{id}/results/users")
    public ResponseEntity<List<UserResultDTO>> getUserResults(@PathVariable UUID id) {
        // Privacy-aware: will return anonymized or identified based on campaign settings
        return ResponseEntity.ok(reportingService.getUserResults(id));
    }
}

