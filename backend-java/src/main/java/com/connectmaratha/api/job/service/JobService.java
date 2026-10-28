package com.connectmaratha.api.job.service;

import com.connectmaratha.api.common.exception.ApiException;
import com.connectmaratha.api.common.schema.LazyTables;
import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.Roles;
import com.connectmaratha.api.common.util.Ids;
import com.connectmaratha.api.common.util.Js;
import com.connectmaratha.api.common.validation.SchemaValidator;
import com.connectmaratha.api.job.dto.JobSchemas;
import com.connectmaratha.api.job.repository.JobRepository;
import com.connectmaratha.api.member.entity.Member;
import com.connectmaratha.api.member.repository.MemberRepository;
import com.connectmaratha.api.sangam.repository.ActivityRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * Job board (रोजगार): jobs owned by the member who posted them, which close when the poster closes them or 30 days
 * after they were posted or extended. Contact phone and email go only to logged-in members.
 */
@Service
public class JobService {

    private static final Logger log = LoggerFactory.getLogger(JobService.class);
    private static final ObjectMapper JSON = new ObjectMapper();
    static final int MAX_JOBS_PER_DAY = 5;

    private final JobRepository jobs;
    private final MemberRepository members;
    private final ActivityRepository activity;
    private final LazyTables tables;
    private final TransactionTemplate ownTransaction;
    private final AtomicBoolean oldJobsDated = new AtomicBoolean();

    public JobService(JobRepository jobs, MemberRepository members, ActivityRepository activity, LazyTables tables,
                      PlatformTransactionManager transactions) {
        this.jobs = jobs;
        this.members = members;
        this.activity = activity;
        this.tables = tables;
        this.ownTransaction = new TransactionTemplate(transactions);
        this.ownTransaction.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    /** Adds the columns and gives jobs without a closing date 30 more days (once per start; again changes nothing). */
    void ensure() {
        tables.ensureJobColumns();
        if (oldJobsDated.get()) return;
        try {
            Integer dated = ownTransaction.execute(status -> jobs.backfillClosesAt());
            if (dated != null && dated > 0) log.info("Gave {} old jobs a closing date 30 days from now", dated);
            oldJobsDated.set(true);
        } catch (RuntimeException e) {
            log.warn("Dating old jobs failed; will retry on next use", e);
        }
    }

    // ------------------------------------------------------------------ board

    /** Open jobs, newest first; "all" / "सर्व" mean no filter. Contacts only for logged-in viewers. */
    @Transactional(readOnly = true)
    public Map<String, Object> list(CurrentUser viewer, String category, String district, String search) {
        ensure();
        String categoryFilter = Js.truthy(category) && !"all".equals(category.trim()) ? category : null;
        String districtFilter = Js.truthy(district) && !"सर्व".equals(district.trim()) ? district : null;
        String searchFilter = search == null || search.isBlank() ? null : search;
        List<Map<String, Object>> list = new ArrayList<>();
        for (Map<String, Object> row : jobs.listed(categoryFilter, districtFilter, searchFilter, viewerId(viewer))) {
            list.add(jobJson(row, viewer));
        }
        return listResult("jobs", list);
    }

    /** One job in any state (a shared link to a closed job still opens); a hidden job only for its poster and admins. */
    @Transactional(readOnly = true)
    public Map<String, Object> detail(CurrentUser viewer, String id) {
        ensure();
        Map<String, Object> row = visibleJob(viewer, id);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("job", jobJson(row, viewer));
        return out;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> stats() {
        ensure();
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("open_jobs", jobs.openJobs());
        out.put("hired", 0);
        return out;
    }

    // ------------------------------------------------------------------ posting and managing

    /** Posts a job (5 per member per 24 hours) that closes in 30 days. */
    @Transactional
    public Map<String, Object> create(CurrentUser user, Map<String, Object> body) {
        ensure();
        Map<String, Object> input = JobSchemas.normalize(body);
        SchemaValidator.check(input, JobSchemas.JOB, true, null);
        if (jobs.recentJobs(user.id()) >= MAX_JOBS_PER_DAY) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "RATE_LIMIT_EXCEEDED",
                "२४ तासांत जास्तीत जास्त ५ नोकरी जाहिराती देता येतात (At most 5 jobs in 24 hours).");
        }
        String id = Ids.millis("JOB-", jobs::existsJob);
        jobs.insertJob(id, user.id(), text(input.get("title")), text(input.get("company")), text(input.get("district")),
            orElse(input.get("category"), "सामान्य"), orElse(input.get("salary"), "चर्चेनुसार"),
            orElse(input.get("job_type"), "Full-time"), orElse(input.get("experience"), "१-३ वर्षे"),
            text(input.get("desc")), text(input.get("contact_email")), text(input.get("phone")));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", "नोकरी जाहिरात प्रसिद्ध झाली! (Job posted.)");
        out.put("job", jobJson(jobs.findJob(id, user.id()).orElseThrow(), user));
        return out;
    }

