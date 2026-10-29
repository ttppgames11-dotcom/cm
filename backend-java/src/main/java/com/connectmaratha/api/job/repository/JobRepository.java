package com.connectmaratha.api.job.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/** All job and job application SQL. jobs.created_at is "YYYY-MM-DD HH24:MI:SS" text written by the server (as Node did). */
@Repository
public class JobRepository {

    /** The text timestamp the server writes, as a timestamp (null for any other format). */
    private static final String CREATED_TS = """
        CASE WHEN %s ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$'
             THEN to_timestamp(%s, 'YYYY-MM-DD HH24:MI:SS') END""";

    /**
     * A job with its state (closed, expired past closes_at, else open), created_ts, application counts, whether the
     * viewer (first parameter, may be null) applied, and the poster's name.
     */
    private static final String JOB_SELECT = """
        SELECT j.*,
               CASE WHEN j.status = 'closed' THEN 'closed' WHEN j.closes_at <= now() THEN 'expired' ELSE 'open' END AS state,
               %s AS created_ts,
               (SELECT COUNT(*) FROM job_applications a WHERE a.job_id = j.id) AS applications,
               (SELECT COUNT(*) FROM job_applications a WHERE a.job_id = j.id AND a.status = 'new') AS new_applications,
               EXISTS (SELECT 1 FROM job_applications a WHERE a.job_id = j.id AND a.member_id = CAST(? AS TEXT)) AS applied,
               m.name AS poster_name
        FROM jobs j LEFT JOIN members m ON m.id = j.poster_id""".formatted(CREATED_TS.formatted("j.created_at", "j.created_at"));

    private static final String LISTED = " WHERE j.status = 'open' AND (j.closes_at IS NULL OR j.closes_at > now()) AND NOT j.hidden";

    private final JdbcTemplate jdbc;

    public JobRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // ------------------------------------------------------------------ jobs

    public boolean existsJob(String id) {
        return Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS (SELECT 1 FROM jobs WHERE id = ?)", Boolean.class, id));
    }

    public Optional<Map<String, Object>> findJob(String id, String viewerId) {
        return jdbc.queryForList(JOB_SELECT + " WHERE j.id = ?", viewerId, id).stream().findFirst();
    }

    /** Open, not hidden, not expired jobs, newest first; optional category and district (trimmed, any case) and a search in title, company and description. */
    public List<Map<String, Object>> listed(String category, String district, String search, String viewerId) {
        StringBuilder sql = new StringBuilder(JOB_SELECT).append(LISTED);
        List<Object> args = new ArrayList<>();
        args.add(viewerId);
        if (category != null) {
            sql.append(" AND lower(trim(j.category)) = lower(trim(?))");
            args.add(category);
        }
        if (district != null) {
            sql.append(" AND lower(trim(j.district)) = lower(trim(?))");
            args.add(district);
        }
        if (search != null) {
            sql.append(" AND (j.title ILIKE ? OR j.company ILIKE ? OR j.\"desc\" ILIKE ?)");
            String like = "%" + search.trim() + "%";
            args.add(like);
            args.add(like);
            args.add(like);
        }
        sql.append(" ORDER BY j.created_at DESC, j.id DESC");
        return jdbc.queryForList(sql.toString(), args.toArray());
    }

    public List<Map<String, Object>> jobsOfMember(String memberId) {
        return jdbc.queryForList(JOB_SELECT + " WHERE j.poster_id = ? ORDER BY j.created_at DESC, j.id DESC", memberId, memberId);
    }

    public List<Map<String, Object>> allJobs() {
        return jdbc.queryForList(JOB_SELECT + " ORDER BY j.created_at DESC, j.id DESC", (Object) null);
    }

    public int openJobs() {
        Integer n = jdbc.queryForObject("SELECT COUNT(*) FROM jobs j" + LISTED, Integer.class);
        return n == null ? 0 : n;
    }

    /** Jobs the member posted in the last 24 hours (the fixed text format compares correctly as text). */
    public int recentJobs(String memberId) {
        Integer n = jdbc.queryForObject("""
            SELECT COUNT(*) FROM jobs WHERE poster_id = ? AND created_at > to_char(now() - interval '24 hours', 'YYYY-MM-DD HH24:MI:SS')""",
            Integer.class, memberId);
        return n == null ? 0 : n;
    }

    /** A new open job that closes 30 days from now. */
    public void insertJob(String id, String posterId, String title, String company, String district, String category, String salary,
                          String jobType, String experience, String desc, String contactEmail, String phone) {
        jdbc.update("""
            INSERT INTO jobs (id, poster_id, title, company, district, category, salary, job_type, experience, "desc", contact_email,
              phone, status, closes_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', now() + interval '30 days', to_char(now(), 'YYYY-MM-DD HH24:MI:SS'))""",
            id, posterId, title, company, district, category, salary, jobType, experience, desc, contactEmail, phone);
    }

    /** Closes the job only while it is open; 0 when it was already closed. */
    public int closeIfOpen(String id) {
        return jdbc.update("UPDATE jobs SET status = 'closed', updated_at = now() WHERE id = ? AND status = 'open'", id);
    }

    /** Moves closes_at to 30 days from now, only while the job is open (expired included). */
    public int extendIfOpen(String id) {
        return jdbc.update(
            "UPDATE jobs SET closes_at = now() + interval '30 days', updated_at = now() WHERE id = ? AND status = 'open'", id);
    }

