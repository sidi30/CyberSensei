package io.cybersensei.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDashboardDTO {
    private Long userId;
    private String name;
    private String email;
    
    // Niveau et progression
    private Integer currentLevel;
    private Integer totalXp;
    private Integer xpToNextLevel;
    private String rank;
    private Integer modulesCompleted;
    private Integer totalModules;
    private Integer totalBadges;
    private Integer streakDays;
    private LocalDate lastActivityDate;
    
    // Progression par module
    private List<ModuleProgressDTO> modulesProgress;
    
    // Badges obtenus
    private List<BadgeDTO> badgesEarned;
    
    // Module suggéré (prochain à faire)
    private ModuleProgressDTO suggestedNextModule;
    
    // Statistiques globales
    private Double overallCompletionPercentage;
    private Double averageScore;
    private Integer totalExercisesCompleted;
}

