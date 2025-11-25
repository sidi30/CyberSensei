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
    private Double score;
    private Boolean success;
    private Integer duration;
    private Map<String, Object> detailsJSON;
    private LocalDateTime date;
}


