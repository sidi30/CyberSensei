package io.cybersensei.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@Tag(name = "Settings", description = "SMTP & frequency settings (dev/demo)")
public class SettingsController {

    @GetMapping
    @Operation(summary = "Get all settings")
    public ResponseEntity<Map<String, Object>> getAllSettings() {
        // Return flat structure expected by frontend
        return ResponseEntity.ok(Map.of(
                "phishingFrequency", 1,
                "trainingIntensity", "medium"
        ));
    }

    @GetMapping("/smtp")
    @Operation(summary = "Get SMTP configuration")
    public ResponseEntity<Map<String, Object>> getSmtp() {
        return ResponseEntity.ok(Map.of(
                "host", "smtp.gmail.com",
                "port", 587,
                "username", "noreply@cybersensei.io",
                "password", "",
                "fromEmail", "noreply@cybersensei.io",
                "fromName", "CyberSensei"
        ));
    }

    @PostMapping("/smtp")
    @Operation(summary = "Save SMTP configuration")
    public ResponseEntity<Void> saveSmtp(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok().build();
    }

    @GetMapping("/frequency")
    @Operation(summary = "Get frequency configuration")
    public ResponseEntity<Map<String, Object>> getFrequency() {
        return ResponseEntity.ok(Map.of(
                "phishingFrequency", 1,
                "trainingIntensity", "MEDIUM"
        ));
    }

    @PostMapping("/frequency")
    @Operation(summary = "Save frequency configuration")
    public ResponseEntity<Void> saveFrequency(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok().build();
    }

    @PostMapping("/save")
    @Operation(summary = "Save generic settings")
    public ResponseEntity<Void> saveSettings(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok().build();
    }
}