    public int setHidden(String id, boolean hidden) {
        return jdbc.update("UPDATE jobs SET hidden = ?, updated_at = now() WHERE id = ?", hidden, id);
    }

    // ------------------------------------------------------------------ applications

    /** An application with created_ts, and its job's poster, title, company, district and state (null when the job is gone). */
    private static final String APPLICATION_SELECT = """
        SELECT a.*, %s AS created_ts, j.poster_id, j.title AS job_title, j.company AS job_company, j.district AS job_district,
               CASE WHEN j.status = 'closed' THEN 'closed' WHEN j.closes_at <= now() THEN 'expired' ELSE 'open' END AS job_state
        FROM job_applications a LEFT JOIN jobs j ON j.id = a.job_id""".formatted(CREATED_TS.formatted("a.created_at", "a.created_at"));

    public boolean existsApplication(String id) {
        return Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS (SELECT 1 FROM job_applications WHERE id = ?)", Boolean.class, id));
    }

    /** Saves a new application; 0 when this member has already applied to this job (the unique index, so a race never fails). */
    public int insertApplication(String id, String jobId, String memberId, String name, String phone, String email, String summary) {
        return jdbc.update("""
            INSERT INTO job_applications (id, job_id, member_id, applicant_name, phone, email, resume_summary, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'new', to_char(now(), 'YYYY-MM-DD HH24:MI:SS'))
            ON CONFLICT (job_id, member_id) WHERE member_id IS NOT NULL DO NOTHING""",
            id, jobId, memberId, name, phone, email, summary);
    }

    public Optional<Map<String, Object>> findApplication(String id) {
        return jdbc.queryForList(APPLICATION_SELECT + " WHERE a.id = ?", id).stream().findFirst();
    }

    public List<Map<String, Object>> applicationsOfJob(String jobId) {
        return jdbc.queryForList(APPLICATION_SELECT + " WHERE a.job_id = ? ORDER BY a.created_at DESC, a.id DESC", jobId);
    }

    public List<Map<String, Object>> applicationsOfMember(String memberId) {
        return jdbc.queryForList(APPLICATION_SELECT + " WHERE a.member_id = ? ORDER BY a.created_at DESC, a.id DESC", memberId);
    }

    /** Sets the status when it is different; 0 when it already had that status. */
    public int changeStatus(String id, String status) {
        return jdbc.update("UPDATE job_applications SET status = ?, updated_at = now() WHERE id = ? AND status <> ?", status, id, status);
    }

    /** How many members got a job through Connect Maratha: applications marked hired. */
    public int hiredCount() {
        Integer n = jdbc.queryForObject("SELECT COUNT(*) FROM job_applications WHERE status = 'hired'", Integer.class);
        return n == null ? 0 : n;
    }

    // ------------------------------------------------------------------ alerts

    public List<Map<String, Object>> alertsOf(String memberId) {
        return jdbc.queryForList("SELECT * FROM job_alerts WHERE member_id = ? ORDER BY created_at, id", memberId);
    }

    public Optional<Map<String, Object>> findAlert(String id) {
        return jdbc.queryForList("SELECT * FROM job_alerts WHERE id = ?", id).stream().findFirst();
    }

    public int alertCount(String memberId) {
        Integer n = jdbc.queryForObject("SELECT COUNT(*) FROM job_alerts WHERE member_id = ?", Integer.class, memberId);
        return n == null ? 0 : n;
    }

    public boolean existsAlert(String id) {
        return Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS (SELECT 1 FROM job_alerts WHERE id = ?)", Boolean.class, id));
    }

    /** Saves an alert (null = any); 0 when the member already has the same one (the unique index, any case). */
    public int insertAlert(String id, String memberId, String district, String category) {
        return jdbc.update("""
            INSERT INTO job_alerts (id, member_id, district, category) VALUES (?, ?, ?, ?)
            ON CONFLICT (member_id, coalesce(lower(district), ''), coalesce(lower(category), '')) DO NOTHING""",
            id, memberId, district, category);
    }

    /** Deletes the alert only when it belongs to the member; 0 otherwise. */
    public int deleteAlert(String id, String memberId) {
        return jdbc.update("DELETE FROM job_alerts WHERE id = ? AND member_id = ?", id, memberId);
    }

    /**
     * Members to tell about a new job: an alert whose district and category match the job (NULL matches anything;
     * trimmed, any case), never the poster. One row per member however many alerts match; newest alerts first, at most
     * {@code limit}.
     */
    public List<String> matchingAlertMembers(String district, String category, String posterId, int limit) {
        return jdbc.queryForList("""
            SELECT member_id FROM job_alerts
            WHERE member_id <> ?
              AND (district IS NULL OR lower(trim(district)) = lower(trim(?)))
              AND (category IS NULL OR lower(trim(category)) = lower(trim(?)))
            GROUP BY member_id
            ORDER BY max(created_at) DESC, member_id
            LIMIT ?""", String.class, posterId, district, category, limit);
    }

    /** Jobs posted before closing dates existed run 30 more days from now. Returns the number of jobs changed. */
    public int backfillClosesAt() {
        return jdbc.update("UPDATE jobs SET closes_at = now() + interval '30 days' WHERE closes_at IS NULL");
    }
}
