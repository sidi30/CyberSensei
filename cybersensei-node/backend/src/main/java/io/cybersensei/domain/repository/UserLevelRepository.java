package io.cybersensei.domain.repository;

import io.cybersensei.domain.entity.UserLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserLevelRepository extends JpaRepository<UserLevel, Long> {
    
    Optional<UserLevel> findByUserId(Long userId);
    
    boolean existsByUserId(Long userId);
}

