package io.cybersensei.service;

import io.cybersensei.domain.entity.AIProfile;
import io.cybersensei.domain.entity.UserExerciseResult;
import io.cybersensei.domain.repository.AIProfileRepository;
import io.cybersensei.domain.repository.UserExerciseResultRepository;
import io.cybersensei.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * Service for managing AI profiles and personalization
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AIProfileService {

    private final AIProfileRepository aiProfileRepository;
    private final UserExerciseResultRepository resultRepository;

    /**
     * Get or create AI profile for current user
     */
    @Transactional
    public AIProfile getOrCreateProfile() {
        Long userId = getCurrentUserId();
        return aiProfileRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultProfile(userId));
    }

    /**
     * Get AI profile by user ID
     */
    @Transactional(readOnly = true)
    public Optional<AIProfile> getProfileByUserId(Long userId) {
        return aiProfileRepository.findByUserId(userId);
    }

    /**
     * Create default profile for a user
     */
    private AIProfile createDefaultProfile(Long userId) {
        Map<String, Object> defaultPreferences = new HashMap<>();
        defaultPreferences.put("preferredDifficulty", "BEGINNER");
        defaultPreferences.put("uiTheme", "light");
        defaultPreferences.put("notificationsEnabled", true);
        defaultPreferences.put("dailyGoal", 1);
        defaultPreferences.put("preferredTopics", new ArrayList<String>());

        Map<String, Object> defaultAnalytics = new HashMap<>();
        defaultAnalytics.put("avgResponseTime", 0);
        defaultAnalytics.put("topicProgress", new HashMap<String, Integer>());
        defaultAnalytics.put("completionRate", 0);

        AIProfile profile = AIProfile.builder()
                .userId(userId)
                .style("practical")
                .preferencesJSON(defaultPreferences)
                .analyticsJSON(defaultAnalytics)
                .weaknessesJSON(new HashMap<>())
                .streakDays(0)
                .totalXP(0)
                .currentLevel(1)
                .build();

        return aiProfileRepository.save(profile);
    }

    /**
     * Update user preferences
     */
    @Transactional
    public AIProfile updatePreferences(Map<String, Object> preferences) {
        AIProfile profile = getOrCreateProfile();

        Map<String, Object> currentPrefs = profile.getPreferencesJSON();
        if (currentPrefs == null) {
            currentPrefs = new HashMap<>();
        }

        // Merge new preferences
        currentPrefs.putAll(preferences);
        profile.setPreferencesJSON(currentPrefs);

        return aiProfileRepository.save(profile);
    }

    /**
     * Update learning style
     */
    @Transactional
    public AIProfile updateStyle(String style) {
        AIProfile profile = getOrCreateProfile();
        profile.setStyle(style);
        return aiProfileRepository.save(profile);
    }

    /**
     * Record activity and update streak
     */
    @Transactional
    public AIProfile recordActivity(int xpEarned) {
        AIProfile profile = getOrCreateProfile();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lastActivity = profile.getLastActivityDate();

        // Update streak
        if (lastActivity != null) {
            long daysBetween = ChronoUnit.DAYS.between(lastActivity.toLocalDate(), now.toLocalDate());
            if (daysBetween == 1) {
                // Consecutive day - increase streak
                profile.setStreakDays(profile.getStreakDays() + 1);
            } else if (daysBetween > 1) {
                // Streak broken - reset
                profile.setStreakDays(1);
            }
            // Same day - no change to streak
        } else {
            // First activity
            profile.setStreakDays(1);
        }

        // Add XP
        profile.addXP(xpEarned);
        profile.setLastActivityDate(now);

        return aiProfileRepository.save(profile);
    }

    /**
     * Update topic progress after completing an exercise
     */
    @Transactional
    @SuppressWarnings("unchecked")
    public AIProfile updateTopicProgress(String topic, int score, int maxScore) {
        AIProfile profile = getOrCreateProfile();

        Map<String, Object> analytics = profile.getAnalyticsJSON();
        if (analytics == null) {
            analytics = new HashMap<>();
        }

        Map<String, Object> topicProgress = (Map<String, Object>) analytics.getOrDefault("topicProgress", new HashMap<>());

        // Update topic stats
        Map<String, Object> topicStats = (Map<String, Object>) topicProgress.getOrDefault(topic, new HashMap<>());
        int attempts = ((Number) topicStats.getOrDefault("attempts", 0)).intValue() + 1;
        double totalScore = ((Number) topicStats.getOrDefault("totalScore", 0.0)).doubleValue() + score;
        double totalMax = ((Number) topicStats.getOrDefault("totalMax", 0.0)).doubleValue() + maxScore;

        topicStats.put("attempts", attempts);
        topicStats.put("totalScore", totalScore);
        topicStats.put("totalMax", totalMax);
        topicStats.put("avgScore", totalMax > 0 ? (totalScore / totalMax) * 100 : 0);
        topicStats.put("lastAttempt", LocalDateTime.now().toString());

        topicProgress.put(topic, topicStats);
        analytics.put("topicProgress", topicProgress);

        // Update weaknesses based on score
        updateWeaknesses(profile, topic, score, maxScore);

        profile.setAnalyticsJSON(analytics);
        return aiProfileRepository.save(profile);
    }

    /**
     * Update weaknesses based on exercise performance
     */
    @SuppressWarnings("unchecked")
    private void updateWeaknesses(AIProfile profile, String topic, int score, int maxScore) {
        Map<String, Object> weaknesses = profile.getWeaknessesJSON();
        if (weaknesses == null) {
            weaknesses = new HashMap<>();
        }

        double percentage = maxScore > 0 ? (score * 100.0 / maxScore) : 0;

        if (percentage < 60) {
            // Add or keep as weakness
            weaknesses.put(topic, Map.of(
                    "score", percentage,
                    "lastAttempt", LocalDateTime.now().toString()
            ));
        } else if (percentage >= 80) {
            // Remove from weaknesses if they improved
            weaknesses.remove(topic);
        }

        profile.setWeaknessesJSON(weaknesses);
    }

    /**
     * Get personalized greeting based on time and streak
     */
    public Map<String, Object> getPersonalizedGreeting() {
        AIProfile profile = getOrCreateProfile();
        Map<String, Object> greeting = new HashMap<>();

        // Time-based greeting
        int hour = LocalDateTime.now().getHour();
        String timeGreeting;
        String emoji;

        if (hour < 12) {
            timeGreeting = "Bonjour";
            emoji = "☀️";
        } else if (hour < 18) {
            timeGreeting = "Bon apres-midi";
            emoji = "🌤️";
        } else {
            timeGreeting = "Bonsoir";
            emoji = "🌙";
        }

        greeting.put("timeGreeting", timeGreeting);
        greeting.put("emoji", emoji);
        greeting.put("streakDays", profile.getStreakDays());
        greeting.put("totalXP", profile.getTotalXP());
        greeting.put("currentLevel", profile.getCurrentLevel());

        // Streak message
        if (profile.getStreakDays() > 0) {
            greeting.put("streakMessage", String.format("Serie de %d jour(s) ! 🔥", profile.getStreakDays()));
        }

        // Level progress
        int xpForNextLevel = calculateXPForNextLevel(profile.getCurrentLevel());
        int xpInCurrentLevel = profile.getTotalXP() - calculateTotalXPForLevel(profile.getCurrentLevel() - 1);
        greeting.put("xpForNextLevel", xpForNextLevel);
        greeting.put("xpInCurrentLevel", xpInCurrentLevel);
        greeting.put("levelProgress", (xpInCurrentLevel * 100) / xpForNextLevel);

        return greeting;
    }

    /**
     * Get personalized recommendations based on weaknesses and progress
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getRecommendations() {
        AIProfile profile = getOrCreateProfile();
        Map<String, Object> recommendations = new HashMap<>();

        // Topics to improve (weaknesses)
        Map<String, Object> weaknesses = profile.getWeaknessesJSON();
        if (weaknesses != null && !weaknesses.isEmpty()) {
            recommendations.put("topicsToImprove", new ArrayList<>(weaknesses.keySet()));
        } else {
            recommendations.put("topicsToImprove", List.of());
        }

        // Suggested difficulty based on performance
        Double avgScore = resultRepository.findAverageScoreByUserId(profile.getUserId());
        String suggestedDifficulty;
        if (avgScore == null || avgScore < 50) {
            suggestedDifficulty = "BEGINNER";
        } else if (avgScore < 70) {
            suggestedDifficulty = "INTERMEDIATE";
        } else if (avgScore < 85) {
            suggestedDifficulty = "ADVANCED";
        } else {
            suggestedDifficulty = "EXPERT";
        }
        recommendations.put("suggestedDifficulty", suggestedDifficulty);

        // Topics not yet attempted
        Map<String, Object> analytics = profile.getAnalyticsJSON();
        Map<String, Object> topicProgress = analytics != null
                ? (Map<String, Object>) analytics.getOrDefault("topicProgress", new HashMap<>())
                : new HashMap<>();

        List<String> allTopics = List.of(
                "Phishing", "Password Security", "Ransomware", "Social Engineering",
                "Remote Work Security", "Data Protection", "Shadow IT", "Malware",
                "Network Security", "Zero Trust"
        );

        List<String> newTopics = allTopics.stream()
                .filter(t -> !topicProgress.containsKey(t))
                .toList();
        recommendations.put("newTopicsToExplore", newTopics);

        // Daily goal status
        Map<String, Object> preferences = profile.getPreferencesJSON();
        int dailyGoal = preferences != null
                ? ((Number) preferences.getOrDefault("dailyGoal", 1)).intValue()
                : 1;

        Long exercisesToday = resultRepository.countTodayByUserId(profile.getUserId());
        recommendations.put("dailyGoal", dailyGoal);
        recommendations.put("exercisesToday", exercisesToday);
        recommendations.put("dailyGoalReached", exercisesToday >= dailyGoal);

        return recommendations;
    }

    private int calculateXPForNextLevel(int currentLevel) {
        return (currentLevel) * 100 + 100;
    }

    private int calculateTotalXPForLevel(int level) {
        if (level <= 0) return 0;
        int total = 0;
        for (int i = 1; i <= level; i++) {
            total += i * 100;
        }
        return total;
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal) {
            return ((UserPrincipal) auth.getPrincipal()).getId();
        }
        return 1L; // Default for dev mode
    }
}
