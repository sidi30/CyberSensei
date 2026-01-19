package com.cybersensei.backend.repository;

import com.cybersensei.backend.entity.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BadgeRepository extends JpaRepository<Badge, Long> {
    
    List<Badge> findByActiveOrderByOrderIndexAsc(Boolean active);
    
    List<Badge> findByBadgeTypeAndActiveOrderByOrderIndexAsc(String badgeType, Boolean active);
    
    List<Badge> findByRarityAndActiveOrderByOrderIndexAsc(String rarity, Boolean active);
    
    Optional<Badge> findByRequirementTypeAndRequirementValueAndActive(
        String requirementType, String requirementValue, Boolean active
    );
    
    Optional<Badge> findByName(String name);
}

