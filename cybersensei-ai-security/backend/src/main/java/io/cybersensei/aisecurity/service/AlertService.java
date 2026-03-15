package io.cybersensei.aisecurity.service;

import io.cybersensei.aisecurity.api.dto.response.AlertResponse;
import io.cybersensei.aisecurity.domain.entity.Alert;
import io.cybersensei.aisecurity.domain.enums.AlertStatus;
import io.cybersensei.aisecurity.domain.repository.AlertRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;

    public Page<AlertResponse> getAlerts(Long companyId, AlertStatus status, Pageable pageable) {
        Page<Alert> alerts;
        if (status != null) {
            alerts = alertRepository.findByCompanyIdAndStatusOrderByCreatedAtDesc(companyId, status, pageable);
        } else {
            alerts = alertRepository.findByCompanyIdOrderByCreatedAtDesc(companyId, pageable);
        }
        return alerts.map(this::toResponse);
    }

    public long countOpenAlerts(Long companyId) {
        return alertRepository.countByCompanyIdAndStatus(companyId, AlertStatus.OPEN);
    }

    @Transactional
    public AlertResponse resolveAlert(Long alertId, Long resolvedByUserId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new EntityNotFoundException("Alert not found: " + alertId));

        alert.setStatus(AlertStatus.RESOLVED);
        alert.setResolvedAt(LocalDateTime.now());
        alert.setResolvedBy(resolvedByUserId);

        return toResponse(alertRepository.save(alert));
    }

    @Transactional
    public AlertResponse dismissAlert(Long alertId, Long resolvedByUserId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new EntityNotFoundException("Alert not found: " + alertId));

        alert.setStatus(AlertStatus.DISMISSED);
        alert.setResolvedAt(LocalDateTime.now());
        alert.setResolvedBy(resolvedByUserId);

        return toResponse(alertRepository.save(alert));
    }

    private AlertResponse toResponse(Alert alert) {
        return AlertResponse.builder()
                .id(alert.getId())
                .companyId(alert.getCompanyId())
                .userId(alert.getUserId())
                .title(alert.getTitle())
                .description(alert.getDescription())
                .severity(alert.getSeverity())
                .status(alert.getStatus())
                .createdAt(alert.getCreatedAt())
                .resolvedAt(alert.getResolvedAt())
                .build();
    }
}
