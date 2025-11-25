package io.cybersensei.api.controller;

import io.cybersensei.api.dto.CompanyMetricsDto;
import io.cybersensei.service.MetricsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Manager Dashboard Controller
 */
@RestController
@RequestMapping("/api/manager")
@RequiredArgsConstructor
@Tag(name = "Manager Dashboard", description = "Manager and admin endpoints")
@SecurityRequirement(name = "bearer-jwt")
@PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
public class ManagerController {

    private final MetricsService metricsService;

    @GetMapping("/metrics")
    @Operation(summary = "Get company-wide security metrics")
    public ResponseEntity<CompanyMetricsDto> getMetrics() {
        return ResponseEntity.ok(metricsService.getLatestMetrics());
    }
}


