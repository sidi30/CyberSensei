package com.cybersensei.backend.phishing.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Security configuration for phishing tracking endpoints.
 * Tracking endpoints are public but rate-limited and token-protected.
 */
@Configuration
@EnableMethodSecurity
public class PhishingSecurityConfig {

    /**
     * Security filter chain for tracking endpoints.
     * These need to be accessible without authentication.
     */
    @Bean
    @Order(1)
    public SecurityFilterChain trackingSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher("/t/**")
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()
                )
                .csrf(AbstractHttpConfigurer::disable);

        return http.build();
    }
}

