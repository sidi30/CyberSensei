package io.cybersensei.domain.repository;

import io.cybersensei.domain.entity.PhishingTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhishingTemplateRepository extends JpaRepository<PhishingTemplate, Long> {
    List<PhishingTemplate> findByActiveTrue();
    
    @Query("SELECT t FROM PhishingTemplate t WHERE t.active = true ORDER BY RANDOM() LIMIT 1")
    PhishingTemplate findRandomActiveTemplate();
}


