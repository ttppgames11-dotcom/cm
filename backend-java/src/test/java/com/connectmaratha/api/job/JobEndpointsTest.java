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
        // alerts saved by JobAlertsTest would add notifications here
        if (jdbc.queryForObject("SELECT to_regclass('job_alerts') IS NOT NULL", Boolean.class)) {
            jdbc.update("DELETE FROM job_alerts WHERE member_id LIKE 'M90%'");
        }
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

    // ------------------------------------------------------------------ application helpers

    static Map<String, Object> applyBody() {
        Map<String, Object> b = new LinkedHashMap<>();
        b.put("applicant_name", "Zj Rahul");
        b.put("phone", "9876500002");
        b.put("email", "rahul@zj.test");
        b.put("resume_summary", "3 years Tally");
        return b;
    }

    ResultActions apply(String token, String jobId) throws Exception {
        return send(post("/api/jobs/" + jobId + "/apply"), token, applyBody());
    }

    String applied(String token, String jobId) throws Exception {
        return body(apply(token, jobId).andExpect(status().isCreated())).get("application").get("id").asText();
    }

    ResultActions setStatus(String token, String appId, Object value) throws Exception {
        Map<String, Object> b = new LinkedHashMap<>();
        if (value != null) b.put("status", value);
        return send(put("/api/jobs/applications/" + appId), token, b);
    }

    int applicationRows(String jobId, String memberId) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM job_applications WHERE job_id = ? AND member_id = ?", Integer.class, jobId, memberId);
    }

    List<Map<String, Object>> notificationsOf(String memberId) {
        return jdbc.queryForList("SELECT * FROM notifications WHERE member_id = ? ORDER BY created_at", memberId);
    }

    int hired() throws Exception {
        return body(send(get("/api/jobs/stats"), null, null).andExpect(status().isOk())).get("hired").asInt();
    }

    /** Runs the calls at the same instant and returns their HTTP statuses. */
    List<Integer> atOnce(List<java.util.concurrent.Callable<ResultActions>> calls) throws Exception {
        java.util.concurrent.CountDownLatch go = new java.util.concurrent.CountDownLatch(1);
        java.util.concurrent.ExecutorService pool = java.util.concurrent.Executors.newFixedThreadPool(calls.size());
        List<java.util.concurrent.Future<Integer>> results = new ArrayList<>();
        for (java.util.concurrent.Callable<ResultActions> call : calls) {
            results.add(pool.submit(() -> {
                go.await();
                return call.call().andReturn().getResponse().getStatus();
            }));
        }
        go.countDown();
        List<Integer> statuses = new ArrayList<>();
        for (java.util.concurrent.Future<Integer> f : results) statuses.add(f.get());
        pool.shutdown();
        return statuses;
    }

    // ------------------------------------------------------------------ applying

    @Test
    void applyingNeedsALogin() throws Exception {
        String job = postJob(m(1));
        apply(null, job).andExpect(status().isUnauthorized());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM job_applications WHERE job_id = ?", Integer.class, job)).isZero();
    }

    @Test
    void memberApplies() throws Exception {
        String job = postJob(m(1));
        JsonNode application = body(apply(m(2), job).andExpect(status().isCreated())).get("application");
        assertThat(application.get("id").asText()).startsWith("APP-");
        assertThat(application.get("status").asText()).isEqualTo("new");
        assertThat(applicationRows(job, "M9002")).isEqualTo(1);
        assertThat(find(body(send(get("/api/jobs"), m(2), null)), "jobs", job).get("applied").asBoolean()).isTrue();
        assertThat(find(body(send(get("/api/jobs"), m(3), null)), "jobs", job).get("applied").asBoolean()).isFalse();
    }

    @Test
    void applyingTwiceIsRefused() throws Exception {
        String job = postJob(m(1));
        apply(m(2), job).andExpect(status().isCreated());
        apply(m(2), job).andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("ALREADY_APPLIED"));
        assertThat(applicationRows(job, "M9002")).isEqualTo(1);
    }

    @Test
    void simultaneousApplicationsLeaveOneRow() throws Exception {
        String job = postJob(m(1));
        for (int round = 0; round < 10; round++) {
            jdbc.update("DELETE FROM job_applications WHERE job_id = ?", job);
            List<Integer> statuses = atOnce(List.of(() -> apply(m(3), job), () -> apply(m(3), job)));
            assertThat(statuses).containsExactlyInAnyOrder(201, 409);
            assertThat(applicationRows(job, "M9003")).isEqualTo(1);
        }
    }

    @Test
    void cannotApplyToOwnClosedExpiredHiddenOrMissingJobs() throws Exception {
        String own = postJob(m(1));
        apply(m(1), own).andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("OWN_JOB"));
        String closed = postJob(m(1));
        act(m(1), closed, "close").andExpect(status().isOk());
        apply(m(2), closed).andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("JOB_CLOSED"));
        String expired = postJob(m(1));
        expire(expired);
        apply(m(2), expired).andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("JOB_CLOSED"));
        String hidden = postJob(m(1));
        hide(hidden);
        apply(m(2), hidden).andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("JOB_NOT_FOUND"));
        apply(m(2), "JOB-Zj0").andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("JOB_NOT_FOUND"));
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM job_applications WHERE member_id IN ('M9001', 'M9002')", Integer.class))
            .isZero();
    }

    @Test
    void applicationFieldsAreValidated() throws Exception {
        String job = postJob(m(1));
        List<Map<String, Object>> bad = List.of(
            with(applyBody(), "applicant_name", "Z"),
            with(applyBody(), "phone", "12"),
            with(applyBody(), "email", "x"),
            with(applyBody(), "resume_summary", "x".repeat(501)));
        for (Map<String, Object> b : bad) {
            String reply = raw(send(post("/api/jobs/" + job + "/apply"), m(2), b).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR")));
            assertThat(reply).doesNotContain("9876500001");
        }
        assertThat(applicationRows(job, "M9002")).isZero();
    }

    @Test
    void posterIsNotified() throws Exception {
        String job = postJob(m(1));
        applied(m(2), job);
        List<Map<String, Object>> rows = notificationsOf("M9001");
        assertThat(rows).hasSize(1);
        assertThat(rows.get(0).get("type")).isEqualTo("job");
        assertThat(rows.get(0).get("title")).isEqualTo("📩 नवीन अर्ज: Zj Accountant");
        assertThat(String.valueOf(rows.get(0).get("message"))).contains("Zj Rahul");

        jdbc.update("INSERT INTO jobs (id, title, company, district, phone, created_at, closes_at) "
            + "VALUES ('JOB-Zj2', 'Zj Old Driver', 'Zj Old Travels', 'पुणे', '9876500009', '2026-01-01 10:00:00', now() + interval '1 day')");
        applied(m(3), "JOB-Zj2");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM notifications WHERE title LIKE '%Zj Old Driver%'", Integer.class)).isZero();
    }

    // ------------------------------------------------------------------ the poster's view

    @Test
    void posterAndAdminSeeApplicantsOthersDont() throws Exception {
        String job = postJob(m(1));
        applied(m(2), job);
        jdbc.update("UPDATE job_applications SET created_at = '2026-01-01 10:00:00' WHERE job_id = ?", job);
        applied(m(3), job);
        for (String who : List.of(m(1), admin())) {
            JsonNode list = body(send(get("/api/jobs/" + job + "/applications"), who, null).andExpect(status().isOk()));
            assertThat(list.get("count").asInt()).isEqualTo(2);
            JsonNode newest = list.get("applications").get(0);
            assertThat(newest.get("phone").asText()).isEqualTo("9876500002");
            assertThat(newest.get("email").asText()).isEqualTo("rahul@zj.test");
            assertThat(newest.get("resume_summary").asText()).isEqualTo("3 years Tally");
            assertThat(newest.get("status").asText()).isEqualTo("new");
            assertThat(raw(send(get("/api/jobs/" + job + "/applications"), who, null))).doesNotContain("M9003");
        }
        send(get("/api/jobs/" + job + "/applications"), m(2), null).andExpect(status().isForbidden())
            .andExpect(jsonPath("$.code").value("NOT_OWNER"));
        send(get("/api/jobs/" + job + "/applications"), m(4), null).andExpect(status().isForbidden());
        send(get("/api/jobs/" + job + "/applications"), null, null).andExpect(status().isUnauthorized());
        send(get("/api/jobs/JOB-Zj0/applications"), m(1), null).andExpect(status().isNotFound());
    }

    @Test
    void posterSetsStatusesAndApplicantIsNotified() throws Exception {
        String job = postJob(m(1));
        String app = applied(m(2), job);
        setStatus(m(1), app, " Shortlisted ").andExpect(status().isOk()).andExpect(jsonPath("$.application.status").value("shortlisted"));
        List<Map<String, Object>> rows = notificationsOf("M9002");
        assertThat(rows).hasSize(1);
        assertThat(rows.get(0).get("type")).isEqualTo("job_application");
        assertThat(rows.get(0).get("title")).isEqualTo("✅ अर्जाची स्थिती: Zj Accountant");
        assertThat(rows.get(0).get("message")).isEqualTo("Zj Traders: शॉर्टलिस्ट");

        setStatus(m(1), app, "shortlisted").andExpect(status().isOk());
        assertThat(notificationsOf("M9002")).hasSize(1);
        setStatus(m(1), app, "new").andExpect(status().isOk());
        assertThat(notificationsOf("M9002")).hasSize(1);
        for (Object bad : new Object[] {"boss", "", null}) setStatus(m(1), app, bad).andExpect(status().isBadRequest());

        act(m(1), job, "close").andExpect(status().isOk());
        setStatus(m(1), app, "hired").andExpect(status().isOk());
        assertThat(notificationsOf("M9002")).hasSize(2);
        setStatus(m(3), app, "rejected").andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("NOT_OWNER"));
        setStatus(m(1), "APP-Zj0", "rejected").andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("APPLICATION_NOT_FOUND"));
        setStatus(admin(), app, "rejected").andExpect(status().isOk());
    }

    @Test
    void myApplicationsShowJobAndStatus() throws Exception {
        String a = postJob(m(1));
        String b = postJob(m(1), with(jobBody(), "title", "Zj Driver"));
        applied(m(2), a);
        jdbc.update("UPDATE job_applications SET created_at = '2026-01-01 10:00:00' WHERE job_id = ?", a);
        applied(m(2), b);
        act(m(1), a, "close").andExpect(status().isOk());
        applied(m(3), b);

        send(get("/api/jobs/applications/mine"), null, null).andExpect(status().isUnauthorized());
        JsonNode mine = body(send(get("/api/jobs/applications/mine"), m(2), null).andExpect(status().isOk()));
        assertThat(mine.get("count").asInt()).isEqualTo(2);
        JsonNode first = mine.get("applications").get(0);
        JsonNode second = mine.get("applications").get(1);
        assertThat(first.get("job").get("title").asText()).isEqualTo("Zj Driver");
        assertThat(first.get("job").get("state").asText()).isEqualTo("open");
        assertThat(second.get("job").get("id").asText()).isEqualTo(a);
        assertThat(second.get("job").get("state").asText()).isEqualTo("closed");
        assertThat(second.get("status").asText()).isEqualTo("new");
        assertThat(second.get("job").get("company").asText()).isEqualTo("Zj Traders");
    }

    @Test
    void mineCountsApplications() throws Exception {
        String job = postJob(m(1));
        String first = applied(m(2), job);
        applied(m(3), job);
        applied(m(4), job);
        setStatus(m(1), first, "shortlisted").andExpect(status().isOk());
        JsonNode row = find(body(send(get("/api/jobs/mine"), m(1), null)), "jobs", job);
        assertThat(row.get("applications").asInt()).isEqualTo(3);
        assertThat(row.get("new_applications").asInt()).isEqualTo(2);
    }

    @Test
    void hiredCounterCountsHiredApplications() throws Exception {
        String job = postJob(m(1));
        String app = applied(m(2), job);
        int before = hired();
        setStatus(m(1), app, "hired").andExpect(status().isOk());
        assertThat(hired()).isEqualTo(before + 1);
        setStatus(m(1), app, "rejected").andExpect(status().isOk());
        assertThat(hired()).isEqualTo(before);
    }

    @Test
    void oldApplicationsAreAdminOnly() throws Exception {
        jdbc.update("INSERT INTO jobs (id, title, company, district, phone, created_at, closes_at) "
            + "VALUES ('JOB-Zj3', 'Zj Old Clerk', 'Zj Old Office', 'पुणे', '9876500009', '2026-01-01 10:00:00', now() + interval '1 day')");
        jdbc.update("INSERT INTO job_applications (id, job_id, applicant_name, phone, created_at) "
            + "VALUES ('APP-Zj1', 'JOB-Zj3', 'Zj Old Applicant', '9876500008', '2026-01-02 10:00:00')");
        JsonNode list = body(send(get("/api/jobs/JOB-Zj3/applications"), admin(), null).andExpect(status().isOk()));
        assertThat(list.get("applications").get(0).get("applicant_name").asText()).isEqualTo("Zj Old Applicant");
        send(get("/api/jobs/JOB-Zj3/applications"), m(1), null).andExpect(status().isForbidden());
        setStatus(m(1), "APP-Zj1", "hired").andExpect(status().isForbidden());
    }

    // ------------------------------------------------------------------ admin

    @Test
    void adminSeesAllJobsAndHides() throws Exception {
        String closed = postJob(m(1));
        act(m(1), closed, "close").andExpect(status().isOk());
        String hidden = postJob(m(1));
        hide(hidden);
        String open = postJob(m(2));
        applied(m(3), open);
        jdbc.update("INSERT INTO jobs (id, title, company, district, phone, created_at, closes_at) "
            + "VALUES ('JOB-Zj4', 'Zj Old Cook', 'Zj Old Hotel', 'पुणे', '9876500009', '2026-01-01 10:00:00', now() - interval '1 day')");

        send(get("/api/admin/jobs"), m(1), null).andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("FORBIDDEN"));
        send(put("/api/admin/jobs/" + open), m(1), Map.of("hidden", true)).andExpect(status().isForbidden());

        JsonNode all = body(send(get("/api/admin/jobs"), admin(), null).andExpect(status().isOk()));
        assertThat(ids(all, "jobs")).contains(closed, hidden, open, "JOB-Zj4");
        assertThat(find(all, "jobs", hidden).get("hidden").asBoolean()).isTrue();
        assertThat(find(all, "jobs", "JOB-Zj4").get("state").asText()).isEqualTo("expired");
        assertThat(find(all, "jobs", "JOB-Zj4").get("poster_name").isNull()).isTrue();
        assertThat(find(all, "jobs", open).get("poster_name").asText()).isEqualTo("Member M9002");
        assertThat(find(all, "jobs", open).get("applications").asInt()).isEqualTo(1);
        assertThat(find(all, "jobs", open).get("phone").asText()).isEqualTo("9876500001");

        send(put("/api/admin/jobs/" + open), admin(), Map.of("hidden", true)).andExpect(status().isOk());
        assertThat(ids(body(send(get("/api/jobs"), null, null)), "jobs")).doesNotContain(open);
        send(put("/api/admin/jobs/" + open), admin(), Map.of("hidden", false)).andExpect(status().isOk());
        assertThat(ids(body(send(get("/api/jobs"), null, null)), "jobs")).contains(open);
        assertThat(jdbc.queryForList("SELECT action FROM audit_logs WHERE user_id = ? ORDER BY created_at, id", String.class, ADMIN))
            .containsExactly("JOB_HIDE", "JOB_UNHIDE");
        send(put("/api/admin/jobs/" + open), admin(), Map.of()).andExpect(status().isBadRequest());
        send(put("/api/admin/jobs/JOB-Zj0"), admin(), Map.of("hidden", true)).andExpect(status().isNotFound());
    }
}
