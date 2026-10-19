package com.connectmaratha.api.web;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

/**
 * Reads a request body the way Express's json parser does, so malformed and
 * unusual requests get the same replies as before:
 * <ul>
 *   <li>a body that isn't JSON by Content-Type is treated as empty ({});</li>
 *   <li>more than 100 KB: 413 PAYLOAD_TOO_LARGE;</li>
 *   <li>broken JSON: 400 INVALID_JSON_BODY;</li>
 *   <li>a JSON array body is treated as empty (fields are simply missing).</li>
 * </ul>
 */
@Component
public class JsonBody {

    static final int LIMIT_BYTES = 100 * 1024;

    private final ObjectMapper json;

    public JsonBody(ObjectMapper json) {
        this.json = json;
    }

    public Map<String, Object> read(HttpServletRequest req) {
        String contentType = req.getContentType();
        if (contentType == null || !contentType.toLowerCase().contains("json")) return new LinkedHashMap<>();
        try {
            byte[] bytes = req.getInputStream().readNBytes(LIMIT_BYTES + 1);
            if (bytes.length > LIMIT_BYTES) {
                throw new ApiException(HttpStatus.PAYLOAD_TOO_LARGE, "PAYLOAD_TOO_LARGE",
                    "पाठवलेला डेटा खूप मोठा आहे (Payload exceeds size limit).");
            }
            if (bytes.length == 0 || new String(bytes, java.nio.charset.StandardCharsets.UTF_8).isBlank()) {
                return new LinkedHashMap<>();
            }
            Object parsed = json.readValue(bytes, Object.class);
            if (parsed instanceof Map<?, ?>) {
                return json.convertValue(parsed, new TypeReference<LinkedHashMap<String, Object>>() {});
            }
            if (parsed instanceof List<?>) return new LinkedHashMap<>();
            throw invalid();
        } catch (IOException e) {
            throw invalid();
        }
    }

    private static ApiException invalid() {
        return new ApiException(HttpStatus.BAD_REQUEST, "INVALID_JSON_BODY",
            "अवैध JSON डेटा स्वरूप (Invalid JSON payload format).");
    }
}
