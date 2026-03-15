package io.cybersensei.scheduler.dto;

import java.util.List;

/**
 * Requête envoyée au microservice cybersensei-scanner (POST /scan).
 */
public record ScanRequest(
    String domain,
    List<String> emails
) {}
