package io.cybersensei.scheduler.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.Map;

/**
 * Réponse du microservice cybersensei-scanner.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record ScanResponse(
    String domain,
    int score,
    Map<String, Object> details,
    String timestamp
) {}
