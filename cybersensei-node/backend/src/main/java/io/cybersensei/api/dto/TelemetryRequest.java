package io.cybersensei.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TelemetryRequest {
    private String tenantId;
    private String version;
    private Map<String, Object> metrics;
    private Map<String, Object> health;
}


