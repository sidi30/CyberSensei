package io.cybersensei.api.controller;

import io.cybersensei.service.HealthCheckService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(HealthController.class)
@AutoConfigureMockMvc(addFilters = false)
class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private HealthCheckService healthCheckService;

    @Test
    void getHealth_shouldReturn200WithStatus() throws Exception {
        Map<String, Object> dbStatus = new HashMap<>();
        dbStatus.put("status", "UP");

        Map<String, Object> healthStatus = new HashMap<>();
        healthStatus.put("status", "UP");
        healthStatus.put("timestamp", 1709913600000L);
        healthStatus.put("database", dbStatus);

        when(healthCheckService.getHealthStatus()).thenReturn(healthStatus);

        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.database.status").value("UP"));
    }

    @Test
    void getHealth_databaseDown_shouldStillReturn200() throws Exception {
        Map<String, Object> dbStatus = new HashMap<>();
        dbStatus.put("status", "DOWN");
        dbStatus.put("error", "Connection refused");

        Map<String, Object> healthStatus = new HashMap<>();
        healthStatus.put("status", "UP");
        healthStatus.put("timestamp", 1709913600000L);
        healthStatus.put("database", dbStatus);

        when(healthCheckService.getHealthStatus()).thenReturn(healthStatus);

        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.database.status").value("DOWN"))
                .andExpect(jsonPath("$.database.error").value("Connection refused"));
    }
}
