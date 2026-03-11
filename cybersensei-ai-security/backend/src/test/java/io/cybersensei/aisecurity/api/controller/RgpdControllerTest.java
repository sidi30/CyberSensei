package io.cybersensei.aisecurity.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.cybersensei.aisecurity.domain.entity.RetentionPolicy;
import io.cybersensei.aisecurity.security.JwtTokenProvider;
import io.cybersensei.aisecurity.service.RgpdComplianceService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RgpdController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("RgpdController")
class RgpdControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private RgpdComplianceService rgpdService;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    // ── GET /api/v1/rgpd/access/{userId} ──

    @Nested
    @DisplayName("GET /api/v1/rgpd/access/{userId}")
    class AccessUserData {

        @Test
        @DisplayName("should return 200 with user data map")
        void shouldReturn200WithUserDataMap() throws Exception {
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("user_id", 42L);
            data.put("total_events", 2);
            data.put("events", List.of());

            when(rgpdService.accessUserData(eq(42L), eq(0L), eq(1L))).thenReturn(data);

            mockMvc.perform(get("/api/v1/rgpd/access/42")
                            .param("companyId", "1")
                            .param("requestedBy", "0"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.user_id").value(42))
                    .andExpect(jsonPath("$.total_events").value(2));
        }
    }

    // ── DELETE /api/v1/rgpd/erasure/{userId} ──

    @Nested
    @DisplayName("DELETE /api/v1/rgpd/erasure/{userId}")
    class EraseUserData {

        @Test
        @DisplayName("should return 200 with erasure result map")
        void shouldReturn200WithErasureResult() throws Exception {
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("user_id", 42L);
            data.put("events_deleted", 5L);
            data.put("status", "COMPLETED");

            when(rgpdService.eraseUserData(eq(42L), eq(0L), eq(1L))).thenReturn(data);

            mockMvc.perform(delete("/api/v1/rgpd/erasure/42")
                            .param("companyId", "1")
                            .param("requestedBy", "0"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.user_id").value(42))
                    .andExpect(jsonPath("$.events_deleted").value(5))
                    .andExpect(jsonPath("$.status").value("COMPLETED"));
        }
    }

    // ── GET /api/v1/rgpd/export/{userId} ──

    @Nested
    @DisplayName("GET /api/v1/rgpd/export/{userId}")
    class ExportUserData {

        @Test
        @DisplayName("should return 200 with export data map")
        void shouldReturn200WithExportData() throws Exception {
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("user_id", 42L);
            data.put("export_format", "JSON");
            data.put("data_controller", "CyberSensei AI Security");

            when(rgpdService.exportUserData(eq(42L), eq(0L), eq(1L))).thenReturn(data);

            mockMvc.perform(get("/api/v1/rgpd/export/42")
                            .param("companyId", "1")
                            .param("requestedBy", "0"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.user_id").value(42))
                    .andExpect(jsonPath("$.export_format").value("JSON"))
                    .andExpect(jsonPath("$.data_controller").value("CyberSensei AI Security"));
        }
    }

    // ── GET /api/v1/rgpd/registry ──

    @Nested
    @DisplayName("GET /api/v1/rgpd/registry")
    class GetProcessingRegistry {

        @Test
        @DisplayName("should return 200 with registry map")
        void shouldReturn200WithRegistryMap() throws Exception {
            Map<String, Object> registry = new LinkedHashMap<>();
            registry.put("treatment_name", "CyberSensei AI Security");
            registry.put("data_processor", "CyberSensei SAS");

            when(rgpdService.getProcessingRegistry(eq(1L))).thenReturn(registry);

            mockMvc.perform(get("/api/v1/rgpd/registry")
                            .param("companyId", "1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.treatment_name").value("CyberSensei AI Security"))
                    .andExpect(jsonPath("$.data_processor").value("CyberSensei SAS"));
        }
    }

    // ── PUT /api/v1/rgpd/retention ──

    @Nested
    @DisplayName("PUT /api/v1/rgpd/retention")
    class UpdateRetentionPolicy {

        @Test
        @DisplayName("should return 200 with RetentionPolicy")
        void shouldReturn200WithRetentionPolicy() throws Exception {
            RetentionPolicy policy = RetentionPolicy.builder()
                    .id(1L)
                    .companyId(1L)
                    .policyName("default")
                    .retentionDays(60)
                    .article9RetentionDays(15)
                    .build();

            when(rgpdService.upsertRetentionPolicy(eq(1L), eq(60), eq(15))).thenReturn(policy);

            mockMvc.perform(put("/api/v1/rgpd/retention")
                            .param("companyId", "1")
                            .param("retentionDays", "60")
                            .param("article9RetentionDays", "15"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.companyId").value(1))
                    .andExpect(jsonPath("$.retentionDays").value(60))
                    .andExpect(jsonPath("$.article9RetentionDays").value(15));
        }
    }

    // ── GET /api/v1/rgpd/audit-log ──

    @Nested
    @DisplayName("GET /api/v1/rgpd/audit-log")
    class GetAuditLog {

        @Test
        @DisplayName("should return 200 with list of audit entries")
        void shouldReturn200WithAuditEntries() throws Exception {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("id", 1L);
            entry.put("operation", "ACCESS");
            entry.put("status", "COMPLETED");

            when(rgpdService.getAuditLog(eq(1L))).thenReturn(List.of(entry));

            mockMvc.perform(get("/api/v1/rgpd/audit-log")
                            .param("companyId", "1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].id").value(1))
                    .andExpect(jsonPath("$[0].operation").value("ACCESS"))
                    .andExpect(jsonPath("$[0].status").value("COMPLETED"));
        }
    }
}
