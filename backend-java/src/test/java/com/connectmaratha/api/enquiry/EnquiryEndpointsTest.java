package com.connectmaratha.api.enquiry;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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

    /** Posts a valid requirement and returns its id. */
    String posted(String token) throws Exception {
        return json.readTree(raw(postEnquiry(token, valid()).andExpect(status().isCreated()))).at("/enquiry/id").asText();
    }

    static Map<String, Object> validQuote() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("businessName", "पाटील इंटेरियर्स");
        body.put("ownerName", "Raj Patil");
        body.put("phone", "9890011122");
        body.put("quoteAmount", "₹ 1,80,000");
        body.put("proposalNotes", "१५ दिवसांत काम");
        return body;
    }

    static Map<String, Object> quoteWith(String key, Object value) {
        Map<String, Object> body = validQuote();
        body.put(key, value);
        return body;
    }

    ResultActions quote(String token, String enquiryId, Map<String, Object> body) throws Exception {
        return mvc.perform(post("/api/enquiries/" + enquiryId + "/quote").header("Authorization", token)
            .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsBytes(body)));
    }

    ResultActions setStatus(String token, String enquiryId, String value) throws Exception {
        return mvc.perform(put("/api/enquiries/" + enquiryId + "/status").header("Authorization", token)
            .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsBytes(Map.of("status", value))));
    }

    ResultActions mine(String token) throws Exception {
        return mvc.perform(get("/api/enquiries/mine").header("Authorization", token));
    }

    ResultActions summary(String token) throws Exception {
        MockHttpServletRequestBuilder req = get("/api/admin/enquiries-summary");
        if (token != null) req.header("Authorization", token);
        return mvc.perform(req);
    }

    // ------------------------------------------------------------------ posting

    @Test
    void postingNeedsLogin() throws Exception {
        postEnquiry(null, valid()).andExpect(status().isUnauthorized());
    }

    @Test
    void postValidatesFields() throws Exception {
        member("M9401", "Test Poster", "9822144550");
        String t = token("M9401", "member");
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
        member("M9401", "Test Poster", "9822144550");
        String t = token("M9401", "member");
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
        assertThat(jdbc.queryForObject("SELECT phone FROM enquiries WHERE member_id = 'M9401'", String.class)).isEqualTo("9822144550");

        Map<String, Object> second = with("phone", "+91 98221-44551");
        second.put("title", "Second requirement");
        postEnquiry(t, second).andExpect(status().isCreated());
        assertThat(jdbc.queryForObject("SELECT phone FROM enquiries WHERE title = 'Second requirement'", String.class))
            .isEqualTo("+919822144551");
    }

    // ------------------------------------------------------------------ listing

    @Test
    void publicListNeverShowsPhones() throws Exception {
        member("M9401", "Test Poster", "9822144550");
        postEnquiry(token("M9401", "member"), valid()).andExpect(status().isCreated());
        String body = raw(getList(null).andExpect(status().isOk()));
        assertThat(body).contains(TITLE).doesNotContain("9822144550").doesNotContain("M9401");
    }

    @Test
    void listFlagsMineForTheViewer() throws Exception {
        member("M9401", "Test Poster", "9822144550");
        postEnquiry(token("M9401", "member"), valid()).andExpect(status().isCreated());
        getList(token("M9401", "member")).andExpect(jsonPath("$.enquiries[0].isMine").value(true));
        getList(token("M9402", "member")).andExpect(jsonPath("$.enquiries[0].isMine").value(false));
        getList(null).andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.count").value(1))
            .andExpect(jsonPath("$.enquiries[0].isMine").value(false))
            .andExpect(jsonPath("$.enquiries[0].quotedByMe").value(false));
    }

    @Test
    void brokenOrExpiredTokenStillGetsTheList() throws Exception {
        member("M9401", "Test Poster", "9822144550");
        postEnquiry(token("M9401", "member"), valid()).andExpect(status().isCreated());
        getList("Bearer not.a.token")
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.count").value(1))
            .andExpect(jsonPath("$.enquiries[0].isMine").value(false));
    }

    @Test
    void allFilterValuesMeanEverything() throws Exception {
        member("M9401", "Test Poster", "9822144550");
        String t = token("M9401", "member");
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
        member("M9401", "Test Poster", "9822144550");
        String t = token("M9401", "member");
        for (int i = 0; i < 3; i++) postEnquiry(t, with("title", "")).andExpect(status().isBadRequest()); // not counted
        for (int i = 0; i < 10; i++) postEnquiry(t, with("title", "Requirement " + i)).andExpect(status().isCreated());
        postEnquiry(t, with("title", "One too many"))
            .andExpect(status().isTooManyRequests())
            .andExpect(jsonPath("$.code").value("RATE_LIMIT_EXCEEDED"));
    }

    @Test
    void listIsCappedAt100() throws Exception {
        for (int i = 0; i < 101; i++) {
            repo.insert(new EnquiryRow("ENQ-CAP" + i, "M9401", "T " + i, null, "IT", null, "Pune", null, null, null,
                "open", null, null, null, 0, false));
        }
        getList(null).andExpect(jsonPath("$.count").value(100));
    }

    // ------------------------------------------------------------------ quotes

    @Test
    void quoteRules() throws Exception {
        member("M9401", "Test Poster", "9822144550");
        String poster = token("M9401", "member");
        String business = token("M9402", "member");
        String id = posted(poster);

        quote(poster, id, validQuote()).andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("OWN_ENQUIRY"));
        quote(business, "ENQ-missing", validQuote()).andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("ENQUIRY_NOT_FOUND"));
        Map<String, Object> noName = validQuote();
        noName.remove("businessName");
        quote(business, id, noName).andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));

        quote(business, id, validQuote())
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.updated").value(false))
            .andExpect(jsonPath("$.quote.businessName").value("पाटील इंटेरियर्स"));
        quote(business, id, quoteWith("quoteAmount", "₹ 1,70,000"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.updated").value(true))
            .andExpect(jsonPath("$.quote.quoteAmount").value("₹ 1,70,000"));
        getList(null).andExpect(jsonPath("$.enquiries[0].quotesCount").value(1));
    }

    @Test
    void quoteOnClosedRequirementIsRefusedAndNothingSaved() throws Exception {
        member("M9401", "Test Poster", "9822144550");
        String id = posted(token("M9401", "member"));
        setStatus(token("M9401", "member"), id, "closed").andExpect(status().isOk());
        quote(token("M9402", "member"), id, validQuote())
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.code").value("ENQUIRY_CLOSED"));
        getList(null).andExpect(jsonPath("$.enquiries[0].quotesCount").value(0));
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM enquiry_quotes", Integer.class)).isZero();
    }

    @Test
    void quotePhoneWithSpacesIsAccepted() throws Exception {
        member("M9401", "Test Poster", "9822144550");
        String id = posted(token("M9401", "member"));
        quote(token("M9402", "member"), id, quoteWith("phone", "098221 44550")).andExpect(status().isCreated());
        assertThat(jdbc.queryForObject("SELECT phone FROM enquiry_quotes WHERE member_id = 'M9402'", String.class))
            .isEqualTo("09822144550");
    }

    @Test
    void listShowsQuotedByMe() throws Exception {
        member("M9401", "Test Poster", "9822144550");
        String id = posted(token("M9401", "member"));
        quote(token("M9402", "member"), id, validQuote()).andExpect(status().isCreated());
        getList(token("M9402", "member")).andExpect(jsonPath("$.enquiries[0].quotedByMe").value(true));
        getList(token("M9403", "member")).andExpect(jsonPath("$.enquiries[0].quotedByMe").value(false));
    }

    @Test
    void mineShowsQuotesWithPhonesOnlyToTheOwner() throws Exception {
        member("M9401", "Test Poster", "9822144550");
        String poster = token("M9401", "member");
        String id = posted(poster);
        quote(token("M9402", "member"), id, validQuote()).andExpect(status().isCreated());

        mine(poster)
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.count").value(1))
            .andExpect(jsonPath("$.enquiries[0].isMine").value(true))
            .andExpect(jsonPath("$.enquiries[0].phone").value("9822144550"))
            .andExpect(jsonPath("$.enquiries[0].quotes[0].businessName").value("पाटील इंटेरियर्स"))
            .andExpect(jsonPath("$.enquiries[0].quotes[0].phone").value("9890011122"))
            .andExpect(jsonPath("$.enquiries[0].quotes[0].quoteAmount").value("₹ 1,80,000"));
        mine(token("M9402", "member")).andExpect(jsonPath("$.count").value(0));
        assertThat(raw(getList(null))).doesNotContain("9890011122").doesNotContain("1,80,000");
    }

    @Test
    void onlyPosterOrAdminChangesStatus() throws Exception {
        member("M9401", "Test Poster", "9822144550");
        String poster = token("M9401", "member");
        String id = posted(poster);
        setStatus(token("M9402", "member"), id, "closed").andExpect(status().isForbidden())
            .andExpect(jsonPath("$.code").value("NOT_OWNER"));
        setStatus(poster, id, "closed").andExpect(status().isOk()).andExpect(jsonPath("$.enquiry.status").value("closed"));
        setStatus(poster, id, "closed").andExpect(status().isOk());
        setStatus(token("M9409", "admin"), id, "open").andExpect(status().isOk())
            .andExpect(jsonPath("$.enquiry.status").value("open"));
        setStatus(poster, id, "done").andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        setStatus(poster, "ENQ-missing", "closed").andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("ENQUIRY_NOT_FOUND"));
    }

    @Test
    void adminSummaryIsAdminOnlyAndIncludesPhones() throws Exception {
        member("M9401", "Test Poster", "9822144550");
        String id = posted(token("M9401", "member"));
        quote(token("M9402", "member"), id, validQuote()).andExpect(status().isCreated());
        summary(null).andExpect(status().isUnauthorized());
        summary(token("M9402", "member")).andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("ADMIN_ONLY"));
        summary(token("M9409", "admin"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.count").value(1))
            .andExpect(jsonPath("$.enquiries[0].phone").value("9822144550"))
            .andExpect(jsonPath("$.enquiries[0].memberId").value("M9401"))
            .andExpect(jsonPath("$.enquiries[0].quotesCount").value(1))
            .andExpect(jsonPath("$.enquiries[0].isMine").doesNotExist());
    }

    @Test
    void thirtyFirstQuoteInAnHourIsRefused() throws Exception {
        for (int i = 0; i < 31; i++) {
            repo.insert(new EnquiryRow("ENQ-Q" + i, "M9401", "T " + i, null, "IT", null, "Pune", null, null, null,
                "open", null, null, null, 0, false));
        }
        String business = token("M9402", "member");
        for (int i = 0; i < 30; i++) quote(business, "ENQ-Q" + i, validQuote()).andExpect(status().isCreated());
        quote(business, "ENQ-Q30", validQuote())
            .andExpect(status().isTooManyRequests())
            .andExpect(jsonPath("$.code").value("RATE_LIMIT_EXCEEDED"));
    }
}
