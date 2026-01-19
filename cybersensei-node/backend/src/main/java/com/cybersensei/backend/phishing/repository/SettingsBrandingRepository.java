package com.cybersensei.backend.phishing.repository;

import com.cybersensei.backend.phishing.entity.SettingsBranding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SettingsBrandingRepository extends JpaRepository<SettingsBranding, UUID> {

    Optional<SettingsBranding> findFirstByOrderByCreatedAtDesc();
}

