package com.cybersensei.backend.service;

import com.cybersensei.backend.dto.BadgeDTO;
import com.cybersensei.backend.dto.ModuleProgressDTO;
import com.cybersensei.backend.dto.UserDashboardDTO;
import com.cybersensei.backend.entity.Badge;
import com.cybersensei.backend.entity.Module;
import com.cybersensei.backend.entity.UserBadge;
import com.cybersensei.backend.entity.UserLevel;
import com.cybersensei.backend.entity.UserModuleProgress;
import com.cybersensei.backend.repository.BadgeRepository;
import com.cybersensei.backend.repository.ModuleRepository;
import com.cybersensei.backend.repository.UserBadgeRepository;
import com.cybersensei.backend.repository.UserLevelRepository;
import com.cybersensei.backend.repository.UserModuleProgressRepository;
import io.cybersensei.domain.entity.User;
import io.cybersensei.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProgressionService {

    private final UserRepository userRepository;
    private final ModuleRepository moduleRepository;
    private final UserModuleProgressRepository progressRepository;
    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final UserLevelRepository levelRepository;

    /**
     * Récupère le dashboard complet d'un utilisateur
     */
    @Transactional(readOnly = true)
    public UserDashboardDTO getUserDashboard(Long userId) {
        log.info("Fetching dashboard for user ID: {}", userId);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        
        // Récupérer le niveau de l'utilisateur
        UserLevel userLevel = levelRepository.findByUserId(userId)
            .orElseGet(() -> initializeUserLevel(userId));
        
        // Récupérer la progression par module
        List<ModuleProgressDTO> modulesProgress = getModulesProgressForUser(userId);
        
        // Récupérer les badges obtenus
        List<BadgeDTO> badges = getUserBadges(userId);
        
        // Calculer statistiques globales
        Double overallCompletion = modulesProgress.stream()
            .mapToDouble(ModuleProgressDTO::getCompletionPercentage)
            .average()
            .orElse(0.0);
        
        Double averageScore = modulesProgress.stream()
            .filter(m -> m.getAverageScore() > 0)
            .mapToDouble(ModuleProgressDTO::getAverageScore)
            .average()
            .orElse(0.0);
        
        Integer totalExercises = modulesProgress.stream()
            .mapToInt(ModuleProgressDTO::getExercisesCompleted)
            .sum();
        
        // Trouver le module suggéré (premier module non complété)
        ModuleProgressDTO suggestedModule = modulesProgress.stream()
            .filter(m -> !"COMPLETED".equals(m.getStatus()))
            .findFirst()
            .orElse(null);
        
        return UserDashboardDTO.builder()
            .userId(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .currentLevel(userLevel.getCurrentLevel())
            .totalXp(userLevel.getTotalXp())
            .xpToNextLevel(userLevel.getXpToNextLevel())
            .rank(userLevel.getRank())
            .modulesCompleted(userLevel.getModulesCompleted())
            .totalModules(15) // 15 modules au total
            .totalBadges(userLevel.getTotalBadges())
            .streakDays(userLevel.getStreakDays())
            .lastActivityDate(userLevel.getLastActivityDate())
            .modulesProgress(modulesProgress)
            .badgesEarned(badges)
            .suggestedNextModule(suggestedModule)
            .overallCompletionPercentage(overallCompletion)
            .averageScore(averageScore)
            .totalExercisesCompleted(totalExercises)
            .build();
    }

    /**
     * Récupère la progression de tous les modules pour un utilisateur
     */
    @Transactional(readOnly = true)
    public List<ModuleProgressDTO> getModulesProgressForUser(Long userId) {
        log.info("Fetching modules progress for user ID: {}", userId);
        
        List<Module> allModules = moduleRepository.findByActiveOrderByOrderIndexAsc(true);
        List<UserModuleProgress> userProgress = progressRepository.findByUserIdWithModule(userId);
        
        return allModules.stream().map(module -> {
            Optional<UserModuleProgress> progress = userProgress.stream()
                .filter(p -> p.getModule().getId().equals(module.getId()))
                .findFirst();
            
            if (progress.isPresent()) {
                UserModuleProgress p = progress.get();
                
                // Vérifier si le badge a été obtenu
                Optional<Badge> moduleBadge = badgeRepository
                    .findByRequirementTypeAndRequirementValueAndActive(
                        "MODULE_COMPLETE", module.getName(), true
                    );
                
                Boolean badgeEarned = moduleBadge.map(badge -> 
                    userBadgeRepository.existsByUserIdAndBadgeId(userId, badge.getId())
                ).orElse(false);
                
                return ModuleProgressDTO.builder()
                    .moduleId(module.getId())
                    .moduleName(module.getName())
                    .displayName(module.getDisplayName())
                    .description(module.getDescription())
                    .difficulty(module.getDifficulty())
                    .totalExercises(p.getTotalExercises())
                    .exercisesCompleted(p.getExercisesCompleted())
                    .exercisesSuccess(p.getExercisesSuccess())
                    .completionPercentage(p.getCompletionPercentage())
                    .averageScore(p.getAverageScore())
                    .status(p.getStatus())
                    .iconUrl(module.getIconUrl())
                    .startedAt(p.getStartedAt())
                    .completedAt(p.getCompletedAt())
                    .lastActivityAt(p.getLastActivityAt())
                    .badgeEarned(badgeEarned)
                    .badgeName(moduleBadge.map(Badge::getDisplayName).orElse(null))
                    .build();
            } else {
                // Module pas encore commencé
                return ModuleProgressDTO.builder()
                    .moduleId(module.getId())
                    .moduleName(module.getName())
                    .displayName(module.getDisplayName())
                    .description(module.getDescription())
                    .difficulty(module.getDifficulty())
                    .totalExercises(module.getTotalExercises())
                    .exercisesCompleted(0)
                    .exercisesSuccess(0)
                    .completionPercentage(0.0)
                    .averageScore(0.0)
                    .status("NOT_STARTED")
                    .iconUrl(module.getIconUrl())
                    .badgeEarned(false)
                    .build();
            }
        }).collect(Collectors.toList());
    }

    /**
     * Récupère tous les badges obtenus par un utilisateur
     */
    @Transactional(readOnly = true)
    public List<BadgeDTO> getUserBadges(Long userId) {
        log.info("Fetching badges for user ID: {}", userId);
        
        List<UserBadge> userBadges = userBadgeRepository.findByUserIdWithBadge(userId);
        
        return userBadges.stream()
            .map(ub -> BadgeDTO.builder()
                .badgeId(ub.getBadge().getId())
                .name(ub.getBadge().getName())
                .displayName(ub.getBadge().getDisplayName())
                .description(ub.getBadge().getDescription())
                .iconUrl(ub.getBadge().getIconUrl())
                .badgeType(ub.getBadge().getBadgeType())
                .rarity(ub.getBadge().getRarity())
                .points(ub.getBadge().getPoints())
                .earnedAt(ub.getEarnedAt())
                .earned(true)
                .build())
            .collect(Collectors.toList());
    }

    /**
     * Récupère tous les badges disponibles avec indication si l'utilisateur les a obtenus
     */
    @Transactional(readOnly = true)
    public List<BadgeDTO> getAllBadgesForUser(Long userId) {
        log.info("Fetching all badges with earned status for user ID: {}", userId);
        
        List<Badge> allBadges = badgeRepository.findByActiveOrderByOrderIndexAsc(true);
        List<UserBadge> userBadges = userBadgeRepository.findByUserIdWithBadge(userId);
        
        return allBadges.stream()
            .map(badge -> {
                Optional<UserBadge> earned = userBadges.stream()
                    .filter(ub -> ub.getBadge().getId().equals(badge.getId()))
                    .findFirst();
                
                return BadgeDTO.builder()
                    .badgeId(badge.getId())
                    .name(badge.getName())
                    .displayName(badge.getDisplayName())
                    .description(badge.getDescription())
                    .iconUrl(badge.getIconUrl())
                    .badgeType(badge.getBadgeType())
                    .rarity(badge.getRarity())
                    .points(badge.getPoints())
                    .earnedAt(earned.map(UserBadge::getEarnedAt).orElse(null))
                    .earned(earned.isPresent())
                    .build();
            })
            .collect(Collectors.toList());
    }

    /**
     * Initialise le niveau d'un utilisateur
     */
    @Transactional
    public UserLevel initializeUserLevel(Long userId) {
        log.info("Initializing user level for user ID: {}", userId);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        
        UserLevel userLevel = UserLevel.builder()
            .user(user)
            .currentLevel(1)
            .totalXp(0)
            .xpToNextLevel(100)
            .modulesCompleted(0)
            .totalBadges(0)
            .streakDays(0)
            .rank("DÉBUTANT")
            .build();
        
        return levelRepository.save(userLevel);
    }

    /**
     * Récupère la progression d'un module spécifique pour un utilisateur
     */
    @Transactional(readOnly = true)
    public ModuleProgressDTO getModuleProgress(Long userId, Long moduleId) {
        log.info("Fetching module progress for user ID: {} and module ID: {}", userId, moduleId);
        
        Module module = moduleRepository.findById(moduleId)
            .orElseThrow(() -> new RuntimeException("Module not found: " + moduleId));
        
        Optional<UserModuleProgress> progressOpt = progressRepository.findByUserIdAndModuleId(userId, moduleId);
        
        if (progressOpt.isPresent()) {
            UserModuleProgress progress = progressOpt.get();
            
            Optional<Badge> moduleBadge = badgeRepository
                .findByRequirementTypeAndRequirementValueAndActive(
                    "MODULE_COMPLETE", module.getName(), true
                );
            
            Boolean badgeEarned = moduleBadge.map(badge -> 
                userBadgeRepository.existsByUserIdAndBadgeId(userId, badge.getId())
            ).orElse(false);
            
            return ModuleProgressDTO.builder()
                .moduleId(module.getId())
                .moduleName(module.getName())
                .displayName(module.getDisplayName())
                .description(module.getDescription())
                .difficulty(module.getDifficulty())
                .totalExercises(progress.getTotalExercises())
                .exercisesCompleted(progress.getExercisesCompleted())
                .exercisesSuccess(progress.getExercisesSuccess())
                .completionPercentage(progress.getCompletionPercentage())
                .averageScore(progress.getAverageScore())
                .status(progress.getStatus())
                .iconUrl(module.getIconUrl())
                .startedAt(progress.getStartedAt())
                .completedAt(progress.getCompletedAt())
                .lastActivityAt(progress.getLastActivityAt())
                .badgeEarned(badgeEarned)
                .badgeName(moduleBadge.map(Badge::getDisplayName).orElse(null))
                .build();
        }
        
        return ModuleProgressDTO.builder()
            .moduleId(module.getId())
            .moduleName(module.getName())
            .displayName(module.getDisplayName())
            .description(module.getDescription())
            .difficulty(module.getDifficulty())
            .totalExercises(module.getTotalExercises())
            .exercisesCompleted(0)
            .exercisesSuccess(0)
            .completionPercentage(0.0)
            .averageScore(0.0)
            .status("NOT_STARTED")
            .iconUrl(module.getIconUrl())
            .badgeEarned(false)
            .build();
    }
}

