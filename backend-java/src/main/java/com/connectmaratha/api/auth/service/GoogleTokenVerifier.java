package com.connectmaratha.api.auth.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Asks Google whether a Sign-In ID token is genuine (Node: verifyGoogleIdToken).
 * Accepts it only when Google confirms it, the email is verified, and it was
 * issued for one of GOOGLE_CLIENT_IDS.
 */
@Component
public class GoogleTokenVerifier {

    private static final ObjectMapper JSON = new ObjectMapper();

    private final List<String> clientIds;
    private final boolean production;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(8)).build();

    public GoogleTokenVerifier(@Value("${app.google-client-ids:}") String clientIds,
                               @Value("${app.production:false}") boolean production) {
        this.clientIds = Arrays.stream(clientIds.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
        this.production = production;
    }

    /** Production without GOOGLE_CLIENT_IDS: Google sign-in is switched off (503). */
    public boolean configured() {
        return !(clientIds.isEmpty() && production);
    }

    /** The token's verified claims (email, name, aud, ...), or empty when not genuine. */
    public Optional<Map<String, Object>> verify(String idToken) throws Exception {
        if (!configured()) throw new IllegalStateException("GOOGLE_CLIENT_IDS must be set in production");
        HttpRequest req = HttpRequest.newBuilder(URI.create(
                "https://oauth2.googleapis.com/tokeninfo?id_token=" + URLEncoder.encode(idToken, StandardCharsets.UTF_8)))
            .timeout(Duration.ofSeconds(8))
            .GET()
            .build();
        HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
        if (res.statusCode() < 200 || res.statusCode() >= 300) return Optional.empty();
        Map<String, Object> info = JSON.readValue(res.body(), new TypeReference<>() {});
        return check(info);
    }

    /** The rules applied to Google's answer (split out so tests can exercise them). */
    public Optional<Map<String, Object>> check(Map<String, Object> info) {
        Object verified = info.get("email_verified");
        if (!"true".equals(verified) && !Boolean.TRUE.equals(verified)) return Optional.empty();
        if (!clientIds.isEmpty() && !clientIds.contains(String.valueOf(info.get("aud")))) return Optional.empty();
        Object email = info.get("email");
        return email == null || String.valueOf(email).isEmpty() ? Optional.empty() : Optional.of(info);
    }
}
