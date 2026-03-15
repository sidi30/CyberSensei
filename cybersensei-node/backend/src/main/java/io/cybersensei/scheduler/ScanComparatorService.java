package io.cybersensei.scheduler;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.cybersensei.domain.entity.ScanResult;
import io.cybersensei.domain.repository.ScanResultRepository;
import io.cybersensei.scheduler.dto.ScanDiff;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Compare les résultats de deux scans successifs pour détecter
 * les nouveaux risques, les risques résolus et les variations de score.
 */
@Service
public class ScanComparatorService {

    private static final Logger log = LoggerFactory.getLogger(ScanComparatorService.class);

    private final ScanResultRepository scanResultRepo;
    private final AlertPipelineService alertPipeline;
    private final ObjectMapper objectMapper;

    public ScanComparatorService(
            ScanResultRepository scanResultRepo,
            AlertPipelineService alertPipeline,
            ObjectMapper objectMapper) {
        this.scanResultRepo = scanResultRepo;
        this.alertPipeline = alertPipeline;
        this.objectMapper = objectMapper;
    }

    /**
     * Compare le scan courant avec le précédent et déclenche le pipeline d'alertes.
     */
    public void compareAndAlert(ScanResult current) {
        Optional<ScanResult> previousOpt = scanResultRepo
                .findFirstByDomainAndIdNotOrderByScannedAtDesc(current.getDomain(), current.getId());

        ScanDiff diff;
        if (previousOpt.isEmpty()) {
            log.info("Premier scan pour {} — pas de comparaison possible", current.getDomain());
            // Premier scan : on considère toutes les alertes comme nouvelles
            diff = new ScanDiff(
                    0,
                    100,
                    current.getScore(),
                    extractAllRisks(current),
                    List.of(),
                    current.getDomain()
            );
        } else {
            diff = compare(previousOpt.get(), current);
        }

        log.info("ScanDiff pour {} — delta: {}, nouvelles: {}, résolues: {}",
                current.getDomain(), diff.deltaScore(),
                diff.nouvellesAlertes().size(), diff.risquesResolus().size());

        // Déclencher le pipeline d'alertes
        alertPipeline.process(diff);
    }

    /**
     * Compare deux scans et retourne les différences.
     */
    public ScanDiff compare(ScanResult previous, ScanResult current) {
        int deltaScore = current.getScore() - previous.getScore();

        Set<String> previousRisks = new HashSet<>(extractAllRisks(previous));
        Set<String> currentRisks = new HashSet<>(extractAllRisks(current));

        // Nouveaux risques = présents maintenant, absents avant
        List<String> nouvellesAlertes = currentRisks.stream()
                .filter(r -> !previousRisks.contains(r))
                .sorted()
                .toList();

        // Risques résolus = présents avant, absents maintenant
        List<String> risquesResolus = previousRisks.stream()
                .filter(r -> !currentRisks.contains(r))
                .sorted()
                .toList();

        return new ScanDiff(
                deltaScore,
                previous.getScore(),
                current.getScore(),
                nouvellesAlertes,
                risquesResolus,
                current.getDomain()
        );
    }

    /**
     * Extrait tous les identifiants de risque d'un scan pour la comparaison.
     * Chaque risque a un identifiant unique : "type:détail".
     */
    private List<String> extractAllRisks(ScanResult scan) {
        List<String> risks = new ArrayList<>();

        // Ports critiques
        List<Map<String, Object>> criticalPorts = parseJsonList(scan.getCriticalPortsJson());
        for (Map<String, Object> port : criticalPorts) {
            risks.add("port:" + port.getOrDefault("port", "unknown"));
        }

        // CVE
        List<String> cveIds = parseJsonStringList(scan.getCveIdsJson());
        for (String cve : cveIds) {
            risks.add("cve:" + cve);
        }

        // TLS faible
        if (scan.isWeakTls()) {
            risks.add("tls:weak_protocol");
        }
        if (scan.isCertExpired()) {
            risks.add("tls:cert_expired");
        }

        // Typosquats
        List<Map<String, Object>> typosquats = parseJsonList(scan.getTyposquatsJson());
        for (Map<String, Object> ts : typosquats) {
            risks.add("typosquat:" + ts.getOrDefault("domain", "unknown"));
        }

        // Emails compromis
        List<String> breachedEmails = parseJsonStringList(scan.getBreachedEmailsJson());
        for (String email : breachedEmails) {
            risks.add("breach:" + email);
        }

        // IP blacklistée
        if (scan.getAbuseScore() > 50) {
            risks.add("abuseipdb:blacklisted");
        }

        return risks;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> parseJsonList(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            log.debug("Erreur parsing JSON list : {}", e.getMessage());
            return List.of();
        }
    }

    private List<String> parseJsonStringList(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            log.debug("Erreur parsing JSON string list : {}", e.getMessage());
            return List.of();
        }
    }
}
