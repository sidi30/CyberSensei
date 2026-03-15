package io.cybersensei.aisecurity.api.dto.response;

import io.cybersensei.aisecurity.domain.enums.AlertStatus;
import io.cybersensei.aisecurity.domain.enums.RiskLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertResponse {

    private Long id;
    private Long companyId;
    private Long userId;
    private String title;
    private String description;
    private RiskLevel severity;
    private AlertStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
}
