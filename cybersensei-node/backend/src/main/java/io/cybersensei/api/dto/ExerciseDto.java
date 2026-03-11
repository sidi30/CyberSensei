package io.cybersensei.api.dto;

import io.cybersensei.domain.entity.Exercise;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
    @NotBlank(message = "Topic is required")
    private String topic;
    @NotNull(message = "Exercise type is required")
    private Exercise.ExerciseType type;
    @NotNull(message = "Difficulty is required")
    private Exercise.Difficulty difficulty;
    @NotNull(message = "Payload is required")
    private Map<String, Object> payloadJSON;
    private Boolean active;
}


