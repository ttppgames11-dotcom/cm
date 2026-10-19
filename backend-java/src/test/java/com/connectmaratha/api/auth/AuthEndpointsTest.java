package com.connectmaratha.api.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import com.connectmaratha.api.PostgresTestBase;
import com.connectmaratha.api.config.JwtService;
import com.connectmaratha.api.mail.MailService;
import com.connectmaratha.api.ratelimit.AuthRateLimiter;
import com.connectmaratha.api.ratelimit.RateLimitFilter;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

/** The 11 auth endpoints against a real PostgreSQL schema, with Node's replies as the expected result. */
@SpringBootTest(properties = {"app.rate-limit.auth-ip-max=1000", "app.rate-limit.public-max=100000"})
@AutoConfigureMockMvc
class AuthEndpointsTest extends PostgresTestBase {

    private static final String NODE_HASH_COST8 = "$2a$08$Zae3AcsrKIX2CdcClj.7tuAXsKIjvusfT/cGyFYXmMqpjHb7ZuJo."; // Swarajya#2026
    private static final String PASSWORD = "Swarajya#2026";

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired JwtService jwt;
    @Autowired AuthRateLimiter authLimiter;
    @Autowired RateLimitFilter rateLimit;
    @MockBean MailService mail;
    @MockBean GoogleTokenVerifier google;

    private final JdbcTemplate jdbc = new JdbcTemplate(dataSource());
    private int sequence = 0;

    @BeforeEach
    void clean() {
        authLimiter.reset();
        rateLimit.reset();
        reset(mail, google);
    }

    // ------------------------------------------------------------------ helpers

    private JsonNode call(MockHttpServletRequestBuilder req, int expectedStatus) throws Exception {
        MvcResult r = mvc.perform(req).andReturn();
        assertThat(r.getResponse().getStatus()).as(r.getResponse().getContentAsString()).isEqualTo(expectedStatus);
        return json.readTree(r.getResponse().getContentAsByteArray());
    }

