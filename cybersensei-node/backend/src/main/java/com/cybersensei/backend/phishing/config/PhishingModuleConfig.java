package com.cybersensei.backend.phishing.config;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Configuration for the Phishing Simulation module.
 */
@Configuration
@EnableScheduling
@ComponentScan(basePackages = "com.cybersensei.backend.phishing")
@EntityScan(basePackages = "com.cybersensei.backend.phishing.entity")
@EnableJpaRepositories(basePackages = "com.cybersensei.backend.phishing.repository")
public class PhishingModuleConfig {

    // Module configuration
    // Additional beans can be defined here if needed
}

