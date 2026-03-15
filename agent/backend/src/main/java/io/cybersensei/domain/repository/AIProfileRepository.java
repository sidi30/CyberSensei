package io.cybersensei.domain.repository;

import io.cybersensei.domain.entity.AIProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AIProfileRepository extends JpaRepository<AIProfile, Long> {
    Optional<AIProfile> findByUserId(Long userId);
}


