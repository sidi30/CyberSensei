package io.cybersensei.aisecurity.service;

import io.cybersensei.aisecurity.api.dto.response.AlertResponse;
import io.cybersensei.aisecurity.domain.entity.Alert;
import io.cybersensei.aisecurity.domain.enums.AlertStatus;
import io.cybersensei.aisecurity.domain.enums.RiskLevel;
import io.cybersensei.aisecurity.domain.repository.AlertRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AlertServiceTest {

    @Mock
    private AlertRepository alertRepository;

    @InjectMocks
    private AlertService alertService;

    private Alert buildAlert(Long id, AlertStatus status) {
        return Alert.builder()
                .id(id)
                .companyId(1L)
                .userId(42L)
                .title("Test Alert")
                .description("Some sensitive data detected")
                .severity(RiskLevel.HIGH)
                .status(status)
                .createdAt(LocalDateTime.now())
                .build();
    }

    // ── getAlerts ──

    @Nested
    @DisplayName("getAlerts")
    class GetAlerts {

        @Test
        @DisplayName("should return paginated alerts without status filter")
        void shouldReturnAlertsWithoutStatusFilter() {
            // Arrange
            Long companyId = 1L;
            Pageable pageable = PageRequest.of(0, 20);
            Alert alert = buildAlert(1L, AlertStatus.OPEN);
            Page<Alert> page = new PageImpl<>(List.of(alert), pageable, 1);

            when(alertRepository.findByCompanyIdOrderByCreatedAtDesc(companyId, pageable))
                    .thenReturn(page);

            // Act
            Page<AlertResponse> result = alertService.getAlerts(companyId, null, pageable);

            // Assert
            assertThat(result.getTotalElements()).isEqualTo(1);
            assertThat(result.getContent().get(0).getTitle()).isEqualTo("Test Alert");
            assertThat(result.getContent().get(0).getStatus()).isEqualTo(AlertStatus.OPEN);

            verify(alertRepository).findByCompanyIdOrderByCreatedAtDesc(companyId, pageable);
            verify(alertRepository, never()).findByCompanyIdAndStatusOrderByCreatedAtDesc(any(), any(), any());
        }

        @Test
        @DisplayName("should return paginated alerts with status filter")
        void shouldReturnAlertsWithStatusFilter() {
            // Arrange
            Long companyId = 1L;
            Pageable pageable = PageRequest.of(0, 20);
            Alert alert = buildAlert(1L, AlertStatus.OPEN);
            Page<Alert> page = new PageImpl<>(List.of(alert), pageable, 1);

            when(alertRepository.findByCompanyIdAndStatusOrderByCreatedAtDesc(companyId, AlertStatus.OPEN, pageable))
                    .thenReturn(page);

            // Act
            Page<AlertResponse> result = alertService.getAlerts(companyId, AlertStatus.OPEN, pageable);

            // Assert
            assertThat(result.getTotalElements()).isEqualTo(1);
            verify(alertRepository).findByCompanyIdAndStatusOrderByCreatedAtDesc(companyId, AlertStatus.OPEN, pageable);
            verify(alertRepository, never()).findByCompanyIdOrderByCreatedAtDesc(any(), any());
        }

        @Test
        @DisplayName("should return empty page when no alerts exist")
        void shouldReturnEmptyPage() {
            // Arrange
            Long companyId = 99L;
            Pageable pageable = PageRequest.of(0, 20);
            Page<Alert> emptyPage = new PageImpl<>(List.of(), pageable, 0);

            when(alertRepository.findByCompanyIdOrderByCreatedAtDesc(companyId, pageable))
                    .thenReturn(emptyPage);

            // Act
            Page<AlertResponse> result = alertService.getAlerts(companyId, null, pageable);

            // Assert
            assertThat(result.getTotalElements()).isZero();
            assertThat(result.getContent()).isEmpty();
        }
    }

    // ── countOpenAlerts ──

    @Nested
    @DisplayName("countOpenAlerts")
    class CountOpenAlerts {

        @Test
        @DisplayName("should return count of open alerts for company")
        void shouldReturnCount() {
            when(alertRepository.countByCompanyIdAndStatus(1L, AlertStatus.OPEN)).thenReturn(5L);

            long count = alertService.countOpenAlerts(1L);

            assertThat(count).isEqualTo(5L);
            verify(alertRepository).countByCompanyIdAndStatus(1L, AlertStatus.OPEN);
        }

        @Test
        @DisplayName("should return zero when no open alerts")
        void shouldReturnZero() {
            when(alertRepository.countByCompanyIdAndStatus(1L, AlertStatus.OPEN)).thenReturn(0L);

            long count = alertService.countOpenAlerts(1L);

            assertThat(count).isZero();
        }
    }

    // ── resolveAlert ──

    @Nested
    @DisplayName("resolveAlert")
    class ResolveAlert {

        @Test
        @DisplayName("should set status to RESOLVED and set resolvedAt and resolvedBy")
        void shouldResolveAlert() {
            // Arrange
            Alert alert = buildAlert(1L, AlertStatus.OPEN);
            when(alertRepository.findById(1L)).thenReturn(Optional.of(alert));
            when(alertRepository.save(any(Alert.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            AlertResponse response = alertService.resolveAlert(1L, 100L);

            // Assert
            assertThat(response.getStatus()).isEqualTo(AlertStatus.RESOLVED);

            ArgumentCaptor<Alert> captor = ArgumentCaptor.forClass(Alert.class);
            verify(alertRepository).save(captor.capture());
            Alert saved = captor.getValue();
            assertThat(saved.getStatus()).isEqualTo(AlertStatus.RESOLVED);
            assertThat(saved.getResolvedAt()).isNotNull();
            assertThat(saved.getResolvedBy()).isEqualTo(100L);
        }

        @Test
        @DisplayName("should throw EntityNotFoundException when alert not found")
        void shouldThrowWhenNotFound() {
            when(alertRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> alertService.resolveAlert(999L, 100L))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("999");
        }
    }

    // ── dismissAlert ──

    @Nested
    @DisplayName("dismissAlert")
    class DismissAlert {

        @Test
        @DisplayName("should set status to DISMISSED and set resolvedAt and resolvedBy")
        void shouldDismissAlert() {
            // Arrange
            Alert alert = buildAlert(2L, AlertStatus.OPEN);
            when(alertRepository.findById(2L)).thenReturn(Optional.of(alert));
            when(alertRepository.save(any(Alert.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            AlertResponse response = alertService.dismissAlert(2L, 200L);

            // Assert
            assertThat(response.getStatus()).isEqualTo(AlertStatus.DISMISSED);

            ArgumentCaptor<Alert> captor = ArgumentCaptor.forClass(Alert.class);
            verify(alertRepository).save(captor.capture());
            Alert saved = captor.getValue();
            assertThat(saved.getStatus()).isEqualTo(AlertStatus.DISMISSED);
            assertThat(saved.getResolvedAt()).isNotNull();
            assertThat(saved.getResolvedBy()).isEqualTo(200L);
        }

        @Test
        @DisplayName("should throw EntityNotFoundException when alert not found for dismiss")
        void shouldThrowWhenNotFoundForDismiss() {
            when(alertRepository.findById(888L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> alertService.dismissAlert(888L, 200L))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("888");
        }
    }

    // ── Response mapping ──

    @Nested
    @DisplayName("Response mapping")
    class ResponseMapping {

        @Test
        @DisplayName("should map all Alert fields to AlertResponse correctly")
        void shouldMapFieldsCorrectly() {
            // Arrange
            LocalDateTime now = LocalDateTime.now();
            Alert alert = Alert.builder()
                    .id(10L)
                    .companyId(5L)
                    .userId(50L)
                    .title("Critical Alert")
                    .description("Credentials detected")
                    .severity(RiskLevel.CRITICAL)
                    .status(AlertStatus.OPEN)
                    .createdAt(now)
                    .resolvedAt(null)
                    .build();

            when(alertRepository.findById(10L)).thenReturn(Optional.of(alert));
            when(alertRepository.save(any(Alert.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            AlertResponse response = alertService.resolveAlert(10L, 99L);

            // Assert
            assertThat(response.getId()).isEqualTo(10L);
            assertThat(response.getCompanyId()).isEqualTo(5L);
            assertThat(response.getUserId()).isEqualTo(50L);
            assertThat(response.getTitle()).isEqualTo("Critical Alert");
            assertThat(response.getDescription()).isEqualTo("Credentials detected");
            assertThat(response.getSeverity()).isEqualTo(RiskLevel.CRITICAL);
            assertThat(response.getCreatedAt()).isEqualTo(now);
        }
    }
}
