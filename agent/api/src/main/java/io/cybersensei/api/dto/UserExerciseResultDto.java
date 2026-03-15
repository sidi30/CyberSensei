package io.cybersensei.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserExerciseResultDto {
    private Long id;
    private Long userId;
    private Long exerciseId;
    private String title; // Exercise title/topic
    private Double score;
    private Double maxScore; // Max possible score
    private Boolean success;
    private Integer duration;
    private Map<String, Object> detailsJSON;
    private LocalDateTime date;
    private LocalDateTime completedAt; // Alias for date (Teams app compatibility)
    private String feedback; // Personalized feedback message
    private Integer correct; // Number of correct answers
    private Integer total; // Total number of questions
}


