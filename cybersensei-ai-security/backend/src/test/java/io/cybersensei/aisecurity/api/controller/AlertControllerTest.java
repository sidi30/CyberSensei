package io.cybersensei.aisecurity.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.cybersensei.aisecurity.api.dto.response.AlertResponse;
import io.cybersensei.aisecurity.domain.enums.AlertStatus;
import io.cybersensei.aisecurity.domain.enums.RiskLevel;
import io.cybersensei.aisecurity.service.AlertService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.bean.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AlertController.class)
@AutoConfigureMockMvc(addFilters = false)
class AlertControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AlertService alertService;

    private AlertResponse buildAlertResponse(Long id, AlertStatus status) {
        return AlertResponse.builder()
                .id(id)
                .companyId(1L)
                .userId(42L)
                .title("Alert " + id)
                .description("Description for alert " + id)
                .severity(RiskLevel.HIGH)
                .status(status)
                .createdAt(LocalDateTime.of(2025, 6, 15, 10, 30))
                .build();
    }

    // ── GET /api/ai-security/alerts ──

    @Nested
    @DisplayName("GET /api/ai-security/alerts")
    class GetAlerts {

        @Test
        @DisplayName("should return paginated alerts with 200 status")
        void shouldReturnPaginatedAlerts() throws Exception {
            // Arrange
            AlertResponse alert1 = buildAlertResponse(1L, AlertStatus.OPEN);
            AlertResponse alert2 = buildAlertResponse(2L, AlertStatus.OPEN);
            Page<AlertResponse> page = new PageImpl<>(List.of(alert1, alert2), PageRequest.of(0, 20), 2);

            when(alertService.getAlerts(eq(1L), eq(null), any())).thenReturn(page);

            // Act & Assert
            mockMvc.perform(get("/api/ai-security/alerts")
                            .param("companyId", "1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(2)))
                    .andExpect(jsonPath("$.content[0].id").value(1))
                    .andExpect(jsonPath("$.content[0].title").value("Alert 1"))
                    .andExpect(jsonPath("$.content[0].status").value("OPEN"))
                    .andExpect(jsonPath("$.totalElements").value(2));
        }

        @Test
        @DisplayName("should pass status filter to service")
        void shouldPassStatusFilter() throws Exception {
            Page<AlertResponse> page = new PageImpl<>(List.of(), PageRequest.of(0, 20), 0);
            when(alertService.getAlerts(eq(1L), eq(AlertStatus.RESOLVED), any())).thenReturn(page);

            mockMvc.perform(get("/api/ai-security/alerts")
                            .param("companyId", "1")
                            .param("status", "RESOLVED"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(0)));
        }
    }

    // ── GET /api/ai-security/alerts/count ──

    @Nested
    @DisplayName("GET /api/ai-security/alerts/count")
    class CountAlerts {

        @Test
        @DisplayName("should return count of open alerts")
        void shouldReturnCount() throws Exception {
            when(alertService.countOpenAlerts(1L)).thenReturn(7L);

            mockMvc.perform(get("/api/ai-security/alerts/count")
                            .param("companyId", "1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.count").value(7));
        }
    }

    // ── PATCH /api/ai-security/alerts/{id}/resolve ──

    @Nested
    @DisplayName("PATCH /api/ai-security/alerts/{id}/resolve")
    class ResolveAlert {

        @Test
        @DisplayName("should resolve alert and return updated response")
        void shouldResolveAlert() throws Exception {
            AlertResponse resolved = buildAlertResponse(1L, AlertStatus.RESOLVED);
            resolved.setResolvedAt(LocalDateTime.now());
            when(alertService.resolveAlert(eq(1L), eq(42L))).thenReturn(resolved);

            var auth = new UsernamePasswordAuthenticationToken(
                    42L, null, List.of(new SimpleGrantedAuthority("ROLE_USER")));

            mockMvc.perform(patch("/api/ai-security/alerts/1/resolve")
                            .with(authentication(auth)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.status").value("RESOLVED"));
        }
    }

    // ── PATCH /api/ai-security/alerts/{id}/dismiss ──

    @Nested
    @DisplayName("PATCH /api/ai-security/alerts/{id}/dismiss")
    class DismissAlert {

        @Test
        @DisplayName("should dismiss alert and return updated response")
        void shouldDismissAlert() throws Exception {
            AlertResponse dismissed = buildAlertResponse(2L, AlertStatus.DISMISSED);
            dismissed.setResolvedAt(LocalDateTime.now());
            when(alertService.dismissAlert(eq(2L), eq(42L))).thenReturn(dismissed);

            var auth = new UsernamePasswordAuthenticationToken(
                    42L, null, List.of(new SimpleGrantedAuthority("ROLE_USER")));

            mockMvc.perform(patch("/api/ai-security/alerts/2/dismiss")
                            .with(authentication(auth)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(2))
                    .andExpect(jsonPath("$.status").value("DISMISSED"));
        }
    }
}
