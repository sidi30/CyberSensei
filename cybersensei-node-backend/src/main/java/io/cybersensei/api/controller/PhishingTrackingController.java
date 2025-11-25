package io.cybersensei.api.controller;

import io.cybersensei.domain.entity.PhishingTracker;
import io.cybersensei.service.PhishingMailerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;

/**
 * Phishing Tracking Controller
 * 
 * Handles:
 * - Tracking pixel requests (email opens)
 * - Phishing link clicks
 * - Phishing reports
 */
@RestController
@RequestMapping("/api/phishing")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Phishing Tracking", description = "Phishing email tracking endpoints")
public class PhishingTrackingController {

    private final PhishingMailerService mailerService;

    /**
     * Tracking pixel endpoint
     * Returns a 1x1 transparent PNG and tracks email opens
     * 
     * GET /api/phishing/pixel/{token}
     */
    @GetMapping("/pixel/{token}")
    @Operation(summary = "Track email open via tracking pixel", 
               description = "Returns 1x1 transparent PNG and records email open event")
    public ResponseEntity<byte[]> trackPixel(@PathVariable String token) {
        try {
            // Track the email open
            mailerService.trackEmailOpen(token);
        } catch (Exception e) {
            log.error("Error tracking pixel for token {}: {}", token, e.getMessage());
            // Don't fail - still return the pixel
        }

        // Return 1x1 transparent PNG
        byte[] pixel = generateTransparentPixel();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG);
        headers.setCacheControl("no-cache, no-store, must-revalidate");
        headers.setPragma("no-cache");
        headers.setExpires(0);

        return new ResponseEntity<>(pixel, headers, HttpStatus.OK);
    }

    /**
     * Phishing link click endpoint
     * Tracks the click and displays educational page
     * 
     * GET /api/phishing/click/{token}
     */
    @GetMapping("/click/{token}")
    @Operation(summary = "Track phishing link click", 
               description = "Records click event and displays educational warning page")
    public ResponseEntity<String> trackClick(@PathVariable String token) {
        PhishingTracker tracker = null;
        
        try {
            // Track the click
            tracker = mailerService.trackLinkClick(token);
        } catch (Exception e) {
            log.error("Error tracking click for token {}: {}", token, e.getMessage());
        }

        // Generate educational HTML page
        String html = generateEducationalPage(tracker);

        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(html);
    }

    /**
     * Phishing report endpoint
     * Allows users to report suspicious emails
     * 
     * POST /api/phishing/report/{token}
     */
    @PostMapping("/report/{token}")
    @Operation(summary = "Report phishing email", 
               description = "Records that user reported the email as suspicious (positive outcome)")
    public ResponseEntity<ReportResponse> reportPhishing(@PathVariable String token) {
        try {
            mailerService.trackPhishingReport(token);
            
            return ResponseEntity.ok(new ReportResponse(
                true, 
                "Merci d'avoir signalé cet email suspect ! Votre vigilance aide à protéger l'entreprise.",
                100
            ));
        } catch (Exception e) {
            log.error("Error reporting phishing for token {}: {}", token, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ReportResponse(false, "Erreur lors du signalement", 0));
        }
    }

    /**
     * Generate 1x1 transparent PNG pixel
     */
    private byte[] generateTransparentPixel() {
        // Base64 encoded 1x1 transparent PNG
        String base64Pixel = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
        return Base64.getDecoder().decode(base64Pixel);
    }

    /**
     * Generate educational HTML page shown after clicking phishing link
     */
    private String generateEducationalPage(PhishingTracker tracker) {
        // Educational page is generic, tracker is used for logging only
        return """
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CyberSensei - Formation Sécurité</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            max-width: 600px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
            animation: slideUp 0.5s ease-out;
        }
        
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .warning-header {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .warning-icon {
            font-size: 64px;
            margin-bottom: 15px;
            animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        
        .warning-header h1 {
            font-size: 28px;
            margin-bottom: 10px;
            font-weight: 700;
        }
        
        .warning-header p {
            font-size: 16px;
            opacity: 0.95;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .info-box {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 20px;
            margin-bottom: 30px;
            border-radius: 8px;
        }
        
        .info-box h2 {
            color: #1976d2;
            font-size: 20px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .tips {
            list-style: none;
        }
        
        .tips li {
            padding: 12px 0;
            border-bottom: 1px solid #e0e0e0;
            display: flex;
            align-items: start;
            gap: 12px;
        }
        
        .tips li:last-child {
            border-bottom: none;
        }
        
        .tips li::before {
            content: "✓";
            color: #4caf50;
            font-weight: bold;
            font-size: 20px;
            flex-shrink: 0;
        }
        
        .cta-button {
            display: block;
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s;
            margin-top: 20px;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        .footer {
            background: #f5f5f5;
            padding: 20px 30px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        
        .score-badge {
            background: #ff5722;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            display: inline-block;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="warning-header">
            <div class="warning-icon">⚠️</div>
            <h1>Attention ! Vous avez cliqué sur un lien de phishing</h1>
            <p>Ceci était un test de formation CyberSensei</p>
            <div class="score-badge">Score : 0/100</div>
        </div>
        
        <div class="content">
            <div class="info-box">
                <h2>🛡️ Comment se protéger du phishing ?</h2>
                <ul class="tips">
                    <li>
                        <div>
                            <strong>Vérifiez l'expéditeur</strong><br>
                            Examinez attentivement l'adresse email de l'expéditeur, pas seulement le nom affiché
                        </div>
                    </li>
                    <li>
                        <div>
                            <strong>Survolez les liens avant de cliquer</strong><br>
                            Placez votre souris sur le lien pour voir la vraie destination dans la barre de statut
                        </div>
                    </li>
                    <li>
                        <div>
                            <strong>Méfiez-vous de l'urgence</strong><br>
                            Les attaquants créent un sentiment d'urgence pour vous pousser à agir sans réfléchir
                        </div>
                    </li>
                    <li>
                        <div>
                            <strong>Ne communiquez jamais vos identifiants</strong><br>
                            Aucun service légitime ne vous demandera vos mots de passe par email
                        </div>
                    </li>
                    <li>
                        <div>
                            <strong>En cas de doute, contactez le service IT</strong><br>
                            Il vaut mieux poser une question que de compromettre la sécurité
                        </div>
                    </li>
                    <li>
                        <div>
                            <strong>Utilisez l'authentification à deux facteurs (2FA)</strong><br>
                            Même si vos identifiants sont compromis, le 2FA ajoute une couche de protection
                        </div>
                    </li>
                </ul>
            </div>
            
            <a href="/app/training" class="cta-button">
                📚 Accéder à ma formation
            </a>
        </div>
        
        <div class="footer">
            <p><strong>CyberSensei</strong> - Plateforme de formation en cybersécurité</p>
            <p style="margin-top: 8px; font-size: 12px;">
                Cet email faisait partie d'un exercice de sensibilisation.<br>
                Vos données restent confidentielles et ne sont utilisées qu'à des fins de formation.
            </p>
        </div>
    </div>
</body>
</html>
                """;
    }

    /**
     * Response DTO for report endpoint
     */
    public record ReportResponse(boolean success, String message, int score) {}
}

