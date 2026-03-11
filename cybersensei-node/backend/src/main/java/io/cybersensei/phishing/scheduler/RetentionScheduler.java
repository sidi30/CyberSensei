package io.cybersensei.phishing.scheduler;

import io.cybersensei.phishing.service.RetentionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduler for data retention cleanup.
 * Runs once per day to purge old data based on campaign retention settings.
 */
@Component
public class RetentionScheduler {

    private static final Logger log = LoggerFactory.getLogger(RetentionScheduler.class);

    private final RetentionService retentionService;

    public RetentionScheduler(RetentionService retentionService) {
        this.retentionService = retentionService;
    }

    /**
     * Purge old data at 3 AM every day.
     */
    @Scheduled(cron = "0 0 3 * * *")
    public void purgeOldData() {
        log.info("Starting scheduled data retention purge...");
        
        try {
            retentionService.purgeOldData();
            log.info("Scheduled data retention purge completed");
        } catch (Exception e) {
            log.error("Error during data retention purge: {}", e.getMessage());
        }
    }
}

