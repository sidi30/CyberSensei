package io.cybersensei.service;

import io.cybersensei.api.dto.AIChatRequest;
import io.cybersensei.api.dto.AIChatResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.Map;
import java.util.UUID;

/**
 * AI Service - communicates with local AI model container
 */
@Service
@Slf4j
public class AIService {

    private final RestClient restClient;

    public AIService(@Value("${cybersensei.ai.service-url}") String aiServiceUrl,
                     @Value("${cybersensei.ai.timeout}") long timeout) {
        this.restClient = RestClient.builder()
                .baseUrl(aiServiceUrl)
                .build();
    }

    @SuppressWarnings("unchecked")
    public AIChatResponse chat(AIChatRequest request) {
        log.info("Sending chat request to AI service: {}", request.getPrompt());

        try {
            Map<String, Object> aiRequest = Map.of(
                    "prompt", request.getPrompt(),
                    "context", request.getContext() != null ? request.getContext() : ""
            );

            Map<String, Object> response = restClient.post()
                    .uri("/api/ai/chat")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(aiRequest)
                    .retrieve()
                    .body(Map.class);

            String aiResponse = response != null ? (String) response.get("response") : "No response from AI";
            String sessionId = UUID.randomUUID().toString();

            return AIChatResponse.builder()
                    .response(aiResponse)
                    .sessionId(sessionId)
                    .build();

        } catch (Exception e) {
            log.error("Error calling AI service: {}", e.getMessage(), e);
            return AIChatResponse.builder()
                    .response("Je suis desole, le service IA est temporairement indisponible. Veuillez reessayer plus tard.")
                    .sessionId(UUID.randomUUID().toString())
                    .build();
        }
    }
}
