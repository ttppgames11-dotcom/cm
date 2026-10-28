package com.connectmaratha.api.job;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.connectmaratha.api.PostgresTestBase;
import com.connectmaratha.api.common.ratelimit.RateLimitFilter;
import com.connectmaratha.api.common.security.JwtService;
import com.connectmaratha.api.job.repository.JobRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
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

/** /api/jobs/... and /api/admin/jobs: member-owned jobs that close, real applications, statuses and the hired counter. */
@SpringBootTest
@AutoConfigureMockMvc
class JobEndpointsTest extends PostgresTestBase {

    static final String ADMIN = "M9009";

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired JwtService jwt;
    @Autowired JdbcTemplate jdbc;
    @Autowired RateLimitFilter rateLimit;
    @Autowired JobRepository repository;

    @BeforeEach
    void fresh() throws Exception {
        rateLimit.reset();
        // adds the new columns before cleaning
        send(get("/api/jobs"), null, null).andExpect(status().isOk());
        String jobs = "SELECT id FROM jobs WHERE poster_id LIKE 'M90%' OR title LIKE 'Zj%'";
        jdbc.update("DELETE FROM job_applications WHERE job_id IN (" + jobs + ") OR member_id LIKE 'M90%' OR applicant_name LIKE 'Zj%'");
        jdbc.update("DELETE FROM jobs WHERE poster_id LIKE 'M90%' OR title LIKE 'Zj%'");
        jdbc.update("DELETE FROM notifications WHERE member_id LIKE 'M90%'");
        jdbc.update("DELETE FROM audit_logs WHERE user_id LIKE 'M90%'");
        for (String id : List.of("M9001", "M9002", "M9003", "M9004", "M9005", "M9006", ADMIN)) member(id);
    }

    // ------------------------------------------------------------------ helpers

    void member(String id) {
        jdbc.update("INSERT INTO members (id, name, phone, role) VALUES (?, ?, ?, 'member') "
            + "ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, role = 'member'",
            id, "Member " + id, "98000" + id.substring(1));
    }

    String token(String id, String role) {
        return "Bearer " + jwt.generate(id, "Test", role, "Gold");
    }

    String m(int n) {
        return token("M900" + n, "member");
    }

    String admin() {
        return token(ADMIN, "admin");
    }

    static Map<String, Object> jobBody() {
        Map<String, Object> b = new LinkedHashMap<>();
        b.put("title", "Zj Accountant");
        b.put("company", "Zj Traders");
        b.put("district", "पुणे");
        b.put("category", "Accounts");
        b.put("salary", "₹25,000");
        b.put("phone", "9876500001");
        b.put("contact_email", "hr@zj.test");
        b.put("desc", "Tally");
        return b;
    }

    static Map<String, Object> with(Map<String, Object> body, String key, Object value) {
        Map<String, Object> copy = new LinkedHashMap<>(body);
        if (value == null) copy.remove(key); else copy.put(key, value);
        return copy;
    }

