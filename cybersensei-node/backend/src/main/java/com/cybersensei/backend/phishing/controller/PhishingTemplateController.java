package com.cybersensei.backend.phishing.controller;

import com.cybersensei.backend.phishing.dto.PhishingTemplateDTO;
import com.cybersensei.backend.phishing.service.TemplateService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller for phishing templates.
 */
@RestController
@RequestMapping("/api/phishing/templates")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class PhishingTemplateController {

    private final TemplateService templateService;

    public PhishingTemplateController(TemplateService templateService) {
        this.templateService = templateService;
    }

    @PostMapping
    public ResponseEntity<PhishingTemplateDTO> createTemplate(@RequestBody PhishingTemplateDTO dto) {
        PhishingTemplateDTO created = templateService.createTemplate(dto);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<PhishingTemplateDTO>> getAllTemplates(
            @RequestParam(required = false) Boolean activeOnly) {
        
        List<PhishingTemplateDTO> templates;
        if (Boolean.TRUE.equals(activeOnly)) {
            templates = templateService.getActiveTemplates();
        } else {
            templates = templateService.getAllTemplates();
        }
        return ResponseEntity.ok(templates);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PhishingTemplateDTO> getTemplate(@PathVariable UUID id) {
        PhishingTemplateDTO template = templateService.getTemplate(id);
        return ResponseEntity.ok(template);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PhishingTemplateDTO> updateTemplate(
            @PathVariable UUID id,
            @RequestBody PhishingTemplateDTO dto) {
        PhishingTemplateDTO updated = templateService.updateTemplate(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable UUID id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/themes")
    public ResponseEntity<List<String>> getAvailableThemes() {
        return ResponseEntity.ok(templateService.getAvailableThemes());
    }

    @GetMapping("/by-theme/{theme}")
    public ResponseEntity<List<PhishingTemplateDTO>> getTemplatesByTheme(@PathVariable String theme) {
        return ResponseEntity.ok(templateService.getTemplatesByTheme(theme));
    }
}

