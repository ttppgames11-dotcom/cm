package com.connectmaratha.api.media.service;

import com.connectmaratha.api.common.exception.ApiException;
import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.media.entity.Media;
import com.connectmaratha.api.media.repository.MediaRepository;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Profile and post pictures (backend/routes/media.routes.js): the real image type is
 * read from the file's first bytes, never from its name or Content-Type, and files
 * carrying scripts or HTML are refused.
 */
@Service
public class MediaService {

    private static final Logger log = LoggerFactory.getLogger(MediaService.class);

    public static final int MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB, as the app's maxImageBytes
    static final int MIN_FILE_SIZE = 64;
    static final List<String> ALLOWED_KINDS = List.of("profile", "post", "banner");
    private static final Pattern MEDIA_ID = Pattern.compile("^[a-f0-9]{32}$");
    private static final SecureRandom RANDOM = new SecureRandom();

    /** Text that has no business inside a picture (polyglot files, embedded scripts or HTML). */
    private static final List<byte[]> FORBIDDEN = List.of(
        "<?php", "<? ", "<?\r", "<?\n", "<?=", "<script", "<SCRIPT", "<!DOCTYPE", "<!doctype", "<html", "<HTML",
        "<svg", "<SVG", "javascript:", "base64_decode", "shell_exec", "eval(")
        .stream().map(s -> s.getBytes(StandardCharsets.US_ASCII)).toList();

    private final MediaRepository media;

    public MediaService(MediaRepository media) {
        this.media = media;
    }

    /** "abc...def.jpg" -> the stored picture; 400 for a malformed id, 404 when unknown. */
    @Transactional(readOnly = true)
    public Media find(String rawId) {
        String id = String.valueOf(rawId == null ? "" : rawId).replaceFirst("\\.[^/.]+$", "").trim().toLowerCase(Locale.ROOT);
        if (!MEDIA_ID.matcher(id).matches()) {
            throw ApiException.plain(HttpStatus.BAD_REQUEST, "अवैध मीडिया आयडी (Invalid media ID format)");
        }
        Optional<Media> item = media.findById(id);
        if (item.isEmpty() || item.get().getBytes() == null || item.get().getBytes().length == 0) {
            throw ApiException.plain(HttpStatus.NOT_FOUND, "Media not found");
        }
        return item.get();
    }

    /** bytes is the raw request body, or null when nothing usable was sent (e.g. a JSON body). */
    @Transactional
    public Map<String, Object> upload(CurrentUser user, String kind, byte[] bytes) {
        if (!ALLOWED_KINDS.contains(kind)) {
            throw ApiException.plain(HttpStatus.BAD_REQUEST,
                "अवैध प्रकार (Invalid media kind. Allowed kinds: " + String.join(", ", ALLOWED_KINDS) + ")");
        }
        if (kind.equals("profile") && user == null) {
            throw ApiException.plain(HttpStatus.UNAUTHORIZED,
                "प्रोफाइल फोटो अपलोड करण्यासाठी लॉगिन आवश्यक आहे (Authentication required)");
        }
        if (bytes == null || bytes.length == 0) {
            throw ApiException.plain(HttpStatus.BAD_REQUEST, "कोणताही फोटो डेटा मिळाला नाही (No image data provided)");
        }
        if (bytes.length < MIN_FILE_SIZE) {
            throw ApiException.plain(HttpStatus.BAD_REQUEST, "फोटो फाइल अमान्य किंवा खूप लहान आहे (File too small or corrupted)");
        }
        if (bytes.length > MAX_FILE_SIZE) {
            throw ApiException.plain(HttpStatus.PAYLOAD_TOO_LARGE,
                "फोटो खूप मोठा आहे. कमाल मर्यादा ५ MB आहे. (File too large. Maximum size is 5MB)");
        }
        String mime = detectImageMime(bytes);
        if (mime == null) {
            throw ApiException.plain(HttpStatus.BAD_REQUEST,
                "अवैध फाइल स्वरूप. फक्त JPEG, PNG आणि WebP फाइल्स स्वीकारल्या जातील. (Invalid image format. Only JPEG, PNG, and WebP are allowed.)");
        }
        if (containsMaliciousPayload(bytes)) {
            log.warn("[SECURITY] Blocked potentially malicious upload attempt");
            throw ApiException.plain(HttpStatus.BAD_REQUEST,
                "अवैध सामग्री आढळली (Executable code, scripts, or embedded HTML are forbidden)");
        }

        byte[] random = new byte[16];
        RANDOM.nextBytes(random);
        String id = HexFormat.of().formatHex(random);
        String path = "/media/" + id;
        media.insertMedia(id, user == null ? "anonymous" : user.id(), kind, mime, bytes, bytes.length);
        if (kind.equals("profile")) media.setMemberPhoto(user.id(), path);

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("id", id);
        out.put("path", path);
        out.put("photo", path);
        out.put("image", path);
        return out;
    }

    @Transactional
    public Map<String, Object> deleteProfilePhoto(CurrentUser user) {
        if (user.id() != null) {
            media.deleteByOwnerAndKind(user.id(), "profile");
            media.setMemberPhoto(user.id(), null);
        }
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", "प्रोफाइल फोटो हटवला (Profile photo removed)");
        return out;
    }

    /** PNG (with IHDR), JPEG or WebP from the magic bytes, else null. */
    static String detectImageMime(byte[] b) {
        if (b == null || b.length < MIN_FILE_SIZE) return null;
        if (b.length >= 24 && u(b, 0) == 0x89 && u(b, 1) == 0x50 && u(b, 2) == 0x4E && u(b, 3) == 0x47
            && u(b, 4) == 0x0D && u(b, 5) == 0x0A && u(b, 6) == 0x1A && u(b, 7) == 0x0A
            && u(b, 12) == 0x49 && u(b, 13) == 0x48 && u(b, 14) == 0x44 && u(b, 15) == 0x52) {
            return "image/png";
        }
        if (b.length >= 64 && u(b, 0) == 0xFF && u(b, 1) == 0xD8 && u(b, 2) == 0xFF) return "image/jpeg";
        if (b.length >= 16 && u(b, 0) == 0x52 && u(b, 1) == 0x49 && u(b, 2) == 0x46 && u(b, 3) == 0x46
            && u(b, 8) == 0x57 && u(b, 9) == 0x45 && u(b, 10) == 0x42 && u(b, 11) == 0x50) {
            return "image/webp";
        }
        return null;
    }

    static boolean containsMaliciousPayload(byte[] b) {
        for (byte[] sig : FORBIDDEN) if (indexOf(b, sig) >= 0) return true;
        return false;
    }

    private static int u(byte[] b, int i) {
        return b[i] & 0xFF;
    }

    private static int indexOf(byte[] data, byte[] sig) {
        outer:
        for (int i = 0; i <= data.length - sig.length; i++) {
            for (int j = 0; j < sig.length; j++) if (data[i + j] != sig[j]) continue outer;
            return i;
        }
        return -1;
    }

}
