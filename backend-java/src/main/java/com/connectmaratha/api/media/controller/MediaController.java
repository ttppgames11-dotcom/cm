package com.connectmaratha.api.media.controller;

import com.connectmaratha.api.common.exception.ApiException;
import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.RequireAuth;
import com.connectmaratha.api.common.web.JsonBody;
import com.connectmaratha.api.media.entity.Media;
import com.connectmaratha.api.media.service.MediaService;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.Locale;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** /media/* and /api/media/* — the same endpoints as backend/routes/media.routes.js (mounted on both paths). */
@RestController
@RequestMapping({"/media", "/api/media"})
public class MediaController {

    private final MediaService media;
    private final JsonBody bodies;

    public MediaController(MediaService media, JsonBody bodies) {
        this.media = media;
        this.bodies = bodies;
    }

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> show(@PathVariable String id) {
        Media item = media.find(id);
        byte[] bytes = item.getBytes();
        return ResponseEntity.ok()
            .header("Content-Type", item.getMime() == null ? "image/jpeg" : item.getMime())
            .header("X-Content-Type-Options", "nosniff")
            .header("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; sandbox")
            .header("Content-Disposition", "inline")
            .header("Cache-Control", "public, max-age=31536000, immutable")
            .header("Cross-Origin-Resource-Policy", "cross-origin")
            .header("Content-Length", String.valueOf(bytes.length))
            .body(bytes);
    }

    /** The image is the raw request body (any Content-Type), at most 5 MB; login is optional except for "profile". */
    @PostMapping("/{kind}")
    public ResponseEntity<Map<String, Object>> upload(@PathVariable String kind, CurrentUser user, HttpServletRequest req) {
        byte[] bytes = readRawBody(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(media.upload(user, kind, bytes));
    }

    @DeleteMapping("/profile")
    @RequireAuth
    public Map<String, Object> deleteProfilePhoto(CurrentUser user) {
        return media.deleteProfilePhoto(user);
    }

    /**
     * Like the Node server: a JSON body goes through the JSON reader (bad JSON is a 400) and
     * then counts as "no image"; any other body is read as raw bytes, and more than 5 MB is a 413.
     */
    private byte[] readRawBody(HttpServletRequest req) {
        String type = req.getContentType();
        if (type != null && type.toLowerCase(Locale.ROOT).contains("json")) {
            bodies.read(req);
            return null;
        }
        try {
            byte[] bytes = req.getInputStream().readNBytes(MediaService.MAX_FILE_SIZE + 1);
            if (bytes.length > MediaService.MAX_FILE_SIZE) {
                throw new ApiException(HttpStatus.PAYLOAD_TOO_LARGE, "PAYLOAD_TOO_LARGE",
                    "पाठवलेला डेटा खूप मोठा आहे (Payload exceeds size limit).");
            }
            return bytes;
        } catch (IOException e) {
            throw ApiException.plain(HttpStatus.BAD_REQUEST, "कोणताही फोटो डेटा मिळाला नाही (No image data provided)");
        }
    }
}
