package io.cybersensei.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/license")
@Tag(name = "License", description = "License info (dev/demo)")
public class LicenseController {

    @GetMapping("/info")
    @Operation(summary = "Get license info")
    public ResponseEntity<Map<String, Object>> getInfo() {
        return ResponseEntity.ok(Map.of(
                "type", "PREMIUM",
                "tenantId", "demo-tenant",
                "expiresAt", LocalDateTime.now().plusMonths(6).toString(),
                "maxUsers", 999,
                "features", List.of("ALL")
        ));
    }
}