    private MockHttpServletRequestBuilder postJson(String path, Object body) throws Exception {
        return post(path).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body));
    }

    private String uniquePhone() {
        sequence++;
        return "98" + String.format("%08d", (System.nanoTime() / 1000 + sequence) % 100000000);
    }

    private JsonNode register(Map<String, Object> body, int status) throws Exception {
        return call(postJson("/api/auth/register", body), status);
    }

    /** Inserts a member the way an older Node-written row looks (bcryptjs hash, no photo/interests set). */
    private String nodeMember(String id, String email, String phone) {
        jdbc.update("""
            INSERT INTO members (id, name, email, phone, password_hash, avatar, city, district, skills, about,
              tier, role, joined, created_at, reference_id, referral_id, total_referrals)
            VALUES (?, 'Node Member', ?, ?, ?, '👤', 'Pune', 'पुणे', '["Flutter","Node"]', '["line 1","line 2"]',
              'Gold', 'member', '2026-01-01', '2026-01-01 10:00:00', ?, ?, 0)""",
            id, email, phone, NODE_HASH_COST8, "REF-96K-" + id.substring(1), "REF-96K-" + id.substring(1));
        return id;
    }

    private String bearer(String id, String role) {
        return "Bearer " + jwt.generate(id, "Test", role, "Gold");
    }

    // ----------------------------------------------------------------- register

    @Test
    void registerCreatesAMemberWithTheNodeReplyShape() throws Exception {
        String phone = uniquePhone();
        JsonNode r = register(Map.of("name", "संभाजी राजे", "phone", phone, "email", "sambhaji" + phone + "@example.com",
            "password", PASSWORD, "city", "Pune", "skills", "Flutter, Node.js", "about", "समाज सेवक"), 201);

        assertThat(r.get("success").asBoolean()).isTrue();
        assertThat(r.get("message").asText()).isEqualTo("नोंदणी यशस्वी झाली!");
        JsonNode m = r.get("member");
        assertThat(m.get("id").asText()).matches("M\\d{4}");
        assertThat(m.get("reference_id").asText()).isEqualTo("REF-96K-" + m.get("id").asText().substring(1));
        assertThat(m.get("referral_id").asText()).isEqualTo(m.get("reference_id").asText());
        assertThat(m.get("tier").asText()).isEqualTo("Basic");
        assertThat(m.get("role").asText()).isEqualTo("member");
        assertThat(m.get("total_referrals").asInt()).isZero();
        assertThat(m.get("skills").asText()).isEqualTo("Flutter, Node.js");
        assertThat(m.get("about").asText()).isEqualTo("समाज सेवक");
        assertThat(m.get("district").asText()).isEqualTo("पुणे");      // default
        assertThat(m.get("state").asText()).isEqualTo("महाराष्ट्र");   // default
        assertThat(m.get("country").asText()).isEqualTo("भारत");      // default
        assertThat(m.has("password_hash")).isFalse();
        assertThat(m.has("interests")).isFalse(); // not in the register SELECT

        var claims = jwt.parse(r.get("token").asText()).orElseThrow();
        assertThat(claims.get("id")).isEqualTo(m.get("id").asText());
        assertThat(claims.get("tier")).isEqualTo("Basic");

        // Stored like Node stores it: bcrypt hash, DB defaults for the columns not inserted.
        Map<String, Object> row = jdbc.queryForMap("SELECT password_hash, status, verified_mobile, interests FROM members WHERE id = ?",
            m.get("id").asText());
        assertThat((String) row.get("password_hash")).startsWith("$2a$08$");
        assertThat(row.get("status")).isEqualTo("active");
        assertThat(row.get("verified_mobile")).isEqualTo(1);
        assertThat(row.get("interests")).isEqualTo("[]");
    }

    @Test
    void registerAcceptsAppAndWebsiteShapes() throws Exception {
        // Mobile app: strings. Website: arrays and "mobile"/"organization" names.
        JsonNode app = register(Map.of("name", "App User", "phone", uniquePhone(), "skills", "a, b",
            "interests", "Fort Conservation", "legalCompliance", Map.of("termsAccepted", true)), 201);
        assertThat(app.get("member").get("skills").asText()).isEqualTo("a, b");

        JsonNode web = register(Map.of("name", "Web User", "mobile", uniquePhone(), "organization", "Swarajya IT",
            "skills", java.util.List.of("Go", " Java ", ""), "about", java.util.List.of("one", "two"),
            "interests", java.util.List.of("Forts")), 201);
        JsonNode m = web.get("member");
        assertThat(m.get("business").asText()).isEqualTo("Swarajya IT");
        assertThat(m.get("skills").asText()).isEqualTo("Go, Java");
        assertThat(m.get("about").asText()).isEqualTo("one\ntwo");
        assertThat(m.get("phone").asText()).isNotEmpty(); // "mobile" is stored as phone
    }

    @Test
    void registerValidationMatchesNode() throws Exception {
        JsonNode noName = register(Map.of("phone", uniquePhone()), 400);
        assertThat(noName.get("code").asText()).isEqualTo("VALIDATION_ERROR");
        assertThat(noName.get("error").asText()).isEqualTo("name आवश्यक आहे (name is required)");
        assertThat(noName.get("errors")).hasSize(1);

        JsonNode noContact = register(Map.of("name", "Someone"), 400);
        assertThat(noContact.get("error").asText())
            .isEqualTo("किमान एक पर्याय आवश्यक आहे: [email, phone, mobile] (At least one of [email, phone, mobile] is required)");

        JsonNode badEmail = register(Map.of("name", "Someone", "email", "not-an-email"), 400);
        assertThat(badEmail.get("error").asText()).isEqualTo("email चे फॉरमॅट अवैध आहे (email has an invalid email format)");

        JsonNode wrongType = register(Map.of("name", "Someone", "phone", uniquePhone(), "skills", 5), 400);
        assertThat(wrongType.get("error").asText())
            .isEqualTo("skills चे स्वरूप अयोग्य आहे: string किंवा array अपेक्षित, number मिळाले (skills must be of type string or array)");

        JsonNode shortName = register(Map.of("name", "A", "phone", uniquePhone()), 400);
        assertThat(shortName.get("error").asText()).isEqualTo("name ची लांबी किमान 2 अक्षरे असावी (name must be at least 2 characters)");
    }

    @Test
    void registerRejectsDuplicatePhoneOrEmailWithoutACode() throws Exception {
        String phone = uniquePhone();
        register(Map.of("name", "First", "phone", phone, "email", phone + "@dup.example.com"), 201);
        JsonNode dupPhone = register(Map.of("name", "Second", "phone", phone), 400);
        assertThat(dupPhone.get("error").asText()).isEqualTo("या ईमेल किंवा फोन क्रमांकासह सदस्य आधीच नोंदणीकृत आहे.");
        assertThat(dupPhone.has("code")).isFalse();
        register(Map.of("name", "Third", "email", phone + "@dup.example.com"), 400);
    }

    @Test
    void registerWithAReferralCodeCreditsTheReferrer() throws Exception {
        JsonNode referrer = register(Map.of("name", "Referrer", "phone", uniquePhone()), 201);
        String code = referrer.get("member").get("reference_id").asText();
        String referrerId = referrer.get("member").get("id").asText();

        JsonNode friend = register(Map.of("name", "Friend", "phone", uniquePhone(), "referral_code", code.toLowerCase()), 201);
        assertThat(friend.get("member").get("referred_by").asText()).isEqualTo(code);
        assertThat(jdbc.queryForObject("SELECT total_referrals FROM members WHERE id = ?", Integer.class, referrerId)).isEqualTo(1);

        // An unknown code is stored as typed and credits nobody (Node behaviour).
        JsonNode stray = register(Map.of("name", "Stray", "phone", uniquePhone(), "referredBy", "SOMEONE-ELSE"), 201);
        assertThat(stray.get("member").get("referred_by").asText()).isEqualTo("SOMEONE-ELSE");

        // By member id and by phone number too.
        register(Map.of("name", "ById", "phone", uniquePhone(), "reference_id", referrerId), 201);
        assertThat(jdbc.queryForObject("SELECT total_referrals FROM members WHERE id = ?", Integer.class, referrerId)).isEqualTo(2);
    }

    @Test
    void registerChecksTheLocationHierarchy() throws Exception {
        jdbc.update("INSERT INTO countries (id, name, code) VALUES ('C-IN', 'भारत', 'IN') ON CONFLICT DO NOTHING");
        jdbc.update("INSERT INTO states (id, country_id, name, code) VALUES ('S-MH', 'C-IN', 'महाराष्ट्र', 'MH') ON CONFLICT DO NOTHING");
        jdbc.update("INSERT INTO states (id, country_id, name, code) VALUES ('S-GJ', 'C-IN', 'गुजरात', 'GJ') ON CONFLICT DO NOTHING");
        jdbc.update("INSERT INTO districts (id, state_id, name, code) VALUES ('D-SAT', 'S-MH', 'सातारा', 'SAT') ON CONFLICT DO NOTHING");
        jdbc.update("INSERT INTO talukas (id, district_id, name, code) VALUES ('T-KAR', 'D-SAT', 'कराड', 'KAR') ON CONFLICT DO NOTHING");
        jdbc.update("INSERT INTO villages (id, taluka_id, name, code) VALUES ('V-MAL', 'T-KAR', 'मलकापूर', 'MAL') ON CONFLICT DO NOTHING");

        JsonNode ok = register(Map.of("name", "Located", "phone", uniquePhone(), "countryId", "C-IN", "stateId", "S-MH",
            "districtId", "D-SAT", "talukaId", "T-KAR", "villageId", "V-MAL"), 201);
        JsonNode m = ok.get("member");
        assertThat(m.get("district").asText()).isEqualTo("सातारा");
        assertThat(m.get("taluka").asText()).isEqualTo("कराड");
        assertThat(m.get("village").asText()).isEqualTo("मलकापूर");
        assertThat(m.get("city").asText()).isEqualTo("मलकापूर, कराड");
        assertThat(m.get("village_id").asText()).isEqualTo("V-MAL");

        JsonNode wrongState = register(Map.of("name", "Wrong", "phone", uniquePhone(), "countryId", "C-IN", "stateId", "S-GJ",
            "districtId", "D-SAT"), 400);
        assertThat(wrongState.get("error").asText()).isEqualTo("जिल्हा आणि राज्याचा संबंध जुळत नाही (District does not belong to selected State).");
        assertThat(wrongState.has("code")).isFalse();
        register(Map.of("name", "Nowhere", "phone", uniquePhone(), "countryId", "C-XX"), 400);
    }

    @Test
    void registerSendsAWelcomeEmailOnlyWhenThereIsAnEmail() throws Exception {
        String phone = uniquePhone();
        JsonNode with = register(Map.of("name", "Mail Me", "phone", phone, "email", phone + "@mail.example.com"), 201);
        verify(mail).sendWelcome(eq(phone + "@mail.example.com"), eq("Mail Me"), eq(with.get("member").get("id").asText()));
        reset(mail);
        register(Map.of("name", "No Mail", "phone", uniquePhone()), 201);
        org.mockito.Mockito.verifyNoInteractions(mail);
    }

    @Test
    void registerWithBrokenOrEmptyJsonBehavesLikeExpress() throws Exception {
        assertThat(call(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content("{ broken"), 400)
            .get("code").asText()).isEqualTo("INVALID_JSON_BODY");
        // Not JSON at all: Express sees an empty body, so the field errors appear.
        JsonNode r = call(post("/api/auth/register").contentType(MediaType.TEXT_PLAIN).content("hello"), 400);
        assertThat(r.get("code").asText()).isEqualTo("VALIDATION_ERROR");
        assertThat(r.get("error").asText()).isEqualTo("name आवश्यक आहे (name is required)");
    }

    // -------------------------------------------------------------------- login

    @Test
    void loginAcceptsPasswordsHashedByNodeInEveryWayTheAppSendsTheId() throws Exception {
        nodeMember("M8001", "node.login@example.com", "9811100001");

        for (Map<String, Object> body : java.util.List.of(
                Map.<String, Object>of("identifier", "M8001", "password", PASSWORD),
                Map.<String, Object>of("identifier", "NODE.LOGIN@example.com", "password", PASSWORD),
                Map.<String, Object>of("identifier", "9811100001", "password", PASSWORD),
                Map.<String, Object>of("identifier", "+91 98111 00001", "password", PASSWORD),   // matched by last 10 digits
                Map.<String, Object>of("phone", "9811100001", "password", PASSWORD),
                Map.<String, Object>of("mobile", "9811100001", "password", PASSWORD),
                Map.<String, Object>of("email", "node.login@example.com", "password", PASSWORD))) {
            JsonNode r = call(postJson("/api/auth/login", body), 200);
            assertThat(r.get("message").asText()).isEqualTo("लॉगिन यशस्वी झाले!");
            assertThat(r.get("member").get("id").asText()).isEqualTo("M8001");
            authLimiter.reset();
        }
    }

    @Test
    void loginReplyNormalisesTheMemberLikeNode() throws Exception {
        nodeMember("M8002", "node.shape@example.com", "9811100002");
        JsonNode m = call(postJson("/api/auth/login", Map.of("identifier", "M8002", "password", PASSWORD)), 200).get("member");
        assertThat(m.get("skills").asText()).isEqualTo("Flutter, Node");          // JSON array text -> "a, b"
        assertThat(m.get("about").asText()).isEqualTo("line 1\nline 2");
        assertThat(m.get("interests").isArray()).isTrue();                          // parsed
        assertThat(m.has("password_hash")).isFalse();
        assertThat(m.get("reference_id").asText()).isEqualTo("REF-96K-8002");
        assertThat(m.get("total_referrals").asInt()).isZero();
        assertThat(m.has("status")).isTrue();                                       // SELECT * columns
    }

    @Test
    void loginFillsMissingReferralCodesInTheReplyOnly() throws Exception {
        jdbc.update("INSERT INTO members (id, name, email, phone, password_hash) VALUES ('M8003', 'Old Member', 'old@example.com', '9811100003', ?)",
            NODE_HASH_COST8);
        JsonNode m = call(postJson("/api/auth/login", Map.of("identifier", "M8003", "password", PASSWORD)), 200).get("member");
        assertThat(m.get("reference_id").asText()).isEqualTo("REF-96K-8003");
        assertThat(m.get("referral_id").asText()).isEqualTo("REF-96K-8003");
        assertThat(jdbc.queryForObject("SELECT reference_id FROM members WHERE id = 'M8003'", String.class)).isNull();
    }

    @Test
    void loginFailuresUseNodeStatusesAndMessages() throws Exception {
        nodeMember("M8004", "node.fail@example.com", "9811100004");
        JsonNode wrong = call(postJson("/api/auth/login", Map.of("identifier", "M8004", "password", "wrong-password")), 401);
        assertThat(wrong.get("error").asText()).isEqualTo("अवैध संकेतशब्द (Incorrect password).");
        assertThat(wrong.has("code")).isFalse();

        JsonNode unknown = call(postJson("/api/auth/login", Map.of("identifier", "M0000", "password", "x")), 401);
        assertThat(unknown.get("code").asText()).isEqualTo("USER_NOT_REGISTERED");

        JsonNode none = call(postJson("/api/auth/login", Map.of("password", "x")), 400);
        assertThat(none.get("error").asText()).isEqualTo("कृपया आयडी, ईमेल किंवा फोन प्रविष्ट करा.");

        jdbc.update("INSERT INTO members (id, name, email, phone) VALUES ('M8005', 'Google Only', 'g@example.com', '9811100005')");
        JsonNode noPassword = call(postJson("/api/auth/login", Map.of("identifier", "M8005", "password", "x")), 401);
        assertThat(noPassword.get("error").asText()).startsWith("या खात्यासाठी संकेतशब्द सेट केलेला नाही.");
    }

    @Test
    void loginThenMeWorks() throws Exception {
        nodeMember("M8006", "node.me@example.com", "9811100006");
        String token = call(postJson("/api/auth/login", Map.of("identifier", "M8006", "password", PASSWORD)), 200).get("token").asText();
        JsonNode me = call(get("/api/auth/me").header("Authorization", "Bearer " + token), 200);
        assertThat(me.get("member").get("id").asText()).isEqualTo("M8006");
        assertThat(me.get("member").get("interests").isArray()).isTrue();
        assertThat(me.get("member").has("reference_id")).isFalse(); // /me has its own column list
        assertThat(me.get("member").has("verified_profile")).isTrue();

        call(get("/api/auth/me"), 401);
        call(get("/api/auth/me").header("Authorization", "Bearer " + jwt.generate("M9999", "Ghost", "member", "Gold")), 404);
    }

    // ------------------------------------------------------------------- google

    @Test
    void googleRefusesBodiesWithoutAnIdToken() throws Exception {
        JsonNode r = call(postJson("/api/auth/google", Map.of("email", "someone@example.com")), 400);
        assertThat(r.get("code").asText()).isEqualTo("VALIDATION_ERROR");
        call(postJson("/api/auth/google", Map.of("idToken", "x".repeat(40), "unexpected", 1)), 400); // strict schema
    }

    @Test
    void googleRejectsAnInvalidToken() throws Exception {
        when(google.configured()).thenReturn(true);
        when(google.verify(anyString())).thenReturn(Optional.empty());
        JsonNode r = call(postJson("/api/auth/google", Map.of("idToken", "x".repeat(40))), 401);
        assertThat(r.get("code").asText()).isEqualTo("INVALID_GOOGLE_TOKEN");
    }

    @Test
    void googleIsSwitchedOffWhenNotConfigured() throws Exception {
        when(google.configured()).thenReturn(false);
        JsonNode r = call(postJson("/api/auth/google", Map.of("idToken", "x".repeat(40))), 503);
        assertThat(r.get("code").asText()).isEqualTo("GOOGLE_NOT_CONFIGURED");
    }

    @Test
    void googleLogsInAnExistingMemberByTheVerifiedEmailOnly() throws Exception {
        nodeMember("M8010", "google.user@example.com", "9811100010");
        when(google.configured()).thenReturn(true);
        when(google.verify(anyString())).thenReturn(Optional.of(Map.of("email", "Google.User@example.com", "name", "Ignored")));
        JsonNode r = call(postJson("/api/auth/google", Map.of("idToken", "x".repeat(40))), 200);
        assertThat(r.get("message").asText()).isEqualTo("Google लॉगिन यशस्वी झाले!");
        assertThat(r.get("member").get("id").asText()).isEqualTo("M8010");
        assertThat(r.get("member").has("password_hash")).isFalse();
    }

    @Test
    void googleSignUpNeedsRegisterTrueAndConsent() throws Exception {
        when(google.configured()).thenReturn(true);
        when(google.verify(anyString())).thenReturn(Optional.of(Map.of("email", "new.google@example.com", "name", "New Google")));

        JsonNode unknown = call(postJson("/api/auth/google", Map.of("idToken", "x".repeat(40))), 404);
        assertThat(unknown.get("code").asText()).isEqualTo("USER_NOT_REGISTERED");

        JsonNode noConsent = call(postJson("/api/auth/google", Map.of("idToken", "x".repeat(40), "register", true)), 400);
        assertThat(noConsent.get("code").asText()).isEqualTo("CONSENT_REQUIRED");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM members WHERE email = 'new.google@example.com'", Integer.class)).isZero();

        JsonNode created = call(postJson("/api/auth/google", Map.of("idToken", "x".repeat(40), "register", true,
            "legalCompliance", Map.of("termsAccepted", true, "privacyAccepted", true, "ageConfirmed", true))), 200);
        JsonNode m = created.get("member");
        assertThat(m.get("name").asText()).isEqualTo("New Google");
        assertThat(m.get("tier").asText()).isEqualTo("Basic");
        assertThat(m.get("reference_id").asText()).startsWith("REF-96K-");
        assertThat(jdbc.queryForObject("SELECT password_hash FROM members WHERE email = 'new.google@example.com'", String.class)).isNull();

        // A Google-only account cannot use the password login.
        call(postJson("/api/auth/login", Map.of("identifier", "new.google@example.com", "password", "anything")), 401);
    }

    @Test
    void googleVerifierAppliesTheNodeRules() {
        GoogleTokenVerifier v = new GoogleTokenVerifier("web-client-1,web-client-2", true);
        assertThat(v.configured()).isTrue();
        assertThat(v.check(Map.of("email", "a@b.com", "email_verified", "true", "aud", "web-client-2"))).isPresent();
        assertThat(v.check(Map.of("email", "a@b.com", "email_verified", true, "aud", "web-client-1"))).isPresent();
        assertThat(v.check(Map.of("email", "a@b.com", "email_verified", "false", "aud", "web-client-1"))).isEmpty();
        assertThat(v.check(Map.of("email", "a@b.com", "email_verified", "true", "aud", "someone-elses-app"))).isEmpty();
        assertThat(v.check(Map.of("email_verified", "true", "aud", "web-client-1"))).isEmpty();
        assertThat(new GoogleTokenVerifier("", true).configured()).isFalse();
        assertThat(new GoogleTokenVerifier("", false).configured()).isTrue();
    }

    // ----------------------------------------------------------- password reset

    @Test
    void passwordResetFlowWorksEndToEnd() throws Exception {
        nodeMember("M8020", "reset.me@example.com", "9811100020");

        JsonNode sent = call(postJson("/api/auth/forgot-password", Map.of("email", "  Reset.Me@Example.com ")), 200);
        assertThat(sent.get("email").asText()).isEqualTo("reset.me@example.com");
        ArgumentCaptor<String> otp = ArgumentCaptor.forClass(String.class);
        verify(mail).sendPasswordResetOtp(eq("reset.me@example.com"), eq("Node Member"), otp.capture());
        assertThat(otp.getValue()).matches("\\d{6}");
        // Only a hash is stored.
        assertThat(jdbc.queryForObject("SELECT otp_hash FROM password_resets WHERE email = 'reset.me@example.com'", String.class))
            .startsWith("$2a$08$").doesNotContain(otp.getValue());

        // Wrong OTP: counts down.
        String wrong = otp.getValue().equals("000000") ? "111111" : "000000";
        JsonNode bad = call(postJson("/api/auth/verify-reset-otp", Map.of("email", "reset.me@example.com", "otp", wrong)), 400);
        assertThat(bad.get("code").asText()).isEqualTo("INVALID_OTP");
        assertThat(bad.get("error").asText()).isEqualTo("अवैध OTP. कृपया पुन्हा तपासा (उर्वरित प्रयत्न: 4).");

        JsonNode ok = call(postJson("/api/auth/verify-reset-otp", Map.of("email", "reset.me@example.com", "otp", otp.getValue())), 200);
        String resetToken = ok.get("resetToken").asText();
        var claims = jwt.parse(resetToken).orElseThrow();
        assertThat(claims.get("purpose")).isEqualTo("password_reset");
        assertThat(claims.get("email")).isEqualTo("reset.me@example.com");

        // The reset token proves an OTP, not a login.
        call(get("/api/auth/me").header("Authorization", "Bearer " + resetToken), 403);

        // Wrong email for the token, and a login token instead of a reset token.
        assertThat(call(postJson("/api/auth/reset-password", Map.of("email", "other@example.com", "resetToken", resetToken,
            "newPassword", "NewPassw0rd!")), 403).get("code").asText()).isEqualTo("TOKEN_MISMATCH");
        assertThat(call(postJson("/api/auth/reset-password", Map.of("email", "reset.me@example.com",
            "resetToken", jwt.generate("M8020", "x", "member", "Gold"), "newPassword", "NewPassw0rd!")), 403)
            .get("code").asText()).isEqualTo("TOKEN_MISMATCH");
        assertThat(call(postJson("/api/auth/reset-password", Map.of("email", "reset.me@example.com",
            "resetToken", "x".repeat(30), "newPassword", "NewPassw0rd!")), 403).get("code").asText()).isEqualTo("INVALID_RESET_TOKEN");
        // 6-7 characters pass the schema but not the endpoint's own 8-character rule.
        assertThat(call(postJson("/api/auth/reset-password", Map.of("email", "reset.me@example.com", "resetToken", resetToken,
            "newPassword", "short12")), 400).get("error").asText()).isEqualTo("पासवर्ड किमान ८ अक्षरांचा असणे आवश्यक आहे.");

        call(postJson("/api/auth/reset-password", Map.of("email", "reset.me@example.com", "resetToken", resetToken,
            "newPassword", "NewPassw0rd!")), 200);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM password_resets WHERE email = 'reset.me@example.com'", Integer.class)).isZero();
        call(postJson("/api/auth/login", Map.of("identifier", "M8020", "password", "NewPassw0rd!")), 200);
        call(postJson("/api/auth/login", Map.of("identifier", "M8020", "password", PASSWORD)), 401);
    }

    @Test
    void passwordResetEdgeCases() throws Exception {
        assertThat(call(postJson("/api/auth/forgot-password", Map.of("email", "nobody@example.com")), 404)
            .get("code").asText()).isEqualTo("USER_NOT_FOUND");
        assertThat(call(postJson("/api/auth/verify-reset-otp", Map.of("email", "nobody@example.com", "otp", "123456")), 400)
            .get("code").asText()).isEqualTo("NO_OTP_REQUESTED");
        call(postJson("/api/auth/verify-reset-otp", Map.of("email", "nobody@example.com", "otp", "12")), 400); // schema

        nodeMember("M8021", "reset.limit@example.com", "9811100021");
        call(postJson("/api/auth/forgot-password", Map.of("email", "reset.limit@example.com")), 200);
        for (int i = 4; i >= 0; i--) {
            JsonNode r = call(postJson("/api/auth/verify-reset-otp", Map.of("email", "reset.limit@example.com", "otp", "000000")), 400);
            assertThat(r.get("code").asText()).isEqualTo("INVALID_OTP");
            assertThat(r.get("error").asText()).contains("उर्वरित प्रयत्न: " + i + ")");
        }
        // The 5th failure also starts the login limiter's 2 second pause for this email (as in Node).
        authLimiter.reset();
        JsonNode locked = call(postJson("/api/auth/verify-reset-otp", Map.of("email", "reset.limit@example.com", "otp", "000000")), 400);
        assertThat(locked.get("code").asText()).isEqualTo("TOO_MANY_ATTEMPTS");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM password_resets WHERE email = 'reset.limit@example.com'", Integer.class)).isZero();

        nodeMember("M8022", "reset.expired@example.com", "9811100022");
        call(postJson("/api/auth/forgot-password", Map.of("email", "reset.expired@example.com")), 200);
        jdbc.update("UPDATE password_resets SET expires_at = now() - interval '1 minute' WHERE email = 'reset.expired@example.com'");
        assertThat(call(postJson("/api/auth/verify-reset-otp", Map.of("email", "reset.expired@example.com", "otp", "123456")), 400)
            .get("code").asText()).isEqualTo("OTP_EXPIRED");
    }

    @Test
    void askingForANewCodeReplacesTheOldOne() throws Exception {
        nodeMember("M8023", "reset.twice@example.com", "9811100023");
        call(postJson("/api/auth/forgot-password", Map.of("email", "reset.twice@example.com")), 200);
        call(postJson("/api/auth/forgot-password", Map.of("email", "reset.twice@example.com")), 200);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM password_resets WHERE email = 'reset.twice@example.com'", Integer.class)).isEqualTo(1);
    }

    // ------------------------------------------------------------ account delete

    private void addActivity(String memberId) {
        jdbc.update("INSERT INTO posts (id, author_id, author_name, text, likes_count, created_at) VALUES (?, ?, 'x', 'hello', 1, '2026-01-01')",
            "P-" + memberId, memberId);
        jdbc.update("INSERT INTO post_comments (id, post_id, author_id, author_name, text, created_at) VALUES (?, ?, ?, 'x', 'hi', '2026-01-01')",
            "C-" + memberId, "P-" + memberId, memberId);
        jdbc.update("INSERT INTO donations (id, donor_id, donor_name, amount, created_at) VALUES (?, ?, 'Donor', 100, '2026-01-01')",
            "D-" + memberId, memberId);
    }

    @Test
    void appDeleteAccountRemovesTheMemberAndTheirContent() throws Exception {
        nodeMember("M8030", "delete.me@example.com", "9811100030");
        addActivity("M8030");
        String auth = bearer("M8030", "member");

        call(delete("/api/auth/account").header("Authorization", auth).contentType(MediaType.APPLICATION_JSON)
            .content("{\"confirm\":\"DELETE\"}"), 401); // password needed
        JsonNode wrong = call(delete("/api/auth/account").header("Authorization", auth).contentType(MediaType.APPLICATION_JSON)
            .content("{\"confirm\":\"DELETE\",\"password\":\"wrong\"}"), 401);
        assertThat(wrong.get("code").asText()).isEqualTo("INVALID_PASSWORD");
        call(delete("/api/auth/account").header("Authorization", auth).contentType(MediaType.APPLICATION_JSON)
            .content("{\"confirm\":\"nope\",\"password\":\"" + PASSWORD + "\"}"), 400);
        call(delete("/api/auth/account").contentType(MediaType.APPLICATION_JSON).content("{}"), 401);

        JsonNode ok = call(delete("/api/auth/account").header("Authorization", auth).contentType(MediaType.APPLICATION_JSON)
            .content("{\"confirm\":\"DELETE\",\"password\":\"" + PASSWORD + "\"}"), 200);
        assertThat(ok.get("deleted").asBoolean()).isTrue();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM members WHERE id = 'M8030'", Integer.class)).isZero();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM posts WHERE author_id = 'M8030'", Integer.class)).isZero();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM post_comments WHERE author_id = 'M8030'", Integer.class)).isZero();
        // Donations are kept, anonymised.
        Map<String, Object> donation = jdbc.queryForMap("SELECT donor_id, donor_name, amount FROM donations WHERE id = 'D-M8030'");
        assertThat(donation.get("donor_id")).isNull();
        assertThat(donation.get("donor_name")).isEqualTo("Deleted Member");
    }

    @Test
    void websiteDeleteAccountDeletesOnlyWhenLoggedInAndOtherwiseOnlyRecordsARequest() throws Exception {
        nodeMember("M8031", "web.delete@example.com", "9811100031");
        nodeMember("M8032", "web.keep@example.com", "9811100032");

        // Logged out: a request is recorded, nothing is deleted, and the reply is the same for unknown numbers.
        JsonNode requested = call(postJson("/api/auth/delete-account", Map.of("identifier", "web.delete@example.com", "confirmation", true, "reason", "testing")), 200);
        assertThat(requested.get("requested").asBoolean()).isTrue();
        assertThat(requested.get("deleted").asBoolean()).isFalse();
        assertThat(requested.get("data").get("requested").asBoolean()).isTrue();
        JsonNode unknown = call(postJson("/api/auth/delete-account", Map.of("identifier", "9000000001", "confirmation", true)), 200);
        assertThat(unknown.get("message").asText()).isEqualTo(requested.get("message").asText());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM members WHERE id = 'M8031'", Integer.class)).isEqualTo(1);
        Map<String, Object> ticket = jdbc.queryForMap("SELECT source, requester_id, priority, status FROM support_tickets WHERE requester_id = 'M8031'");
        assertThat(ticket).containsEntry("source", "account_deletion").containsEntry("priority", "High").containsEntry("status", "New");

        // Asking again does not create a second open ticket.
        call(postJson("/api/auth/delete-account", Map.of("identifier", "9811100031", "confirmation", true)), 200);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM support_tickets WHERE requester_id = 'M8031'", Integer.class)).isEqualTo(1);

        assertThat(call(postJson("/api/auth/delete-account", Map.of("confirmation", true)), 400).get("code").asText()).isEqualTo("IDENTIFIER_REQUIRED");
        assertThat(call(postJson("/api/auth/delete-account", Map.of("identifier", "x@y.com")), 400).get("code").asText()).isEqualTo("CONFIRMATION_REQUIRED");

        // Logged in: really deletes, with the password.
        String auth = bearer("M8032", "member");
        call(post("/api/auth/delete-account").header("Authorization", auth).contentType(MediaType.APPLICATION_JSON)
            .content("{\"password\":\"wrong\"}"), 401);
        JsonNode deleted = call(post("/api/auth/delete-account").header("Authorization", auth).contentType(MediaType.APPLICATION_JSON)
            .content("{\"password\":\"" + PASSWORD + "\",\"confirmation\":true}"), 200);
        assertThat(deleted.get("deleted").asBoolean()).isTrue();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM members WHERE id = 'M8032'", Integer.class)).isZero();
    }

    // ---------------------------------------------------------------- referrals

    @Test
    void verifyReferralFindsMembersOfficialCodesAndRejectsTheRest() throws Exception {
        nodeMember("M8040", "ref.owner@example.com", "9811100040");

        for (String code : new String[] {"REF-96K-8040", "ref-96k-8040", "M8040", "98111 00040", "+91 98111 00040"}) {
            JsonNode r = call(get("/api/auth/referrals/verify/{code}", code), 200);
            assertThat(r.get("isValid").asBoolean()).as(code).isTrue();
            assertThat(r.get("message").asText()).isEqualTo("सत्यापित रेफरल कोड");
            assertThat(r.get("referrer").get("id").asText()).isEqualTo("M8040");
            assertThat(r.get("referrer").get("name").asText()).isEqualTo("Node Member");
            assertThat(r.get("referrer").get("district").asText()).isEqualTo("पुणे");
            assertThat(r.get("referrer").get("reference_id").asText()).isEqualTo("REF-96K-8040");
        }

        JsonNode official = call(get("/api/auth/referrals/verify/{code}", "cm-official-2026"), 200);
        assertThat(official.get("message").asText()).isEqualTo("अधिकृत रेफरल कोड");
        assertThat(official.get("referrer").get("reference_id").asText()).isEqualTo("CM-OFFICIAL-2026");
        assertThat(official.get("referrer").get("city").asText()).isEqualTo("महाराष्ट्र");

        JsonNode missing = call(get("/api/auth/referrals/verify/{code}", "NOPE-123"), 404);
        assertThat(missing.get("success").asBoolean()).isFalse();
        assertThat(missing.get("isValid").asBoolean()).isFalse();
        assertThat(missing.get("error").asText()).isEqualTo("हा रेफरल आयडी आढळला नाही.");
        assertThat(missing.has("code")).isFalse();
    }

    @Test
    void myReferralsListsTheMembersWhoJoinedWithMyCode() throws Exception {
        JsonNode owner = register(Map.of("name", "Owner", "phone", uniquePhone(), "password", PASSWORD), 201);
        String code = owner.get("member").get("reference_id").asText();
        String ownerId = owner.get("member").get("id").asText();
        String friendPhone = uniquePhone();
        register(Map.of("name", "Friend One", "phone", friendPhone, "district", "सातारा", "referral_code", code), 201);
        register(Map.of("name", "Friend Two", "phone", uniquePhone(), "referral_code", ownerId), 201);

        JsonNode r = call(get("/api/auth/referrals/my-referrals").header("Authorization", "Bearer " + owner.get("token").asText()), 200);
        assertThat(r.get("reference_id").asText()).isEqualTo(code);
        assertThat(r.get("referral_id").asText()).isEqualTo(code);
        assertThat(r.get("total_referrals").asInt()).isEqualTo(2);
        assertThat(r.get("share_link").asText()).isEqualTo("https://connectmaratha.com/register?ref=" + code);
        JsonNode list = r.get("referred_members");
        assertThat(list).hasSize(2);
        JsonNode one = null;
        for (JsonNode n : list) if (n.get("name").asText().equals("Friend One")) one = n;
        assertThat(one).isNotNull();
        assertThat(one.get("phone").asText()).isEqualTo(friendPhone.substring(0, 4) + " •••••");
        assertThat(one.get("district").asText()).isEqualTo("सातारा");
        assertThat(one.get("status").asText()).isEqualTo("सक्रिय (Active)");
        assertThat(one.get("joined").asText()).matches("\\d{4}-\\d{2}-\\d{2}");

        call(get("/api/auth/referrals/my-referrals"), 401);
        call(get("/api/auth/referrals/my-referrals").header("Authorization", bearer("M9998", "member")), 404);
    }

    @Test
    void myReferralsOfAMemberWithNoCodesFallsBackLikeNode() throws Exception {
        jdbc.update("INSERT INTO members (id, name, email, phone) VALUES ('M8041', 'No Codes', 'nocodes@example.com', '9811100041')");
        JsonNode r = call(get("/api/auth/referrals/my-referrals").header("Authorization", bearer("M8041", "member")), 200);
        assertThat(r.get("reference_id").asText()).isEqualTo("REF-96K-8041");
        assertThat(r.get("total_referrals").asInt()).isZero();
        assertThat(r.get("referred_members")).isEmpty();
    }
}
