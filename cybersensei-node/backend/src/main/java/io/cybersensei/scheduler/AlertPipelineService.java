package io.cybersensei.scheduler;

import io.cybersensei.scheduler.dto.ScanDiff;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Pipeline d'alertes : traite les différences entre scans et envoie
 * les notifications par email en fonction de la sévérité.
 */
@Service
public class AlertPipelineService {

    private static final Logger log = LoggerFactory.getLogger(AlertPipelineService.class);
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final JavaMailSender mailSender;

    @Value("${cybersensei.scanner.alert-email:}")
    private String alertRecipient;

    @Value("${spring.mail.username:noreply@cybersensei.io}")
    private String fromAddress;

    public AlertPipelineService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Traite un ScanDiff et déclenche les notifications appropriées.
     *
     * Règles :
     * - delta_score < -10 → alerte CRITIQUE
     * - nouvelles_alertes non vides → alerte IMPORTANTE
     * - risques_resolus non vides → notification POSITIVE
     */
    public void process(ScanDiff diff) {
        if (alertRecipient == null || alertRecipient.isBlank()) {
            log.warn("Pas de destinataire configuré (cybersensei.scanner.alert-email) — alertes ignorées");
            return;
        }

        try {
            if (diff.deltaScore() < -10) {
                sendCriticalAlert(diff);
            }

            if (!diff.nouvellesAlertes().isEmpty()) {
                sendNewRisksAlert(diff);
            }

            if (!diff.risquesResolus().isEmpty()) {
                sendResolvedNotification(diff);
            }

            if (diff.deltaScore() >= -10 && diff.nouvellesAlertes().isEmpty()
                    && diff.risquesResolus().isEmpty()) {
                log.info("Aucune alerte à envoyer pour {} — situation stable", diff.domain());
            }
        } catch (Exception e) {
            log.error("Erreur dans le pipeline d'alertes pour {} : {}", diff.domain(), e.getMessage());
        }
    }

    /**
     * Alerte CRITIQUE : dégradation du score > 10 points.
     */
    private void sendCriticalAlert(ScanDiff diff) {
        String subject = String.format(
                "🔴 CRITIQUE — Score de sécurité en chute pour %s (%d → %d)",
                diff.domain(), diff.previousScore(), diff.currentScore()
        );

        String html = buildHtmlEmail(
                "#e74c3c",
                "ALERTE CRITIQUE",
                diff.domain(),
                diff.previousScore(),
                diff.currentScore(),
                diff.deltaScore(),
                diff.nouvellesAlertes(),
                diff.risquesResolus(),
                "Le score de sécurité a chuté de plus de 10 points. "
                        + "Une investigation immédiate est recommandée."
        );

        sendEmail(subject, html);
        log.warn("Alerte CRITIQUE envoyée pour {} (delta: {})", diff.domain(), diff.deltaScore());
    }

    /**
     * Alerte IMPORTANTE : nouveaux risques détectés.
     */
    private void sendNewRisksAlert(ScanDiff diff) {
        String subject = String.format(
                "🟠 IMPORTANT — %d nouveau(x) risque(s) détecté(s) sur %s",
                diff.nouvellesAlertes().size(), diff.domain()
        );

        String html = buildHtmlEmail(
                "#f39c12",
                "NOUVEAUX RISQUES DÉTECTÉS",
                diff.domain(),
                diff.previousScore(),
                diff.currentScore(),
                diff.deltaScore(),
                diff.nouvellesAlertes(),
                List.of(),
                "De nouveaux risques ont été identifiés. Consultez le détail ci-dessous "
                        + "et planifiez les actions correctives."
        );

        sendEmail(subject, html);
        log.info("Alerte IMPORTANTE envoyée pour {} ({} nouveaux risques)",
                diff.domain(), diff.nouvellesAlertes().size());
    }

    /**
     * Notification POSITIVE : risques résolus.
     */
    private void sendResolvedNotification(ScanDiff diff) {
        String subject = String.format(
                "🟢 POSITIF — %d risque(s) résolu(s) sur %s",
                diff.risquesResolus().size(), diff.domain()
        );

        String html = buildHtmlEmail(
                "#27ae60",
                "RISQUES RÉSOLUS",
                diff.domain(),
                diff.previousScore(),
                diff.currentScore(),
                diff.deltaScore(),
                List.of(),
                diff.risquesResolus(),
                "Félicitations ! Des risques précédemment identifiés ont été corrigés."
        );

        sendEmail(subject, html);
        log.info("Notification POSITIVE envoyée pour {} ({} risques résolus)",
                diff.domain(), diff.risquesResolus().size());
    }

