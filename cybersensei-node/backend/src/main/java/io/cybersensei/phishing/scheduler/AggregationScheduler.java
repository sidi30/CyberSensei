package io.cybersensei.phishing.scheduler;

import io.cybersensei.api.exception.ResourceNotFoundException;
import io.cybersensei.api.exception.BusinessRuleException;
import io.cybersensei.phishing.entity.*;
import io.cybersensei.phishing.entity.PhishingCampaign.CampaignStatus;
import io.cybersensei.phishing.entity.PhishingEvent.EventType;
import io.cybersensei.phishing.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;

/**
 * Scheduler for daily result aggregation.
 * Runs once per day to compute daily statistics.
 */
@Component
public class AggregationScheduler {

    private static final Logger log = LoggerFactory.getLogger(AggregationScheduler.class);

    private final PhishingCampaignRepository campaignRepository;
    private final PhishingEventRepository eventRepository;
    private final PhishingRecipientRepository recipientRepository;
    private final PhishingResultsDailyRepository resultsDailyRepository;

    public AggregationScheduler(PhishingCampaignRepository campaignRepository,
                               PhishingEventRepository eventRepository,
                               PhishingRecipientRepository recipientRepository,
                               PhishingResultsDailyRepository resultsDailyRepository) {
        this.campaignRepository = campaignRepository;
        this.eventRepository = eventRepository;
        this.recipientRepository = recipientRepository;
        this.resultsDailyRepository = resultsDailyRepository;
    }

    /**
     * Aggregate daily results at 2 AM every day.
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void aggregateDailyResults() {
        log.info("Starting daily results aggregation...");

        LocalDate yesterday = LocalDate.now().minusDays(1);

        // Get all active or recently completed campaigns
        List<CampaignStatus> activeStatuses = List.of(
                CampaignStatus.RUNNING, 
                CampaignStatus.SCHEDULED, 
                CampaignStatus.COMPLETED
        );
        List<PhishingCampaign> campaigns = campaignRepository.findByStatusIn(activeStatuses);

        for (PhishingCampaign campaign : campaigns) {
            try {
                aggregateCampaignDaily(campaign, yesterday);
            } catch (Exception e) {
                log.error("Error aggregating campaign {}: {}", campaign.getId(), e.getMessage());
            }
        }

        log.info("Daily results aggregation completed for {} campaigns", campaigns.size());
    }

    /**
     * Aggregate results for a single campaign on a specific day.
     */
    @Transactional
    public void aggregateCampaignDaily(PhishingCampaign campaign, LocalDate day) {
        UUID campaignId = campaign.getId();

        // Get date range for the day
        OffsetDateTime startOfDay = day.atStartOfDay().atOffset(java.time.ZoneOffset.UTC);
        OffsetDateTime endOfDay = day.plusDays(1).atStartOfDay().atOffset(java.time.ZoneOffset.UTC);

        // Get all events for the day
        List<PhishingEvent> events = eventRepository.findByCampaignIdAndDateRange(
                campaignId, startOfDay, endOfDay);

        // Get all recipients sent on this day
        List<PhishingRecipient> recipients = recipientRepository.findByCampaignId(campaignId).stream()
                .filter(r -> r.getSentAt() != null && 
                        r.getSentAt().toLocalDate().equals(day))
                .toList();

        // Group by department
        Map<String, DepartmentStats> departmentStats = new HashMap<>();
        departmentStats.put(null, new DepartmentStats()); // Overall stats

        for (PhishingRecipient recipient : recipients) {
            String dept = recipient.getDepartment();
            departmentStats.computeIfAbsent(dept, k -> new DepartmentStats()).sentCount++;
            departmentStats.get(null).sentCount++;
        }

        for (PhishingEvent event : events) {
            String dept = null;
            if (event.getRecipient() != null) {
                dept = event.getRecipient().getDepartment();
            }

            DepartmentStats overall = departmentStats.get(null);
            DepartmentStats deptStats = departmentStats.computeIfAbsent(dept, k -> new DepartmentStats());

            switch (event.getEventType()) {
                case DELIVERED:
                    overall.deliveredCount++;
                    deptStats.deliveredCount++;
                    break;
                case OPENED:
                    overall.openedCount++;
                    deptStats.openedCount++;
                    break;
                case CLICKED:
                    overall.clickedCount++;
                    deptStats.clickedCount++;
                    break;
                case REPORTED:
                    overall.reportedCount++;
                    deptStats.reportedCount++;
                    break;
                case DATA_SUBMITTED:
                    overall.dataSubmittedCount++;
                    deptStats.dataSubmittedCount++;
                    break;
            }
        }

        // Save aggregated results
        for (Map.Entry<String, DepartmentStats> entry : departmentStats.entrySet()) {
            String department = entry.getKey();
            DepartmentStats stats = entry.getValue();

            if (stats.sentCount == 0 && stats.deliveredCount == 0) {
                continue; // Skip empty stats
            }

            // Check if record already exists
            Optional<PhishingResultsDaily> existing = resultsDailyRepository
                    .findByCampaignIdAndDayAndDepartment(campaignId, day, department);

            PhishingResultsDaily result;
            if (existing.isPresent()) {
                result = existing.get();
            } else {
                result = new PhishingResultsDaily();
                result.setCampaign(campaign);
                result.setDay(day);
                result.setDepartment(department);
            }

            result.setSentCount(stats.sentCount);
            result.setDeliveredCount(stats.deliveredCount);
            result.setOpenedCount(stats.openedCount);
            result.setClickedCount(stats.clickedCount);
            result.setReportedCount(stats.reportedCount);
            result.setDataSubmittedCount(stats.dataSubmittedCount);
            result.calculateRates();

            resultsDailyRepository.save(result);
        }

        log.debug("Aggregated results for campaign {} on {}", campaign.getName(), day);
    }

    /**
     * Manual trigger for aggregation (for testing or catch-up).
     */
    @Transactional
    public void aggregateForDateRange(UUID campaignId, LocalDate startDate, LocalDate endDate) {
        PhishingCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found"));

        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            aggregateCampaignDaily(campaign, current);
            current = current.plusDays(1);
        }
    }

    /**
     * Helper class for department statistics.
     */
    private static class DepartmentStats {
        int sentCount = 0;
        int deliveredCount = 0;
        int openedCount = 0;
        int clickedCount = 0;
        int reportedCount = 0;
        int dataSubmittedCount = 0;
    }
}

