package io.cybersensei.phishing.controller;

import io.cybersensei.phishing.dto.CampaignResultsDTO;
import io.cybersensei.phishing.dto.PhishingCampaignDTO;
import io.cybersensei.phishing.dto.UserResultDTO;
import io.cybersensei.phishing.service.CampaignService;
import io.cybersensei.phishing.service.ReportingService;
import io.cybersensei.phishing.service.TargetingService.TargetUser;
import io.cybersensei.security.UserPrincipal;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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

    private static UUID toUuid(Long userId) {
        return new UUID(0, userId);
    }

    @PostMapping
    public ResponseEntity<PhishingCampaignDTO> createCampaign(
            @RequestBody PhishingCampaignDTO dto,
            @AuthenticationPrincipal UserPrincipal principal) {
        PhishingCampaignDTO created = campaignService.createCampaign(dto, toUuid(principal.getId()));
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
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(campaignService.scheduleCampaign(id, toUuid(principal.getId())));
    }

    @PostMapping("/{id}/pause")
    public ResponseEntity<PhishingCampaignDTO> pauseCampaign(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(campaignService.pauseCampaign(id, toUuid(principal.getId())));
    }

    @PostMapping("/{id}/resume")
    public ResponseEntity<PhishingCampaignDTO> resumeCampaign(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(campaignService.resumeCampaign(id, toUuid(principal.getId())));
    }

    @PostMapping("/{id}/stop")
    public ResponseEntity<PhishingCampaignDTO> stopCampaign(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(campaignService.stopCampaign(id, toUuid(principal.getId())));
    }

    @PostMapping("/{id}/run-now")
    public ResponseEntity<PhishingCampaignDTO> runCampaignNow(
            @PathVariable UUID id,
            @RequestBody(required = false) List<TargetUser> targetUsers,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<TargetUser> users = targetUsers != null ? targetUsers : List.of();
        return ResponseEntity.ok(campaignService.runCampaignNow(id, toUuid(principal.getId()), users));
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

