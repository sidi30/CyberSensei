package io.cybersensei.scheduler;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.cybersensei.domain.entity.ScanResult;
import io.cybersensei.domain.repository.ScanResultRepository;
import io.cybersensei.scheduler.dto.ScanRequest;
import io.cybersensei.scheduler.dto.ScanResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.*;

/**
 * Planificateur de scans de sécurité.
 * Déclenche des scans quotidiens et hebdomadaires via le microservice
 * cybersensei-scanner, puis persiste les résultats et déclenche
 * le pipeline d'alertes.
 */
@Service
public class ScanSchedulerService {

    private static final Logger log = LoggerFactory.getLogger(ScanSchedulerService.class);

    private final RestClient restClient;
    private final ScanResultRepository scanResultRepo;
    private final ScanComparatorService comparatorService;
    private final AlertPipelineService alertPipeline;
    private final ObjectMapper objectMapper;

    @Value("${cybersensei.scanner.domain:}")
    private String targetDomain;

    @Value("${cybersensei.scanner.emails:}")
    private String targetEmails;

    public ScanSchedulerService(
            @Value("${SCANNER_SERVICE_URL:http://localhost:8000}") String scannerUrl,
            ScanResultRepository scanResultRepo,
            ScanComparatorService comparatorService,
            AlertPipelineService alertPipeline,
            ObjectMapper objectMapper) {
        this.restClient = RestClient.builder()
                .baseUrl(scannerUrl)
                .build();
        this.scanResultRepo = scanResultRepo;
        this.comparatorService = comparatorService;
        this.alertPipeline = alertPipeline;
        this.objectMapper = objectMapper;
        log.info("ScanSchedulerService initialisé — scanner URL: {}", scannerUrl);
    }

    /**
     * Scan quotidien à 02h00.
     * Lance un scan standard sur le domaine configuré.
     */
    @Scheduled(cron = "${cybersensei.scanner.daily-cron:0 0 2 * * *}")
    public void dailyScan() {
        if (targetDomain == null || targetDomain.isBlank()) {
            log.warn("Scan quotidien ignoré : aucun domaine configuré (cybersensei.scanner.domain)");
            return;
        }
        log.info("=== Démarrage du scan quotidien pour {} ===", targetDomain);
        executeScan(targetDomain, parseEmails(targetEmails), "daily");
    }

    /**
     * Scan hebdomadaire le lundi à 03h00.
     * Lance un scan complet avec plus de modules.
     */
    @Scheduled(cron = "${cybersensei.scanner.weekly-cron:0 0 3 * * MON}")
    public void weeklyScan() {
        if (targetDomain == null || targetDomain.isBlank()) {
            log.warn("Scan hebdomadaire ignoré : aucun domaine configuré");
            return;
        }
        log.info("=== Démarrage du scan hebdomadaire complet pour {} ===", targetDomain);
        executeScan(targetDomain, parseEmails(targetEmails), "weekly");
    }

    /**
     * Exécute un scan via le microservice Python et traite le résultat.
     */
    private void executeScan(String domain, List<String> emails, String scanType) {
        try {
            ScanRequest request = new ScanRequest(domain, emails);

            log.info("Appel POST /scan vers le scanner pour {}", domain);
            ScanResponse response = restClient.post()
                    .uri("/scan")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(ScanResponse.class);

            if (response == null) {
                log.error("Le scanner a retourné une réponse vide pour {}", domain);
                return;
            }

            log.info("Scan {} terminé pour {} — score: {}/100", scanType, domain, response.score());

            // Persister le résultat
            ScanResult result = mapToEntity(response, scanType);
            scanResultRepo.save(result);
            log.info("Résultat du scan persité (id={})", result.getId());

            // Comparer avec le scan précédent et déclencher les alertes
            comparatorService.compareAndAlert(result);

        } catch (Exception e) {
            log.error("Échec du scan {} pour {} : {}", scanType, domain, e.getMessage());
            // Le scheduler ne doit jamais crasher — on log et on continue
        }
    }

    /**
     * Mappe la réponse du scanner vers l'entité JPA.
     */
    private ScanResult mapToEntity(ScanResponse response, String scanType) {
        ScanResult result = new ScanResult();
        result.setDomain(response.domain());
        result.setScore(response.score());
        result.setScanType(scanType);
        result.setScannedAt(Instant.now());

        try {
            result.setDetailsJson(objectMapper.writeValueAsString(response.details()));
        } catch (JsonProcessingException e) {
            log.warn("Impossible de sérialiser les détails du scan : {}", e.getMessage());
        }

        // Extraire les données structurées pour la comparaison
        Map<String, Object> details = response.details();
        if (details != null) {
            extractNmapData(details, result);
            extractNucleiData(details, result);
            extractTestsslData(details, result);
            extractDnstwistData(details, result);
            extractHibpData(details, result);
            extractAbuseipdbData(details, result);
        }

        return result;
    }

