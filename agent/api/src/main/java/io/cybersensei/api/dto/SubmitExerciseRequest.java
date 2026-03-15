package io.cybersensei.api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
public class SubmitExerciseRequest {
    
    @NotNull
    @Min(0)
    @Max(100)
    private Double score;
    
    @NotNull
    private Boolean success;
    
    @NotNull
    @Min(0)
    private Integer duration; // in seconds
    
    private Map<String, Object> detailsJSON;
}


