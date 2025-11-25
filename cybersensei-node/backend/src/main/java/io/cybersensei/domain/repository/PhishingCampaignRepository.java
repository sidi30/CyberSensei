package io.cybersensei.domain.repository;

import io.cybersensei.domain.entity.PhishingCampaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PhishingCampaignRepository extends JpaRepository<PhishingCampaign, Long> {
    List<PhishingCampaign> findBySentAtAfterOrderBySentAtDesc(LocalDateTime since);
}


