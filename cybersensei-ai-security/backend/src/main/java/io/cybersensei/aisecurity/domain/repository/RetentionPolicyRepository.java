package io.cybersensei.aisecurity.domain.repository;

import io.cybersensei.aisecurity.domain.entity.RetentionPolicy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RetentionPolicyRepository extends JpaRepository<RetentionPolicy, Long> {

    Optional<RetentionPolicy> findByCompanyIdAndIsActiveTrue(Long companyId);

    Optional<RetentionPolicy> findByCompanyIdAndPolicyName(Long companyId, String policyName);
}
