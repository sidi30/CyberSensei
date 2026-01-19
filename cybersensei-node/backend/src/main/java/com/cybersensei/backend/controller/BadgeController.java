package com.cybersensei.backend.controller;

import com.cybersensei.backend.dto.BadgeDTO;
import com.cybersensei.backend.service.ProgressionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/badges")
@RequiredArgsConstructor
@Tag(name = "Badges", description = "Gestion des badges utilisateur")
@CrossOrigin(origins = "*")
public class BadgeController {

    private final ProgressionService progressionService;

    /**
     * Récupère tous les badges obtenus par un utilisateur
     */
    @GetMapping("/user/{userId}")
    @Operation(summary = "Badges obtenus", 
               description = "Récupère la liste des badges obtenus par l'utilisateur")
    public ResponseEntity<List<BadgeDTO>> getUserBadges(
            @Parameter(description = "ID de l'utilisateur") 
            @PathVariable Long userId) {
        log.info("GET /api/badges/user/{}", userId);
        
        List<BadgeDTO> badges = progressionService.getUserBadges(userId);
        return ResponseEntity.ok(badges);
    }

    /**
     * Récupère tous les badges disponibles avec indication si obtenu ou non
     */
    @GetMapping("/all/{userId}")
    @Operation(summary = "Tous les badges", 
               description = "Récupère tous les badges disponibles avec statut obtenu/non obtenu")
    public ResponseEntity<List<BadgeDTO>> getAllBadgesForUser(
            @Parameter(description = "ID de l'utilisateur") 
            @PathVariable Long userId) {
        log.info("GET /api/badges/all/{}", userId);
        
        List<BadgeDTO> badges = progressionService.getAllBadgesForUser(userId);
        return ResponseEntity.ok(badges);
    }
}

