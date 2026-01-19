package com.cybersensei.backend.repository;

import com.cybersensei.backend.entity.UserLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserLevelRepository extends JpaRepository<UserLevel, Long> {
    
    Optional<UserLevel> findByUserId(Long userId);
    
    boolean existsByUserId(Long userId);
}

