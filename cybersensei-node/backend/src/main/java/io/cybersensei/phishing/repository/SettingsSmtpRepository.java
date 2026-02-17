package io.cybersensei.phishing.repository;

import io.cybersensei.phishing.entity.SettingsSmtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SettingsSmtpRepository extends JpaRepository<SettingsSmtp, UUID> {

    Optional<SettingsSmtp> findByName(String name);

    Optional<SettingsSmtp> findByIsActiveTrue();

    Optional<SettingsSmtp> findFirstByIsActiveTrueOrderByCreatedAtDesc();

    boolean existsByName(String name);
}

