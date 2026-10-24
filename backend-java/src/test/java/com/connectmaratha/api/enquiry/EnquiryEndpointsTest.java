package com.connectmaratha.api.enquiry;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.connectmaratha.api.PostgresTestBase;
import com.connectmaratha.api.common.ratelimit.RateLimitFilter;
import com.connectmaratha.api.common.schema.LazyTables;
import com.connectmaratha.api.common.security.JwtService;
import com.connectmaratha.api.enquiry.repository.EnquiryRepository;
import com.connectmaratha.api.enquiry.repository.EnquiryRow;
import com.connectmaratha.api.enquiry.service.PostingLimiter;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.LinkedHashMap;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

/** /api/enquiries: B2B requirements (login rules, validation, privacy, filters, limits). */
@SpringBootTest
@AutoConfigureMockMvc
class EnquiryEndpointsTest extends PostgresTestBase {

    static final String TITLE = "पुण्यात ऑफिस इंटेरियर 🏢";

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired JwtService jwt;
    @Autowired JdbcTemplate jdbc;
    @Autowired LazyTables tables;
    @Autowired EnquiryRepository repo;
    @Autowired PostingLimiter limiter;
    @Autowired RateLimitFilter rateLimit;

    @BeforeEach
    void fresh() {
        limiter.reset();
        rateLimit.reset();
        tables.ensureEnquiryTables();
        jdbc.update("DELETE FROM enquiries");
    }

    // ------------------------------------------------------------------ helpers

    void member(String id, String name, String phone) {
        jdbc.update("INSERT INTO members (id, name, phone) VALUES (?, ?, ?) ON CONFLICT (id) DO NOTHING", id, name, phone);
    }

    String token(String id, String role) {
        return "Bearer " + jwt.generate(id, "Test", role, "Gold");
    }

