package io.cybersensei;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * CyberSensei Node Backend Application
 *
 * Main entry point for the Spring Boot application.
 * Enables scheduling for background jobs (sync, metrics, phishing campaigns).
 */
@SpringBootApplication
@EnableScheduling
@EntityScan(basePackages = {"io.cybersensei.domain.entity", "io.cybersensei.phishing.entity"})
@EnableJpaRepositories(basePackages = {"io.cybersensei.domain.repository", "io.cybersensei.phishing.repository"})
public class CyberSenseiApplication {

    public static void main(String[] args) {
        SpringApplication.run(CyberSenseiApplication.class, args);
    }
}
