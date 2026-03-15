package io.cybersensei.aisecurity.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.cybersensei.aisecurity.api.dto.request.AnalyzePromptRequest;
import io.cybersensei.aisecurity.api.dto.response.AnalyzePromptResponse;
import io.cybersensei.aisecurity.domain.enums.AiTool;
import io.cybersensei.aisecurity.domain.enums.RiskLevel;
import io.cybersensei.aisecurity.security.JwtTokenProvider;
import io.cybersensei.aisecurity.service.PromptSecurityService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PromptAnalysisController.class)
@AutoConfigureMockMvc(addFilters = false)
class PromptAnalysisControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PromptSecurityService promptSecurityService;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    // ── POST /api/ai-security/analyze with valid request ──

    @Nested
    @DisplayName("POST /api/ai-security/analyze - valid requests")
    class ValidRequests {

        @Test
        @DisplayName("should return 200 with analysis result for valid request")
        void shouldReturn200ForValidRequest() throws Exception {
            // Arrange
            AnalyzePromptRequest request = AnalyzePromptRequest.builder()
                    .prompt("Bonjour, comment optimiser du code Java ?")
                    .aiTool(AiTool.CHATGPT)
                    .companyId(1L)
                    .userId(42L)
                    .sourceUrl("https://chat.openai.com")
                    .build();

            AnalyzePromptResponse response = AnalyzePromptResponse.builder()
                    .eventId(1L)
                    .riskScore(0)
                    .riskLevel(RiskLevel.SAFE)
                    .blocked(false)
                    .sanitizedPrompt(null)
                    .detections(List.of())
                    .recommendation("Aucun risque detecte. Vous pouvez envoyer ce prompt.")
                    .build();

            when(promptSecurityService.analyzeAndProcess(any(AnalyzePromptRequest.class)))
                    .thenReturn(response);

            // Act & Assert
            mockMvc.perform(post("/api/ai-security/analyze")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.eventId").value(1))
                    .andExpect(jsonPath("$.riskScore").value(0))
                    .andExpect(jsonPath("$.riskLevel").value("SAFE"))
                    .andExpect(jsonPath("$.blocked").value(false))
                    .andExpect(jsonPath("$.detections").isArray())
                    .andExpect(jsonPath("$.detections").isEmpty());
        }

        @Test
        @DisplayName("should return analysis with detections for risky prompt")
        void shouldReturnDetectionsForRiskyPrompt() throws Exception {
            // Arrange
            AnalyzePromptRequest request = AnalyzePromptRequest.builder()
                    .prompt("password=secret123")
                    .aiTool(AiTool.COPILOT)
                    .companyId(2L)
                    .userId(10L)
                    .build();

            var detectionDetail = AnalyzePromptResponse.DetectionDetail.builder()
                    .category("CREDENTIALS_SECRETS")
                    .confidence(95)
                    .method("regex")
                    .snippet("pa****23")
                    .build();

            AnalyzePromptResponse response = AnalyzePromptResponse.builder()
                    .eventId(2L)
                    .riskScore(85)
                    .riskLevel(RiskLevel.CRITICAL)
                    .blocked(true)
                    .sanitizedPrompt("password=[MASQUE]")
                    .detections(List.of(detectionDetail))
                    .recommendation("Ce prompt a ete bloque.")
                    .build();

            when(promptSecurityService.analyzeAndProcess(any(AnalyzePromptRequest.class)))
                    .thenReturn(response);

            // Act & Assert
            mockMvc.perform(post("/api/ai-security/analyze")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.riskScore").value(85))
                    .andExpect(jsonPath("$.blocked").value(true))
                    .andExpect(jsonPath("$.sanitizedPrompt").value("password=[MASQUE]"))
                    .andExpect(jsonPath("$.detections[0].category").value("CREDENTIALS_SECRETS"))
                    .andExpect(jsonPath("$.detections[0].confidence").value(95));
        }
    }

    // ── Validation: empty prompt ──

    @Nested
    @DisplayName("POST /api/ai-security/analyze - validation errors")
    class ValidationErrors {

        @Test
        @DisplayName("should return 400 when prompt is empty")
        void shouldReturn400WhenPromptEmpty() throws Exception {
            AnalyzePromptRequest request = AnalyzePromptRequest.builder()
                    .prompt("")
                    .aiTool(AiTool.CHATGPT)
                    .companyId(1L)
                    .userId(42L)
                    .build();

            mockMvc.perform(post("/api/ai-security/analyze")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 400 when prompt is null")
        void shouldReturn400WhenPromptNull() throws Exception {
            AnalyzePromptRequest request = AnalyzePromptRequest.builder()
                    .prompt(null)
                    .aiTool(AiTool.CHATGPT)
                    .companyId(1L)
                    .userId(42L)
                    .build();

            mockMvc.perform(post("/api/ai-security/analyze")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 400 when companyId is missing")
        void shouldReturn400WhenCompanyIdMissing() throws Exception {
            AnalyzePromptRequest request = AnalyzePromptRequest.builder()
                    .prompt("Valid prompt text")
                    .aiTool(AiTool.CHATGPT)
                    .companyId(null)
                    .userId(42L)
                    .build();

            mockMvc.perform(post("/api/ai-security/analyze")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 400 when userId is missing")
        void shouldReturn400WhenUserIdMissing() throws Exception {
            AnalyzePromptRequest request = AnalyzePromptRequest.builder()
                    .prompt("Valid prompt text")
                    .aiTool(AiTool.CHATGPT)
                    .companyId(1L)
                    .userId(null)
                    .build();

            mockMvc.perform(post("/api/ai-security/analyze")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 400 when aiTool is missing")
        void shouldReturn400WhenAiToolMissing() throws Exception {
            AnalyzePromptRequest request = AnalyzePromptRequest.builder()
                    .prompt("Valid prompt text")
                    .aiTool(null)
                    .companyId(1L)
                    .userId(42L)
                    .build();

            mockMvc.perform(post("/api/ai-security/analyze")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
    }
}
