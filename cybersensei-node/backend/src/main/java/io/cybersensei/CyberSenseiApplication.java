package io.cybersensei;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * CyberSensei Node Backend Application
 * 
 * Main entry point for the Spring Boot application.
 * Enables scheduling for background jobs (sync, metrics, phishing campaigns).
 */
@SpringBootApplication
@EnableScheduling
public class CyberSenseiApplication {

    public static void main(String[] args) {
        SpringApplication.run(CyberSenseiApplication.class, args);
    }
}


