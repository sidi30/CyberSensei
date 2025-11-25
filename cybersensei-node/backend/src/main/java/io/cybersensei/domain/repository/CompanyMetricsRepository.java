package io.cybersensei.domain.repository;

import io.cybersensei.domain.entity.CompanyMetrics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyMetricsRepository extends JpaRepository<CompanyMetrics, Long> {
    @Query("SELECT m FROM CompanyMetrics m ORDER BY m.updatedAt DESC LIMIT 1")
    Optional<CompanyMetrics> findLatest();
}