    /** { action: close | extend } by the poster or an admin, only while the job is open. */
    @Transactional
    public Map<String, Object> act(CurrentUser user, String id, Map<String, Object> body) {
        ensure();
        Map<String, Object> input = JobSchemas.normalize(body);
        SchemaValidator.check(input, JobSchemas.ACTION, true, null);
        String action = text(input.get("action"));
        Map<String, Object> row = jobs.findJob(id, user.id()).orElseThrow(JobService::jobNotFound);
        boolean owner = isPoster(user, row);
        if (!owner && !isAdmin(user)) throw notOwner();
        int changed = action.equals("close") ? jobs.closeIfOpen(id) : jobs.extendIfOpen(id);
        if (changed == 0) {
            throw new ApiException(HttpStatus.CONFLICT, "INVALID_TRANSITION", "ही जागा आधीच बंद झाली आहे (This job is already closed).");
        }
        if (!owner && action.equals("close")) audit(user, "JOB_CLOSE", Map.of("jobId", id));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", action.equals("close")
            ? "जागा बंद केली (Job closed.)"
            : "जाहिरात आणखी ३० दिवस सुरू राहील (Job extended by 30 days.)");
        out.put("job", jobJson(jobs.findJob(id, user.id()).orElseThrow(), user));
        return out;
    }

    /** The caller's jobs in every state, with application counts. */
    @Transactional(readOnly = true)
    public Map<String, Object> mine(CurrentUser user) {
        ensure();
        List<Map<String, Object>> list = new ArrayList<>();
        for (Map<String, Object> row : jobs.jobsOfMember(user.id())) list.add(ownJobJson(row, user));
        return listResult("jobs", list);
    }

    // ------------------------------------------------------------------ helpers

    /** The job, or 404 when it does not exist or is hidden from this viewer. */
    private Map<String, Object> visibleJob(CurrentUser viewer, String id) {
        Map<String, Object> row = jobs.findJob(id, viewerId(viewer)).orElseThrow(JobService::jobNotFound);
        if (Boolean.TRUE.equals(row.get("hidden")) && !isPoster(viewer, row) && !isAdmin(viewer)) throw jobNotFound();
        return row;
    }

    /** A job as a viewer may see it: no poster id; contact phone and email only for logged-in viewers. */
    static Map<String, Object> jobJson(Map<String, Object> row, CurrentUser viewer) {
        Map<String, Object> j = new LinkedHashMap<>();
        j.put("id", row.get("id"));
        for (String k : new String[] {"title", "company", "district", "category", "salary", "job_type", "experience", "desc"}) {
            j.put(k, text(row.get(k)));
        }
        j.put("created_at", iso(row.get("created_ts"), row.get("created_at")));
        j.put("closes_at", iso(row.get("closes_at"), null));
        j.put("state", text(row.get("state")));
        j.put("mine", isPoster(viewer, row));
        j.put("applied", viewer != null && Boolean.TRUE.equals(row.get("applied")));
        if (viewer != null) {
            j.put("phone", text(row.get("phone")));
            j.put("contact_email", text(row.get("contact_email")));
        }
        return j;
    }

    /** The poster's own view: the public fields plus application counts and the hidden flag. */
    static Map<String, Object> ownJobJson(Map<String, Object> row, CurrentUser viewer) {
        Map<String, Object> j = jobJson(row, viewer);
        j.put("applications", count(row.get("applications")));
        j.put("new_applications", count(row.get("new_applications")));
        j.put("hidden", Boolean.TRUE.equals(row.get("hidden")));
        return j;
    }

    private void audit(CurrentUser user, String action, Map<String, Object> details) {
        String name = members.findById(user.id()).map(Member::getName).map(JobService::text).filter(s -> !s.isEmpty()).orElse("सदस्य");
        String json;
        try {
            json = JSON.writeValueAsString(details);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(e);
        }
        activity.audit("LOG-" + System.currentTimeMillis() + "-" + Ids.between(0, 1000), user.id(), name, action, json);
    }

    static boolean isPoster(CurrentUser user, Map<String, Object> job) {
        return user != null && user.id().equals(job.get("poster_id"));
    }

    static boolean isAdmin(CurrentUser user) {
        return user != null && Roles.isAdmin(user);
    }

    static String viewerId(CurrentUser viewer) {
        return viewer == null ? null : viewer.id();
    }

    static ApiException jobNotFound() {
        return ApiException.notFound("JOB_NOT_FOUND", "नोकरी संधी आढळली नाही (Job not found).");
    }

    static ApiException notOwner() {
        return ApiException.forbidden("NOT_OWNER", "ही जाहिरात आपली नाही (This job is not yours).");
    }

    /** A timestamp as ISO-8601 text (UTC); the stored text when it could not be read as a timestamp. */
    static String iso(Object timestamp, Object text) {
        if (timestamp instanceof java.sql.Timestamp t) return t.toInstant().toString();
        if (timestamp instanceof OffsetDateTime o) return o.toInstant().toString();
        return text == null ? null : text.toString();
    }

    static int count(Object value) {
        return value instanceof Number n ? n.intValue() : 0;
    }

    static String orElse(Object value, String fallback) {
        String s = text(value);
        return s.isEmpty() ? fallback : s;
    }

    static String text(Object value) {
        return value == null ? "" : value.toString().trim();
    }

    static Map<String, Object> listResult(String key, List<Map<String, Object>> list) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("count", list.size());
        out.put(key, list);
        return out;
    }
}
