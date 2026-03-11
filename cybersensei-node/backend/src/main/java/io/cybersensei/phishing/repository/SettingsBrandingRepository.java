package io.cybersensei.phishing.repository;

import io.cybersensei.phishing.entity.SettingsBranding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SettingsBrandingRepository extends JpaRepository<SettingsBranding, UUID> {

    Optional<SettingsBranding> findFirstByOrderByCreatedAtDesc();
}

