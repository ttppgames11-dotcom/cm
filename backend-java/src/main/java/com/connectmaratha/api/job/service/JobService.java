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
        out.put("hired", jobs.hiredCount());
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
        String id = newId("JOB-", jobs::existsJob);
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

    // ------------------------------------------------------------------ applications

    /**
     * Applies to an open job (once per member; not to your own). Not one transaction: the application is saved
     * first and the poster's notification is sent on its own, so a failed notification never undoes it.
     */
    public Map<String, Object> apply(CurrentUser user, String jobId, Map<String, Object> body) {
        ensure();
        Map<String, Object> job = visibleJob(user, jobId);
        if (!"open".equals(job.get("state"))) {
            throw new ApiException(HttpStatus.CONFLICT, "JOB_CLOSED", "ही जागा आता बंद आहे (This job is closed).");
        }
        if (isPoster(user, job)) throw ApiException.badRequest("OWN_JOB", "स्वतःच्या जाहिरातीला अर्ज करता येत नाही (You cannot apply to your own job).");
        Map<String, Object> input = JobSchemas.normalize(body);
        SchemaValidator.check(input, JobSchemas.APPLICATION, true, null);
        String id = newId("APP-", jobs::existsApplication);
        String name = text(input.get("applicant_name"));
        int saved = jobs.insertApplication(id, jobId, user.id(), name, text(input.get("phone")), text(input.get("email")),
            text(input.get("resume_summary")));
        if (saved == 0) {
            throw new ApiException(HttpStatus.CONFLICT, "ALREADY_APPLIED", "तुम्ही या जागेसाठी आधीच अर्ज केला आहे (You have already applied).");
        }
        Object poster = job.get("poster_id");
        if (poster != null) {
            send(jobId, poster.toString(), "📩 नवीन अर्ज: " + text(job.get("title")),
                name + " यांनी अर्ज केला. माझ्या जाहिराती मध्ये पहा.", "job");
        }
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", "आपला नोकरी अर्ज यशस्वीरित्या सादर करण्यात आला! (Application sent.)");
        out.put("application", myApplicationJson(jobs.findApplication(id).orElseThrow()));
        return out;
    }

    /** The caller's applications with their job and status, newest first. */
    @Transactional(readOnly = true)
    public Map<String, Object> myApplications(CurrentUser user) {
        ensure();
        List<Map<String, Object>> list = new ArrayList<>();
        for (Map<String, Object> row : jobs.applicationsOfMember(user.id())) list.add(myApplicationJson(row));
        return listResult("applications", list);
    }

    /** A job's applicants with their contacts, for its poster and admins only. */
    @Transactional(readOnly = true)
    public Map<String, Object> applications(CurrentUser user, String jobId) {
        ensure();
        Map<String, Object> job = jobs.findJob(jobId, user.id()).orElseThrow(JobService::jobNotFound);
        if (!isPoster(user, job) && !isAdmin(user)) throw notOwner();
        List<Map<String, Object>> list = new ArrayList<>();
        for (Map<String, Object> row : jobs.applicationsOfJob(jobId)) list.add(applicantJson(row));
        return listResult("applications", list);
    }

    /** { status: new | shortlisted | rejected | hired } by the job's poster or an admin; the applicant is told when it changes. */
    public Map<String, Object> setStatus(CurrentUser user, String applicationId, Map<String, Object> body) {
        ensure();
        Map<String, Object> app = jobs.findApplication(applicationId).orElseThrow(() ->
            ApiException.notFound("APPLICATION_NOT_FOUND", "हा अर्ज सापडला नाही (Application not found)."));
        if (!isPoster(user, app) && !isAdmin(user)) throw notOwner();
        Map<String, Object> input = JobSchemas.normalize(body);
        SchemaValidator.check(input, JobSchemas.STATUS, true, null);
        String status = text(input.get("status"));
        boolean changed = jobs.changeStatus(applicationId, status) > 0;
        Object applicant = app.get("member_id");
        if (changed && applicant != null && !status.equals("new")) {
            send(text(app.get("job_id")), applicant.toString(), STATUS_ICONS.get(status) + " अर्जाची स्थिती: " + text(app.get("job_title")),
                text(app.get("job_company")) + ": " + STATUS_LABELS.get(status), "job_application");
        }
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", "अर्जाची स्थिती: " + STATUS_LABELS.get(status) + " (Status saved.)");
        out.put("application", applicantJson(jobs.findApplication(applicationId).orElseThrow()));
        return out;
    }

    /** One notification in its own transaction; false (logged) when it fails, which never undoes the action. */
    private boolean send(String jobId, String memberId, String title, String message, String type) {
        try {
            ownTransaction.executeWithoutResult(status -> activity.notifyMember(notificationId(), memberId, title, message, type));
            return true;
        } catch (RuntimeException e) {
            log.warn("Job {}: could not notify {}", jobId, memberId, e);
            return false;
        }
    }

    // ------------------------------------------------------------------ admin

    @Transactional(readOnly = true)
    public Map<String, Object> adminAll(CurrentUser user) {
        requireAdmin(user);
        ensure();
        List<Map<String, Object>> list = new ArrayList<>();
        for (Map<String, Object> row : jobs.allJobs()) {
            Map<String, Object> j = ownJobJson(row, user);
            j.put("poster_name", row.get("poster_name"));
            list.add(j);
        }
        return listResult("jobs", list);
    }

    /** { hidden: true | false }: hide a job from the board, or show it again. */
    @Transactional
    public Map<String, Object> setHidden(CurrentUser user, String jobId, Map<String, Object> body) {
        requireAdmin(user);
        ensure();
        SchemaValidator.check(body, JobSchemas.HIDDEN, true, null);
        boolean hidden = Boolean.TRUE.equals(body.get("hidden"));
        if (jobs.setHidden(jobId, hidden) == 0) throw jobNotFound();
        audit(user, hidden ? "JOB_HIDE" : "JOB_UNHIDE", Map.of("jobId", jobId));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", hidden ? "जाहिरात लपवली (Job hidden.)" : "जाहिरात पुन्हा दिसेल (Job shown again.)");
        out.put("job", ownJobJson(jobs.findJob(jobId, user.id()).orElseThrow(), user));
        return out;
    }

    // ------------------------------------------------------------------ helpers

    static final Map<String, String> STATUS_LABELS = Map.of(
        "new", "नवीन", "shortlisted", "शॉर्टलिस्ट", "rejected", "निवड नाही", "hired", "नोकरी मिळाली");
    static final Map<String, String> STATUS_ICONS = Map.of("new", "⏳", "shortlisted", "✅", "rejected", "❌", "hired", "🎉");

    /** An applicant as the job's poster and admins see them, contacts included. */
    static Map<String, Object> applicantJson(Map<String, Object> row) {
        Map<String, Object> a = new LinkedHashMap<>();
        a.put("id", row.get("id"));
        a.put("job_id", row.get("job_id"));
        for (String k : new String[] {"applicant_name", "phone", "email", "resume_summary", "status"}) a.put(k, text(row.get(k)));
        a.put("created_at", iso(row.get("created_ts"), row.get("created_at")));
        return a;
    }

    /** The applicant's own view: status and the job it is for (no other applicant's data). */
    static Map<String, Object> myApplicationJson(Map<String, Object> row) {
        Map<String, Object> a = new LinkedHashMap<>();
        a.put("id", row.get("id"));
        a.put("status", text(row.get("status")));
        a.put("created_at", iso(row.get("created_ts"), row.get("created_at")));
        Map<String, Object> job = new LinkedHashMap<>();
        job.put("id", row.get("job_id"));
        job.put("title", text(row.get("job_title")));
        job.put("company", text(row.get("job_company")));
        job.put("district", text(row.get("job_district")));
        job.put("state", text(row.get("job_state")));
        a.put("job", job);
        return a;
    }

    private static void requireAdmin(CurrentUser user) {
        if (!isAdmin(user)) throw ApiException.forbidden("FORBIDDEN", "ही कृती आपण करू शकत नाही (You cannot do this).");
    }

    private static String notificationId() {
        return "NOTIF-" + System.currentTimeMillis() + "-" + java.util.UUID.randomUUID().toString().substring(0, 8);
    }

    /** prefix + milliseconds + 4 random characters, so two saves in the same millisecond never share an id. */
    static String newId(String prefix, java.util.function.Predicate<String> taken) {
        String id;
        do {
            id = prefix + System.currentTimeMillis() + Ids.base36(4);
        } while (taken.test(id));
        return id;
    }

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
