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
    private static final Pattern DATE_TIME = Pattern.compile("\\d{4}-\\d{2}-\\d{2}( \\d{2}:\\d{2}:\\d{2})?");
    private static final Pattern PHONE_MASKED = Pattern.compile("\\b\\d{4} •••••");
    private static final Pattern PHONE = Pattern.compile("\\b\\d{10}\\b");
    private static final Pattern PARITY_EMAIL = Pattern.compile("[A-Za-z0-9.]+@parity\\.test");
    private static final Pattern POST_ID = Pattern.compile("\\b(P|CMM)-\\d{10,}");
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
            body = new LinkedHashMap<>(body);
            body.put("phone", s.phone());
            body.put("email", s.email());
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
            Resp created = s.post("/api/auth/register", reg("Login Member", phone, email, "skills", "a, b"));
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
            Resp owner = s.post("/api/auth/register", reg("Ref Owner", s.phone(), null));
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
            Resp m1 = s.post("/api/auth/register", reg("Delete One", s.phone(), s.email()));
            String t1 = tokenOf(m1);
            r.rec("app delete no token", s.delete("/api/auth/account", Map.of("confirm", "DELETE"), null));
            r.rec("app delete no password", s.delete("/api/auth/account", Map.of("confirm", "DELETE"), t1));
            r.rec("app delete wrong password", s.delete("/api/auth/account", Map.of("confirm", "DELETE", "password", "wrong"), t1));
            r.rec("app delete bad confirm", s.delete("/api/auth/account", Map.of("confirm", "nope", "password", "Swarajya#2026"), t1));
            r.rec("app delete extra field", s.delete("/api/auth/account", Map.of("confirm", "DELETE", "password", "Swarajya#2026", "x", 1), t1));
            r.rec("app delete ok", s.delete("/api/auth/account", Map.of("confirm", "DELETE", "password", "Swarajya#2026"), t1));
            r.rec("deleted can't login", s.post("/api/auth/login", Map.of("identifier", m1.json().get("member").get("id").asText(), "password", "Swarajya#2026")));

            String phone = s.phone();
            Resp m2 = s.post("/api/auth/register", reg("Delete Two", phone, null));
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
