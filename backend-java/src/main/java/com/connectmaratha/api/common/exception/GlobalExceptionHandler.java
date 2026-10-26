package com.connectmaratha.api.common.exception;

import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.web.ClientIp;

import com.connectmaratha.api.common.ratelimit.AuthRateLimiter;
import jakarta.servlet.http.HttpServletRequest;
import java.security.SecureRandom;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.async.AsyncRequestNotUsableException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * Error replies identical to the Node backend's (middleware/errorHandler.js and
 * the 404 catch-all in server.js). Server errors are logged in full with an
 * ERR-... id; the member only sees a generic message and that id.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private static final SecureRandom RANDOM = new SecureRandom();

    static final String NOT_FOUND_MESSAGE =
        "विनंती केलेला मार्ग आढळला नाही (Requested endpoint not found).";
    static final String SERVER_ERROR_MESSAGE =
        "सर्व्हरवर तांत्रिक अडचण आली आहे. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा (Internal server error).";

    public static Map<String, Object> body(String code, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", false);
        if (code != null) body.put("code", code);
        body.put("error", message);
        return body;
    }

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, Object>> api(ApiException e) {
        Map<String, Object> body = body(e.getCode(), e.getMessage());
        if (e instanceof AuthRateLimiter.RateLimitedException limited) {
            // Node's field order: retryAfter, backoff, failures
            for (String key : new String[] {"retryAfter", "backoff", "failures"}) {
                if (limited.getExtra().containsKey(key)) body.put(key, limited.getExtra().get(key));
            }
        }
        if (e instanceof ValidationException invalid) {
            body.put("errors", invalid.getErrors());
        }
        return ResponseEntity.status(e.getStatus()).body(body);
    }

    // Unknown paths and unsupported methods: Node answers both with its 404 catch-all.
    @ExceptionHandler({NoResourceFoundException.class, HttpRequestMethodNotSupportedException.class})
    public ResponseEntity<Map<String, Object>> notFound() {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body("ROUTE_NOT_FOUND", NOT_FOUND_MESSAGE));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> badJson() {
        return ResponseEntity.badRequest().body(
            body("INVALID_JSON_BODY", "अवैध JSON डेटा स्वरूप (Invalid JSON payload format)."));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> tooLarge() {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(
            body("PAYLOAD_TOO_LARGE", "पाठवलेला डेटा खूप मोठा आहे (Payload exceeds size limit)."));
    }

    /**
     * The visitor closed the page while a live stream (or a slow reply) was being sent. That is
     * normal, not a server error, and there is no connection left to answer on.
     */
    @ExceptionHandler(AsyncRequestNotUsableException.class)
    public void clientGone() {
        // nothing to send
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> unexpected(Exception e, HttpServletRequest req) {
        String errorId = "ERR-" + Long.toString(System.currentTimeMillis(), 36).toUpperCase()
            + "-" + HexFormat.of().withUpperCase().formatHex(randomBytes(3));
        Object user = req.getAttribute(CurrentUser.ATTRIBUTE);
        log.error("[SERVER ERROR {}] {} {} user={} ip={}", errorId, req.getMethod(), req.getRequestURI(),
            user instanceof CurrentUser u ? u.id() : "Unauthenticated", ClientIp.of(req), e);
        // Like Node (err.code): a database error carries its SQLSTATE code (e.g. 23505), anything else INTERNAL_SERVER_ERROR.
        Map<String, Object> body = body(sqlState(e).orElse("INTERNAL_SERVER_ERROR"), SERVER_ERROR_MESSAGE);
        body.put("errorId", errorId);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    private static java.util.Optional<String> sqlState(Throwable e) {
        for (Throwable t = e; t != null; t = t.getCause()) {
            if (t instanceof java.sql.SQLException sql && sql.getSQLState() != null) return java.util.Optional.of(sql.getSQLState());
            if (t.getCause() == t) break;
        }
        return java.util.Optional.empty();
    }

    private static byte[] randomBytes(int n) {
        byte[] b = new byte[n];
        RANDOM.nextBytes(b);
        return b;
    }
}
