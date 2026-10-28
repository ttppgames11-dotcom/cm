package com.connectmaratha.api.parity;

import com.connectmaratha.api.member.entity.Member;

import static org.assertj.core.api.Assertions.assertThat;

import com.connectmaratha.api.PostgresTestBase;
import com.connectmaratha.api.common.security.JwtService;
import com.connectmaratha.api.mail.service.MailService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.io.File;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.JdbcTemplate;

/**
 * The real Node backend and the Java backend, side by side on ONE PostgreSQL:
 * the same requests go to both and the replies are compared (status, field
 * names, messages). Ids, tokens, dates and phone numbers are masked because
 * they legitimately differ. Also proves the cut-over case: accounts and login
 * tokens made by one server work on the other.
 *
 * Needs `node` on the PATH and the backend's dependencies installed
 * (../backend/node_modules, ../database/node_modules for pg).
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
    "app.jwt-secret=" + NodeParityTest.SECRET,
    "app.rate-limit.public-max=1000000",
    "app.rate-limit.user-max=1000000",
    "app.rate-limit.auth-ip-max=1000000"
})
class NodeParityTest extends PostgresTestBase {

    static final String SECRET = "parity_test_secret_0123456789abcdef0123456789";
    private static final int NODE_PORT = 5098;
    private static final ObjectMapper JSON = new ObjectMapper();
    private static final HttpClient HTTP = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
    private static final Path NODE_LOG = Path.of("target", "node-parity.log");

    private static Process node;

    @LocalServerPort int javaPort;
    @Autowired JwtService jwt;
    @MockBean MailService mail;

    // ------------------------------------------------------------ node process

    @BeforeAll
    static void startNode() throws Exception {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource());
        // Tell Node's migration runner everything is already applied (the schema is built by the test base).
        jdbc.execute("CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ DEFAULT now())");
        File[] files = Path.of("..", "database", "migrations").toFile().listFiles((d, n) -> n.endsWith(".sql"));
        for (File f : files) jdbc.update("INSERT INTO schema_migrations (name) VALUES (?) ON CONFLICT DO NOTHING", f.getName());

        Files.createDirectories(NODE_LOG.getParent());
        ProcessBuilder pb = new ProcessBuilder("node", "server.js")
            .directory(Path.of("..", "backend").toFile())
            .redirectErrorStream(true)
            .redirectOutput(NODE_LOG.toFile());
        Map<String, String> env = pb.environment();
        env.put("PORT", String.valueOf(NODE_PORT));
        env.put("NODE_ENV", "development");
        env.put("DATABASE_URL", "postgres://postgres:postgres@127.0.0.1:" + postgresPort() + "/postgres");
        env.put("JWT_SECRET", SECRET);
        env.put("RATE_LIMIT_PUBLIC_MAX", "1000000");
        env.put("RATE_LIMIT_USER_MAX", "1000000");
        env.put("RATE_LIMIT_AUTH_IP_MAX", "1000000");
        // dotenv never overrides a variable that is already set, so empty values keep Node from
        // reading real SMTP settings out of backend/.env: this test must never send real mail.
        env.put("SMTP_HOST", "");
        env.put("SMTP_USER", "");
        env.put("SMTP_PASS", "");
        node = pb.start();

        long deadline = System.currentTimeMillis() + 40_000;
        while (System.currentTimeMillis() < deadline) {
            try {
                if (send("GET", "http://127.0.0.1:" + NODE_PORT + "/api/health", null, null).status() == 200) return;
            } catch (Exception ignored) {
                Thread.sleep(300);
            }
        }
        throw new IllegalStateException("Node backend did not start:\n" + Files.readString(NODE_LOG));
    }

    @AfterAll
    static void stopNode() {
        if (node != null) node.destroyForcibly();
    }

    // -------------------------------------------------------------------- http

    record Resp(int status, String raw, JsonNode json) {
        /** The same reply without one nested field (for whole-database counts that differ between runs). */
        /** The same reply without one top-level field. */
        Resp withoutTop(String field) {
            if (json == null || !json.isObject()) return this;
            ObjectNode copy = json.deepCopy();
            copy.remove(field);
            return new Resp(status, raw, copy);
        }

        Resp without(String parent, String field) {
            if (json == null || !json.has(parent) || !json.get(parent).isObject()) return this;
            ObjectNode copy = json.deepCopy();
            ((ObjectNode) copy.get(parent)).remove(field);
            return new Resp(status, raw, copy);
        }
    }

    static Resp send(String method, String url, String body, Map<String, String> headers) throws Exception {
        HttpRequest.Builder b = HttpRequest.newBuilder(URI.create(url)).timeout(Duration.ofSeconds(30));
        String contentType = headers != null && headers.containsKey("Content-Type") ? headers.get("Content-Type") : "application/json";
        if (headers != null) headers.forEach((k, v) -> { if (!k.equals("Content-Type")) b.header(k, v); });
        if (body == null) {
            b.method(method, HttpRequest.BodyPublishers.noBody());
        } else {
            b.header("Content-Type", contentType);
            b.method(method, HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8));
        }
        HttpResponse<String> r = HTTP.send(b.build(), HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        JsonNode parsed;
        try {
            parsed = JSON.readTree(r.body());
        } catch (Exception e) {
            parsed = null;
        }
        return new Resp(r.statusCode(), r.body(), parsed);
    }

    /** A raw (non-JSON) body, e.g. an image upload. */
    static Resp sendBytes(String method, String url, byte[] body, String contentType, String token) throws Exception {
        HttpRequest.Builder b = HttpRequest.newBuilder(URI.create(url)).timeout(Duration.ofSeconds(60));
        if (token != null) b.header("Authorization", "Bearer " + token);
        if (contentType != null) b.header("Content-Type", contentType);
        b.method(method, body == null ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofByteArray(body));
        HttpResponse<String> r = HTTP.send(b.build(), HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        JsonNode parsed;
        try {
            parsed = JSON.readTree(r.body());
        } catch (Exception e) {
            parsed = null;
        }
        return new Resp(r.statusCode(), r.body(), parsed);
    }

    /** GET returning bytes and headers (for served images). */
    static HttpResponse<byte[]> fetchBytes(String url) throws Exception {
        return HTTP.send(HttpRequest.newBuilder(URI.create(url)).timeout(Duration.ofSeconds(30)).GET().build(),
            HttpResponse.BodyHandlers.ofByteArray());
    }

    static byte[] fakeImage(String kind, int size, String extra) {
        byte[] b = new byte[size];
        java.util.Arrays.fill(b, (byte) 0x11);
        byte[] head = switch (kind) {
            case "png" -> new byte[] {(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52};
            case "jpeg" -> new byte[] {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0};
            case "webp" -> new byte[] {0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50};
            default -> "plain text, not a picture".getBytes(StandardCharsets.US_ASCII);
        };
        System.arraycopy(head, 0, b, 0, Math.min(head.length, size));
        if (extra != null) {
            byte[] e = extra.getBytes(StandardCharsets.US_ASCII);
            System.arraycopy(e, 0, b, 40, e.length);
        }
        return b;
    }

    // ---------------------------------------------------------------- servers

    /** One of the two servers, with helpers that build the requests. */
    final class Srv {
        final String name;
        final String base;
        final String tag;           // makes this server's test data unique
        private final AtomicInteger counter = new AtomicInteger();

        Srv(String name, String base, String tag) {
            this.name = name;
            this.base = base;
            this.tag = tag;
        }

        String phone() {
            return (tag.equals("n") ? "97" : "98") + String.format("%08d", 10_000_000 + counter.incrementAndGet() * 7 + (System.nanoTime() / 1000) % 1_000_000);
        }

        String email() {
            return tag + System.nanoTime() % 100_000_000 + counter.incrementAndGet() + "@parity.test";
        }

        Resp req(String method, String path, Object body, String token) throws Exception {
            Map<String, String> h = new LinkedHashMap<>();
            if (token != null) h.put("Authorization", "Bearer " + token);
            return send(method, base + path, body == null ? null : (body instanceof String s ? s : JSON.writeValueAsString(body)), h);
        }

        Resp post(String path, Object body) throws Exception { return req("POST", path, body, null); }
        Resp post(String path, Object body, String token) throws Exception { return req("POST", path, body, token); }
        Resp get(String path, String token) throws Exception { return req("GET", path, null, token); }
        Resp delete(String path, Object body, String token) throws Exception { return req("DELETE", path, body, token); }

        /** The 6-digit reset code that was "emailed" after a forgot-password call. */
        String lastOtp(String email) throws Exception {
            if (name.equals("java")) {
                ArgumentCaptor<String> otp = ArgumentCaptor.forClass(String.class);
                Mockito.verify(mail, Mockito.atLeastOnce()).sendPasswordResetOtp(Mockito.eq(email), Mockito.anyString(), otp.capture());
                return otp.getValue();
            }
            long deadline = System.currentTimeMillis() + 5000;
            while (System.currentTimeMillis() < deadline) {
                String log = Files.readString(NODE_LOG, StandardCharsets.UTF_8);
                int to = log.lastIndexOf("To: " + email);
                if (to >= 0) {
                    Matcher m = Pattern.compile("OTP CODE: \\[ (\\d{6}) \\]").matcher(log.substring(to));
                    if (m.find()) return m.group(1);
                }
                Thread.sleep(150);
            }
            throw new IllegalStateException("No OTP in the Node log for " + email);
        }
    }

    /** Collects labelled replies from one run of a scenario. */
    static final class Recorder {
        final Map<String, Resp> replies = new LinkedHashMap<>();

        void rec(String label, Resp r) {
            replies.put(label, r);
        }
    }

    interface Scenario {
        void run(Srv s, Recorder rec) throws Exception;
    }

    private final List<String> mismatches = new ArrayList<>();
    private int compared = 0;

    private void compare(String scenario, Scenario s) throws Exception {
        Srv n = new Srv("node", "http://127.0.0.1:" + NODE_PORT, "n");
        Srv j = new Srv("java", "http://127.0.0.1:" + javaPort, "j");
        Recorder rn = new Recorder();
        Recorder rj = new Recorder();
        s.run(n, rn);
        s.run(j, rj);
        assertThat(rj.replies.keySet()).as(scenario + " recorded labels").isEqualTo(rn.replies.keySet());
        for (String label : rn.replies.keySet()) {
            compared++;
            Resp a = rn.replies.get(label);
            Resp b = rj.replies.get(label);
            JsonNode na = normalize(a.json());
            JsonNode nb = normalize(b.json());
            if (a.status() != b.status() || !String.valueOf(na).equals(String.valueOf(nb))) {
                mismatches.add("[" + scenario + " / " + label + "]\n  node " + a.status() + " " + pretty(na)
                    + "\n  java " + b.status() + " " + pretty(nb));
            }
        }
    }

    // ------------------------------------------------------------ normalizing

    private static final Pattern JWT = Pattern.compile("eyJ[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+");
    private static final Pattern MEMBER_ID = Pattern.compile("\\bM\\d{4}\\b");
    private static final Pattern REF_CODE = Pattern.compile("REF-96K-\\d+");
    private static final Pattern ISO = Pattern.compile("\\d{4}-\\d{2}-\\d{2}T[\\d:.]+Z");
    private static final Pattern DATE_TIME = Pattern.compile("\\d{4}-\\d{2}-\\d{2}( \\d{2}:\\d{2}:\\d{2}(\\.\\d+)?([+-]\\d{2}(:?\\d{2})?)?)?");
    private static final Pattern WEBSITE_IDS = Pattern.compile("\\b(SBK|SRV|CC|ACT|RCPT|TECH)-[A-Z0-9]{6,}\\b|\\bTKT-\\d{6}-[A-Z0-9]+\\b");
    /** Ids made from the clock: DOC-4821, REQ-482, CM-M-482 and so on. */
    private static final Pattern CLOCK_IDS = Pattern.compile("^((DOC|DON|GRV|VOL|WHELP|LN)-\\d{4}|REQ-\\d{3}|CM-[MF]-\\d{3})$");
    private static final Pattern PHONE_MASKED = Pattern.compile("\\b\\d{4} •••••");
    private static final Pattern PHONE = Pattern.compile("\\b\\d{10}\\b");
    private static final Pattern PARITY_EMAIL = Pattern.compile("[A-Za-z0-9.]+@parity\\.test");
    private static final Pattern POST_ID = Pattern.compile("\\b(P|CMM)-\\d{10,}");
    private static final Pattern MEDIA_ID = Pattern.compile("\\b[a-f0-9]{32}\\b");
    /** Random record ids Node picks: B42, JOB-42, E42, TXN-AB12CD34, CM-80G-12345, DON-<ms>, REV-/APP-/RSVP-<ms>. */
    private static final Pattern RANDOM_IDS = Pattern.compile(
        "^(B|JOB-|E)\\d{2,}$|^REF-\\d{3}$|^(BLD|DRY|PROD)-\\d{4,}$|^SUB-\\d{6}$|^oral_\\d{10,}$|\\bTXN-[A-Z0-9]+|\\bCM-80G-\\d{5}\\b"
            + "|\\b(DON|REV|APP|RSVP|MT)-\\d{10,}|\\b(ENQ|DENQ|REG)-\\d{10,}-\\d{3}\\b");
    private static final Pattern TAGGED = Pattern.compile("(Zq|GZ)[nj]");
    private static final Pattern ERR_ID = Pattern.compile("ERR-[A-Z0-9]+-[A-F0-9]+");
    private static final Pattern IN_SECONDS = Pattern.compile("in \\d+s");
    private static final Pattern RETRY_SECONDS = Pattern.compile("कृपया \\d+ सेकंदांनंतर");

    static String normalizeString(String s) {
        s = JWT.matcher(s).replaceAll("<jwt>");
        s = ISO.matcher(s).replaceAll("<iso>");
        s = DATE_TIME.matcher(s).replaceAll("<date>");
        s = PHONE_MASKED.matcher(s).replaceAll("<phone4> •••••");
        s = PHONE.matcher(s).replaceAll("<phone>");
        s = PARITY_EMAIL.matcher(s).replaceAll("<email>");
        s = REF_CODE.matcher(s).replaceAll("REF-96K-####");
        s = MEMBER_ID.matcher(s).replaceAll("M####");
        s = POST_ID.matcher(s).replaceAll("$1-#");
        s = MEDIA_ID.matcher(s).replaceAll("<media-id>");
        s = RANDOM_IDS.matcher(s).replaceAll("<random-id>");
        s = WEBSITE_IDS.matcher(s).replaceAll("<website-id>");
        s = CLOCK_IDS.matcher(s).replaceAll("<clock-id>");
        s = TAGGED.matcher(s).replaceAll("$1#");
        s = ERR_ID.matcher(s).replaceAll("<errid>");
        s = IN_SECONDS.matcher(s).replaceAll("in Ns");
        s = RETRY_SECONDS.matcher(s).replaceAll("कृपया N सेकंदांनंतर");
        return s;
    }

    static JsonNode normalize(JsonNode n) {
        if (n == null) return JsonNodeFactory.instance.textNode("<not json>");
        if (n.isObject()) {
            TreeMap<String, JsonNode> sorted = new TreeMap<>();
            n.fields().forEachRemaining(e -> sorted.put(e.getKey(), normalize(e.getValue())));
            ObjectNode out = JsonNodeFactory.instance.objectNode();
            sorted.forEach(out::set);
            return out;
        }
        if (n.isArray()) {
            List<JsonNode> items = new ArrayList<>();
            n.forEach(i -> items.add(normalize(i)));
            items.sort(Comparator.comparing(String::valueOf));
            ArrayNode out = JsonNodeFactory.instance.arrayNode();
            items.forEach(out::add);
            return out;
        }
        if (n.isTextual()) return JsonNodeFactory.instance.textNode(normalizeString(n.asText()));
        return n;
    }

    private static String pretty(JsonNode n) {
        return n.toString();
    }

    // -------------------------------------------------------------- scenarios

    private static Map<String, Object> reg(String name, String phone, String email, Object... more) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("name", name);
        if (phone != null) m.put("phone", phone);
        if (email != null) m.put("email", email);
        m.put("password", "Swarajya#2026");
        for (int i = 0; i < more.length; i += 2) m.put((String) more[i], more[i + 1]);
        return m;
    }

    /** Setup sign-up. Node can occasionally hand out a member id twice in a row (it answers 500), so try again. */
    private static Resp regOk(Srv s, Map<String, Object> body) throws Exception {
        Resp r = null;
        for (int i = 0; i < 5; i++) {
            r = s.post("/api/auth/register", body);
            if (r.status() == 201) return r;
            // The failed attempt saved nothing (the database refused the duplicate id), so the same details can be sent again.
            Thread.sleep(50);
        }
        return r;
    }

    private static String tokenOf(Resp r) {
        return r.json().get("token").asText();
    }

    @Test
    void javaAnswersLikeNode() throws Exception {
        compare("routes and bad input", (s, r) -> {
            r.rec("unknown route", s.get("/api/nope", null));
            r.rec("wrong method", s.req("PUT", "/api/health/x", null, null));
            r.rec("broken json", s.post("/api/auth/register", "{ broken"));
            r.rec("login empty body", s.post("/api/auth/login", "{}"));
            r.rec("register not json", send("POST", s.base + "/api/auth/register", "hello", Map.of("Content-Type", "text/plain")));
        });

        compare("register", (s, r) -> {
            String phone = s.phone();
            String email = s.email();
            r.rec("minimal", s.post("/api/auth/register", reg("संभाजी राजे", phone, null)));
            r.rec("full", s.post("/api/auth/register", reg("Full Member", s.phone(), email, "city", "Pune", "district", "सातारा",
                "state", "महाराष्ट्र", "country", "भारत", "profession", "Dev", "business", "Biz", "education", "BE",
                "skills", "Flutter, Node", "about", "hello", "interests", "Forts")));
            r.rec("website shape", s.post("/api/auth/register", reg("Web Member", null, null, "mobile", s.phone(),
                "organization", "Swarajya IT", "skills", List.of("Go", " Java ", ""), "about", List.of("one", "two"),
                "interests", List.of("Forts"), "goals", List.of("a"), "legalCompliance", Map.of("termsAccepted", true))));
            r.rec("duplicate phone", s.post("/api/auth/register", reg("Dup", phone, null)));
            r.rec("duplicate email", s.post("/api/auth/register", reg("Dup2", s.phone(), email)));
            r.rec("no name", s.post("/api/auth/register", Map.of("phone", s.phone())));
            r.rec("short name", s.post("/api/auth/register", reg("A", s.phone(), null)));
            r.rec("no contact", s.post("/api/auth/register", Map.of("name", "Nobody")));
            r.rec("bad email", s.post("/api/auth/register", reg("Bad Email", null, "nope")));
            r.rec("bad phone", s.post("/api/auth/register", reg("Bad Phone", "12345", null)));
            r.rec("short password", s.post("/api/auth/register", Map.of("name", "Short", "phone", s.phone(), "password", "123")));
            r.rec("skills wrong type", s.post("/api/auth/register", reg("Wrong", s.phone(), null, "skills", 5)));
            r.rec("too many skills", s.post("/api/auth/register", reg("Many", s.phone(), null, "skills", java.util.Collections.nCopies(31, "x"))));
            r.rec("long skill item", s.post("/api/auth/register", reg("LongItem", s.phone(), null, "skills", List.of("x".repeat(51)))));
            r.rec("unknown field allowed", s.post("/api/auth/register", reg("Extra", s.phone(), null, "favouriteColour", "orange")));
            r.rec("bad country id", s.post("/api/auth/register", reg("Geo", s.phone(), null, "countryId", "C-NOPE")));
            r.rec("no password", s.post("/api/auth/register", Map.of("name", "NoPass", "phone", s.phone())));
        });

        compare("login and me", (s, r) -> {
            String phone = s.phone();
            String email = s.email();
            Resp created = regOk(s, reg("Login Member", phone, email, "skills", "a, b"));
            String id = created.json().get("member").get("id").asText();
            r.rec("by id", s.post("/api/auth/login", Map.of("identifier", id, "password", "Swarajya#2026")));
            r.rec("by email", s.post("/api/auth/login", Map.of("identifier", email.toUpperCase(), "password", "Swarajya#2026")));
            r.rec("by phone", s.post("/api/auth/login", Map.of("identifier", phone, "password", "Swarajya#2026")));
            r.rec("by +91 phone", s.post("/api/auth/login", Map.of("identifier", "+91 " + phone.substring(0, 5) + " " + phone.substring(5), "password", "Swarajya#2026")));
            r.rec("phone field", s.post("/api/auth/login", Map.of("phone", phone, "password", "Swarajya#2026")));
            r.rec("email field", s.post("/api/auth/login", Map.of("email", email, "password", "Swarajya#2026")));
            r.rec("wrong password", s.post("/api/auth/login", Map.of("identifier", id, "password", "wrong")));
            r.rec("unknown member", s.post("/api/auth/login", Map.of("identifier", "M0000", "password", "x")));
            r.rec("no identifier", s.post("/api/auth/login", Map.of("password", "x")));
            r.rec("identifier too long", s.post("/api/auth/login", Map.of("identifier", "x".repeat(121), "password", "x")));
            r.rec("password wrong type", s.post("/api/auth/login", Map.of("identifier", id, "password", 12345)));
            String token = tokenOf(s.post("/api/auth/login", Map.of("identifier", id, "password", "Swarajya#2026")));
            r.rec("me", s.get("/api/auth/me", token));
            r.rec("me no token", s.get("/api/auth/me", null));
            r.rec("me bad token", s.get("/api/auth/me", "not.a.token"));
            r.rec("me unknown member", s.get("/api/auth/me", jwt.generate("M0001", "Ghost", "member", "Gold")));
        });

        compare("referrals", (s, r) -> {
            Resp owner = regOk(s, reg("Ref Owner", s.phone(), null));
            String code = owner.json().get("member").get("reference_id").asText();
            String ownerId = owner.json().get("member").get("id").asText();
            String ownerToken = tokenOf(owner);
            r.rec("verify by code", s.get("/api/auth/referrals/verify/" + code, null));
            r.rec("verify lowercase", s.get("/api/auth/referrals/verify/" + code.toLowerCase(), null));
            r.rec("verify by id", s.get("/api/auth/referrals/verify/" + ownerId, null));
            r.rec("verify official", s.get("/api/auth/referrals/verify/cm-official-2026", null));
            r.rec("verify admin code", s.get("/api/auth/referrals/verify/CM-ADMIN-001", null));
            r.rec("verify fake", s.get("/api/auth/referrals/verify/NOPE-123", null));
            r.rec("friend by code", s.post("/api/auth/register", reg("Friend A", s.phone(), null, "referral_code", code)));
            r.rec("friend by id", s.post("/api/auth/register", reg("Friend B", s.phone(), null, "referredBy", ownerId)));
            r.rec("friend unknown code", s.post("/api/auth/register", reg("Friend C", s.phone(), null, "reference_id", "SOMEONE-ELSE")));
            r.rec("my referrals", s.get("/api/auth/referrals/my-referrals", ownerToken));
            r.rec("my referrals no token", s.get("/api/auth/referrals/my-referrals", null));
            r.rec("my referrals ghost", s.get("/api/auth/referrals/my-referrals", jwt.generate("M0002", "Ghost", "member", "Gold")));
        });

        compare("password reset", (s, r) -> {
            String email = s.email();
            s.post("/api/auth/register", reg("Reset Member", s.phone(), email));
            r.rec("forgot unknown", s.post("/api/auth/forgot-password", Map.of("email", "nobody" + s.tag + "@parity.test")));
            r.rec("forgot bad email", s.post("/api/auth/forgot-password", Map.of("email", "nope")));
            r.rec("forgot ok", s.post("/api/auth/forgot-password", Map.of("email", "  " + email.toUpperCase() + " ")));
            String otp = s.lastOtp(email.toLowerCase());
            String wrong = otp.equals("000000") ? "111111" : "000000";
            r.rec("verify wrong", s.post("/api/auth/verify-reset-otp", Map.of("email", email, "otp", wrong)));
            r.rec("verify bad format", s.post("/api/auth/verify-reset-otp", Map.of("email", email, "otp", "12")));
            r.rec("verify no request", s.post("/api/auth/verify-reset-otp", Map.of("email", "nobody" + s.tag + "@parity.test", "otp", "123456")));
            Resp ok = s.post("/api/auth/verify-reset-otp", Map.of("email", email, "otp", otp));
            r.rec("verify ok", ok);
            String resetToken = ok.json().get("resetToken").asText();
            r.rec("reset short", s.post("/api/auth/reset-password", Map.of("email", email, "resetToken", resetToken, "newPassword", "short12")));
            r.rec("reset wrong email", s.post("/api/auth/reset-password", Map.of("email", "other" + s.tag + "@parity.test", "resetToken", resetToken, "newPassword", "NewPassw0rd!")));
            r.rec("reset bad token", s.post("/api/auth/reset-password", Map.of("email", email, "resetToken", "x".repeat(30), "newPassword", "NewPassw0rd!")));
            r.rec("reset login token", s.post("/api/auth/reset-password", Map.of("email", email, "resetToken", jwt.generate("M0003", "x", "member", "Gold"), "newPassword", "NewPassw0rd!")));
            r.rec("reset ok", s.post("/api/auth/reset-password", Map.of("email", email, "resetToken", resetToken, "newPassword", "NewPassw0rd!")));
            r.rec("login new password", s.post("/api/auth/login", Map.of("identifier", email, "password", "NewPassw0rd!")));
            r.rec("login old password", s.post("/api/auth/login", Map.of("identifier", email, "password", "Swarajya#2026")));
        });

        compare("account deletion", (s, r) -> {
            Resp m1 = regOk(s, reg("Delete One", s.phone(), s.email()));
            String t1 = tokenOf(m1);
            r.rec("app delete no token", s.delete("/api/auth/account", Map.of("confirm", "DELETE"), null));
            r.rec("app delete no password", s.delete("/api/auth/account", Map.of("confirm", "DELETE"), t1));
            r.rec("app delete wrong password", s.delete("/api/auth/account", Map.of("confirm", "DELETE", "password", "wrong"), t1));
            r.rec("app delete bad confirm", s.delete("/api/auth/account", Map.of("confirm", "nope", "password", "Swarajya#2026"), t1));
            r.rec("app delete extra field", s.delete("/api/auth/account", Map.of("confirm", "DELETE", "password", "Swarajya#2026", "x", 1), t1));
            r.rec("app delete ok", s.delete("/api/auth/account", Map.of("confirm", "DELETE", "password", "Swarajya#2026"), t1));
            r.rec("deleted can't login", s.post("/api/auth/login", Map.of("identifier", m1.json().get("member").get("id").asText(), "password", "Swarajya#2026")));

            String phone = s.phone();
            Resp m2 = regOk(s, reg("Delete Two", phone, null));
            r.rec("web request", s.post("/api/auth/delete-account", Map.of("identifier", phone, "confirmation", true, "reason", "testing")));
            r.rec("web request unknown", s.post("/api/auth/delete-account", Map.of("identifier", "9000000001", "confirmation", true)));
            r.rec("web request no identifier", s.post("/api/auth/delete-account", Map.of("confirmation", true)));
            r.rec("web request no confirmation", s.post("/api/auth/delete-account", Map.of("identifier", phone)));
            r.rec("web logged-in wrong password", s.post("/api/auth/delete-account", Map.of("password", "wrong"), tokenOf(m2)));
            r.rec("web logged-in ok", s.post("/api/auth/delete-account", Map.of("password", "Swarajya#2026", "confirmation", true), tokenOf(m2)));
        });

        compare("google sign-in", (s, r) -> {
            r.rec("no token", s.post("/api/auth/google", Map.of("email", "someone@parity.test")));
            r.rec("extra field", s.post("/api/auth/google", Map.of("idToken", "x".repeat(40), "unexpected", 1)));
            r.rec("short token", s.post("/api/auth/google", Map.of("idToken", "short")));
            r.rec("register wrong type", s.post("/api/auth/google", Map.of("idToken", "x".repeat(40), "register", "yes")));
        });

        compare("members", (s, r) -> {
            String zq = "Zq" + s.tag;
            Resp a = regOk(s, reg(zq + " Alpha", s.phone(), s.email(), "profession", zq + "prof",
                "district", "सातारा", "skills", List.of("Go", "Java"), "about", "hello"));
            Resp b = regOk(s, reg(zq + " Beta", s.phone(), s.email(), "profession", "Other", "district", "पुणे"));
            String ta = tokenOf(a);
            String tb = tokenOf(b);
            String idA = a.json().get("member").get("id").asText();
            r.rec("list by name", s.get("/api/members?search=" + zq + "%20Alpha", null));
            r.rec("list by profession", s.get("/api/members?profession=" + zq + "prof", null));
            r.rec("list by district and name", s.get("/api/members?district=%E0%A4%AA%E0%A5%81%E0%A4%A3%E0%A5%87&search=" + zq, null));
            r.rec("list all districts", s.get("/api/members?district=%E0%A4%B8%E0%A4%B0%E0%A5%8D%E0%A4%B5&search=" + zq, null));
            r.rec("list by tier", s.get("/api/members?tier=Platinum&search=" + zq, null));
            r.rec("list nothing", s.get("/api/members?search=" + zq + "-nobody", null));
            r.rec("detail visitor", s.get("/api/members/" + idA, null));
            r.rec("detail self", s.get("/api/members/" + idA, ta));
            r.rec("detail other member", s.get("/api/members/" + idA, tb));
            r.rec("detail bad token", s.get("/api/members/" + idA, "not-a-token"));
            r.rec("detail missing", s.get("/api/members/M0", null));
            r.rec("edit no token", s.req("PUT", "/api/members/" + idA, Map.of("city", "X"), null));
            r.rec("edit someone else", s.req("PUT", "/api/members/" + idA, Map.of("city", "X"), tb));
            r.rec("edit empty body", s.req("PUT", "/api/members/" + idA, Map.of(), ta));
            r.rec("edit fields", s.req("PUT", "/api/members/" + idA, Map.of("city", "Pune", "business", "Biz",
                "skills", List.of(" Flutter ", "", "Dart"), "about", List.of("line1", "line2")), ta));
            r.rec("edit text skills", s.req("PUT", "/api/members/" + idA, Map.of("skills", "  a, b  ", "about", " bio "), ta));
            r.rec("edit missing member", s.req("PUT", "/api/members/M0", Map.of("city", "X"), ta));
            r.rec("detail after edit", s.get("/api/members/" + idA, ta));
            Resp stats = s.get("/api/members/stats", null);
            assertThat(stats.status()).as(s.name + " stats").isEqualTo(200);
            assertThat(stats.json().get("stats").get("totalMembers").asInt()).isGreaterThanOrEqualTo(2);
            assertThat(s.get("/api/members/stats/summary", null).json().get("stats").has("activeDistricts")).isTrue();
        });

        compare("community", (s, r) -> {
            String group = "GZ" + s.tag;
            Resp a = regOk(s, reg("Zq" + s.tag + " Poster", s.phone(), s.email()));
            Resp b = regOk(s, reg("Zq" + s.tag + " Reader", s.phone(), s.email()));
            String ta = tokenOf(a);
            String tb = tokenOf(b);
            String idA = a.json().get("member").get("id").asText();
            String idB = b.json().get("member").get("id").asText();

            r.rec("post no token", s.post("/api/community/posts", Map.of("text", "hi"), null));
            r.rec("post no text", s.post("/api/community/posts", Map.of("group_id", group), ta));
            Resp p1 = s.post("/api/community/posts", Map.of("text", "पहिली पोस्ट", "group_id", group, "image_id", "abc.jpg"), ta);
            r.rec("post ok", p1);
            r.rec("post by image path", s.post("/api/community/posts", Map.of("text", "second", "group_id", group, "image", "/media/x.png"), ta));
            String postId = p1.json().get("post").get("id").asText();

            r.rec("like no token", s.post("/api/community/posts/" + postId + "/like", Map.of(), null));
            r.rec("like missing post", s.post("/api/community/posts/P-0/like", Map.of(), tb));
            r.rec("like", s.post("/api/community/posts/" + postId + "/like", Map.of(), tb));
            r.rec("feed with like", s.get("/api/community/posts?groupId=" + group, tb));
            r.rec("unlike", s.post("/api/community/posts/" + postId + "/like", Map.of(), tb));

            r.rec("comment no token", s.post("/api/community/posts/" + postId + "/comments", Map.of("text", "x"), null));
            r.rec("comment empty", s.post("/api/community/posts/" + postId + "/comments", Map.of("text", "   "), tb));
            r.rec("comment ok", s.post("/api/community/posts/" + postId + "/comments", Map.of("text", " nice "), tb));
            r.rec("comment on missing post", s.post("/api/community/posts/" + group + "-ghost/comments", Map.of("text", "orphan"), tb));
            r.rec("feed visitor", s.get("/api/community/posts?groupId=" + group, null));
            r.rec("feed other group", s.get("/api/community/posts?groupId=" + group + "-none", null));

            r.rec("report no token", s.post("/api/community/report", Map.of("target_type", "post", "target_id", postId, "reason", "spam"), null));
            r.rec("report bad reason", s.post("/api/community/report", Map.of("target_type", "post", "target_id", postId, "reason", "nope"), tb));
            r.rec("report bad type", s.post("/api/community/report", Map.of("target_type", "planet", "target_id", postId, "reason", "spam"), tb));
            r.rec("report missing target", s.post("/api/community/report", Map.of("target_type", "post", "target_id", "P-0", "reason", "spam"), tb));
            r.rec("report self", s.post("/api/community/report", Map.of("target_type", "member", "target_id", idB, "reason", "spam"), tb));
            r.rec("report post", s.post("/api/community/report", Map.of("target_type", "post", "target_id", postId, "reason", "spam", "details", "bad"), tb));
            r.rec("report post again", s.post("/api/community/report", Map.of("target_type", "post", "target_id", postId, "reason", "abuse"), tb));
            r.rec("report member", s.post("/api/community/report", Map.of("target_type", "member", "target_id", idA, "reason", "harassment"), tb));

            r.rec("blocks no token", s.get("/api/community/blocks", null));
            r.rec("block self", s.post("/api/community/blocks/" + idB, Map.of(), tb));
            r.rec("block missing", s.post("/api/community/blocks/M0", Map.of(), tb));
            r.rec("block", s.post("/api/community/blocks/" + idA, Map.of(), tb));
            r.rec("block again", s.post("/api/community/blocks/" + idA, Map.of(), tb));
            r.rec("blocked list", s.get("/api/community/blocks", tb));
            r.rec("feed hides blocked", s.get("/api/community/posts?groupId=" + group, tb));
            r.rec("feed for others unchanged", s.get("/api/community/posts?groupId=" + group, ta));
            r.rec("unblock", s.delete("/api/community/blocks/" + idA, null, tb));
            r.rec("blocked list empty", s.get("/api/community/blocks", tb));

            r.rec("groups filtered", s.get("/api/community/groups?type=zzz-none", null));
            r.rec("group join", s.post("/api/community/groups/G-none/join", Map.of(), null));
        });

        compare("admin", (s, r) -> {
            String zq = "Zq" + s.tag;
            String admin = jwt.generate("M0001", "Admin", "admin", "Gold");
            String ceo = jwt.generate("M0002", "CEO", "ceo", "Gold");
            Resp a = regOk(s, reg(zq + " Admin List A", s.phone(), s.email(), "city", "Pune"));
            regOk(s, reg(zq + " Admin List B", s.phone(), s.email(), "city", "Satara"));
            String member = tokenOf(a);
            String idA = a.json().get("member").get("id").asText();

            r.rec("metrics no token", s.get("/api/admin/metrics", null));
            r.rec("metrics member", s.get("/api/admin/metrics", member));
            r.rec("metrics bad token", s.get("/api/admin/metrics", "x.y.z"));
            Resp metrics = s.get("/api/admin/metrics", admin);
            assertThat(metrics.status()).as(s.name + " admin metrics").isEqualTo(200);
            assertThat(metrics.json().get("metrics").get("totalMembers").asInt()).isGreaterThanOrEqualTo(2);
            assertThat(metrics.json().get("metrics").has("uptime")).isTrue();
            r.rec("metrics ceo shape", s.get("/api/admin/metrics", ceo).without("metrics", "uptime")
                .without("metrics", "totalMembers").without("metrics", "totalPosts").without("metrics", "totalReferrals")
                .without("metrics", "totalBusinesses").without("metrics", "totalEvents"));
            r.rec("audit logs", s.get("/api/admin/audit-logs", null));

            r.rec("users no token", s.get("/api/admin/users", null));
            r.rec("users member", s.get("/api/admin/users", member));
            r.rec("users search", s.get("/api/admin/users?search=" + zq + "%20Admin", admin).without("data", "stats"));
            r.rec("users search role all", s.get("/api/admin/users?search=" + zq + "%20Admin&role=all&verified=all", admin).without("data", "stats"));
            r.rec("users role admin", s.get("/api/admin/users?search=" + zq + "%20Admin&role=admin", admin).without("data", "stats"));
            Resp all = s.get("/api/admin/users", ceo);
            assertThat(all.json().get("data").get("stats").get("total").asInt()).as(s.name + " users total")
                .isEqualTo(all.json().get("data").get("users").size());
            assertThat(all.raw()).as(s.name + " never sends password hashes").doesNotContain("password_hash");
            r.rec("one user", s.get("/api/admin/users/" + idA, admin));
            r.rec("one user missing", s.get("/api/admin/users/M0", admin));

            r.rec("verify no token", s.post("/api/admin/verify-member/" + idA, Map.of("status", true)));
            r.rec("verify ceo", s.post("/api/admin/verify-member/" + idA, Map.of("status", true), ceo));
            r.rec("verify member", s.post("/api/admin/verify-member/" + idA, Map.of("status", true), member));
            r.rec("verify admin", s.post("/api/admin/verify-member/" + idA, Map.of("status", true), admin));
            r.rec("users verified only", s.get("/api/admin/users?search=" + zq + "%20Admin&verified=true", admin).without("data", "stats"));
            r.rec("unverify admin", s.post("/api/admin/verify-member/" + idA, Map.of("status", 0), admin));
            r.rec("one user after", s.get("/api/admin/users/" + idA, admin));
        });

        compare("old dashboard referral code", (s, r) -> {
            Resp a = regOk(s, reg("Zq" + s.tag + " Old Code", s.phone(), null));
            String idA = a.json().get("member").get("id").asText();
            r.rec("verify CM- code", s.get("/api/auth/referrals/verify/CM-" + idA, null));
            r.rec("verify cm- lower", s.get("/api/auth/referrals/verify/cm-" + idA.toLowerCase(), null));
            r.rec("verify CM-M0", s.get("/api/auth/referrals/verify/CM-M0", null));
            r.rec("register with CM- code", regOk(s, reg("Zq" + s.tag + " Via Old Code", s.phone(), null, "referredBy", "CM-" + idA)));
        });

        compare("media", (s, r) -> {
            Resp m = regOk(s, reg("Zq" + s.tag + " Photo", s.phone(), null));
            String token = tokenOf(m);
            String memberId = m.json().get("member").get("id").asText();
            byte[] jpeg = fakeImage("jpeg", 200, null);

            Resp post = sendBytes("POST", s.base + "/api/media/post", jpeg, "image/jpeg", null);
            r.rec("post photo, visitor", post);
            r.rec("png", sendBytes("POST", s.base + "/api/media/post", fakeImage("png", 120, null), "application/octet-stream", token));
            r.rec("webp, no content type", sendBytes("POST", s.base + "/api/media/banner", fakeImage("webp", 100, null), null, token));
            r.rec("via /media path", sendBytes("POST", s.base + "/media/post", jpeg, "image/jpeg", token));
            r.rec("profile no login", sendBytes("POST", s.base + "/api/media/profile", jpeg, "image/jpeg", null));
            r.rec("profile bad token", sendBytes("POST", s.base + "/api/media/profile", jpeg, "image/jpeg", "x.y.z"));
            r.rec("profile", sendBytes("POST", s.base + "/api/media/profile", jpeg, "image/jpeg", token));
            r.rec("member shows photo", s.get("/api/members/" + memberId, token));
            r.rec("bad kind", sendBytes("POST", s.base + "/api/media/avatar", jpeg, "image/jpeg", token));
            r.rec("empty body", sendBytes("POST", s.base + "/api/media/post", new byte[0], "image/jpeg", token));
            r.rec("too small", sendBytes("POST", s.base + "/api/media/post", fakeImage("jpeg", 20, null), "image/jpeg", token));
            r.rec("not an image", sendBytes("POST", s.base + "/api/media/post", fakeImage("text", 200, null), "image/jpeg", token));
            r.rec("hidden script", sendBytes("POST", s.base + "/api/media/post", fakeImage("jpeg", 200, "<script>alert(1)"), "image/jpeg", token));
            r.rec("hidden php", sendBytes("POST", s.base + "/api/media/post", fakeImage("png", 200, "<?php echo"), "image/png", token));
            r.rec("too large", sendBytes("POST", s.base + "/api/media/post", fakeImage("jpeg", 5 * 1024 * 1024 + 10, null), "image/jpeg", token));
            r.rec("too large, bad kind", sendBytes("POST", s.base + "/api/media/avatar", fakeImage("jpeg", 5 * 1024 * 1024 + 10, null), "image/jpeg", token));
            r.rec("exactly 5 MB", sendBytes("POST", s.base + "/api/media/post", fakeImage("jpeg", 5 * 1024 * 1024, null), "image/jpeg", token));
            r.rec("json body", sendBytes("POST", s.base + "/api/media/post", "{\"a\":1}".getBytes(StandardCharsets.UTF_8), "application/json", token));
            r.rec("broken json body", sendBytes("POST", s.base + "/api/media/post", "{ oops".getBytes(StandardCharsets.UTF_8), "application/json", token));

            String id = post.json().get("id").asText();
            HttpResponse<byte[]> img = fetchBytes(s.base + "/api/media/" + id);
            assertThat(img.statusCode()).isEqualTo(200);
            assertThat(img.body()).as(s.name + " serves the uploaded bytes unchanged").isEqualTo(jpeg);
            for (String h : List.of("content-type", "x-content-type-options", "content-security-policy",
                    "content-disposition", "cache-control", "cross-origin-resource-policy", "content-length")) {
                r.rec("image header " + h, new Resp(200, img.headers().firstValue(h).orElse("<missing>"),
                    JsonNodeFactory.instance.textNode(img.headers().firstValue(h).orElse("<missing>").toLowerCase().replace(" ", ""))));
            }
            assertThat(fetchBytes(s.base + "/media/" + id.toUpperCase() + ".jpg").body()).as(s.name + " /media/ID.jpg").isEqualTo(jpeg);
            r.rec("image bad id", s.get("/api/media/xyz", null));
            r.rec("image traversal", s.get("/api/media/..%2F..%2Fetc%2Fpasswd", null));
            r.rec("image unknown", s.get("/api/media/" + "0".repeat(32), null));

            r.rec("delete profile no login", s.delete("/api/media/profile", null, null));
            r.rec("delete profile", s.delete("/api/media/profile", null, token));
            r.rec("member photo removed", s.get("/api/members/" + memberId, token));
        });

        // Adding a business needs a login in Java (Node lets anyone add one), so the businesses are put into the
        // shared database directly; creating them is tested in BusinessOwnershipTest.
        JdbcTemplate bizSeed = new JdbcTemplate(dataSource());
        for (String t : List.of("n", "j")) {
            String dist = "Zq" + t;
            String[][] rows = {
                {"GZ" + t + "B1", dist + " Mess", "Shinde", "restaurant", "[\"Thali\",\"Catering\"]", "9800000000"},
                {"GZ" + t + "B2", dist + " Soft", "Patil", "it", "[\"Apps\"]", ""},
                {"GZ" + t + "B3", dist + " Shop", "More", "retail", "[]", ""}};
            for (String[] row : rows) {
                bizSeed.update("INSERT INTO businesses (id, name, owner, cat, city, district, photo, phone, whatsapp, website, hours, services, offers, rating, created_at, owner_id, status) "
                    + "VALUES (?, ?, ?, ?, 'पुणे', ?, '🏢', ?, '', '', 'सकाळी ९ ते रात्री ८', ?, '', 5.0, '2026-01-01 10:00:00', NULL, 'visible') ON CONFLICT DO NOTHING",
                    row[0], row[1], row[2], row[3], dist, row[5], row[4]);
            }
        }
        compare("businesses", (s, r) -> {
            String d = "Zq" + s.tag; // this server's own district, so lists don't mix
            String id = "GZ" + s.tag + "B1";
            r.rec("review", s.post("/api/businesses/" + id + "/reviews", Map.of("member_name", "Rao", "rating", "4", "text", "छान")));
            r.rec("review defaults", s.post("/api/businesses/" + id + "/reviews", Map.of()));
            r.rec("detail with reviews", s.get("/api/businesses/" + id, null));
            r.rec("detail missing", s.get("/api/businesses/B0", null));
            r.rec("list district", s.get("/api/businesses?district=" + d, null));
            r.rec("list cat", s.get("/api/businesses?district=" + d + "&cat=it", null));
            r.rec("list cat all", s.get("/api/businesses?district=" + d + "&cat=all", null));
            r.rec("list search service", s.get("/api/businesses?district=" + d + "&search=catering", null));
        });

        compare("events", (s, r) -> {
            String d = "Zq" + s.tag;
            r.rec("create missing venue", s.post("/api/events", Map.of("title", "Melava", "date", "2026-12-01")));
            Resp e1 = s.post("/api/events", Map.of("title", "Zq" + s.tag + " Melava", "date", "2026-12-05", "venue", "Pune", "district", d));
            r.rec("create", e1);
            r.rec("create earlier", s.post("/api/events", Map.of("title", "Zq" + s.tag + " Shivjayanti", "date", "2026-02-19",
                "venue", "Raigad", "district", d, "category", "festival", "desc", "जयंती")));
            String id = e1.json().get("event").get("id").asText();
            r.rec("rsvp default seat", s.post("/api/events/" + id + "/rsvp", Map.of()));
            r.rec("rsvp 3 seats text", s.post("/api/events/" + id + "/rsvp", Map.of("seats", "3", "member_name", "Rao")));
            r.rec("rsvp 2.7 seats", s.post("/api/events/" + id + "/rsvp", Map.of("seats", 2.7)));
            r.rec("rsvp bad seats", s.post("/api/events/" + id + "/rsvp", Map.of("seats", "many")));
            r.rec("rsvp unknown event", s.post("/api/events/EZ" + s.tag + "/rsvp", Map.of()));
            r.rec("detail", s.get("/api/events/" + id, null));
            r.rec("detail missing", s.get("/api/events/E0", null));
            r.rec("list district (date order)", s.get("/api/events?district=" + d, null));
            r.rec("list category", s.get("/api/events?district=" + d + "&category=festival", null));
        });

        JdbcTemplate seed = new JdbcTemplate(dataSource());
        for (String t : List.of("n", "j")) {
            seed.update("INSERT INTO campaigns (id, cat, title, target, collected, donors, \"desc\", active, created_at) "
                + "VALUES (?, 'fort', ?, 500000, 1000.5, 3, 'test', 1, '2026-01-01 00:00:00') ON CONFLICT DO NOTHING",
                "GZ" + t + "C", "Zq" + t + " Fort Campaign");
        }
        compare("donations", (s, r) -> {
            String cid = "GZ" + s.tag + "C";
            r.rec("campaign detail before", s.get("/api/donations/campaigns/" + cid, null));
            r.rec("campaign missing", s.get("/api/donations/campaigns/C0", null));
            r.rec("donate no amount", s.post("/api/donations/donate", Map.of("campaign_id", cid)));
            r.rec("donate zero", s.post("/api/donations/donate", Map.of("campaign_id", cid, "amount", 0)));
            r.rec("donate negative", s.post("/api/donations/donate", Map.of("campaign_id", cid, "amount", "-5")));
            r.rec("donate words", s.post("/api/donations/donate", Map.of("campaign_id", cid, "amount", "lots")));
            r.rec("donate 500", s.post("/api/donations/donate", Map.of("campaign_id", cid, "campaign_title", "Zq" + s.tag + " Fort",
                "donor_name", "Rao", "amount", 500)));
            r.rec("donate 12.5abc anonymous", s.post("/api/donations/donate", Map.of("campaign_id", cid, "amount", "12.5abc",
                "is_anonymous", true, "donor_name", "Hidden")));
            r.rec("donate without campaign", s.post("/api/donations/donate", Map.of("amount", 1)));
            r.rec("campaign detail after", s.get("/api/donations/campaigns/" + cid, null));
            Resp list = s.get("/api/donations/campaigns", null);
            assertThat(list.raw()).as(s.name + " active campaigns").contains(cid);
            assertThat(s.get("/api/donations/recent", null).json().get("count").asInt()).isGreaterThan(0);
        });

        compare("sangam", (s, r) -> {
            String z = "Zq" + s.tag;
            String giver = z + "-giver";
            JdbcTemplate db = new JdbcTemplate(dataSource());
            String tokenUser = jwt.generate(z + "-tok", "Token User", "member", "Gold");
            String requester = jwt.generate(z + "-a", "Req A", "member", "Gold");
            String recipient = jwt.generate(z + "-b", "", "member", "Gold");
            String stranger = jwt.generate(z + "-x", "Stranger", "member", "Gold");
            String admin = jwt.generate(z + "-admin", "Admin", "admin", "Gold");
            String superadmin = jwt.generate(z + "-super", "Super", "superadmin", "Gold");

            // Referrals are private and checked in Java (login, real receiver, receiver-only status) but open in Node, so
            // their requests are not compared; ReferralEndpointsTest covers them. Rows are seeded so the totals below still compare.
            for (int i = 1; i <= 3; i++) {
                db.update("INSERT INTO referrals (id, title, category, giver_id, giver_name, recipient_id, recipient_name, client_name, client_phone, client_email, status, value, notes, created_at) "
                    + "VALUES (?, ?, 'x', ?, 'Giver', ?, 'Receiver', 'Client', '9800000002', '', ?, ?, '', '2026-01-01 10:00:00') ON CONFLICT DO NOTHING",
                    "GZ" + s.tag + "R" + i, "Seed " + i, giver, z + "-r", i == 1 ? "Deal Won" : "New", i == 1 ? 50000 : 0);
            }

            // Meetings are private and checked in Java (login, real partner, receiver-only answers) but open in Node, so their
            // requests are not compared; MeetingEndpointsTest covers them.

            Resp metrics = s.get("/api/sangam/metrics", null);
            assertThat(metrics.json().get("metrics").get("totalReferrals").asInt()).as(s.name + " sangam totals").isGreaterThanOrEqualTo(3);
            r.rec("metrics shape", metrics.without("metrics", "totalReferrals").without("metrics", "wonDeals")
                .without("metrics", "totalBusinessValue").without("metrics", "totalMeetings"));
        });

        compare("directories", (s, r) -> {
            String z = "Zq" + s.tag;
            JdbcTemplate db = new JdbcTemplate(dataSource());
            String owner = jwt.generate(z + "-owner", "Owner", "member", "Gold");
            String farmer = jwt.generate(z + "-farmer", "Farmer", "member", "Gold");
            String stranger = jwt.generate(z + "-x", "Stranger", "member", "Gold");
            String admin = jwt.generate(z + "-admin", "Admin", "admin", "Gold");
            String superadmin = jwt.generate(z + "-super", "Super", "superadmin", "Gold");

            // builders
            r.rec("builder bad phone", s.post("/api/builders", Map.of("developer", z + " Dev", "phone", "12345")));
            r.rec("builder phone not text", s.post("/api/builders", Map.of("developer", z + " Dev", "phone", 9876543210L)));
            r.rec("builder bad type", s.post("/api/builders", Map.of("phone", "9876543210", "projectType", "castle")));
            r.rec("builder empty type", s.post("/api/builders", Map.of("phone", "9876543210", "projectType", "")));
            r.rec("builder bad flats", s.post("/api/builders", Map.of("phone", "9876543210", "flatsDelivered", "-2")));
            r.rec("builder amenities not list", s.post("/api/builders", Map.of("phone", "9876543210", "amenities", "Gym")));
            r.rec("builder too many amenities", s.post("/api/builders", Map.of("phone", "9876543210",
                "amenities", java.util.Collections.nCopies(13, "Gym"))));
            r.rec("builder bad discount", s.post("/api/builders", Map.of("phone", "9876543210", "memberDiscountPercent", 11)));
            Resp b1 = s.post("/api/builders", Map.of("developer", z + " Developers", "phone", "+91 98765 43210", "city", "Pune",
                "projectType", "VILLAS", "flatsDelivered", "120", "amenities", List.of(" Gym ", "", "Pool"), "reraNumber", " P5210 ",
                "memberDiscountPercent", "2.5", "ownerName", "Patil"), owner);
            r.rec("builder create", b1);
            r.rec("builder defaults", s.post("/api/builders", Map.of("phone", "09876543211", "ownerId", z + "-body-owner", "desc", 42)));
            String bid = b1.json().get("builder").get("id").asText();
            r.rec("builder detail", s.get("/api/builders/" + bid, null));
            r.rec("builder missing", s.get("/api/builders/BLD-none", null));
            r.rec("builder via short path", s.get("/builders/" + bid, null));
            r.rec("builders/products is a builder id", s.get("/api/builders/products", null));
            r.rec("enquiry missing builder", s.post("/api/builders/BLD-none/enquiries", Map.of("name", "A", "phone", "9876543210")));
            r.rec("enquiry no name", s.post("/api/builders/" + bid + "/enquiries", Map.of("phone", "9876543210")));
            r.rec("enquiry bad phone", s.post("/api/builders/" + bid + "/enquiries", Map.of("name", "Ravi", "phone", "1")));
            r.rec("enquiry", s.post("/api/builders/" + bid + "/enquiries", Map.of("name", " Ravi ", "phone", "9876500000",
                "budget", 7500000, "message", " 2BHK "), farmer));

            // dairy centres
            r.rec("dairy no name", s.post("/api/dairy", Map.of("district", "Satara", "contact", "9876543210")));
            r.rec("dairy no district", s.post("/api/dairy", Map.of("dairyName", "X", "contact", "9876543210")));
            r.rec("dairy bad contact", s.post("/api/dairy", Map.of("dairyName", "X", "district", "Satara", "contact", "123")));
            Resp d1 = s.post("/api/dairy", Map.of("dairyName", z + " Dudh Kendra", "district", " Satara ", "village", "Wai",
                "contact", "9876543212", "facilities", "BMC, Testing, ", "registeredFarmers", "40", "milkRateCow", 35), owner);
            r.rec("dairy create", d1);
            r.rec("dairy create list facilities", s.post("/api/dairy", Map.of("dairyName", z + " Second", "district", "Pune",
                "contact", "9876543213", "facilities", List.of(" Cold store ", ""), "registeredFarmers", "many")));
            String did = d1.json().get("dairy").get("id").asText();
            r.rec("dairy detail", s.get("/api/dairy/" + did, null));
            r.rec("dairy missing", s.get("/api/dairy/DRY-none", null));
            r.rec("dairy list by search", s.get("/api/dairy?search=" + z, null));
            r.rec("dairy list district + search", s.get("/api/dairy?search=" + z + "&district=wai", null));
            r.rec("dairy list kind", s.get("/api/dairy?search=" + z + "&kind=centre", null));
            r.rec("dairy list kind none", s.get("/api/dairy?search=" + z + "&kind=union", null));

            // products
            r.rec("product no login", s.post("/api/dairy/products", Map.of("name", "Milk", "price", 60)));
            r.rec("product no name", s.post("/api/dairy/products", Map.of("price", 60), owner));
            r.rec("product bad price", s.post("/api/dairy/products", Map.of("name", "Milk", "price", "free"), owner));
            r.rec("product stranger without centre", s.post("/api/dairy/products", Map.of("name", "Milk", "price", 60), stranger));
            r.rec("product stranger for centre", s.post("/api/dairy/products", Map.of("name", "Milk", "price", 60, "sellerId", did), stranger));
            r.rec("product unknown centre", s.post("/api/dairy/products", Map.of("name", "Milk", "price", 60, "sellerId", "DRY-none"), owner));
            Resp p1 = s.post("/api/dairy/products", Map.of("name", " A2 Milk ", "price", "60.5", "category", "दूध", "packSize", "1 L"), owner);
            r.rec("product by owner", p1);
            r.rec("product by admin for centre", s.post("/api/dairy/products", Map.of("name", "Ghee", "price", 0, "category", "ghee",
                "sellerId", did, "available", false), admin));
            r.rec("product superadmin is not admin", s.post("/api/dairy/products", Map.of("name", "Curd", "price", 30), superadmin));
            r.rec("products of centre", s.get("/api/dairy/products?sellerId=" + did, null));
            r.rec("products of centre, milk", s.get("/api/dairy/products?sellerId=" + did + "&category=दूध", null));
            r.rec("products of centre, search", s.get("/api/dairy/products?sellerId=" + did + "&search=ghee", null));
            String pid = p1.json().get("product").get("id").asText();
            r.rec("product enquiry missing", s.post("/api/dairy/products/PROD-none/enquiries", Map.of("name", "A", "phone", "9876543210")));
            r.rec("product enquiry", s.post("/api/dairy/products/" + pid + "/enquiries", Map.of("name", "Sunita", "phone", "9876500001",
                "quantity", 5), farmer));

            // registrations
            r.rec("register no login", s.post("/api/dairy/" + did + "/registrations", Map.of("farmerName", "A", "phone", "9876543210")));
            r.rec("register missing centre", s.post("/api/dairy/DRY-none/registrations", Map.of("farmerName", "A", "phone", "9876543210"), farmer));
            r.rec("register no name", s.post("/api/dairy/" + did + "/registrations", Map.of("phone", "9876543210"), farmer));
            r.rec("register", s.post("/api/dairy/" + did + "/registrations", Map.of("farmerName", " Shankar ", "phone", "9876500002",
                "cattleCount", "6", "milkType", "Buffalo", "expectedDailyLitres", 25.5), farmer));
            r.rec("register again", s.post("/api/dairy/" + did + "/registrations", Map.of("farmerName", "Shankar", "phone", "9876500002"), farmer));
            r.rec("registrations stranger", s.get("/api/dairy/" + did + "/registrations", stranger));
            r.rec("registrations owner", s.get("/api/dairy/" + did + "/registrations", owner));
            r.rec("registrations admin", s.get("/api/dairy/" + did + "/registrations", admin));
            r.rec("registrations missing", s.get("/api/dairy/DRY-none/registrations", admin));

            // the shared enquiry limit (10 per 15 minutes): 7 counted calls so far
            Resp last = null;
            for (int i = 8; i <= 11; i++) {
                last = s.post("/api/builders/" + bid + "/enquiries", Map.of("name", "N" + i, "phone", "9876500009"));
                r.rec("limit call " + i, last);
            }
            assertThat(last.status()).as(s.name + " 11th enquiry in 15 minutes is refused").isEqualTo(429);

            Integer notes = db.queryForObject("SELECT COUNT(*) FROM notifications WHERE member_id = ?", Integer.class, z + "-owner");
            String text = "owner notifications=" + notes;
            r.rec("owner notifications", new Resp(200, text, JsonNodeFactory.instance.textNode(text)));
            assertThat(s.get("/api/builders", null).json().get("count").asInt()).as(s.name + " builders incl. copied db.json")
                .isGreaterThanOrEqualTo(12);
        });

        JdbcTemplate places = new JdbcTemplate(dataSource());
        places.execute("""
            INSERT INTO countries (id, name, code) VALUES ('ZZC1', 'Zeta Land', 'ZZ1'), ('ZZC2', 'Alpha Land', 'ZZ2') ON CONFLICT DO NOTHING;
            INSERT INTO states (id, country_id, name, code) VALUES ('ZZS1', 'ZZC1', 'Sahyadri', 'S1'), ('ZZS2', 'ZZC1', 'Konkan', 'S2') ON CONFLICT DO NOTHING;
            INSERT INTO districts (id, state_id, name, code) VALUES ('ZZD1', 'ZZS1', 'Satara', 'D1') ON CONFLICT DO NOTHING;
            INSERT INTO talukas (id, district_id, name, code) VALUES ('ZZT1', 'ZZD1', 'Wai', 'T1') ON CONFLICT DO NOTHING;
            INSERT INTO villages (id, taluka_id, name, code) VALUES ('ZZV1', 'ZZT1', 'Bavdhan', 'V1'), ('ZZV2', 'ZZT1', 'Asle', NULL),
              ('ZZV3', 'ZZT1', 'Pasarni', 'V3') ON CONFLICT DO NOTHING;
            INSERT INTO quiz_questions (question_id, category, difficulty, question_type, question, option_a, option_b, option_c,
              option_d, correct_answer, explanation, year) VALUES
              ('ZQ1', 'Chhatrapati Shivaji Maharaj', 'easy', 'mcq', 'Q1', 'a', 'b', 'c', 'd', 'a', 'e1', 1674),
              ('ZQ2', 'Chhatrapati Shivaji Maharaj', 'hard', 'mcq', 'Q2', 'a', 'b', 'c', 'd', 'b', 'e2', NULL),
              ('ZQ3', 'Maratha Navy', 'medium', 'true_false', 'Q3', 'a', 'b', 'c', 'd', 'c', 'e3', 1700) ON CONFLICT DO NOTHING;
            """);
        compare("locations", (s, r) -> {
            r.rec("countries", s.get("/api/locations/countries", null));
            r.rec("states no country", s.get("/api/locations/states", null));
            r.rec("states unknown country", s.get("/api/locations/states?countryId=NOPE", null));
            r.rec("states", s.get("/api/locations/states?countryId=ZZC1", null));
            r.rec("states none", s.get("/api/locations/states?countryId=ZZC2", null));
            r.rec("districts", s.get("/api/locations/districts?stateId=ZZS1", null));
            r.rec("districts no state", s.get("/api/locations/districts", null));
            r.rec("districts unknown state", s.get("/api/locations/districts?stateId=NOPE", null));
            r.rec("talukas", s.get("/api/locations/talukas?districtId=ZZD1", null));
            r.rec("talukas unknown", s.get("/api/locations/talukas?districtId=NOPE", null));
            r.rec("villages", s.get("/api/locations/villages?talukaId=ZZT1", null));
            r.rec("villages no taluka", s.get("/api/locations/villages", null));
            r.rec("villages unknown taluka", s.get("/api/locations/villages?talukaId=NOPE", null));
            r.rec("villages search", s.get("/api/locations/villages?talukaId=ZZT1&search=%20as%20", null));
            r.rec("villages page 2 of 2", s.get("/api/locations/villages?talukaId=ZZT1&limit=2&page=2", null));
            r.rec("villages bad limit", s.get("/api/locations/villages?talukaId=ZZT1&limit=abc&page=-3", null));
            r.rec("villages limit 0", s.get("/api/locations/villages?talukaId=ZZT1&limit=0", null));
        });

        compare("quiz", (s, r) -> {
            r.rec("stats", s.get("/api/quiz/stats", null));
            r.rec("categories", s.get("/api/quiz/categories", null));
            r.rec("questions all", s.get("/api/quiz/questions", null));
            r.rec("questions marathi category", s.get("/api/quiz/questions?category=" + java.net.URLEncoder.encode("छत्रपती शिवराय व स्वराज्य", StandardCharsets.UTF_8), null));
            r.rec("questions partial category", s.get("/api/quiz/questions?category=navy", null));
            r.rec("questions difficulty marathi", s.get("/api/quiz/questions?difficulty=" + java.net.URLEncoder.encode("प्रगत", StandardCharsets.UTF_8), null));
            r.rec("questions type", s.get("/api/quiz/questions?type=true_false", null));
            r.rec("questions random 10", s.get("/api/quiz/questions?count=10", null));
            r.rec("questions count bad", s.get("/api/quiz/questions?count=abc", null));
            r.rec("questions ALL", s.get("/api/quiz/questions?category=ALL&difficulty=सर्व&type=all&count=all", null));
            Resp one = s.get("/api/quiz/questions?count=1", null);
            assertThat(one.json().get("count").asInt()).as(s.name + " count=1").isEqualTo(1);
            r.rec("daily", s.get("/api/quiz/daily", null));
            r.rec("submit", s.post("/api/quiz/submit", Map.of("candidate_name", "Zq" + s.tag + " Mavla", "score", 7, "total", 10, "points", 70)));
            r.rec("submit defaults", s.post("/api/quiz/submit", Map.of()));
            r.rec("submit text numbers, round half", s.post("/api/quiz/submit", Map.of("score", "1", "total", "8", "points", "5")));
            Map<String, Object> nulls = new LinkedHashMap<>();
            nulls.put("category", null);
            nulls.put("total", null);
            r.rec("submit nulls", s.post("/api/quiz/submit", nulls));
            r.rec("submit bad score", s.post("/api/quiz/submit", Map.of("score", "lots")));
            r.rec("submit decimal points", s.post("/api/quiz/submit", Map.of("points", 7.5)));
            assertThat(s.get("/api/quiz/leaderboard", null).raw()).as(s.name + " leaderboard").contains("Zq" + s.tag + " Mavla");
        });

        compare("culture", (s, r) -> {
            r.rec("add missing story", s.post("/api/culture/oral-history", Map.of("title", "T", "village", "V")));
            r.rec("add", s.post("/api/culture/oral-history", Map.of("title", "Zq" + s.tag + " Vihir", "village", "Pachad",
                "story", "Old well", "district", "Raigad", "contributor", "Bal More")));
            r.rec("add minimal", s.post("/api/culture/oral-history", Map.of("title", 42, "village", "Wai", "story", "Story")));
            r.rec("add empty district", s.post("/api/culture/oral-history", Map.of("title", "X", "village", "Y", "story", "Z", "district", "")));
            Resp list = s.get("/api/culture/oral-history", null);
            assertThat(list.raw()).as(s.name + " oral history list").contains("Zq" + s.tag + " Vihir");
            int count = list.json().get("count").asInt();
            assertThat(s.get("/api/culture/stats", null).json().get("stats").get("totalOralHistories").asInt()).isEqualTo(count);
            r.rec("stats shape", s.get("/api/culture/stats", null).without("stats", "totalOralHistories"));
        });

        compare("services", (s, r) -> {
            String z = "Zq" + s.tag;
            String member = jwt.generate(z + "-m", "Member Name", "member", "Gold");
            String admin = jwt.generate(z + "-a", "Admin", "admin", "Gold");
            String ceo = jwt.generate(z + "-c", "Ceo", "ceo", "Gold");

            r.rec("booking nothing", s.post("/api/services/booking", Map.of()));
            r.rec("booking no phone", s.post("/api/services/booking", Map.of("serviceCategory", "Legal")));
            r.rec("booking bad phone", s.post("/api/services/booking", Map.of("serviceCategory", "Legal", "phone", "12345")));
            r.rec("booking guest", s.post("/api/services/booking", Map.of("serviceCategory", "<b>Legal</b>", "phone", "+91 98765-43210",
                "customerName", "Ravi", "requirementNotes", " need <script>x</script>help ")));
            r.rec("booking logged in", s.post("/api/services/booking", Map.of("serviceCategory", "CA", "phone", "9876543210",
                "professionalName", "CA Joshi", "address", "Pune", "requestedDate", "tomorrow"), member));

            r.rec("admin list no login", s.get("/api/admin/services", null));
            r.rec("admin list member", s.get("/api/admin/services", member));
            r.rec("admin create missing", s.post("/api/admin/services", Map.of("name", "Only name"), admin));
            Resp s1 = s.post("/api/admin/services", Map.of("name", z + " Adv Patil", "category", "Legal", "location", "Satara",
                "phone", "9876500011", "experience", "10 yrs", "pricing", "<i>500</i>/visit", "description", "Property law"), ceo);
            r.rec("admin create", s1);
            r.rec("admin create 2", s.post("/api/admin/services", Map.of("name", z + " Electrician", "category", "Electric"), admin));
            String sid = s1.json().get("service").get("id").asText();
            r.rec("update missing", s.req("PUT", "/api/admin/services/SRV-NONE", Map.of("name", "X"), admin));
            r.rec("update partial", s.req("PUT", "/api/admin/services/" + sid, Map.of("pricing", "700", "status", "hidden"), admin));
            r.rec("update bad status ignored", s.req("PUT", "/api/admin/services/" + sid, Map.of("status", "deleted"), admin));
            Map<String, Object> nullName = new LinkedHashMap<>();
            nullName.put("name", null);
            r.rec("update null name", s.req("PUT", "/api/admin/services/" + sid, nullName, admin));
            r.rec("update back", s.req("PUT", "/api/admin/services/" + sid, Map.of("name", z + " Adv Patil", "status", "active"), admin));

            Resp pub = s.get("/api/services", null);
            assertThat(pub.raw()).as(s.name + " public list").contains("Adv Patil");
            Resp adm = s.get("/api/admin/services", admin);
            assertThat(adm.json().get("count").asInt()).as(s.name + " admin list").isGreaterThanOrEqualTo(2);
            r.rec("public list shape", pub.withoutTop("services").withoutTop("count").without("data", "services").without("data", "count"));
            r.rec("delete", s.delete("/api/admin/services/" + sid, null, admin));
            r.rec("delete again", s.delete("/api/admin/services/" + sid, null, admin));
            assertThat(s.get("/api/admin/services", admin).raw()).as(s.name + " after delete").doesNotContain(sid);
        });

        compare("crm", (s, r) -> {
            String z = "Zq" + s.tag;
            String member = jwt.generate(z + "-m", "Member Name", "member", "Gold");
            String other = jwt.generate(z + "-o", "Other", "member", "Gold");
            String staff = jwt.generate(z + "-s", "Desk Staff", "helpdesk", "Gold");
            String admin = jwt.generate(z + "-a", "Admin", "admin", "Gold");

            r.rec("ticket no login", s.post("/api/crm/tickets", Map.of("title", "T", "description", "D")));
            r.rec("ticket missing", s.post("/api/crm/tickets", Map.of("title", "T"), member));
            Resp t1 = s.post("/api/crm/tickets", Map.of("title", " <b>Water</b> problem ", "description", "No water", "priority", "High",
                "district", z, "category", "Civic", "requesterPhone", "09876543210"), member);
            r.rec("ticket high", t1);
            r.rec("ticket default priority", s.post("/api/crm/tickets", Map.of("title", "Light", "description", "Dark", "priority", "Urgent", "district", z), member));
            r.rec("ticket critical", s.post("/api/crm/tickets", Map.of("title", "Fire", "description", "Help", "priority", "Critical", "district", z,
                "requesterName", "Ignored"), other));
            String tid = t1.json().get("data").get("id").asText();
            r.rec("member sees only own", s.get("/api/crm/tickets?district=" + z, member));
            r.rec("other sees only own", s.get("/api/crm/tickets?district=" + z, other));
            r.rec("staff sees all", s.get("/api/crm/tickets?district=" + z, staff));
            r.rec("staff filter priority", s.get("/api/admin/crm/tickets?district=" + z + "&priority=Critical", staff));
            r.rec("staff filter status", s.get("/api/crm/tickets?district=" + z + "&status=Resolved", staff));
            r.rec("list no login", s.get("/api/crm/tickets", null));

            r.rec("escalate member refused", s.req("PATCH", "/api/crm/tickets/" + tid + "/escalate", Map.of(), member));
            r.rec("escalate missing", s.req("PATCH", "/api/crm/tickets/TKT-NONE/escalate", Map.of(), staff));
            r.rec("escalate 1", s.req("PATCH", "/api/crm/tickets/" + tid + "/escalate", Map.of("reason", " <i>Unresolved</i> "), staff));
            r.rec("escalate 2", s.req("PATCH", "/api/crm/tickets/" + tid + "/escalate", Map.of(), staff));
            r.rec("escalate 3", s.req("PATCH", "/api/crm/tickets/" + tid + "/escalate", Map.of(), admin));
            r.rec("escalate 4 stays at state", s.req("PATCH", "/api/crm/tickets/" + tid + "/escalate", Map.of(), staff));
            r.rec("status member refused", s.req("PATCH", "/api/crm/tickets/" + tid + "/status", Map.of("status", "Closed"), member));
            r.rec("status invalid", s.req("PATCH", "/api/crm/tickets/" + tid + "/status", Map.of("status", "Done"), staff));
            r.rec("status not text", s.req("PATCH", "/api/crm/tickets/" + tid + "/status", Map.of("status", 5), staff));
            r.rec("status missing ticket", s.req("PATCH", "/api/crm/tickets/TKT-NONE/status", Map.of("status", "Closed"), staff));
            r.rec("status resolved", s.req("PATCH", "/api/crm/tickets/" + tid + "/status", Map.of("status", "Resolved", "note", " fixed <b>now</b> "), staff));
            r.rec("member reads resolved ticket", s.get("/api/crm/tickets?district=" + z + "&status=Resolved", member));

            r.rec("centers create no login", s.post("/api/crm/community-centers", Map.of("name", "Seva")));
            r.rec("centers create staff refused", s.post("/api/crm/community-centers", Map.of("name", "Seva"), staff));
            r.rec("centers create no name", s.post("/api/crm/community-centers", Map.of("district", z), admin));
            Resp c1 = s.post("/api/crm/community-centers", Map.of("name", z + " Seva Kendra", "tier", "taluka", "district", z, "taluka", "Wai",
                "address", "Main road", "contactPerson", "Patil", "phone", "9876500022"), admin);
            r.rec("centers create", c1);
            String cid = c1.json().get("data").get("center").get("id").asText();
            r.rec("checkin no login", s.post("/api/crm/community-centers/" + cid + "/checkin", Map.of()));
            r.rec("checkin member refused", s.post("/api/crm/community-centers/" + cid + "/checkin", Map.of(), member));
            r.rec("checkin unknown", s.post("/api/crm/community-centers/CC-NONE/checkin", Map.of(), staff));
            r.rec("checkin", s.post("/api/crm/community-centers/" + cid + "/checkin", Map.of("visitorName", "Ram", "phone", "98765 00033", "purpose", "Cert"), staff));
            r.rec("checkin defaults", s.post("/api/crm/community-centers/" + cid + "/checkin", Map.of(), staff));
            r.rec("transaction member refused", s.post("/api/crm/community-centers/" + cid + "/transaction", Map.of("amount", 5), member));
            r.rec("transaction zero", s.post("/api/crm/community-centers/" + cid + "/transaction", Map.of("amount", 0), staff));
            r.rec("transaction negative", s.post("/api/crm/community-centers/" + cid + "/transaction", Map.of("amount", -5), staff));
            r.rec("transaction words", s.post("/api/crm/community-centers/" + cid + "/transaction", Map.of("amount", "abc"), staff));
            r.rec("transaction too large", s.post("/api/crm/community-centers/" + cid + "/transaction", Map.of("amount", 20000000), staff));
            r.rec("transaction none", s.post("/api/crm/community-centers/" + cid + "/transaction", Map.of(), staff));
            r.rec("transaction unknown", s.post("/api/crm/community-centers/CC-NONE/transaction", Map.of("amount", 5), staff));
            r.rec("transaction 500", s.post("/api/crm/community-centers/" + cid + "/transaction", Map.of("amount", 500, "payerName", "Rao"), staff));
            r.rec("transaction 12.5 text", s.post("/api/crm/community-centers/" + cid + "/transaction", Map.of("amount", "12.5", "category", "Donation"), admin));
            r.rec("centers list", s.get("/api/crm/community-centers?district=" + z, null));
            r.rec("centers list by tier", s.get("/api/admin/crm/community-centers?district=" + z + "&tier=taluka", null));
            r.rec("centers list other tier", s.get("/api/crm/community-centers?district=" + z + "&tier=state", null));
        });

        compare("portal lists", (s, r) -> {
            String z = "Zq" + s.tag;
            // doctors: strict input
            r.rec("doctor nothing", s.post("/api/doctors", Map.of()));
            r.rec("doctor unknown field", s.post("/api/doctors", Map.of("name", "Dr A", "specialty", "ENT", "id", "X1")));
            r.rec("doctor bad phone", s.post("/api/doctors", Map.of("name", "Dr A", "specialty", "ENT", "phone", "12")));
            r.rec("doctor", s.post("/api/doctors", Map.of("name", z + " Dr Patil", "specialty", "Cardio", "phone", "9876543210",
                "city", "Pune", "degree", "MD")));
            r.rec("doctor minimal", s.post("/api/doctors", Map.of("name", "Dr B", "specialty", "Skin")));
            // Blood requests and donors are a new design in Java (login, owners, closing): see BloodEndpointsTest.
            // The free-form lists (matrimony, grievances, volunteers, women, loans) are
            // deliberately stricter in Java: see PortalSecurityTest.

            for (String path : List.of("/api/doctors", "/api/social/volunteers")) {
                Resp list = s.get(path, null);
                assertThat(list.status()).as(s.name + " " + path).isEqualTo(200);
                assertThat(list.json().isArray()).as(s.name + " " + path + " is a plain list").isTrue();
            }
            assertThat(s.get("/api/doctors", null).raw()).as(s.name + " doctor listed").contains(z + " Dr Patil");
        });

        compare("ai assistant", (s, r) -> {
            String z = "Zq" + s.tag;
            String member = jwt.generate(z + "-m", "Member", "member", "Gold");
            r.rec("chat empty", s.post("/api/ai/chat", Map.of()));
            r.rec("chat blank", s.post("/api/ai/chat", Map.of("message", "   <b></b>  ")));
            r.rec("chat english", s.post("/api/ai/chat", Map.of("message", "tell me something", "language", "en")));
            r.rec("chat default language", s.post("/api/ai/chat", Map.of("message", "hello there")));
            r.rec("chat blood english", s.post("/api/ai/chat", Map.of("message", "Where can I donate blood?", "language", "en")));
            r.rec("chat blood marathi", s.post("/api/ai/chat", Map.of("message", "रक्त हवे आहे")));
            r.rec("chat blood hindi", s.post("/api/ai/chat", Map.of("message", "blood chahiye", "language", "hi")));
            r.rec("chat register", s.post("/api/ai/chat", Map.of("message", "how to register as member", "language", "en")));
            r.rec("chat register marathi", s.post("/api/ai/chat", Map.of("message", "सदस्य नोंदणी कशी करू", "language", "mr")));
            r.rec("chat sangam", s.post("/api/ai/chat", Map.of("message", "business b2b help", "language", "hi")));
            r.rec("chat detects marathi", s.post("/api/ai/chat", Map.of("message", "शिवाजी महाराजांचा इतिहास सांगा", "language", "en")));
            r.rec("chat detects hindi", s.post("/api/ai/chat", Map.of("message", "इतिहास बताओ क्या है", "language", "fr")));
            r.rec("chat other language", s.post("/api/ai/chat", Map.of("message", "plain question", "language", "fr")));
            r.rec("chat language number", s.post("/api/ai/chat", Map.of("message", "plain question", "language", 5)));
            Map<String, Object> nulls = new LinkedHashMap<>();
            nulls.put("message", "plain question");
            nulls.put("language", null);
            nulls.put("session_id", null);
            r.rec("chat null language and session", s.post("/api/ai/chat", nulls));
            r.rec("chat session", s.post("/api/ai/chat", Map.of("message", "hi", "session_id", "x".repeat(100))));

            r.rec("support no mobile", s.post("/api/ai/support", Map.of("issue", "App crashes")));
            r.rec("support bad mobile", s.post("/api/ai/support", Map.of("mobile", "123", "issue", "App crashes")));
            r.rec("support bad email", s.post("/api/ai/support", Map.of("mobile", "9876543210", "email", "nope", "issue", "App crashes")));
            r.rec("support no issue", s.post("/api/ai/support", Map.of("mobile", "9876543210")));
            r.rec("support guest", s.post("/api/ai/support", Map.of("mobile", "+91 98765 43210", "email", "a@b.co", "issue", "<b>App</b> crashes", "name", " Ravi ")));
            r.rec("support logged in", s.post("/api/ai/technical-support", Map.of("mobile", "9876543211", "issue", "x".repeat(300), "language", "english-long"), member));
            r.rec("health", s.get("/api/ai/health", null));
        });

        // Ids: Node used to pick one of only 90 business ids without checking, and failed (500) when it was taken.
        // Fill almost all of them, then both servers must still create businesses.
        JdbcTemplate crowded = new JdbcTemplate(dataSource());
        for (int n = 10; n <= 94; n++) {
            crowded.update("INSERT INTO businesses (id, name, owner, cat) VALUES (?, 'filler', 'x', 'x') ON CONFLICT DO NOTHING", "B" + n);
        }
        for (Srv server : List.of(
                new Srv("node", "http://127.0.0.1:" + NODE_PORT, "n"), new Srv("java", "http://127.0.0.1:" + javaPort, "j"))) {
            for (int i = 0; i < 3; i++) {
                // Java needs a login to add a business (Node ignores it)
                Resp created = server.post("/api/businesses", Map.of("name", "Crowded " + i, "owner", "O", "cat", "it"),
                    jwt.generate("M9599", "Test", "member", "Gold"));
                assertThat(created.status()).as(server.name + " creates a business even when most ids are taken").isEqualTo(201);
            }
        }

        // Cut-over case: both servers share one database, so accounts and tokens must work on either.
        Srv node = new Srv("node", "http://127.0.0.1:" + NODE_PORT, "n");
        Srv java = new Srv("java", "http://127.0.0.1:" + javaPort, "j");
        String nPhone = node.phone();
        Resp byNode = node.post("/api/auth/register", reg("Made By Node", nPhone, null));
        Resp javaLogin = java.post("/api/auth/login", Map.of("identifier", nPhone, "password", "Swarajya#2026"));
        assertThat(javaLogin.status()).as("Java logs in a member Node registered").isEqualTo(200);
        assertThat(java.get("/api/auth/me", tokenOf(byNode)).status()).as("Java accepts Node's token").isEqualTo(200);
        assertThat(node.get("/api/auth/me", tokenOf(javaLogin)).status()).as("Node accepts Java's token").isEqualTo(200);

        String jPhone = java.phone();
        Resp byJava = java.post("/api/auth/register", reg("Made By Java", jPhone, null));
        assertThat(node.post("/api/auth/login", Map.of("identifier", jPhone, "password", "Swarajya#2026")).status())
            .as("Node logs in a member Java registered").isEqualTo(200);
        assertThat(node.get("/api/auth/me", tokenOf(byJava)).status()).as("Node accepts Java's registration token").isEqualTo(200);
        // A referral made through one server is counted by the other.
        String refCode = byNode.json().get("member").get("reference_id").asText();
        java.post("/api/auth/register", reg("Referred On Java", java.phone(), null, "referral_code", refCode));
        Resp nodeView = node.get("/api/auth/referrals/my-referrals", tokenOf(byNode));
        assertThat(nodeView.json().get("total_referrals").asInt()).as("referral registered on Java shows on Node").isEqualTo(1);

        System.out.println("PARITY: compared " + compared + " replies, " + mismatches.size() + " differ");
        assertThat(mismatches).as("replies that differ between Node and Java:\n" + String.join("\n", mismatches)).isEmpty();
    }
}
