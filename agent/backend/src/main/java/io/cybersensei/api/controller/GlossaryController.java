package io.cybersensei.api.controller;

import io.cybersensei.service.GlossaryService;
import io.cybersensei.service.GlossaryService.GlossaryEntry;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Glossary Controller - Termes de cybersécurité
 */
@RestController
@RequestMapping("/api/glossary")
@RequiredArgsConstructor
@Tag(name = "Glossary", description = "Glossaire des termes de cybersécurité")
public class GlossaryController {

    private final GlossaryService glossaryService;

    @GetMapping("/search")
    @Operation(summary = "Rechercher un terme dans le glossaire")
    public ResponseEntity<GlossaryEntry> searchTerm(@RequestParam String term) {
        return glossaryService.findByTerm(term)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/all")
    @Operation(summary = "Récupérer tous les termes du glossaire")
    public ResponseEntity<Map<String, GlossaryEntry>> getAllTerms() {
        return ResponseEntity.ok(glossaryService.getAllTerms());
    }

    @GetMapping("/categories")
    @Operation(summary = "Récupérer les termes par catégorie")
    public ResponseEntity<Map<String, List<String>>> getCategories() {
        return ResponseEntity.ok(glossaryService.getTermsByCategory());
    }

    @GetMapping("/related/{term}")
    @Operation(summary = "Récupérer les termes liés")
    public ResponseEntity<List<GlossaryEntry>> getRelatedTerms(@PathVariable String term) {
        return ResponseEntity.ok(glossaryService.getRelatedTerms(term));
    }
}
