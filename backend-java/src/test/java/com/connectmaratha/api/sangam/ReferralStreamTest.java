package com.connectmaratha.api.sangam;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;

import com.connectmaratha.api.PostgresTestBase;
import com.connectmaratha.api.common.live.SseLiveUpdates;
import com.connectmaratha.api.common.live.SseTestClient;
import com.connectmaratha.api.common.ratelimit.RateLimitFilter;
import com.connectmaratha.api.common.security.JwtService;
import com.connectmaratha.api.sangam.service.ReferralLimiter;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.JdbcTemplate;

/** /api/sangam/referrals/stream: a referral given or moved is announced live, without any customer data. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ReferralStreamTest extends PostgresTestBase {

    private static final HttpClient HTTP = HttpClient.newBuilder().version(HttpClient.Version.HTTP_1_1).build();
    private static final Duration WAIT = Duration.ofSeconds(3);
    private static final String STREAM = "/api/sangam/referrals/stream";

    @LocalServerPort int port;
    @Autowired SseLiveUpdates live;
    @Autowired ReferralLimiter limiter;
    @Autowired RateLimitFilter rateLimit;
    @Autowired JdbcTemplate jdbc;
    @Autowired JwtService jwt;
    @Autowired ObjectMapper json;

    private final List<SseTestClient> clients = new ArrayList<>();

    /** M9611 giver, M9612 receiver with a visible business. */
    @BeforeEach
    void fresh() {
        jdbc.update("DELETE FROM referrals WHERE giver_id LIKE 'M961%'");
        jdbc.update("DELETE FROM businesses WHERE name LIKE 'Zr%'");
        jdbc.update("INSERT INTO members (id, name, phone) VALUES ('M9611', 'Live Giver', '9800009611') ON CONFLICT (id) DO NOTHING");
        jdbc.update("INSERT INTO members (id, name, phone) VALUES ('M9612', 'Live Receiver', '9800009612') ON CONFLICT (id) DO NOTHING");
        jdbc.update("INSERT INTO businesses (id, name, owner, cat, owner_id, status) VALUES ('ZRL1', 'Zr Live Shop', 'x', 'it', 'M9612', 'visible')");
    }

    @AfterEach
    void cleanUp() {
        clients.forEach(SseTestClient::close);
        live.disconnectAll();
        limiter.reset();
        rateLimit.reset();
    }

    private SseTestClient stream() {
        SseTestClient c = SseTestClient.open(port, STREAM);
        clients.add(c);
        return c;
    }

    private String token(String id) {
        return "Bearer " + jwt.generate(id, "Test", "member", "Gold");
    }

    private HttpResponse<String> send(String method, String path, String token, Object body) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
            .header("Content-Type", "application/json")
            .header("Authorization", token)
            .method(method, HttpRequest.BodyPublishers.ofByteArray(json.writeValueAsBytes(body)))
            .build();
        return HTTP.send(request, HttpResponse.BodyHandlers.ofString(UTF_8));
    }

    private static Map<String, Object> referral() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("title", "Zr Secret title");
        body.put("clientName", "Secret Customer");
        body.put("clientPhone", "9822144550");
        body.put("recipientId", "M9612");
        return body;
    }

    private String give() throws Exception {
        HttpResponse<String> res = send("POST", "/api/sangam/referrals", token("M9611"), referral());
        assertThat(res.statusCode()).isEqualTo(201);
        return json.readTree(res.body()).at("/referral/id").asText();
    }

    @Test
    void givingSendsAnEventWithoutPrivateData() throws Exception {
        SseTestClient c = stream();
        c.awaitLine(l -> l.equals("event:connected"), WAIT);
        String id = give();
        c.awaitLine(l -> l.equals("event:referral.changed"), WAIT);
        String data = c.awaitLine(l -> l.startsWith("data:"), WAIT);
        assertThat(data).contains("\"id\":\"" + id + "\"").contains("\"giverId\":\"M9611\"").contains("\"recipientId\":\"M9612\"")
            .contains("\"status\":\"New\"")
            .doesNotContain("Secret").doesNotContain("9822144550").doesNotContain("Live Giver").doesNotContain("Live Receiver");
    }

    @Test
    void statusChangeSendsAnEvent() throws Exception {
        String id = give();
        SseTestClient c = stream();
        c.awaitLine(l -> l.equals("event:connected"), WAIT);
        assertThat(send("PUT", "/api/sangam/referrals/" + id + "/status", token("M9612"), Map.of("status", "Won", "value", 1000)).statusCode())
            .isEqualTo(200);
        c.awaitLine(l -> l.equals("event:referral.changed"), WAIT);
        assertThat(c.awaitLine(l -> l.startsWith("data:"), WAIT)).contains("\"status\":\"Won\"").doesNotContain("1000");
    }

    @Test
    void rejectedRequestSendsNothing() throws Exception {
        SseTestClient c = stream();
        c.awaitLine(l -> l.equals("event:connected"), WAIT);
        Map<String, Object> noClient = referral();
        noClient.remove("clientName");
        assertThat(send("POST", "/api/sangam/referrals", token("M9611"), noClient).statusCode()).isEqualTo(400);
        assertThat(c.noLineWithin(l -> l.equals("event:referral.changed"), Duration.ofSeconds(2))).isTrue();
    }

    @Test
    void sixthStreamFromOneIpIsRefused() {
        for (int i = 0; i < 5; i++) assertThat(stream().status()).isEqualTo(200);
        assertThat(stream().status()).isEqualTo(429);
    }
}
