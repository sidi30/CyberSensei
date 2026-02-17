package io.cybersensei.api.controller;

import io.cybersensei.api.dto.BadgeDTO;
import io.cybersensei.api.dto.ModuleProgressDTO;
import io.cybersensei.api.dto.UserDashboardDTO;
import io.cybersensei.service.ProgressionService;
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
@RequestMapping("/api/progression")
@RequiredArgsConstructor
@Tag(name = "Progression", description = "Gestion de la progression utilisateur, modules et badges")
@CrossOrigin(origins = "*")
public class ProgressionController {

    private final ProgressionService progressionService;

    /**
     * Récupère le dashboard complet d'un utilisateur
     */
    @GetMapping("/dashboard/{userId}")
    @Operation(summary = "Dashboard utilisateur complet", 
               description = "Récupère toutes les informations de progression, niveau, badges et modules")
    public ResponseEntity<UserDashboardDTO> getUserDashboard(
            @Parameter(description = "ID de l'utilisateur") 
            @PathVariable Long userId) {
        log.info("GET /api/progression/dashboard/{}", userId);
        
        UserDashboardDTO dashboard = progressionService.getUserDashboard(userId);
        return ResponseEntity.ok(dashboard);
    }

    /**
     * Récupère la progression de tous les modules pour un utilisateur
     */
    @GetMapping("/modules/{userId}")
    @Operation(summary = "Progression des modules", 
               description = "Récupère la progression de tous les modules pour un utilisateur")
    public ResponseEntity<List<ModuleProgressDTO>> getModulesProgress(
            @Parameter(description = "ID de l'utilisateur") 
            @PathVariable Long userId) {
        log.info("GET /api/progression/modules/{}", userId);
        
        List<ModuleProgressDTO> progress = progressionService.getModulesProgressForUser(userId);
        return ResponseEntity.ok(progress);
    }

    /**
     * Récupère la progression d'un module spécifique
     */
    @GetMapping("/modules/{userId}/{moduleId}")
    @Operation(summary = "Progression d'un module spécifique", 
               description = "Récupère les détails de progression pour un module donné")
    public ResponseEntity<ModuleProgressDTO> getModuleProgress(
            @Parameter(description = "ID de l'utilisateur") 
            @PathVariable Long userId,
            @Parameter(description = "ID du module") 
            @PathVariable Long moduleId) {
        log.info("GET /api/progression/modules/{}/{}", userId, moduleId);
        
        ModuleProgressDTO progress = progressionService.getModuleProgress(userId, moduleId);
        return ResponseEntity.ok(progress);
    }

    /**
     * Récupère tous les badges obtenus par un utilisateur
     */
    @GetMapping("/badges/{userId}")
    @Operation(summary = "Badges obtenus", 
               description = "Récupère la liste des badges obtenus par l'utilisateur")
    public ResponseEntity<List<BadgeDTO>> getUserBadges(
            @Parameter(description = "ID de l'utilisateur") 
            @PathVariable Long userId) {
        log.info("GET /api/progression/badges/{}", userId);
        
        List<BadgeDTO> badges = progressionService.getUserBadges(userId);
        return ResponseEntity.ok(badges);
    }

    /**
     * Récupère tous les badges disponibles avec statut (obtenu ou non)
     */
    @GetMapping("/badges/all/{userId}")
    @Operation(summary = "Tous les badges", 
               description = "Récupère tous les badges disponibles avec indication si l'utilisateur les a obtenus")
    public ResponseEntity<List<BadgeDTO>> getAllBadges(
            @Parameter(description = "ID de l'utilisateur") 
            @PathVariable Long userId) {
        log.info("GET /api/progression/badges/all/{}", userId);
        
        List<BadgeDTO> badges = progressionService.getAllBadgesForUser(userId);
        return ResponseEntity.ok(badges);
    }
}