    @SuppressWarnings("unchecked")
    private void extractNmapData(Map<String, Object> details, ScanResult result) {
        try {
            Object nmap = details.get("nmap");
            if (nmap instanceof Map<?, ?> nmapMap && !Boolean.TRUE.equals(nmapMap.get("skipped"))) {
                Object criticalPorts = nmapMap.get("critical_ports");
                if (criticalPorts != null) {
                    result.setCriticalPortsJson(objectMapper.writeValueAsString(criticalPorts));
                }
            }
        } catch (Exception e) {
            log.debug("Extraction nmap échouée : {}", e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private void extractNucleiData(Map<String, Object> details, ScanResult result) {
        try {
            Object nuclei = details.get("nuclei");
            if (nuclei instanceof Map<?, ?> nucleiMap && !Boolean.TRUE.equals(nucleiMap.get("skipped"))) {
                Object vulns = nucleiMap.get("vulnerabilities");
                if (vulns instanceof List<?> vulnList) {
                    List<String> cveIds = new ArrayList<>();
                    for (Object v : vulnList) {
                        if (v instanceof Map<?, ?> vuln) {
                            Object ids = vuln.get("cve_ids");
                            if (ids instanceof List<?> idList) {
                                for (Object id : idList) {
                                    cveIds.add(id.toString());
                                }
                            }
                        }
                    }
                    result.setCveIdsJson(objectMapper.writeValueAsString(cveIds));
                }
            }
        } catch (Exception e) {
            log.debug("Extraction nuclei échouée : {}", e.getMessage());
        }
    }

    private void extractTestsslData(Map<String, Object> details, ScanResult result) {
        try {
            Object testssl = details.get("testssl");
            if (testssl instanceof Map<?, ?> tsMap && !Boolean.TRUE.equals(tsMap.get("skipped"))) {
                result.setWeakTls(Boolean.TRUE.equals(tsMap.get("has_weak_tls")));
                result.setCertExpired(Boolean.TRUE.equals(tsMap.get("cert_expired")));
            }
        } catch (Exception e) {
            log.debug("Extraction testssl échouée : {}", e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private void extractDnstwistData(Map<String, Object> details, ScanResult result) {
        try {
            Object dnstwist = details.get("dnstwist");
            if (dnstwist instanceof Map<?, ?> dtMap && !Boolean.TRUE.equals(dtMap.get("skipped"))) {
                Object typosquats = dtMap.get("active_typosquats");
                if (typosquats != null) {
                    result.setTyposquatsJson(objectMapper.writeValueAsString(typosquats));
                }
            }
        } catch (Exception e) {
            log.debug("Extraction dnstwist échouée : {}", e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private void extractHibpData(Map<String, Object> details, ScanResult result) {
        try {
            Object hibp = details.get("hibp");
            if (hibp instanceof Map<?, ?> hibpMap && !Boolean.TRUE.equals(hibpMap.get("skipped"))) {
                Object results = hibpMap.get("results");
                if (results instanceof List<?> resList) {
                    List<String> breachedEmails = new ArrayList<>();
                    for (Object r : resList) {
                        if (r instanceof Map<?, ?> rMap && Boolean.TRUE.equals(rMap.get("breached"))) {
                            breachedEmails.add(String.valueOf(rMap.get("email")));
                        }
                    }
                    result.setBreachedEmailsJson(objectMapper.writeValueAsString(breachedEmails));
                }
            }
        } catch (Exception e) {
            log.debug("Extraction hibp échouée : {}", e.getMessage());
        }
    }

    private void extractAbuseipdbData(Map<String, Object> details, ScanResult result) {
        try {
            Object abuse = details.get("abuseipdb");
            if (abuse instanceof Map<?, ?> abuseMap && !Boolean.TRUE.equals(abuseMap.get("skipped"))) {
                Object score = abuseMap.get("abuse_score");
                if (score instanceof Number num) {
                    result.setAbuseScore(num.intValue());
                }
            }
        } catch (Exception e) {
            log.debug("Extraction abuseipdb échouée : {}", e.getMessage());
        }
    }

    private List<String> parseEmails(String emailsCsv) {
        if (emailsCsv == null || emailsCsv.isBlank()) return List.of();
        return Arrays.stream(emailsCsv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}
