package com.connectmaratha.api.sangam;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;

import com.connectmaratha.api.PostgresTestBase;
import com.connectmaratha.api.common.live.SseLiveUpdates;
import com.connectmaratha.api.common.live.SseTestClient;
import com.connectmaratha.api.common.ratelimit.RateLimitFilter;
import com.connectmaratha.api.common.security.JwtService;
import com.connectmaratha.api.sangam.service.MeetingLimiter;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneId;
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

/** /api/sangam/meetings/stream: a meeting asked for, answered or moved is announced live, without any meeting content. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class MeetingStreamTest extends PostgresTestBase {

    private static final HttpClient HTTP = HttpClient.newBuilder().version(HttpClient.Version.HTTP_1_1).build();
    private static final Duration WAIT = Duration.ofSeconds(3);
    private static final String STREAM = "/api/sangam/meetings/stream";
    private static final ZoneId IST = ZoneId.of("Asia/Kolkata");

    @LocalServerPort int port;
    @Autowired SseLiveUpdates live;
    @Autowired MeetingLimiter limiter;
    @Autowired RateLimitFilter rateLimit;
    @Autowired JdbcTemplate jdbc;
    @Autowired JwtService jwt;
    @Autowired ObjectMapper json;

    private final List<SseTestClient> clients = new ArrayList<>();

    /** M9811 asks, M9812 owns a visible business and answers. */
    @BeforeEach
    void fresh() {
        limiter.reset();
        rateLimit.reset();
        jdbc.update("DELETE FROM meetings WHERE requester_id LIKE 'M981%' OR recipient_id LIKE 'M981%'");
        jdbc.update("DELETE FROM businesses WHERE name LIKE 'Zm Live%'");
        jdbc.update("INSERT INTO members (id, name, phone) VALUES ('M9811', 'Live Requester', '9800009811') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name");
        jdbc.update("INSERT INTO members (id, name, phone) VALUES ('M9812', 'Live Receiver', '9800009812') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name");
        jdbc.update("INSERT INTO businesses (id, name, owner, cat, owner_id, status) VALUES ('ZML1', 'Zm Live Shop', 'x', 'it', 'M9812', 'visible')");
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

    private static String date() {
        return LocalDate.now(IST).plusDays(7).toString();
    }

    private static Map<String, Object> meeting() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("recipientId", "M9812");
        body.put("date", date());
        body.put("time", "10:30");
        body.put("mode", "Offline");
        body.put("place", "Zm Secret Place");
        body.put("topic", "Zm Secret topic");
        return body;
    }

    private String book() throws Exception {
        HttpResponse<String> res = send("POST", "/api/sangam/meetings", token("M9811"), meeting());
        assertThat(res.statusCode()).isEqualTo(201);
        return json.readTree(res.body()).at("/meeting/id").asText();
    }

    @Test
    void aBookingIsAnnouncedWithIdsAndStatusOnly() throws Exception {
        SseTestClient c = stream();
        c.awaitLine(l -> l.equals("event:connected"), WAIT);
        String id = book();
        c.awaitLine(l -> l.equals("event:meeting.changed"), WAIT);
        String data = c.awaitLine(l -> l.startsWith("data:"), WAIT);
        assertThat(data).contains("\"id\":\"" + id + "\"").contains("\"requesterId\":\"M9811\"").contains("\"recipientId\":\"M9812\"")
            .contains("\"status\":\"Requested\"")
            .doesNotContain("Secret").doesNotContain(date()).doesNotContain("10:30")
            .doesNotContain("Live Requester").doesNotContain("Live Receiver");
        assertThat(json.readTree(data.substring("data:".length())).size()).isEqualTo(4);
    }

    @Test
    void anAnswerIsAnnounced() throws Exception {
        String id = book();
        SseTestClient c = stream();
        c.awaitLine(l -> l.equals("event:connected"), WAIT);
        assertThat(send("PUT", "/api/sangam/meetings/" + id + "/status", token("M9812"), Map.of("status", "accepted")).statusCode()).isEqualTo(200);
        c.awaitLine(l -> l.equals("event:meeting.changed"), WAIT);
        assertThat(c.awaitLine(l -> l.startsWith("data:"), WAIT)).contains("\"status\":\"Confirmed\"");
    }

    @Test
    void aNewTimeIsAnnounced() throws Exception {
        String id = book();
        send("PUT", "/api/sangam/meetings/" + id + "/status", token("M9812"), Map.of("status", "accepted"));
        SseTestClient c = stream();
        c.awaitLine(l -> l.equals("event:connected"), WAIT);
        Map<String, Object> when = Map.of("date", LocalDate.now(IST).plusDays(9).toString(), "time", "16:00");
        assertThat(send("PUT", "/api/sangam/meetings/" + id, token("M9811"), when).statusCode()).isEqualTo(200);
        c.awaitLine(l -> l.equals("event:meeting.changed"), WAIT);
        assertThat(c.awaitLine(l -> l.startsWith("data:"), WAIT)).contains("\"status\":\"Requested\"").doesNotContain("16:00");
    }

    @Test
    void rejectedRequestAndNotesSendNothing() throws Exception {
        String id = book();
        SseTestClient c = stream();
        c.awaitLine(l -> l.equals("event:connected"), WAIT);
        Map<String, Object> noTopic = meeting();
        noTopic.remove("topic");
        assertThat(send("POST", "/api/sangam/meetings", token("M9811"), noTopic).statusCode()).isEqualTo(400);
        assertThat(send("PUT", "/api/sangam/meetings/" + id + "/notes", token("M9811"), Map.of("notes", "private note")).statusCode()).isEqualTo(200);
        assertThat(c.noLineWithin(l -> l.equals("event:meeting.changed"), Duration.ofSeconds(2))).isTrue();
    }
}
