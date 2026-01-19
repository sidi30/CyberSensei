package com.cybersensei.backend.phishing.service;

import com.cybersensei.backend.phishing.entity.PhishingCampaign;
import com.cybersensei.backend.phishing.entity.PhishingCampaign.TargetingConfig;
import com.cybersensei.backend.phishing.repository.PhishingRecipientRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for computing campaign target users based on targeting rules.
 */
@Service
public class TargetingService {

    private static final Logger log = LoggerFactory.getLogger(TargetingService.class);
    private static final Random RANDOM = new Random();

    private final PhishingRecipientRepository recipientRepository;

    public TargetingService(PhishingRecipientRepository recipientRepository) {
        this.recipientRepository = recipientRepository;
    }

    /**
     * Compute target users for a campaign based on targeting rules and sampling.
     * 
     * @param campaign The campaign
     * @param allUsers List of all available users (from user service)
     * @return List of selected users
     */
    public List<TargetUser> computeTargets(PhishingCampaign campaign, List<TargetUser> allUsers) {
        TargetingConfig targeting = campaign.getTargetingJson();
        List<TargetUser> filtered = new ArrayList<>(allUsers);

        // Apply department filter
        if (targeting != null && targeting.getDepartments() != null && !targeting.getDepartments().isEmpty()) {
            Set<String> departments = new HashSet<>(targeting.getDepartments());
            filtered = filtered.stream()
                    .filter(u -> departments.contains(u.getDepartment()))
                    .collect(Collectors.toList());
            log.debug("After department filter: {} users", filtered.size());
        }

        // Apply role filter
        if (targeting != null && targeting.getRoles() != null && !targeting.getRoles().isEmpty()) {
            Set<String> roles = new HashSet<>(targeting.getRoles());
            filtered = filtered.stream()
                    .filter(u -> roles.contains(u.getRole()))
                    .collect(Collectors.toList());
            log.debug("After role filter: {} users", filtered.size());
        }

        // Include specific users
        if (targeting != null && targeting.getIncludeUsers() != null && !targeting.getIncludeUsers().isEmpty()) {
            Set<UUID> includeIds = new HashSet<>(targeting.getIncludeUsers());
            List<TargetUser> includedUsers = allUsers.stream()
                    .filter(u -> includeIds.contains(u.getUserId()))
                    .collect(Collectors.toList());
            // Merge with filtered, avoiding duplicates
            Set<UUID> existingIds = filtered.stream().map(TargetUser::getUserId).collect(Collectors.toSet());
            for (TargetUser user : includedUsers) {
                if (!existingIds.contains(user.getUserId())) {
                    filtered.add(user);
                }
            }
            log.debug("After include users: {} users", filtered.size());
        }

        // Exclude specific users
        if (targeting != null && targeting.getExcludeUsers() != null && !targeting.getExcludeUsers().isEmpty()) {
            Set<UUID> excludeIds = new HashSet<>(targeting.getExcludeUsers());
            filtered = filtered.stream()
                    .filter(u -> !excludeIds.contains(u.getUserId()))
                    .collect(Collectors.toList());
            log.debug("After exclude users: {} users", filtered.size());
        }

        // Exclude users who already received this campaign (for recurring campaigns)
        List<UUID> alreadyTargeted = recipientRepository.findUserIdsByCampaign(campaign.getId());
        if (!alreadyTargeted.isEmpty()) {
            Set<UUID> alreadyTargetedSet = new HashSet<>(alreadyTargeted);
            filtered = filtered.stream()
                    .filter(u -> !alreadyTargetedSet.contains(u.getUserId()))
                    .collect(Collectors.toList());
            log.debug("After excluding already targeted: {} users", filtered.size());
        }

        // Apply sampling
        if (campaign.getSamplingPercent() != null && campaign.getSamplingPercent() < 100) {
            filtered = applySampling(filtered, campaign.getSamplingPercent());
            log.debug("After sampling {}%: {} users", campaign.getSamplingPercent(), filtered.size());
        }

        return filtered;
    }

    /**
     * Apply random sampling to user list.
     */
    private List<TargetUser> applySampling(List<TargetUser> users, int percent) {
        if (users.isEmpty() || percent >= 100) {
            return users;
        }

        int targetCount = Math.max(1, (users.size() * percent) / 100);
        
        // Shuffle and take first N
        List<TargetUser> shuffled = new ArrayList<>(users);
        Collections.shuffle(shuffled, RANDOM);
        
        return shuffled.subList(0, Math.min(targetCount, shuffled.size()));
    }

    /**
     * Get estimated target count without actually selecting users.
     */
    public int estimateTargetCount(PhishingCampaign campaign, int totalUsers) {
        // Rough estimation based on filters
        int estimated = totalUsers;
        
        TargetingConfig targeting = campaign.getTargetingJson();
        
        // If specific departments are targeted, assume 20% of users per department
        if (targeting != null && targeting.getDepartments() != null && !targeting.getDepartments().isEmpty()) {
            estimated = Math.min(estimated, targeting.getDepartments().size() * (totalUsers / 5));
        }
        
        // Apply sampling
        if (campaign.getSamplingPercent() != null && campaign.getSamplingPercent() < 100) {
            estimated = (estimated * campaign.getSamplingPercent()) / 100;
        }
        
        return Math.max(1, estimated);
    }

    /**
     * DTO representing a target user for a campaign.
     */
    public static class TargetUser {
        private UUID userId;
        private String email;
        private String firstName;
        private String lastName;
        private String department;
        private String role;

        public TargetUser() {}

        public TargetUser(UUID userId, String email, String firstName, String lastName, 
                         String department, String role) {
            this.userId = userId;
            this.email = email;
            this.firstName = firstName;
            this.lastName = lastName;
            this.department = department;
            this.role = role;
        }

        public UUID getUserId() { return userId; }
        public void setUserId(UUID userId) { this.userId = userId; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }

        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }

        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }
}

