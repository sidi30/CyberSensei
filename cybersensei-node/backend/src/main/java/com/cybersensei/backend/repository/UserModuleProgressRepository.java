package com.cybersensei.backend.repository;

import com.cybersensei.backend.entity.UserModuleProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserModuleProgressRepository extends JpaRepository<UserModuleProgress, Long> {
    
    List<UserModuleProgress> findByUserIdOrderByModule_OrderIndexAsc(Long userId);
    
    List<UserModuleProgress> findByUserIdAndStatus(Long userId, String status);
    
    Optional<UserModuleProgress> findByUserIdAndModuleId(Long userId, Long moduleId);
    
    @Query("SELECT ump FROM UserModuleProgress ump " +
           "JOIN FETCH ump.module m " +
           "WHERE ump.user.id = :userId " +
           "ORDER BY m.orderIndex ASC")
    List<UserModuleProgress> findByUserIdWithModule(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(ump) FROM UserModuleProgress ump " +
           "WHERE ump.user.id = :userId AND ump.status = 'COMPLETED'")
    Long countCompletedModulesByUserId(@Param("userId") Long userId);
}

