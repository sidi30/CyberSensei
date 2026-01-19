package com.cybersensei.backend.repository;

import com.cybersensei.backend.entity.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {
    
    List<UserBadge> findByUserIdOrderByEarnedAtDesc(Long userId);
    
    Optional<UserBadge> findByUserIdAndBadgeId(Long userId, Long badgeId);
    
    @Query("SELECT ub FROM UserBadge ub " +
           "JOIN FETCH ub.badge b " +
           "WHERE ub.user.id = :userId " +
           "ORDER BY ub.earnedAt DESC")
    List<UserBadge> findByUserIdWithBadge(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(ub) FROM UserBadge ub WHERE ub.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);
    
    boolean existsByUserIdAndBadgeId(Long userId, Long badgeId);
}