    static Map<String, Object> valid() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("title", TITLE);
        body.put("category", "इंटेरियर व बांधकाम");
        body.put("district", "पुणे");
        body.put("city", "पुणे");
        body.put("budget", "₹ 2 लाख");
        body.put("description", "५०० चौ. फूट");
        return body;
    }

    static Map<String, Object> with(String key, Object value) {
        Map<String, Object> body = valid();
        body.put(key, value);
        return body;
    }

    ResultActions postEnquiry(String token, Map<String, Object> body) throws Exception {
        MockHttpServletRequestBuilder req = post("/api/enquiries").contentType(MediaType.APPLICATION_JSON)
            .content(json.writeValueAsBytes(body));
        if (token != null) req.header("Authorization", token);
        return mvc.perform(req);
    }

    ResultActions getList(String token, String... params) throws Exception {
        MockHttpServletRequestBuilder req = get("/api/enquiries");
        for (int i = 0; i < params.length; i += 2) req.param(params[i], params[i + 1]);
        if (token != null) req.header("Authorization", token);
        return mvc.perform(req);
    }

    String raw(ResultActions result) throws Exception {
        return result.andReturn().getResponse().getContentAsString(UTF_8);
    }

    // ------------------------------------------------------------------ posting

    @Test
    void postingNeedsLogin() throws Exception {
        postEnquiry(null, valid()).andExpect(status().isUnauthorized());
    }

    @Test
    void postValidatesFields() throws Exception {
        member("M7001", "Test Poster", "9822144550");
        String t = token("M7001", "member");
        Map<String, Object> noTitle = valid();
        noTitle.remove("title");
        postEnquiry(t, noTitle).andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        postEnquiry(t, with("verified", true)).andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        postEnquiry(t, with("title", "ab")).andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        postEnquiry(t, with("description", "x".repeat(2001))).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        postEnquiry(t, with("phone", "12345")).andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM enquiries", Integer.class)).isZero();
    }

    @Test
    void postSavesWithProfileDefaultsAndNormalisedPhone() throws Exception {
        member("M7001", "Test Poster", "9822144550");
        String t = token("M7001", "member");
        postEnquiry(t, valid())
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.enquiry.id").value(org.hamcrest.Matchers.startsWith("ENQ-")))
            .andExpect(jsonPath("$.enquiry.title").value(TITLE))
            .andExpect(jsonPath("$.enquiry.clientName").value("Test Poster"))
            .andExpect(jsonPath("$.enquiry.isMine").value(true))
            .andExpect(jsonPath("$.enquiry.quotedByMe").value(false))
            .andExpect(jsonPath("$.enquiry.status").value("open"))
            .andExpect(jsonPath("$.enquiry.quotesCount").value(0))
            .andExpect(jsonPath("$.enquiry.phone").doesNotExist())
            .andExpect(jsonPath("$.enquiry.memberId").doesNotExist());
        assertThat(jdbc.queryForObject("SELECT phone FROM enquiries WHERE member_id = 'M7001'", String.class)).isEqualTo("9822144550");

        Map<String, Object> second = with("phone", "+91 98221-44551");
        second.put("title", "Second requirement");
        postEnquiry(t, second).andExpect(status().isCreated());
        assertThat(jdbc.queryForObject("SELECT phone FROM enquiries WHERE title = 'Second requirement'", String.class))
            .isEqualTo("+919822144551");
    }

    // ------------------------------------------------------------------ listing

    @Test
    void publicListNeverShowsPhones() throws Exception {
        member("M7001", "Test Poster", "9822144550");
        postEnquiry(token("M7001", "member"), valid()).andExpect(status().isCreated());
        String body = raw(getList(null).andExpect(status().isOk()));
        assertThat(body).contains(TITLE).doesNotContain("9822144550").doesNotContain("M7001");
    }

    @Test
    void listFlagsMineForTheViewer() throws Exception {
        member("M7001", "Test Poster", "9822144550");
        postEnquiry(token("M7001", "member"), valid()).andExpect(status().isCreated());
        getList(token("M7001", "member")).andExpect(jsonPath("$.enquiries[0].isMine").value(true));
        getList(token("M7002", "member")).andExpect(jsonPath("$.enquiries[0].isMine").value(false));
        getList(null).andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.count").value(1))
            .andExpect(jsonPath("$.enquiries[0].isMine").value(false))
            .andExpect(jsonPath("$.enquiries[0].quotedByMe").value(false));
    }

    @Test
    void brokenOrExpiredTokenStillGetsTheList() throws Exception {
        member("M7001", "Test Poster", "9822144550");
        postEnquiry(token("M7001", "member"), valid()).andExpect(status().isCreated());
        getList("Bearer not.a.token")
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.count").value(1))
            .andExpect(jsonPath("$.enquiries[0].isMine").value(false));
    }

    @Test
    void allFilterValuesMeanEverything() throws Exception {
        member("M7001", "Test Poster", "9822144550");
        String t = token("M7001", "member");
        postEnquiry(t, valid()).andExpect(status().isCreated());
        Map<String, Object> nashik = with("district", "नाशिक");
        nashik.put("title", "Nashik requirement");
        postEnquiry(t, nashik).andExpect(status().isCreated());
        getList(null, "district", "सर्व").andExpect(jsonPath("$.count").value(2));
        getList(null, "district", "").andExpect(jsonPath("$.count").value(2));
        getList(null, "category", "सर्व").andExpect(jsonPath("$.count").value(2));
        getList(null, "district", "नाशिक").andExpect(jsonPath("$.count").value(1))
            .andExpect(jsonPath("$.enquiries[0].title").value("Nashik requirement"));
    }

    @Test
    void eleventhPostInADayIsRefused() throws Exception {
        member("M7001", "Test Poster", "9822144550");
        String t = token("M7001", "member");
        for (int i = 0; i < 3; i++) postEnquiry(t, with("title", "")).andExpect(status().isBadRequest()); // not counted
        for (int i = 0; i < 10; i++) postEnquiry(t, with("title", "Requirement " + i)).andExpect(status().isCreated());
        postEnquiry(t, with("title", "One too many"))
            .andExpect(status().isTooManyRequests())
            .andExpect(jsonPath("$.code").value("RATE_LIMIT_EXCEEDED"));
    }

    @Test
    void listIsCappedAt100() throws Exception {
        for (int i = 0; i < 101; i++) {
            repo.insert(new EnquiryRow("ENQ-CAP" + i, "M7001", "T " + i, null, "IT", null, "Pune", null, null, null,
                "open", null, null, null, 0, false));
        }
        getList(null).andExpect(jsonPath("$.count").value(100));
    }
}
