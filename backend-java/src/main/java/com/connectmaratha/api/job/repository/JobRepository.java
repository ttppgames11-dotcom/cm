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

    /** Jobs posted before closing dates existed run 30 more days from now. Returns the number of jobs changed. */
    public int backfillClosesAt() {
        return jdbc.update("UPDATE jobs SET closes_at = now() + interval '30 days' WHERE closes_at IS NULL");
    }
}
