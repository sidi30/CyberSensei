package com.cybersensei.backend.phishing.service;

import com.cybersensei.backend.phishing.entity.PhishingCampaign;
import com.cybersensei.backend.phishing.entity.PhishingCampaign.TargetingConfig;
import com.cybersensei.backend.phishing.repository.PhishingRecipientRepository;
import com.cybersensei.backend.phishing.service.TargetingService.TargetUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TargetingServiceTest {

    @Mock
    private PhishingRecipientRepository recipientRepository;

    private TargetingService targetingService;

    private List<TargetUser> allUsers;

    @BeforeEach
    void setUp() {
        targetingService = new TargetingService(recipientRepository);
        
        // Create test users
        allUsers = new ArrayList<>();
        allUsers.add(createUser("IT", "Developer"));
        allUsers.add(createUser("IT", "Developer"));
        allUsers.add(createUser("IT", "Manager"));
        allUsers.add(createUser("HR", "Recruiter"));
        allUsers.add(createUser("HR", "Manager"));
        allUsers.add(createUser("Finance", "Accountant"));
        allUsers.add(createUser("Finance", "Analyst"));
        allUsers.add(createUser("Finance", "Manager"));
        allUsers.add(createUser("Sales", "Representative"));
        allUsers.add(createUser("Sales", "Manager"));
    }

    private TargetUser createUser(String department, String role) {
        return new TargetUser(
                UUID.randomUUID(),
                "user@example.com",
                "First",
                "Last",
                department,
                role
        );
    }

    @Test
    void computeTargets_NoFilters_ReturnsAllUsers() {
        when(recipientRepository.findUserIdsByCampaign(any())).thenReturn(List.of());

        PhishingCampaign campaign = new PhishingCampaign();
        campaign.setId(UUID.randomUUID());
        campaign.setTargetingJson(new TargetingConfig());
        campaign.setSamplingPercent(100);

        List<TargetUser> targets = targetingService.computeTargets(campaign, allUsers);

        assertEquals(allUsers.size(), targets.size());
    }

    @Test
    void computeTargets_DepartmentFilter_FiltersCorrectly() {
        when(recipientRepository.findUserIdsByCampaign(any())).thenReturn(List.of());

        PhishingCampaign campaign = new PhishingCampaign();
        campaign.setId(UUID.randomUUID());
        campaign.setSamplingPercent(100);

        TargetingConfig config = new TargetingConfig();
        config.setDepartments(List.of("IT"));
        campaign.setTargetingJson(config);

        List<TargetUser> targets = targetingService.computeTargets(campaign, allUsers);

        assertEquals(3, targets.size()); // 3 IT users
        assertTrue(targets.stream().allMatch(u -> "IT".equals(u.getDepartment())));
    }

    @Test
    void computeTargets_RoleFilter_FiltersCorrectly() {
        when(recipientRepository.findUserIdsByCampaign(any())).thenReturn(List.of());

        PhishingCampaign campaign = new PhishingCampaign();
        campaign.setId(UUID.randomUUID());
        campaign.setSamplingPercent(100);

        TargetingConfig config = new TargetingConfig();
        config.setRoles(List.of("Manager"));
        campaign.setTargetingJson(config);

        List<TargetUser> targets = targetingService.computeTargets(campaign, allUsers);

        assertEquals(4, targets.size()); // 4 Managers
        assertTrue(targets.stream().allMatch(u -> "Manager".equals(u.getRole())));
    }

    @Test
    void computeTargets_Sampling_ReducesCount() {
        when(recipientRepository.findUserIdsByCampaign(any())).thenReturn(List.of());

        PhishingCampaign campaign = new PhishingCampaign();
        campaign.setId(UUID.randomUUID());
        campaign.setTargetingJson(new TargetingConfig());
        campaign.setSamplingPercent(50);

        List<TargetUser> targets = targetingService.computeTargets(campaign, allUsers);

        // 50% of 10 users = 5
        assertEquals(5, targets.size());
    }

    @Test
    void computeTargets_ExcludeUsers_ExcludesCorrectly() {
        when(recipientRepository.findUserIdsByCampaign(any())).thenReturn(List.of());

        PhishingCampaign campaign = new PhishingCampaign();
        campaign.setId(UUID.randomUUID());
        campaign.setSamplingPercent(100);

        UUID excludedId = allUsers.get(0).getUserId();

        TargetingConfig config = new TargetingConfig();
        config.setExcludeUsers(List.of(excludedId));
        campaign.setTargetingJson(config);

        List<TargetUser> targets = targetingService.computeTargets(campaign, allUsers);

        assertEquals(allUsers.size() - 1, targets.size());
        assertFalse(targets.stream().anyMatch(u -> u.getUserId().equals(excludedId)));
    }

    @Test
    void computeTargets_IncludeUsers_AddsUsersToFiltered() {
        when(recipientRepository.findUserIdsByCampaign(any())).thenReturn(List.of());

        PhishingCampaign campaign = new PhishingCampaign();
        campaign.setId(UUID.randomUUID());
        campaign.setSamplingPercent(100);

        // Filter to IT only, but include a Finance user
        UUID financeUserId = allUsers.stream()
                .filter(u -> "Finance".equals(u.getDepartment()))
                .findFirst()
                .get()
                .getUserId();

        TargetingConfig config = new TargetingConfig();
        config.setDepartments(List.of("IT"));
        config.setIncludeUsers(List.of(financeUserId));
        campaign.setTargetingJson(config);

        List<TargetUser> targets = targetingService.computeTargets(campaign, allUsers);

        assertEquals(4, targets.size()); // 3 IT + 1 included Finance
        assertTrue(targets.stream().anyMatch(u -> u.getUserId().equals(financeUserId)));
    }

    @Test
    void computeTargets_ExcludesAlreadyTargeted() {
        // One user already targeted
        UUID alreadyTargetedId = allUsers.get(0).getUserId();
        when(recipientRepository.findUserIdsByCampaign(any()))
                .thenReturn(List.of(alreadyTargetedId));

        PhishingCampaign campaign = new PhishingCampaign();
        campaign.setId(UUID.randomUUID());
        campaign.setTargetingJson(new TargetingConfig());
        campaign.setSamplingPercent(100);

        List<TargetUser> targets = targetingService.computeTargets(campaign, allUsers);

        assertEquals(allUsers.size() - 1, targets.size());
        assertFalse(targets.stream().anyMatch(u -> u.getUserId().equals(alreadyTargetedId)));
    }

    @Test
    void computeTargets_CombinedFilters_WorksCorrectly() {
        when(recipientRepository.findUserIdsByCampaign(any())).thenReturn(List.of());

        PhishingCampaign campaign = new PhishingCampaign();
        campaign.setId(UUID.randomUUID());
        campaign.setSamplingPercent(100);

        // IT department, Manager role
        TargetingConfig config = new TargetingConfig();
        config.setDepartments(List.of("IT"));
        config.setRoles(List.of("Manager"));
        campaign.setTargetingJson(config);

        List<TargetUser> targets = targetingService.computeTargets(campaign, allUsers);

        assertEquals(1, targets.size()); // Only 1 IT Manager
        assertEquals("IT", targets.get(0).getDepartment());
        assertEquals("Manager", targets.get(0).getRole());
    }
}

