package io.cybersensei.domain.repository;

import io.cybersensei.domain.entity.ScanResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ScanResultRepository extends JpaRepository<ScanResult, Long> {

    /**
     * Récupère le dernier scan pour un domaine donné, trié par date décroissante.
     */
    Optional<ScanResult> findFirstByDomainOrderByScannedAtDesc(String domain);

    /**
     * Récupère l'avant-dernier scan pour la comparaison.
     * On prend le 2e résultat en triant par date décroissante.
     */
    Optional<ScanResult> findFirstByDomainAndIdNotOrderByScannedAtDesc(String domain, Long excludeId);
}
