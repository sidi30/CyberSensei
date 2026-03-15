package io.cybersensei.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 * WebSocket handler for broadcasting real-time progress updates
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ProgressWebSocketHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper;

    // All connected sessions
    private final Set<WebSocketSession> sessions = new CopyOnWriteArraySet<>();

    // Sessions by user ID for targeted messages
    private final Map<Long, Set<WebSocketSession>> userSessions = new ConcurrentHashMap<>();

    // Sessions for managers (to receive company metrics)
    private final Set<WebSocketSession> managerSessions = new CopyOnWriteArraySet<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessions.add(session);
        log.info("WebSocket connected: {}", session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        log.debug("Received message: {}", payload);

        try {
            Map<String, Object> data = objectMapper.readValue(payload, Map.class);
            String type = (String) data.get("type");

            if ("REGISTER".equals(type)) {
                handleRegistration(session, data);
            } else if ("PING".equals(type)) {
                session.sendMessage(new TextMessage("{\"type\":\"PONG\"}"));
            }
        } catch (Exception e) {
            log.error("Error handling message: {}", e.getMessage());
        }
    }

    private void handleRegistration(WebSocketSession session, Map<String, Object> data) {
        Long userId = ((Number) data.get("userId")).longValue();
        String role = (String) data.get("role");

        userSessions.computeIfAbsent(userId, k -> new CopyOnWriteArraySet<>()).add(session);

        if ("MANAGER".equals(role) || "ADMIN".equals(role)) {
            managerSessions.add(session);
        }

        log.info("User {} registered with role {}", userId, role);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session);
        managerSessions.remove(session);

        // Remove from user sessions
        userSessions.values().forEach(set -> set.remove(session));

        log.info("WebSocket disconnected: {} ({})", session.getId(), status.getReason());
    }

    /**
     * Broadcast a message to all connected clients
     */
    public void broadcastToAll(Object message) {
        String json = toJson(message);
        if (json == null) return;

        TextMessage textMessage = new TextMessage(json);
        sessions.forEach(session -> sendSafe(session, textMessage));
    }

    /**
     * Send a message to a specific user
     */
    public void sendToUser(Long userId, Object message) {
        Set<WebSocketSession> userSessionSet = userSessions.get(userId);
        if (userSessionSet == null || userSessionSet.isEmpty()) return;

        String json = toJson(message);
        if (json == null) return;

        TextMessage textMessage = new TextMessage(json);
        userSessionSet.forEach(session -> sendSafe(session, textMessage));
    }

    /**
     * Broadcast to all managers
     */
    public void broadcastToManagers(Object message) {
        String json = toJson(message);
        if (json == null) return;

        TextMessage textMessage = new TextMessage(json);
        managerSessions.forEach(session -> sendSafe(session, textMessage));
    }

    /**
     * Broadcast user progress update to managers
     */
    public void broadcastUserProgress(Long userId, String userName, int score, int maxScore, String topic) {
        Map<String, Object> event = Map.of(
                "type", "USER_PROGRESS",
                "userId", userId,
                "userName", userName,
                "score", score,
                "maxScore", maxScore,
                "topic", topic,
                "timestamp", System.currentTimeMillis()
        );
        broadcastToManagers(event);
    }

    /**
     * Broadcast company metrics update
     */
    public void broadcastCompanyMetrics(Map<String, Object> metrics) {
        Map<String, Object> event = Map.of(
                "type", "COMPANY_METRICS",
                "data", metrics,
                "timestamp", System.currentTimeMillis()
        );
        broadcastToManagers(event);
    }

    /**
     * Notify user of exercise completion
     */
    public void notifyExerciseComplete(Long userId, int score, int maxScore, String feedback) {
        Map<String, Object> event = Map.of(
                "type", "EXERCISE_COMPLETE",
                "score", score,
                "maxScore", maxScore,
                "feedback", feedback,
                "timestamp", System.currentTimeMillis()
        );
        sendToUser(userId, event);
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            log.error("Failed to serialize message: {}", e.getMessage());
            return null;
        }
    }

    private void sendSafe(WebSocketSession session, TextMessage message) {
        try {
            if (session.isOpen()) {
                session.sendMessage(message);
            }
        } catch (IOException e) {
            log.error("Failed to send message to {}: {}", session.getId(), e.getMessage());
        }
    }

    public int getConnectedCount() {
        return sessions.size();
    }

    public int getManagerCount() {
        return managerSessions.size();
    }
}
