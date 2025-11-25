package io.cybersensei.service;

import io.cybersensei.domain.entity.Config;
import io.cybersensei.domain.repository.ConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Configuration Service - manages dynamic application settings
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ConfigService {

    private final ConfigRepository configRepository;

    @Transactional(readOnly = true)
    public Optional<String> getConfig(String key) {
        return configRepository.findByKey(key)
                .map(Config::getValue);
    }

    @Transactional(readOnly = true)
    public String getConfigOrDefault(String key, String defaultValue) {
        return getConfig(key).orElse(defaultValue);
    }

    @Transactional
    public void setConfig(String key, String value) {
        Config config = configRepository.findByKey(key)
                .orElse(Config.builder()
                        .key(key)
                        .build());

        config.setValue(value);
        configRepository.save(config);
        log.info("Configuration updated: {} = {}", key, value);
    }

    @Transactional
    public void setConfig(String key, String value, String description) {
        Config config = configRepository.findByKey(key)
                .orElse(Config.builder()
                        .key(key)
                        .build());

        config.setValue(value);
        config.setDescription(description);
        configRepository.save(config);
        log.info("Configuration updated: {} = {} ({})", key, value, description);
    }

    @Transactional(readOnly = true)
    public List<Config> getAllConfigs() {
        return configRepository.findAll();
    }

    @Transactional
    public void deleteConfig(String key) {
        configRepository.findByKey(key).ifPresent(config -> {
            configRepository.delete(config);
            log.info("Configuration deleted: {}", key);
        });
    }
}


