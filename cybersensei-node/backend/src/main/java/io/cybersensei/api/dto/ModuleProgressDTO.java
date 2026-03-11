package io.cybersensei.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModuleProgressDTO {
    private Long moduleId;
    private String moduleName;
    private String displayName;
    private String description;
    private String difficulty;
    private Integer totalExercises;
    private Integer exercisesCompleted;
    private Integer exercisesSuccess;
    private Double completionPercentage;
    private Double averageScore;
    private String status;
    private String iconUrl;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime lastActivityAt;
    private Boolean badgeEarned;
    private String badgeName;
}

