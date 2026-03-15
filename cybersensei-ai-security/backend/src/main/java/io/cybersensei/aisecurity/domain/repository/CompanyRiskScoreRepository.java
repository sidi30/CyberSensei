package io.cybersensei.aisecurity.domain.repository;

import io.cybersensei.aisecurity.domain.entity.CompanyRiskScore;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRiskScoreRepository extends JpaRepository<CompanyRiskScore, Long> {

    Optional<CompanyRiskScore> findByCompanyIdAndComputedDate(Long companyId, LocalDate date);

    List<CompanyRiskScore> findByCompanyIdAndComputedDateBetweenOrderByComputedDateAsc(
            Long companyId, LocalDate start, LocalDate end);

    List<CompanyRiskScore> findByCompanyIdOrderByComputedDateDesc(Long companyId, Pageable pageable);
}
