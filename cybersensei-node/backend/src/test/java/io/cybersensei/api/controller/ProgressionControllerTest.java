package io.cybersensei.api.controller;

import io.cybersensei.api.dto.BadgeDTO;
import io.cybersensei.api.dto.ModuleProgressDTO;
import io.cybersensei.api.dto.UserDashboardDTO;
import io.cybersensei.service.ProgressionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProgressionController.class)
@AutoConfigureMockMvc(addFilters = false)
class ProgressionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProgressionService progressionService;

    // ---- GET /api/progression/dashboard/{userId} ----

    @Test
    void getDashboard_shouldReturnUserDashboard() throws Exception {
        ModuleProgressDTO moduleProgress = ModuleProgressDTO.builder()
                .moduleId(1L)
                .moduleName("phishing")
                .displayName("Phishing")
                .completionPercentage(50.0)
                .averageScore(75.0)
                .exercisesCompleted(3)
                .status("IN_PROGRESS")
                .build();

        BadgeDTO badge = BadgeDTO.builder()
                .badgeId(1L)
                .name("first_exercise")
                .displayName("Premier pas")
                .earned(true)
                .earnedAt(LocalDateTime.of(2026, 1, 10, 12, 0))
                .build();

        UserDashboardDTO dashboard = UserDashboardDTO.builder()
                .userId(1L)
                .name("Alice")
                .email("alice@test.com")
                .currentLevel(3)
                .totalXp(250)
                .xpToNextLevel(50)
                .rank("INTERMÉDIAIRE")
                .modulesCompleted(2)
                .totalModules(15)
                .totalBadges(1)
                .streakDays(5)
                .lastActivityDate(LocalDate.of(2026, 3, 8))
                .modulesProgress(List.of(moduleProgress))
                .badgesEarned(List.of(badge))
                .suggestedNextModule(moduleProgress)
                .overallCompletionPercentage(50.0)
                .averageScore(75.0)
                .totalExercisesCompleted(3)
                .build();

        when(progressionService.getUserDashboard(1L)).thenReturn(dashboard);

        mockMvc.perform(get("/api/progression/dashboard/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.name").value("Alice"))
                .andExpect(jsonPath("$.currentLevel").value(3))
                .andExpect(jsonPath("$.totalXp").value(250))
                .andExpect(jsonPath("$.rank").value("INTERMÉDIAIRE"))
                .andExpect(jsonPath("$.modulesCompleted").value(2))
                .andExpect(jsonPath("$.totalModules").value(15))
                .andExpect(jsonPath("$.streakDays").value(5))
                .andExpect(jsonPath("$.modulesProgress", hasSize(1)))
                .andExpect(jsonPath("$.badgesEarned", hasSize(1)))
                .andExpect(jsonPath("$.overallCompletionPercentage").value(50.0))
                .andExpect(jsonPath("$.totalExercisesCompleted").value(3));
    }

    // ---- GET /api/progression/modules/{userId} ----

    @Test
    void getModulesProgress_shouldReturnModulesList() throws Exception {
        ModuleProgressDTO mod1 = ModuleProgressDTO.builder()
                .moduleId(1L).moduleName("phishing").displayName("Phishing")
                .completionPercentage(100.0).averageScore(90.0)
                .exercisesCompleted(5).totalExercises(5)
                .status("COMPLETED")
                .build();
        ModuleProgressDTO mod2 = ModuleProgressDTO.builder()
                .moduleId(2L).moduleName("passwords").displayName("Mots de passe")
                .completionPercentage(0.0).averageScore(0.0)
                .exercisesCompleted(0).totalExercises(4)
                .status("NOT_STARTED")
                .build();

        when(progressionService.getModulesProgressForUser(5L)).thenReturn(List.of(mod1, mod2));

        mockMvc.perform(get("/api/progression/modules/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].moduleName").value("phishing"))
                .andExpect(jsonPath("$[0].status").value("COMPLETED"))
                .andExpect(jsonPath("$[1].moduleName").value("passwords"))
                .andExpect(jsonPath("$[1].status").value("NOT_STARTED"));
    }

    // ---- GET /api/progression/badges/{userId} ----

    @Test
    void getUserBadges_shouldReturnBadgesList() throws Exception {
        BadgeDTO badge1 = BadgeDTO.builder()
                .badgeId(1L).name("first_exercise").displayName("Premier pas")
                .badgeType("ACHIEVEMENT").rarity("COMMON").points(10)
                .earned(true).earnedAt(LocalDateTime.of(2026, 2, 1, 8, 0))
                .build();
        BadgeDTO badge2 = BadgeDTO.builder()
                .badgeId(2L).name("phishing_master").displayName("Maître Phishing")
                .badgeType("MODULE").rarity("RARE").points(50)
                .earned(true).earnedAt(LocalDateTime.of(2026, 3, 1, 14, 30))
                .build();

        when(progressionService.getUserBadges(5L)).thenReturn(List.of(badge1, badge2));

        mockMvc.perform(get("/api/progression/badges/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].name").value("first_exercise"))
                .andExpect(jsonPath("$[0].earned").value(true))
                .andExpect(jsonPath("$[0].points").value(10))
                .andExpect(jsonPath("$[1].name").value("phishing_master"))
                .andExpect(jsonPath("$[1].rarity").value("RARE"));
    }

    @Test
    void getUserBadges_noBadges_shouldReturnEmptyList() throws Exception {
        when(progressionService.getUserBadges(99L)).thenReturn(List.of());

        mockMvc.perform(get("/api/progression/badges/99"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }
}
