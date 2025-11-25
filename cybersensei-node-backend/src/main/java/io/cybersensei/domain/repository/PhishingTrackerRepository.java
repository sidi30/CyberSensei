package io.cybersensei.domain.repository;

import io.cybersensei.domain.entity.PhishingTracker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PhishingTrackerRepository extends JpaRepository<PhishingTracker, Long> {
    Optional<PhishingTracker> findByToken(String token);
    
    @Query("SELECT COUNT(t) FROM PhishingTracker t WHERE t.campaignId = :campaignId AND t.clicked = true")
    Integer countClickedByCampaignId(@Param("campaignId") Long campaignId);
    
    @Query("SELECT COUNT(t) FROM PhishingTracker t WHERE t.campaignId = :campaignId AND t.opened = true")
    Integer countOpenedByCampaignId(@Param("campaignId") Long campaignId);
    
    @Query("SELECT COUNT(t) FROM PhishingTracker t WHERE t.campaignId = :campaignId AND t.reported = true")
    Integer countReportedByCampaignId(@Param("campaignId") Long campaignId);
}


