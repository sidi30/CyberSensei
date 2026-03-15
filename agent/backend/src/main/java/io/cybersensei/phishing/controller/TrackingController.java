package io.cybersensei.phishing.controller;

import io.cybersensei.phishing.service.TrackingService;
import io.cybersensei.phishing.service.TrackingService.TrackingResult;
import io.cybersensei.util.HttpUtils;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;

/**
 * Public tracking controller for phishing email interactions.
 * These endpoints are accessed by recipients clicking links in phishing emails.
 * Rate-limited and token-protected.
 */
@RestController
@RequestMapping("/t")
public class TrackingController {

    private final TrackingService trackingService;

    // 1x1 transparent GIF pixel
    private static final byte[] TRACKING_PIXEL = Base64.getDecoder().decode(
            "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");

    public TrackingController(TrackingService trackingService) {
        this.trackingService = trackingService;
    }

    /**
     * Track link click.
     * GET /t/{token}/l/{linkId}
     */
    @GetMapping("/{token}/l/{linkId}")
    public ResponseEntity<String> trackClick(
            @PathVariable String token,
            @PathVariable String linkId,
            HttpServletRequest request) {
        
        String ipAddress = HttpUtils.getClientIpAddress(request);
        String userAgent = request.getHeader("User-Agent");

        TrackingResult result = trackingService.trackClick(token, linkId, ipAddress, userAgent);

        if (!result.success()) {
            return ResponseEntity.badRequest().body(getErrorPage(result.errorMessage()));
        }

        String landingPage = result.landingPageHtml();
        if (landingPage == null || landingPage.isEmpty()) {
            landingPage = getDefaultLandingPage();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(landingPage);
    }

    /**
     * Track email open (tracking pixel).
     * GET /t/{token}/p
     */
    @GetMapping(value = "/{token}/p", produces = "image/gif")
    public ResponseEntity<byte[]> trackOpen(
            @PathVariable String token,
            HttpServletRequest request) {
        
        String ipAddress = HttpUtils.getClientIpAddress(request);
        String userAgent = request.getHeader("User-Agent");

        trackingService.trackOpen(token, ipAddress, userAgent);

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_GIF)
                .header("Cache-Control", "no-cache, no-store, must-revalidate")
                .header("Pragma", "no-cache")
                .header("Expires", "0")
                .body(TRACKING_PIXEL);
    }

    /**
     * Track form submission (NEVER stores actual credentials).
     * POST /t/{token}/form
     */
    @PostMapping("/{token}/form")
    public ResponseEntity<String> trackFormSubmit(
            @PathVariable String token,
            HttpServletRequest request) {
        
        String ipAddress = HttpUtils.getClientIpAddress(request);
        String userAgent = request.getHeader("User-Agent");

        TrackingResult result = trackingService.trackFormSubmit(token, ipAddress, userAgent);

        if (!result.success()) {
            return ResponseEntity.badRequest().body(getErrorPage(result.errorMessage()));
        }

        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(result.landingPageHtml());
    }

    /**
     * Track phishing report.
     * POST /t/{token}/report
     */
    @PostMapping("/{token}/report")
    public ResponseEntity<String> trackReport(
            @PathVariable String token,
            HttpServletRequest request) {
        
        String ipAddress = HttpUtils.getClientIpAddress(request);
        String userAgent = request.getHeader("User-Agent");

        TrackingResult result = trackingService.trackReport(token, ipAddress, userAgent);

        if (!result.success()) {
            return ResponseEntity.badRequest().body(getErrorPage(result.errorMessage()));
        }

        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(result.landingPageHtml());
    }

    private String getDefaultLandingPage() {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Security Awareness</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 700px; margin: 50px auto; padding: 20px; }
                    .alert { background: #fff3cd; border: 1px solid #ffc107; padding: 20px; border-radius: 8px; }
                </style>
            </head>
            <body>
                <div class="alert">
                    <h1>⚠️ Security Awareness Exercise</h1>
                    <p>This was a simulated phishing email as part of our security training program.</p>
                    <p>Stay vigilant and always verify suspicious emails!</p>
                </div>
            </body>
            </html>
            """;
    }

    private String getErrorPage(String message) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Error</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 500px; margin: 100px auto; text-align: center; }
                </style>
            </head>
            <body>
                <h1>Page Not Available</h1>
                <p>This page is no longer available or the link has expired.</p>
            </body>
            </html>
            """;
    }
}

