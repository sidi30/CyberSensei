package io.cybersensei.phishing.repository;

import io.cybersensei.phishing.entity.PhishingTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PhishingTemplateRepository extends JpaRepository<PhishingTemplate, UUID> {

    List<PhishingTemplate> findByIsActiveTrue();

    List<PhishingTemplate> findByTheme(String theme);

    List<PhishingTemplate> findByDifficulty(Integer difficulty);

    List<PhishingTemplate> findByThemeAndDifficulty(String theme, Integer difficulty);

    @Query("SELECT t FROM PhishingTemplate t WHERE t.isActive = true AND t.theme = :theme ORDER BY t.difficulty ASC")
    List<PhishingTemplate> findActiveByThemeOrderByDifficulty(@Param("theme") String theme);

    @Query("SELECT DISTINCT t.theme FROM PhishingTemplate t WHERE t.isActive = true")
    List<String> findDistinctThemes();

    @Query("SELECT t FROM PhishingTemplate t WHERE t.isActive = true AND t.difficulty <= :maxDifficulty")
    List<PhishingTemplate> findActiveByMaxDifficulty(@Param("maxDifficulty") Integer maxDifficulty);

    long countByIsActiveTrue();
}

