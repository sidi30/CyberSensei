package io.cybersensei.phishing.scheduler;

import io.cybersensei.phishing.entity.PhishingCampaign;
import io.cybersensei.phishing.entity.PhishingCampaign.*;
import io.cybersensei.phishing.repository.PhishingCampaignRepository;
import io.cybersensei.phishing.service.CampaignService;
import io.cybersensei.phishing.service.TargetingService.TargetUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.*;
import java.util.List;
import java.util.Random;

/**
 * Scheduler for automatic campaign execution.
 * Runs every 5 minutes to check for campaigns that should be executed.
 */
@Component
public class CampaignScheduler {

    private static final Logger log = LoggerFactory.getLogger(CampaignScheduler.class);
    private static final Random RANDOM = new Random();

    private final PhishingCampaignRepository campaignRepository;
    private final CampaignService campaignService;

    public CampaignScheduler(PhishingCampaignRepository campaignRepository,
                            CampaignService campaignService) {
        this.campaignRepository = campaignRepository;
        this.campaignService = campaignService;
    }

    /**
     * Check for scheduled campaigns every 5 minutes.
     */
    @Scheduled(fixedRate = 300000) // 5 minutes
    public void checkScheduledCampaigns() {
        log.debug("Checking for scheduled campaigns...");

        List<PhishingCampaign> scheduledCampaigns = campaignRepository.findByStatus(CampaignStatus.SCHEDULED);

        for (PhishingCampaign campaign : scheduledCampaigns) {
            try {
                if (shouldRunCampaign(campaign)) {
                    log.info("Triggering campaign: {}", campaign.getName());
                    executeCampaign(campaign);
                }
            } catch (Exception e) {
                log.error("Error checking campaign {}: {}", campaign.getId(), e.getMessage());
            }
        }
    }

    /**
     * Determine if a campaign should run now.
     */
    private boolean shouldRunCampaign(PhishingCampaign campaign) {
        ZoneId zoneId = ZoneId.of(campaign.getTimezone());
        ZonedDateTime now = ZonedDateTime.now(zoneId);
        LocalDate today = now.toLocalDate();
        LocalTime currentTime = now.toLocalTime();

        // Check date range
        if (campaign.getScheduleStartDate() != null && today.isBefore(campaign.getScheduleStartDate())) {
            return false;
        }
        if (campaign.getScheduleEndDate() != null && today.isAfter(campaign.getScheduleEndDate())) {
            // Campaign has ended, mark as completed
            campaign.setStatus(CampaignStatus.COMPLETED);
            campaignRepository.save(campaign);
            log.info("Campaign {} has ended, marked as COMPLETED", campaign.getName());
            return false;
        }

        // Check time window
        LocalTime windowStart = campaign.getScheduleWindowStart();
        LocalTime windowEnd = campaign.getScheduleWindowEnd();

        if (windowStart != null && windowEnd != null) {
            if (currentTime.isBefore(windowStart) || currentTime.isAfter(windowEnd)) {
                return false;
            }
        }

        // Check frequency
        return checkFrequency(campaign, today);
    }

    /**
     * Check if campaign should run based on frequency.
     */
    private boolean checkFrequency(PhishingCampaign campaign, LocalDate today) {
        ScheduleFrequency frequency = campaign.getScheduleFrequency();

        switch (frequency) {
            case ONCE:
                // Run once on start date (or first available day)
                LocalDate startDate = campaign.getScheduleStartDate();
                return startDate == null || today.equals(startDate) || today.isAfter(startDate);

            case DAILY:
                // Run every day (with some randomization to avoid exact same time)
                return addRandomDelay();

            case WEEKLY:
                // Run once per week (on the same day as start date, or Monday if not set)
                LocalDate weeklyStart = campaign.getScheduleStartDate();
                DayOfWeek targetDay = weeklyStart != null ? weeklyStart.getDayOfWeek() : DayOfWeek.MONDAY;
                return today.getDayOfWeek() == targetDay && addRandomDelay();

            case MONTHLY:
                // Run once per month (on the same day of month as start date, or 1st if not set)
                LocalDate monthlyStart = campaign.getScheduleStartDate();
                int targetDayOfMonth = monthlyStart != null ? monthlyStart.getDayOfMonth() : 1;
                // Handle months with fewer days
                int adjustedDay = Math.min(targetDayOfMonth, today.lengthOfMonth());
                return today.getDayOfMonth() == adjustedDay && addRandomDelay();

            default:
                return false;
        }
    }

    /**
     * Add randomization to avoid predictable scheduling.
     * Returns true ~20% of the time (once per ~25 minutes on average with 5-min checks).
     */
    private boolean addRandomDelay() {
        return RANDOM.nextInt(5) == 0;
    }

    /**
     * Execute a campaign.
     */
    private void executeCampaign(PhishingCampaign campaign) {
        try {
            // In a real implementation, you would fetch users from your user service
            // For now, we'll need to have them provided or use a UserService
            List<TargetUser> allUsers = fetchAllUsers();

            campaign.setStatus(CampaignStatus.RUNNING);
            campaignRepository.save(campaign);

            campaignService.executeCampaignRun(campaign, allUsers);

            // For ONCE frequency, mark as completed after run
            if (campaign.getScheduleFrequency() == ScheduleFrequency.ONCE) {
                campaign.setStatus(CampaignStatus.COMPLETED);
            } else {
                campaign.setStatus(CampaignStatus.SCHEDULED);
            }
            campaignRepository.save(campaign);

        } catch (Exception e) {
            log.error("Failed to execute campaign {}: {}", campaign.getId(), e.getMessage());
            campaign.setStatus(CampaignStatus.SCHEDULED); // Return to scheduled on error
            campaignRepository.save(campaign);
        }
    }

    /**
     * Fetch all users from user service.
     * This should be injected/replaced with actual user service integration.
     */
    private List<TargetUser> fetchAllUsers() {
        // TODO: Integrate with actual user service
        // For now, return empty list - campaigns need to be run manually with users provided
        return List.of();
    }
}

