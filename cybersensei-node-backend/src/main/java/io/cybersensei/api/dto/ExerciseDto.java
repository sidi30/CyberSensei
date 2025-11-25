package io.cybersensei.api.dto;

import io.cybersensei.domain.entity.Exercise;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseDto {
    private Long id;
    private String topic;
    private Exercise.ExerciseType type;
    private Exercise.Difficulty difficulty;
    private Map<String, Object> payloadJSON;
    private Boolean active;
}


