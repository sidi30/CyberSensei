package io.cybersensei.api.controller;

import io.cybersensei.api.dto.CompanyMetricsDto;
import io.cybersensei.domain.entity.CompanyMetrics;
import io.cybersensei.domain.entity.User;
import io.cybersensei.domain.repository.UserExerciseResultRepository;
import io.cybersensei.domain.repository.UserRepository;
import io.cybersensei.service.MetricsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ManagerController.class)
@AutoConfigureMockMvc(addFilters = false)
class ManagerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MetricsService metricsService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private UserExerciseResultRepository resultRepository;

    // ---- GET /api/manager/metrics ----

    @Test
    @WithMockUser(roles = "ADMIN")
    void getMetrics_shouldReturnCompanyMetrics() throws Exception {
        CompanyMetricsDto dto = CompanyMetricsDto.builder()
                .id(1L)
                .score(75.0)
                .riskLevel(CompanyMetrics.RiskLevel.MEDIUM)
                .averageQuizScore(80.0)
                .phishingClickRate(5.0)
                .activeUsers(42)
                .completedExercises(120)
                .updatedAt(LocalDateTime.of(2026, 1, 15, 10, 0))
                .build();

        when(metricsService.getLatestMetrics()).thenReturn(dto);

        mockMvc.perform(get("/api/manager/metrics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.score").value(75.0))
                .andExpect(jsonPath("$.riskLevel").value("MEDIUM"))
                .andExpect(jsonPath("$.activeUsers").value(42))
                .andExpect(jsonPath("$.completedExercises").value(120))
                .andExpect(jsonPath("$.averageQuizScore").value(80.0));
    }

    // ---- GET /api/manager/users ----

    @Test
    @WithMockUser(roles = "ADMIN")
    void getUsers_shouldReturnUserList() throws Exception {
        User user1 = User.builder()
                .id(1L).name("Alice").email("alice@test.com")
                .department("IT").role(User.UserRole.EMPLOYEE).active(true)
                .build();
        User user2 = User.builder()
                .id(2L).name("Bob").email("bob@test.com")
                .department("HR").role(User.UserRole.EMPLOYEE).active(true)
                .build();

        when(userRepository.findAll()).thenReturn(List.of(user1, user2));
        when(resultRepository.countByUserId(1L)).thenReturn(5L);
        when(resultRepository.findAverageScoreByUserId(1L)).thenReturn(85.0);
        when(resultRepository.countByUserId(2L)).thenReturn(3L);
        when(resultRepository.findAverageScoreByUserId(2L)).thenReturn(45.0);

        mockMvc.perform(get("/api/manager/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].displayName").value("Alice"))
                .andExpect(jsonPath("$[0].email").value("alice@test.com"))
                .andExpect(jsonPath("$[0].department").value("IT"))
                .andExpect(jsonPath("$[0].score").value(85.0))
                .andExpect(jsonPath("$[0].completedExercises").value(5))
                .andExpect(jsonPath("$[0].riskLevel").value("LOW"))
                .andExpect(jsonPath("$[1].displayName").value("Bob"))
                .andExpect(jsonPath("$[1].riskLevel").value("HIGH"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getUsers_withDepartmentFilter_shouldReturnFilteredList() throws Exception {
        User userIT = User.builder()
                .id(1L).name("Alice").email("alice@test.com")
                .department("IT").role(User.UserRole.EMPLOYEE).active(true)
                .build();
        User userHR = User.builder()
                .id(2L).name("Bob").email("bob@test.com")
                .department("HR").role(User.UserRole.EMPLOYEE).active(true)
                .build();

        when(userRepository.findAll()).thenReturn(List.of(userIT, userHR));
        when(resultRepository.countByUserId(1L)).thenReturn(5L);
        when(resultRepository.findAverageScoreByUserId(1L)).thenReturn(85.0);

        mockMvc.perform(get("/api/manager/users").param("department", "IT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].displayName").value("Alice"))
                .andExpect(jsonPath("$[0].department").value("IT"));
    }

    // ---- GET /api/manager/user/{id} ----

    @Test
    @WithMockUser(roles = "ADMIN")
    void getUserMetrics_shouldReturnSingleUserMetrics() throws Exception {
        User user = User.builder()
                .id(10L).name("Charlie").email("charlie@test.com")
                .department("Finance").role(User.UserRole.EMPLOYEE).active(true)
                .build();

        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(resultRepository.countByUserId(10L)).thenReturn(8L);
        when(resultRepository.findAverageScoreByUserId(10L)).thenReturn(62.0);

        mockMvc.perform(get("/api/manager/user/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(10))
                .andExpect(jsonPath("$.userName").value("Charlie"))
                .andExpect(jsonPath("$.department").value("Finance"))
                .andExpect(jsonPath("$.score").value(62.0))
                .andExpect(jsonPath("$.exercisesCompleted").value(8))
                .andExpect(jsonPath("$.riskLevel").value("MEDIUM"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getUserMetrics_unknownUser_shouldReturn404() throws Exception {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/manager/user/999"))
                .andExpect(status().isNotFound());
    }

    // ---- risk-level edge cases ----

    @Test
    @WithMockUser(roles = "MANAGER")
    void getUsers_nullScore_shouldReturnHighRisk() throws Exception {
        User user = User.builder()
                .id(1L).name("New User").email("new@test.com")
                .department(null).role(User.UserRole.EMPLOYEE).active(true)
                .build();

        when(userRepository.findAll()).thenReturn(List.of(user));
        when(resultRepository.countByUserId(1L)).thenReturn(0L);
        when(resultRepository.findAverageScoreByUserId(1L)).thenReturn(null);

        mockMvc.perform(get("/api/manager/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].score").value(0.0))
                .andExpect(jsonPath("$[0].riskLevel").value("HIGH"))
                .andExpect(jsonPath("$[0].department").value("Non assigné"));
    }
}
