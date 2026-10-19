package com.connectmaratha.api.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.Optional;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Login tokens that are interchangeable with the Node backend's
 * (jsonwebtoken, HS256, same secret, payload id/name/role/tier, 7 days).
 * A member logged in through Node stays logged in after the switch.
 */
@Service
public class JwtService {

    /** The dev secret Node falls back to when JWT_SECRET is unset (config/jwt.js). */
    static final String DEV_SECRET = "dev_secret_connect_maratha_local_only_2026";

    private final SecretKey key;
    private final Clock clock;
    private final Duration lifetime = Duration.ofDays(7);

    @Autowired
    public JwtService(@Value("${app.jwt-secret:}") String secret,
                      @Value("${app.production:false}") boolean production) {
        this(secret, production, Clock.systemUTC());
    }

    /** Explicit clock, so tests can check expiry without waiting. */
    public JwtService(String secret, boolean production, Clock clock) {
        if (production && (secret == null || secret.length() < 32)) {
            // Same rule as Node: refuse to start with a weak or missing secret.
            throw new IllegalStateException(
                "JWT_SECRET must be set to at least 32 characters in production");
        }
        String effective = (secret == null || secret.isBlank()) ? DEV_SECRET : secret;
        this.key = Keys.hmacShaKeyFor(effective.getBytes(StandardCharsets.UTF_8));
        this.clock = clock;
    }

    public String generate(String id, String name, String role, String tier) {
        Instant issued = clock.instant();
        Date now = Date.from(issued);
        return Jwts.builder()
            .claims(Map.of(
                "id", id,
                "name", name == null ? "" : name,
                "role", role == null || role.isBlank() ? "member" : role,
                "tier", tier == null || tier.isBlank() ? "Gold" : tier))
            .issuedAt(now)
            .expiration(Date.from(issued.plus(lifetime)))
            .signWith(key, Jwts.SIG.HS256)
            .compact();
    }

    /**
     * Node's 15-minute password reset token: { id, email, purpose: 'password_reset' },
     * signed with the same secret as login tokens.
     */
    public String generateResetToken(String memberId, String email) {
        Instant issued = clock.instant();
        Map<String, Object> claims = new java.util.HashMap<>();
        claims.put("id", memberId);
        claims.put("email", email);
        claims.put("purpose", "password_reset");
        return Jwts.builder()
            .claims(claims)
            .issuedAt(Date.from(issued))
            .expiration(Date.from(issued.plus(Duration.ofMinutes(15))))
            .signWith(key, Jwts.SIG.HS256)
            .compact();
    }

    /** The token's claims, or empty when it is missing, forged, or expired. */
    public Optional<Claims> parse(String token) {
        if (token == null || token.isBlank()) return Optional.empty();
        try {
            return Optional.of(Jwts.parser()
                .verifyWith(key)
                .clock(() -> Date.from(clock.instant()))
                .build()
                .parseSignedClaims(token)
                .getPayload());
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }
}