    ResultActions send(MockHttpServletRequestBuilder req, String token, Object body) throws Exception {
        if (token != null) req.header("Authorization", token);
        if (body != null) req.contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsBytes(body));
        return mvc.perform(req);
    }

    JsonNode body(ResultActions result) throws Exception {
        return json.readTree(result.andReturn().getResponse().getContentAsString(UTF_8));
    }

    String raw(ResultActions result) throws Exception {
        return result.andReturn().getResponse().getContentAsString(UTF_8);
    }

    String postJob(String token, Map<String, Object> body) throws Exception {
        return body(send(post("/api/jobs"), token, body).andExpect(status().isCreated())).get("job").get("id").asText();
    }

    String postJob(String token) throws Exception {
        return postJob(token, jobBody());
    }

    ResultActions act(String token, String id, Object action) throws Exception {
        Map<String, Object> b = new LinkedHashMap<>();
        if (action != null) b.put("action", action);
        return send(put("/api/jobs/" + id), token, b);
    }

    void expire(String id) {
        jdbc.update("UPDATE jobs SET closes_at = now() - interval '1 second' WHERE id = ?", id);
    }

    void hide(String id) {
        jdbc.update("UPDATE jobs SET hidden = true WHERE id = ?", id);
    }

    int jobRows(String memberId) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM jobs WHERE poster_id = ?", Integer.class, memberId);
    }

    List<String> ids(JsonNode list, String key) {
        List<String> out = new ArrayList<>();
        for (JsonNode j : list.get(key)) out.add(j.get("id").asText());
        return out;
    }

    JsonNode find(JsonNode list, String key, String id) {
        for (JsonNode j : list.get(key)) if (id.equals(j.get("id").asText())) return j;
        return null;
    }

    static void closeToNowPlusDays(String iso, int days) {
        Duration off = Duration.between(Instant.now().plus(Duration.ofDays(days)), Instant.parse(iso)).abs();
        assertThat(off).isLessThan(Duration.ofMinutes(1));
    }

    // ------------------------------------------------------------------ posting

    @Test
    void postingNeedsALogin() throws Exception {
        send(post("/api/jobs"), null, jobBody()).andExpect(status().isUnauthorized());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM jobs WHERE title LIKE 'Zj%'", Integer.class)).isZero();
    }

    @Test
    void memberPostsAJob() throws Exception {
        JsonNode job = body(send(post("/api/jobs"), m(1), jobBody()).andExpect(status().isCreated())).get("job");
        assertThat(job.get("id").asText()).startsWith("JOB-");
        assertThat(job.get("state").asText()).isEqualTo("open");
        assertThat(job.get("mine").asBoolean()).isTrue();
        closeToNowPlusDays(job.get("closes_at").asText(), 30);
        assertThat(job.has("poster_id")).isFalse();
        assertThat(jdbc.queryForObject("SELECT poster_id FROM jobs WHERE id = ?", String.class, job.get("id").asText())).isEqualTo("M9001");
    }

    @Test
    void emptyOptionalFieldsGetDefaults() throws Exception {
        Map<String, Object> b = new LinkedHashMap<>();
        b.put("title", "Zj Clerk");
        b.put("company", "Zj Office");
        b.put("district", "पुणे");
        b.put("phone", "9876500001");
        b.put("salary", "");
        JsonNode job = body(send(post("/api/jobs"), m(1), b).andExpect(status().isCreated())).get("job");
        assertThat(job.get("category").asText()).isEqualTo("सामान्य");
        assertThat(job.get("salary").asText()).isEqualTo("चर्चेनुसार");
        assertThat(job.get("job_type").asText()).isEqualTo("Full-time");
        assertThat(job.get("experience").asText()).isEqualTo("१-३ वर्षे");
    }

    @Test
    void jobFieldsAreValidated() throws Exception {
        List<Map<String, Object>> bad = List.of(
            with(jobBody(), "title", "Z"),
            with(jobBody(), "company", null),
            with(jobBody(), "district", null),
            with(jobBody(), "phone", "123"),
            with(jobBody(), "contact_email", "abc"),
            with(jobBody(), "desc", "x".repeat(1001)));
        for (Map<String, Object> b : bad) {
            send(post("/api/jobs"), m(1), b).andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        }
        assertThat(jobRows("M9001")).isZero();
    }

    @Test
    void fiveJobsADay() throws Exception {
        for (int i = 0; i < 5; i++) postJob(m(1));
        send(post("/api/jobs"), m(1), jobBody()).andExpect(status().isTooManyRequests())
            .andExpect(jsonPath("$.code").value("RATE_LIMIT_EXCEEDED"));
        jdbc.update("UPDATE jobs SET created_at = to_char(now() - interval '25 hours', 'YYYY-MM-DD HH24:MI:SS') WHERE poster_id = 'M9001'");
        postJob(m(1));
    }

    // ------------------------------------------------------------------ board and detail

    @Test
    void visitorsSeeNoContactsMembersDo() throws Exception {
        String id = postJob(m(1));
        String visitor = raw(send(get("/api/jobs"), null, null).andExpect(status().isOk()));
        assertThat(visitor).doesNotContain("9876500001").doesNotContain("hr@zj.test").doesNotContain("poster_id").doesNotContain("M9001");
        String detail = raw(send(get("/api/jobs/" + id), null, null).andExpect(status().isOk()));
        assertThat(detail).doesNotContain("9876500001").doesNotContain("hr@zj.test").doesNotContain("M9001");

        JsonNode asMember = find(body(send(get("/api/jobs"), m(2), null)), "jobs", id);
        assertThat(asMember.get("phone").asText()).isEqualTo("9876500001");
        assertThat(asMember.get("contact_email").asText()).isEqualTo("hr@zj.test");
        assertThat(asMember.get("mine").asBoolean()).isFalse();
        assertThat(find(body(send(get("/api/jobs"), m(1), null)), "jobs", id).get("mine").asBoolean()).isTrue();
    }

    @Test
    void boardShowsOnlyOpenVisibleJobsNewestFirst() throws Exception {
        String closed = postJob(m(1));
        act(m(1), closed, "close").andExpect(status().isOk());
        String expired = postJob(m(1));
        expire(expired);
        String hidden = postJob(m(1));
        hide(hidden);
        String older = postJob(m(2), with(jobBody(), "title", "Zj Driver"));
        jdbc.update("UPDATE jobs SET created_at = to_char(now() - interval '1 hour', 'YYYY-MM-DD HH24:MI:SS') WHERE id = ?", older);
        String newer = postJob(m(2), with(with(jobBody(), "district", "सातारा"), "category", "IT"));

        List<String> board = ids(body(send(get("/api/jobs"), null, null)), "jobs");
        assertThat(board).doesNotContain(closed, expired, hidden);
        assertThat(board).containsSubsequence(newer, older);

        assertThat(ids(body(send(get("/api/jobs?district=पुणे"), null, null)), "jobs")).contains(older).doesNotContain(newer);
        assertThat(ids(body(send(get("/api/jobs?category=Accounts"), null, null)), "jobs")).contains(older).doesNotContain(newer);
        assertThat(ids(body(send(get("/api/jobs?search=TALLY"), null, null)), "jobs")).contains(older, newer);
        assertThat(ids(body(send(get("/api/jobs?district=सर्व&category=all"), null, null)), "jobs")).contains(older, newer);
    }

    @Test
    void detailOpensClosedJobsButHidesHiddenOnes() throws Exception {
        String closed = postJob(m(1));
        act(m(1), closed, "close").andExpect(status().isOk());
        send(get("/api/jobs/" + closed), null, null).andExpect(status().isOk()).andExpect(jsonPath("$.job.state").value("closed"));
        String expired = postJob(m(1));
        expire(expired);
        send(get("/api/jobs/" + expired), null, null).andExpect(status().isOk()).andExpect(jsonPath("$.job.state").value("expired"));

        String hidden = postJob(m(1));
        hide(hidden);
        send(get("/api/jobs/" + hidden), null, null).andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("JOB_NOT_FOUND"));
        send(get("/api/jobs/" + hidden), m(2), null).andExpect(status().isNotFound());
        send(get("/api/jobs/" + hidden), m(1), null).andExpect(status().isOk());
        send(get("/api/jobs/" + hidden), admin(), null).andExpect(status().isOk());
        send(get("/api/jobs/JOB-Zj0"), null, null).andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("JOB_NOT_FOUND"));
    }

    // ------------------------------------------------------------------ close and extend

    @Test
    void ownerClosesAndExtends() throws Exception {
        String a = postJob(m(1));
        act(m(1), a, "close").andExpect(status().isOk()).andExpect(jsonPath("$.job.state").value("closed"));
        assertThat(ids(body(send(get("/api/jobs"), null, null)), "jobs")).doesNotContain(a);

        String b = postJob(m(1));
        expire(b);
        JsonNode job = body(act(m(1), b, " Extend ").andExpect(status().isOk())).get("job");
        assertThat(job.get("state").asText()).isEqualTo("open");
        closeToNowPlusDays(job.get("closes_at").asText(), 30);
        assertThat(ids(body(send(get("/api/jobs"), null, null)), "jobs")).contains(b);
    }

    @Test
    void othersCannotCloseMyJob() throws Exception {
        String id = postJob(m(1));
        act(m(2), id, "close").andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("NOT_OWNER"));
        assertThat(jdbc.queryForObject("SELECT status FROM jobs WHERE id = ?", String.class, id)).isEqualTo("open");
        act(admin(), id, "close").andExpect(status().isOk());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM audit_logs WHERE user_id = ? AND action = 'JOB_CLOSE'", Integer.class, ADMIN))
            .isEqualTo(1);

        String own = postJob(m(1));
        act(m(1), own, "close").andExpect(status().isOk());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM audit_logs WHERE user_id = 'M9001'", Integer.class)).isZero();
        act(m(1), "JOB-Zj0", "close").andExpect(status().isNotFound());
    }

    @Test
    void actingTwiceIsRefused() throws Exception {
        String id = postJob(m(1));
        act(m(1), id, "close").andExpect(status().isOk());
        act(m(1), id, "close").andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("INVALID_TRANSITION"));
        act(m(1), id, "extend").andExpect(status().isConflict());
        String open = postJob(m(1));
        for (Object bad : new Object[] {"accept", "", null, 5}) {
            act(m(1), open, bad).andExpect(status().isBadRequest());
        }
    }

    // ------------------------------------------------------------------ my jobs and stats

    @Test
    void mineListsAllMyJobsWithCounts() throws Exception {
        String open = postJob(m(1));
        String expired = postJob(m(1));
        expire(expired);
        String closed = postJob(m(1));
        act(m(1), closed, "close").andExpect(status().isOk());
        String hidden = postJob(m(1));
        hide(hidden);
        String other = postJob(m(2));

        send(get("/api/jobs/mine"), null, null).andExpect(status().isUnauthorized());
        JsonNode mine = body(send(get("/api/jobs/mine"), m(1), null).andExpect(status().isOk()));
        assertThat(ids(mine, "jobs")).containsExactlyInAnyOrder(open, expired, closed, hidden).doesNotContain(other);
        assertThat(find(mine, "jobs", expired).get("state").asText()).isEqualTo("expired");
        assertThat(find(mine, "jobs", closed).get("state").asText()).isEqualTo("closed");
        assertThat(find(mine, "jobs", open).get("applications").asInt()).isZero();
        assertThat(find(mine, "jobs", open).get("new_applications").asInt()).isZero();
        assertThat(find(mine, "jobs", open).get("phone").asText()).isEqualTo("9876500001");
    }

    @Test
    void statsCountsOpenJobs() throws Exception {
        int before = body(send(get("/api/jobs/stats"), null, null).andExpect(status().isOk())).get("open_jobs").asInt();
        postJob(m(1));
        postJob(m(1));
        String closed = postJob(m(1));
        act(m(1), closed, "close").andExpect(status().isOk());
        hide(postJob(m(2)));
        JsonNode stats = body(send(get("/api/jobs/stats"), null, null));
        assertThat(stats.get("open_jobs").asInt()).isEqualTo(before + 2);
        assertThat(stats.has("hired")).isTrue();
    }

    // ------------------------------------------------------------------ old jobs

    @Test
    void oldJobsGetThirtyMoreDays() throws Exception {
        jdbc.update("INSERT INTO jobs (id, title, company, district, phone, created_at, closes_at) "
            + "VALUES ('JOB-Zj1', 'Zj Old Clerk', 'Zj Old Office', 'पुणे', '9876500009', '2026-01-01 10:00:00', NULL)");
        assertThat(repository.backfillClosesAt()).isGreaterThanOrEqualTo(1);
        JsonNode job = find(body(send(get("/api/jobs"), m(1), null)), "jobs", "JOB-Zj1");
        assertThat(job).isNotNull();
        assertThat(job.get("mine").asBoolean()).isFalse();
        closeToNowPlusDays(job.get("closes_at").asText(), 30);
        assertThat(repository.backfillClosesAt()).isZero();
    }
}