    /**
     * Envoie un email via JavaMailSender.
     */
    private void sendEmail(String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(alertRecipient);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            log.error("Échec envoi email '{}' : {}", subject, e.getMessage());
        }
    }

    /**
     * Construit le template HTML de l'email d'alerte.
     */
    private String buildHtmlEmail(
            String accentColor,
            String alertTitle,
            String domain,
            int previousScore,
            int currentScore,
            int deltaScore,
            List<String> newRisks,
            List<String> resolvedRisks,
            String message
    ) {
        String deltaDisplay = deltaScore >= 0 ? "+" + deltaScore : String.valueOf(deltaScore);
        String scoreColor = currentScore >= 75 ? "#27ae60" : currentScore >= 50 ? "#f39c12" : "#e74c3c";
        String now = LocalDateTime.now().format(DATE_FMT);

        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html><html><head><meta charset='UTF-8'></head>");
        sb.append("<body style='font-family:Arial,sans-serif;margin:0;padding:0;background:#f5f5f5'>");

        // Header
        sb.append("<div style='background:#1a1a2e;padding:20px;text-align:center'>");
        sb.append("<h1 style='color:#16c79a;margin:0;font-size:24px'>CYBER SENSEI</h1>");
        sb.append("<p style='color:#aaa;margin:4px 0 0'>Security Intelligence Platform</p>");
        sb.append("</div>");

        // Alert banner
        sb.append("<div style='background:").append(accentColor)
                .append(";padding:15px;text-align:center'>");
        sb.append("<h2 style='color:white;margin:0'>").append(alertTitle).append("</h2>");
        sb.append("</div>");

        // Content
        sb.append("<div style='max-width:600px;margin:0 auto;padding:30px;background:white'>");

        // Score section
        sb.append("<div style='text-align:center;margin-bottom:30px'>");
        sb.append("<p style='color:#666;margin:0'>Domaine : <strong>").append(domain).append("</strong></p>");
        sb.append("<p style='color:#666;margin:5px 0'>").append(now).append("</p>");
        sb.append("<div style='margin:20px 0'>");
        sb.append("<span style='font-size:48px;font-weight:bold;color:").append(scoreColor).append("'>")
                .append(currentScore).append("</span>");
        sb.append("<span style='font-size:20px;color:#999'>/100</span>");
        sb.append("</div>");
        sb.append("<p style='font-size:18px;color:").append(deltaScore >= 0 ? "#27ae60" : "#e74c3c")
                .append("'>").append(deltaDisplay).append(" points</p>");
        sb.append("</div>");

        // Message
        sb.append("<p style='color:#333;line-height:1.6'>").append(message).append("</p>");

        // New risks
        if (!newRisks.isEmpty()) {
            sb.append("<h3 style='color:#e74c3c;border-bottom:2px solid #e74c3c;padding-bottom:5px'>");
            sb.append("Nouveaux risques (").append(newRisks.size()).append(")</h3>");
            sb.append("<ul style='color:#333'>");
            for (String risk : newRisks) {
                sb.append("<li style='margin:5px 0'>").append(formatRisk(risk)).append("</li>");
            }
            sb.append("</ul>");
        }

        // Resolved risks
        if (!resolvedRisks.isEmpty()) {
            sb.append("<h3 style='color:#27ae60;border-bottom:2px solid #27ae60;padding-bottom:5px'>");
            sb.append("Risques résolus (").append(resolvedRisks.size()).append(")</h3>");
            sb.append("<ul style='color:#333'>");
            for (String risk : resolvedRisks) {
                sb.append("<li style='margin:5px 0'>").append(formatRisk(risk)).append("</li>");
            }
            sb.append("</ul>");
        }

        // Actions
        sb.append("<div style='background:#f8f9fa;border-left:4px solid ").append(accentColor)
                .append(";padding:15px;margin:20px 0'>");
        sb.append("<h4 style='margin:0 0 10px;color:#333'>Actions recommandées</h4>");
        sb.append("<ol style='color:#555;margin:0'>");
        sb.append("<li>Consultez le rapport détaillé sur le dashboard CyberSensei</li>");
        sb.append("<li>Priorisez la correction des risques critiques</li>");
        sb.append("<li>Planifiez un scan complet si nécessaire</li>");
        sb.append("</ol></div>");

        sb.append("</div>");

        // Footer
        sb.append("<div style='text-align:center;padding:20px;color:#999;font-size:12px'>");
        sb.append("<p>CyberSensei — Alerte automatique</p>");
        sb.append("<p>Ce message est généré automatiquement, merci de ne pas y répondre.</p>");
        sb.append("</div>");

        sb.append("</body></html>");
        return sb.toString();
    }

    /**
     * Formate un identifiant de risque en texte lisible.
     */
    private String formatRisk(String risk) {
        if (risk.startsWith("port:")) return "Port critique exposé : " + risk.substring(5);
        if (risk.startsWith("cve:")) return "Vulnérabilité " + risk.substring(4);
        if (risk.startsWith("tls:weak_protocol")) return "Protocole TLS faible détecté";
        if (risk.startsWith("tls:cert_expired")) return "Certificat SSL/TLS expiré";
        if (risk.startsWith("typosquat:")) return "Domaine typosquat actif : " + risk.substring(10);
        if (risk.startsWith("breach:")) return "Email compromis : " + risk.substring(7);
        if (risk.startsWith("abuseipdb:")) return "IP signalée sur AbuseIPDB";
        return risk;
    }
}
