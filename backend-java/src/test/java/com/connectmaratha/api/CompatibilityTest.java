package com.connectmaratha.api;

import com.connectmaratha.api.member.entity.Member;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.connectmaratha.api.common.security.JwtService;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Proves the switch will not log anyone out or lock anyone out:
 * data written by the Node backend (bcryptjs hashes, jsonwebtoken tokens)
 * must work in Java, and tokens made in Java must work in Node.
 */
class CompatibilityTest {

    private static final String SECRET = "compat_test_secret_0123456789abcdef0123456789";

    // Produced by the Node backend's libraries (see backend/middleware/auth.js).
    private static final String NODE_TOKEN =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ik0xMDAxIiwibmFtZSI6IlRlc3QgTWVtYmVyIiwicm9sZSI6Im1lbWJlciIsInRpZXIiOiJHb2xkIiwiaWF0IjoxNzkyMzkzNzI5LCJleHAiOjE3OTI5OTg1Mjl9.ozXlXVaEkbMPPpk-KHr3IZLMVS103-GHarW8NrvnqFY";
    private static final long NODE_TOKEN_ISSUED_AT = 1792393729L;

    private static JwtService serviceAt(long epochSecond) {
        return new JwtService(SECRET, true,
            Clock.fixed(Instant.ofEpochSecond(epochSecond), ZoneOffset.UTC));
    }

    @Test
    void javaAcceptsATokenMadeByNode() {
        var claims = serviceAt(NODE_TOKEN_ISSUED_AT + 3600).parse(NODE_TOKEN).orElseThrow();
        assertThat(claims.get("id")).isEqualTo("M1001");
        assertThat(claims.get("name")).isEqualTo("Test Member");
        assertThat(claims.get("role")).isEqualTo("member");
        assertThat(claims.get("tier")).isEqualTo("Gold");
    }

    @Test
    void nodeTokenExpiresAfterSevenDays() {
        long eightDays = 8L * 24 * 3600;
        assertThat(serviceAt(NODE_TOKEN_ISSUED_AT + eightDays).parse(NODE_TOKEN)).isEmpty();
    }

    @Test
    void forgedAndTamperedTokensAreRejected() {
        JwtService svc = serviceAt(NODE_TOKEN_ISSUED_AT + 60);
        String tampered = NODE_TOKEN.substring(0, NODE_TOKEN.length() - 3) + "AAA";
        assertThat(svc.parse(tampered)).isEmpty();
        assertThat(svc.parse("not.a.token")).isEmpty();
        assertThat(svc.parse("")).isEmpty();
        assertThat(svc.parse(null)).isEmpty();
        // Signed with a different secret.
        String other = new JwtService("another_secret_0123456789abcdef0123456789", true,
            Clock.fixed(Instant.ofEpochSecond(NODE_TOKEN_ISSUED_AT), ZoneOffset.UTC))
            .generate("M1", "x", "member", "Gold");
        assertThat(svc.parse(other)).isEmpty();
    }

    @Test
    void javaTokenIsWrittenForNodeToVerify() throws Exception {
        String token = JwtServiceHolder.nowService().generate("M2002", "Java Member", "admin", "Gold");
        // The Node side verifies this file's token in a separate step.
        Path out = Path.of("target", "java-token.txt");
        Files.createDirectories(out.getParent());
        Files.writeString(out, token);
        assertThat(token.split("\\.")).hasSize(3);
    }

    @Test
    void productionRefusesAWeakSecret() {
        assertThatThrownBy(() -> new JwtService("short", true, Clock.systemUTC()))
            .isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> new JwtService("", true, Clock.systemUTC()))
            .isInstanceOf(IllegalStateException.class);
    }

    // bcryptjs hashes of "Swarajya#2026" at cost 8 (what register uses) and 10.
    @Test
    void javaVerifiesPasswordHashesWrittenByNode() {
        BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder();
        String cost8 = "$2a$08$Zae3AcsrKIX2CdcClj.7tuAXsKIjvusfT/cGyFYXmMqpjHb7ZuJo.";
        String cost10 = "$2a$10$0LhX4X29de4F0y3PPKgCKehufmxnGLK.Vunh106scuZ4YuoHLEpHa";
        assertThat(bcrypt.matches("Swarajya#2026", cost8)).isTrue();
        assertThat(bcrypt.matches("Swarajya#2026", cost10)).isTrue();
        assertThat(bcrypt.matches("wrong-password", cost8)).isFalse();
        assertThat(bcrypt.matches("", cost8)).isFalse();
    }

    @Test
    void nodeVerifiesPasswordHashesWrittenByJava() throws Exception {
        String hash = new BCryptPasswordEncoder(8).encode("Swarajya#2026");
        Path out = Path.of("target", "java-hash.txt");
        Files.createDirectories(out.getParent());
        Files.writeString(out, hash);
        assertThat(hash).startsWith("$2a$08$");
    }

    /** Builds a service on the real clock with the shared test secret. */
    private static final class JwtServiceHolder {
        static JwtService nowService() {
            return new JwtService(SECRET, true, Clock.systemUTC());
        }
    }
}
