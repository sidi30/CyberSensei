package io.cybersensei.api.controller;

import io.cybersensei.api.dto.PhishingCampaignDto;
import io.cybersensei.service.PhishingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Phishing Campaign Controller
 */
@RestController
@RequestMapping("/api/phishing")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Phishing Service", description = "Phishing campaign and tracking endpoints")
public class PhishingController {

    private final PhishingService phishingService;

    @PostMapping("/send")
    @Operation(summary = "Manually trigger phishing campaign")
    @SecurityRequirement(name = "bearer-jwt")
    public ResponseEntity<Void> sendCampaign() {
        phishingService.sendDailyPhishingCampaign();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/results")
    @Operation(summary = "Get recent phishing campaign results")
    @SecurityRequirement(name = "bearer-jwt")
    public ResponseEntity<List<PhishingCampaignDto>> getResults(@RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(phishingService.getRecentCampaigns(days));
    }

    @GetMapping("/track/pixel/{token}")
    @Operation(summary = "Track email open (tracking pixel)")
    public ResponseEntity<byte[]> trackPixel(@PathVariable String token) {
        try {
            phishingService.trackPixelOpen(token);
        } catch (Exception e) {
            log.error("Error tracking pixel: {}", e.getMessage());
        }

        // Return 1x1 transparent pixel
        byte[] pixel = new byte[]{
                (byte) 0x47, (byte) 0x49, (byte) 0x46, (byte) 0x38, (byte) 0x39, (byte) 0x61,
                (byte) 0x01, (byte) 0x00, (byte) 0x01, (byte) 0x00, (byte) 0x80, (byte) 0x00,
                (byte) 0x00, (byte) 0xFF, (byte) 0xFF, (byte) 0xFF, (byte) 0x00, (byte) 0x00,
                (byte) 0x00, (byte) 0x21, (byte) 0xF9, (byte) 0x04, (byte) 0x01, (byte) 0x00,
                (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x2C, (byte) 0x00, (byte) 0x00,
                (byte) 0x00, (byte) 0x00, (byte) 0x01, (byte) 0x00, (byte) 0x01, (byte) 0x00,
                (byte) 0x00, (byte) 0x02, (byte) 0x02, (byte) 0x44, (byte) 0x01, (byte) 0x00,
                (byte) 0x3B
        };

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_GIF);
        return new ResponseEntity<>(pixel, headers, HttpStatus.OK);
    }

    @GetMapping("/track/click/{token}")
    @Operation(summary = "Track phishing link click")
    public ResponseEntity<String> trackClick(@PathVariable String token) {
        try {
            phishingService.trackLinkClick(token);
        } catch (Exception e) {
            log.error("Error tracking click: {}", e.getMessage());
        }

        // Redirect to educational page
        String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <title>CyberSensei - Formation Sécurité</title>
                    <style>
                        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
                        .warning { background: #ff9800; color: white; padding: 20px; border-radius: 5px; }
                        .info { background: #2196F3; color: white; padding: 20px; border-radius: 5px; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="warning">
                        <h1>⚠️ Attention !</h1>
                        <p>Vous venez de cliquer sur un lien de phishing dans le cadre de votre formation CyberSensei.</p>
                    </div>
                    <div class="info">
                        <h2>🛡️ Comment se protéger ?</h2>
                        <ul>
                            <li>Vérifiez toujours l'expéditeur d'un email</li>
                            <li>Ne cliquez pas sur des liens suspects</li>
                            <li>Survolez les liens pour voir leur vraie destination</li>
                            <li>En cas de doute, contactez votre service IT</li>
                        </ul>
                    </div>
                </body>
                </html>
                """;

        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(html);
    }

    @PostMapping("/report/{token}")
    @Operation(summary = "Report phishing email")
    @SecurityRequirement(name = "bearer-jwt")
    public ResponseEntity<Void> reportPhishing(@PathVariable String token) {
        phishingService.reportPhishing(token);
        return ResponseEntity.ok().build();
    }
}


