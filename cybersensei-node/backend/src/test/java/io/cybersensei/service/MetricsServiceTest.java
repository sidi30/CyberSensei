package io.cybersensei.service;

import io.cybersensei.api.dto.CompanyMetricsDto;
import io.cybersensei.api.mapper.CompanyMetricsMapper;
import io.cybersensei.domain.entity.CompanyMetrics;
import io.cybersensei.domain.entity.User;
import io.cybersensei.domain.repository.CompanyMetricsRepository;
import io.cybersensei.domain.repository.UserExerciseResultRepository;
import io.cybersensei.domain.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MetricsServiceTest {

    @Mock
    private CompanyMetricsRepository metricsRepository;

    @Mock
    private UserExerciseResultRepository resultRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CompanyMetricsMapper metricsMapper;

    @InjectMocks
    private MetricsService metricsService;

    // ---- getLatestMetrics ----

    @Test
    void getLatestMetrics_metricsExist_shouldReturnMappedDto() {
        CompanyMetrics metrics = CompanyMetrics.builder()
                .id(1L)
                .score(75.0)
                .riskLevel(CompanyMetrics.RiskLevel.MEDIUM)
                .averageQuizScore(80.0)
                .phishingClickRate(5.0)
                .activeUsers(10)
                .completedExercises(50)
                .updatedAt(LocalDateTime.now())
                .build();

        CompanyMetricsDto expectedDto = CompanyMetricsDto.builder()
                .id(1L)
                .score(75.0)
                .riskLevel(CompanyMetrics.RiskLevel.MEDIUM)
                .averageQuizScore(80.0)
                .phishingClickRate(5.0)
                .activeUsers(10)
                .completedExercises(50)
                .build();

        when(metricsRepository.findLatest()).thenReturn(Optional.of(metrics));
        when(metricsMapper.toDto(metrics)).thenReturn(expectedDto);

        CompanyMetricsDto result = metricsService.getLatestMetrics();

        assertThat(result).isNotNull();
        assertThat(result.getScore()).isEqualTo(75.0);
        assertThat(result.getRiskLevel()).isEqualTo(CompanyMetrics.RiskLevel.MEDIUM);
        assertThat(result.getActiveUsers()).isEqualTo(10);
        verify(metricsRepository).findLatest();
        verify(metricsMapper).toDto(metrics);
    }

    @Test
    void getLatestMetrics_noMetricsExist_shouldCalculateAndReturn() {
        // First call returns empty, triggering calculateMetrics
        // Second call (after calculateMetrics) returns the newly saved metrics
        CompanyMetrics newMetrics = CompanyMetrics.builder()
                .id(1L)
                .score(40.0)
                .riskLevel(CompanyMetrics.RiskLevel.MEDIUM)
                .build();

        CompanyMetricsDto expectedDto = CompanyMetricsDto.builder()
                .id(1L)
                .score(40.0)
                .riskLevel(CompanyMetrics.RiskLevel.MEDIUM)
                .build();

        when(metricsRepository.findLatest())
                .thenReturn(Optional.empty())          // first call in getLatestMetrics
                .thenReturn(Optional.of(newMetrics));   // second call after calculateMetrics

        // Stubs for calculateMetrics
        when(resultRepository.findAverageScoreSince(any(LocalDateTime.class))).thenReturn(null);
        when(userRepository.findAll()).thenReturn(List.of());
        when(resultRepository.countResultsSince(any(LocalDateTime.class))).thenReturn(0L);
        when(metricsRepository.save(any(CompanyMetrics.class))).thenReturn(newMetrics);
        when(metricsMapper.toDto(newMetrics)).thenReturn(expectedDto);

        CompanyMetricsDto result = metricsService.getLatestMetrics();

        assertThat(result).isNotNull();
        assertThat(result.getScore()).isEqualTo(40.0);
        verify(metricsRepository, times(2)).findLatest();
        verify(metricsRepository).save(any(CompanyMetrics.class));
    }

    // ---- calculateMetrics ----

    @Test
    void calculateMetrics_shouldSaveMetricsWithCorrectValues() {
        User activeUser = User.builder().id(1L).name("Alice").active(true).build();
        User inactiveUser = User.builder().id(2L).name("Bob").active(false).build();

        when(resultRepository.findAverageScoreSince(any(LocalDateTime.class))).thenReturn(80.0);
        when(userRepository.findAll()).thenReturn(List.of(activeUser, inactiveUser));
        when(resultRepository.countResultsSince(any(LocalDateTime.class))).thenReturn(15L);
        when(metricsRepository.save(any(CompanyMetrics.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        metricsService.calculateMetrics();

        ArgumentCaptor<CompanyMetrics> captor = ArgumentCaptor.forClass(CompanyMetrics.class);
        verify(metricsRepository).save(captor.capture());

        CompanyMetrics saved = captor.getValue();
        assertThat(saved.getActiveUsers()).isEqualTo(1);
        assertThat(saved.getCompletedExercises()).isEqualTo(15);
        // score = 80 * 0.6 + (100 - 0) * 0.4 = 48 + 40 = 88.0
        assertThat(saved.getScore()).isEqualTo(88.0);
        // score >= 80 && phishingClickRate < 10 => LOW
        assertThat(saved.getRiskLevel()).isEqualTo(CompanyMetrics.RiskLevel.LOW);
    }

    @Test
    void calculateMetrics_nullAvgScore_shouldDefaultToZero() {
        when(resultRepository.findAverageScoreSince(any(LocalDateTime.class))).thenReturn(null);
        when(userRepository.findAll()).thenReturn(List.of());
        when(resultRepository.countResultsSince(any(LocalDateTime.class))).thenReturn(0L);
        when(metricsRepository.save(any(CompanyMetrics.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        metricsService.calculateMetrics();

        ArgumentCaptor<CompanyMetrics> captor = ArgumentCaptor.forClass(CompanyMetrics.class);
        verify(metricsRepository).save(captor.capture());

        CompanyMetrics saved = captor.getValue();
        // score = 0 * 0.6 + (100 - 0) * 0.4 = 40.0
        assertThat(saved.getScore()).isEqualTo(40.0);
        assertThat(saved.getAverageQuizScore()).isEqualTo(0.0);
        assertThat(saved.getActiveUsers()).isEqualTo(0);
        assertThat(saved.getCompletedExercises()).isEqualTo(0);
    }

    @Test
    void calculateMetrics_lowScore_shouldReturnCriticalRisk() {
        // avgQuizScore = 20, phishingClickRate = 0 (default)
        // score = 20 * 0.6 + 100 * 0.4 = 12 + 40 = 52
        // score >= 40 && phishingClickRate < 50 => HIGH
        when(resultRepository.findAverageScoreSince(any(LocalDateTime.class))).thenReturn(20.0);
        when(userRepository.findAll()).thenReturn(List.of());
        when(resultRepository.countResultsSince(any(LocalDateTime.class))).thenReturn(0L);
        when(metricsRepository.save(any(CompanyMetrics.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        metricsService.calculateMetrics();

        ArgumentCaptor<CompanyMetrics> captor = ArgumentCaptor.forClass(CompanyMetrics.class);
        verify(metricsRepository).save(captor.capture());

        CompanyMetrics saved = captor.getValue();
        assertThat(saved.getScore()).isEqualTo(52.0);
        assertThat(saved.getRiskLevel()).isEqualTo(CompanyMetrics.RiskLevel.HIGH);
    }
}
