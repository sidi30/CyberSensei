package io.cybersensei.config;

import io.cybersensei.domain.repository.ConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

/**
 * Mail Configuration
 * SMTP settings are loaded from database (configs table)
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class MailConfig {

    private final ConfigRepository configRepository;

    @Value("${spring.mail.host:smtp.gmail.com}")
    private String defaultHost;

    @Value("${spring.mail.port:587}")
    private int defaultPort;

    @Value("${spring.mail.username:}")
    private String defaultUsername;

    @Value("${spring.mail.password:}")
    private String defaultPassword;

    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();

        // Try to load from database, fallback to application.yml
        try {
            String host = getConfigValue("smtp.host", defaultHost);
            int port = Integer.parseInt(getConfigValue("smtp.port", String.valueOf(defaultPort)));
            String username = getConfigValue("smtp.username", defaultUsername);
            String password = getConfigValue("smtp.password", defaultPassword);

            mailSender.setHost(host);
            mailSender.setPort(port);
            mailSender.setUsername(username);
            mailSender.setPassword(password);

            log.info("SMTP configured: {}:{} (user: {})", host, port, username);
        } catch (Exception e) {
            log.warn("Failed to load SMTP config from database, using defaults: {}", e.getMessage());
            mailSender.setHost(defaultHost);
            mailSender.setPort(defaultPort);
            mailSender.setUsername(defaultUsername);
            mailSender.setPassword(defaultPassword);
        }

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.smtp.connectiontimeout", "5000");
        props.put("mail.smtp.timeout", "5000");
        props.put("mail.smtp.writetimeout", "5000");
        props.put("mail.debug", "false");

        return mailSender;
    }

    private String getConfigValue(String key, String defaultValue) {
        return configRepository.findByKey(key)
                .map(config -> config.getValue())
                .orElse(defaultValue);
    }
}


