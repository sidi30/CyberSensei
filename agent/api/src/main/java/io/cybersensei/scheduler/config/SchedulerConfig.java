package io.cybersensei.scheduler.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

/**
 * Configuration du pool de threads pour les tâches planifiées.
 * Sépare les threads de scheduling des threads HTTP pour éviter
 * qu'un scan long ne bloque les autres tâches.
 */
@Configuration
@EnableScheduling
public class SchedulerConfig {

    @Bean
    public ThreadPoolTaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(4);
        scheduler.setThreadNamePrefix("cs-scheduler-");
        scheduler.setWaitForTasksToCompleteOnShutdown(true);
        scheduler.setAwaitTerminationSeconds(30);
        scheduler.setErrorHandler(t ->
            org.slf4j.LoggerFactory.getLogger("cs-scheduler")
                .error("Erreur non gérée dans une tâche planifiée", t)
        );
        return scheduler;
    }
}
