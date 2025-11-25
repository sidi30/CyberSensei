package io.cybersensei.service;

import io.cybersensei.api.dto.AIChatRequest;
import io.cybersensei.api.dto.AIChatResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Map;
import java.util.UUID;

/**
 * AI Service - communicates with local AI model container
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AIService {

    private final WebClient.Builder webClientBuilder;

    @Value("${cybersensei.ai.service-url}")
    private String aiServiceUrl;

    @Value("${cybersensei.ai.timeout}")
    private long timeout;

    public AIChatResponse chat(AIChatRequest request) {
        log.info("Sending chat request to AI service: {}", request.getPrompt());

        try {
            WebClient webClient = webClientBuilder.baseUrl(aiServiceUrl).build();

            Map<String, Object> aiRequest = Map.of(
                    "prompt", request.getPrompt(),
                    "context", request.getContext() != null ? request.getContext() : ""
            );

            Map<String, Object> response = webClient.post()
                    .uri("/api/ai/chat")
                    .bodyValue(aiRequest)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofMillis(timeout))
                    .onErrorResume(e -> {
                        log.error("Error calling AI service: {}", e.getMessage());
                        return Mono.just(Map.of(
                                "response", "Je suis désolé, le service IA est temporairement indisponible. Veuillez réessayer plus tard.",
                                "error", true
                        ));
                    })
                    .block();

            String aiResponse = response != null ? (String) response.get("response") : "No response from AI";
            String sessionId = UUID.randomUUID().toString();

            return AIChatResponse.builder()
                    .response(aiResponse)
                    .sessionId(sessionId)
                    .build();

        } catch (Exception e) {
            log.error("Unexpected error in AI service: {}", e.getMessage(), e);
            return AIChatResponse.builder()
                    .response("Une erreur inattendue s'est produite. Veuillez réessayer.")
                    .sessionId(UUID.randomUUID().toString())
                    .build();
        }
    }
}


