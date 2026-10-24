package com.connectmaratha.api.enquiry;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;

import com.connectmaratha.api.PostgresTestBase;
import com.connectmaratha.api.common.live.SseLiveUpdates;
import com.connectmaratha.api.common.live.SseTestClient;
import com.connectmaratha.api.common.ratelimit.RateLimitFilter;
import com.connectmaratha.api.common.schema.LazyTables;
import com.connectmaratha.api.common.security.JwtService;
import com.connectmaratha.api.enquiry.service.PostingLimiter;
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

/** /api/enquiries/stream: requirements, quotes and status changes arrive live, without private data. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class EnquiryStreamTest extends PostgresTestBase {

    private static final HttpClient HTTP = HttpClient.newBuilder().version(HttpClient.Version.HTTP_1_1).build();
    private static final Duration WAIT = Duration.ofSeconds(3);

    @LocalServerPort int port;
    @Autowired SseLiveUpdates live;
    @Autowired PostingLimiter limiter;
    @Autowired RateLimitFilter rateLimit;
    @Autowired LazyTables tables;
    @Autowired JdbcTemplate jdbc;
    @Autowired JwtService jwt;
    @Autowired ObjectMapper json;

    private final List<SseTestClient> clients = new ArrayList<>();

    @BeforeEach
    void fresh() {
        tables.ensureEnquiryTables();
        jdbc.update("DELETE FROM enquiries");
        jdbc.update("INSERT INTO members (id, name, phone) VALUES ('M9411', 'Live Poster', '9822144599') ON CONFLICT (id) DO NOTHING");
        jdbc.update("INSERT INTO members (id, name, phone) VALUES ('M9412', 'Live Business', '9822144598') ON CONFLICT (id) DO NOTHING");
    }

    @AfterEach
    void cleanUp() {
        clients.forEach(SseTestClient::close);
        live.disconnectAll();
        limiter.reset();
        rateLimit.reset();
    }

    private SseTestClient stream() {
        SseTestClient c = SseTestClient.open(port, "/api/enquiries/stream");
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

    private static Map<String, Object> requirement() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("title", "Live requirement");
        body.put("category", "IT");
        body.put("district", "पुणे");
        body.put("phone", "9822144599");
        return body;
    }

    /** Posts a requirement as M9411 and returns its id. */
    private String post() throws Exception {
        HttpResponse<String> res = send("POST", "/api/enquiries", token("M9411"), requirement());
        assertThat(res.statusCode()).isEqualTo(201);
        return json.readTree(res.body()).at("/enquiry/id").asText();
    }

    @Test
    void newRequirementArrivesLiveWithoutPhone() throws Exception {
        SseTestClient c = stream();
        c.awaitLine(l -> l.equals("event:connected"), WAIT);
        post();
        c.awaitLine(l -> l.equals("event:enquiry.created"), WAIT);
        String data = c.awaitLine(l -> l.startsWith("data:"), WAIT);
        assertThat(data).contains("\"title\":\"Live requirement\"").contains("\"isMine\":false")
            .doesNotContain("9822144599").doesNotContain("M9411");
    }

    @Test
    void quoteArrivesAsUpdatedCount() throws Exception {
        SseTestClient c = stream();
        c.awaitLine(l -> l.equals("event:connected"), WAIT);
        String id = post();
        Map<String, Object> quote = Map.of("businessName", "Live Biz", "phone", "9890011122", "quoteAmount", "5000");
        assertThat(send("POST", "/api/enquiries/" + id + "/quote", token("M9412"), quote).statusCode()).isEqualTo(201);
        c.awaitLine(l -> l.equals("event:enquiry.updated"), WAIT);
        String data = c.awaitLine(l -> l.startsWith("data:"), WAIT);
        assertThat(data).contains("\"id\":\"" + id + "\"").contains("\"quotesCount\":1").contains("\"status\":\"open\"")
            .doesNotContain("9890011122").doesNotContain("5000");
    }

    @Test
    void statusChangeArrivesLive() throws Exception {
        SseTestClient c = stream();
        c.awaitLine(l -> l.equals("event:connected"), WAIT);
        String id = post();
        assertThat(send("PUT", "/api/enquiries/" + id + "/status", token("M9411"), Map.of("status", "closed")).statusCode())
            .isEqualTo(200);
        c.awaitLine(l -> l.equals("event:enquiry.updated"), WAIT);
        assertThat(c.awaitLine(l -> l.startsWith("data:"), WAIT)).contains("\"status\":\"closed\"");
    }

    @Test
    void rejectedPostSendsNothing() throws Exception {
        SseTestClient c = stream();
        c.awaitLine(l -> l.equals("event:connected"), WAIT);
        Map<String, Object> noTitle = requirement();
        noTitle.remove("title");
        assertThat(send("POST", "/api/enquiries", token("M9411"), noTitle).statusCode()).isEqualTo(400);
        assertThat(c.noLineWithin(l -> l.equals("event:enquiry.created"), Duration.ofSeconds(2))).isTrue();
    }

    @Test
    void sixthStreamFromOneIpIsRefused() {
        for (int i = 0; i < 5; i++) assertThat(stream().status()).isEqualTo(200);
        assertThat(stream().status()).isEqualTo(429);
    }
}
