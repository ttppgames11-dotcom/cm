package com.connectmaratha.api.common.schema;

import java.util.concurrent.atomic.AtomicBoolean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.stereotype.Component;

/**
 * Tables the Node backend creates on first use (backend/utils/websiteTables.js)
 * rather than in a migration. Java runs the identical CREATE TABLE IF NOT EXISTS,
 * so it never changes a table that already exists.
 */
@Component
public class LazyTables {

    private static final String SUPPORT_TICKETS = """
        CREATE TABLE IF NOT EXISTS support_tickets (
          id TEXT PRIMARY KEY, source TEXT DEFAULT 'helpdesk', title TEXT NOT NULL,
          description TEXT NOT NULL, category TEXT, subcategory TEXT, priority TEXT,
          district TEXT, taluka TEXT, division TEXT, assigned_center_id TEXT,
          current_owner_level TEXT DEFAULT 'taluka', status TEXT DEFAULT 'New',
          requester_id TEXT, requester_name TEXT, requester_phone TEXT, requester_email TEXT,
          language TEXT, sla_hours INTEGER, audit_trail TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT)""";

    private static final String SERVICES = """
        CREATE TABLE IF NOT EXISTS services (
          id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL,
          location TEXT, phone TEXT, experience TEXT, pricing TEXT, description TEXT,
          status TEXT DEFAULT 'active', created_by TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT)""";

    private static final String SERVICE_BOOKINGS = """
        CREATE TABLE IF NOT EXISTS service_bookings (
          id TEXT PRIMARY KEY, service_id TEXT, service_category TEXT NOT NULL,
          professional_name TEXT, customer_id TEXT, customer_name TEXT, phone TEXT NOT NULL,
          address TEXT, requested_date TEXT, notes TEXT, status TEXT DEFAULT 'new',
          created_at TEXT DEFAULT CURRENT_TIMESTAMP)""";

    private static final String COMMUNITY_CENTERS = """
        CREATE TABLE IF NOT EXISTS community_centers (
          id TEXT PRIMARY KEY, name TEXT NOT NULL, tier TEXT, division TEXT, district TEXT,
          taluka TEXT, address TEXT, contact_person TEXT, phone TEXT,
          status TEXT DEFAULT 'active', created_at TEXT DEFAULT CURRENT_TIMESTAMP)""";

    private static final String CENTER_ACTIVITIES = """
        CREATE TABLE IF NOT EXISTS center_activities (
          id TEXT PRIMARY KEY, center_id TEXT NOT NULL, type TEXT NOT NULL,
          person_name TEXT, phone TEXT, purpose TEXT, desk TEXT, category TEXT,
          amount NUMERIC, payment_mode TEXT, recorded_by TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP)""";

    private static final String REPORTS = """
        CREATE TABLE IF NOT EXISTS reports (
          id TEXT PRIMARY KEY, reporter_id TEXT NOT NULL, target_type TEXT NOT NULL,
          target_id TEXT NOT NULL, reason TEXT NOT NULL, details TEXT,
          status TEXT DEFAULT 'open', created_at TEXT DEFAULT CURRENT_TIMESTAMP)""";

    private static final String BLOCKS = """
        CREATE TABLE IF NOT EXISTS blocks (
          blocker_id TEXT NOT NULL, blocked_id TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (blocker_id, blocked_id))""";

    /** B2B requirements and quotes (/leads). Not from Node: the same SQL is kept as migration 008_enquiries.sql. */
    static final String ENQUIRY_TABLES = """
        CREATE TABLE IF NOT EXISTS enquiries (
          id          TEXT PRIMARY KEY,
          member_id   TEXT NOT NULL,
          title       TEXT NOT NULL,
          description TEXT,
          category    TEXT NOT NULL,
          city        TEXT,
          district    TEXT NOT NULL,
          budget      TEXT,
          client_name TEXT,
          phone       TEXT,
          status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
          created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
          closed_at   TIMESTAMPTZ
        );
        CREATE INDEX IF NOT EXISTS idx_enquiries_member  ON enquiries (member_id);
        CREATE INDEX IF NOT EXISTS idx_enquiries_created ON enquiries (created_at DESC);

        CREATE TABLE IF NOT EXISTS enquiry_quotes (
          id             TEXT PRIMARY KEY,
          enquiry_id     TEXT NOT NULL REFERENCES enquiries (id) ON DELETE CASCADE,
          member_id      TEXT NOT NULL,
          business_name  TEXT NOT NULL,
          owner_name     TEXT,
          phone          TEXT NOT NULL,
          quote_amount   TEXT,
          proposal_notes TEXT,
          created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
          UNIQUE (enquiry_id, member_id)
        );
        CREATE INDEX IF NOT EXISTS idx_enquiry_quotes_member ON enquiry_quotes (member_id);
        """;

    /** Which of the receiver's businesses a referral is for. Not from Node: the same SQL is kept as migration 009. */
    static final String REFERRAL_COLUMNS = "ALTER TABLE referrals ADD COLUMN IF NOT EXISTS business_id TEXT";
    static final String[] MEETING_COLUMNS = {
        "ALTER TABLE meetings ADD COLUMN IF NOT EXISTS mode TEXT",
        "ALTER TABLE meetings ADD COLUMN IF NOT EXISTS awaiting_id TEXT"};
    /** Business chapters and their seats (join requests). Not from Node: the same SQL is kept as migration 011. */
    static final String[] CHAPTER_TABLES = {
        """
        CREATE TABLE IF NOT EXISTS chapters (
          id TEXT PRIMARY KEY, name TEXT NOT NULL, city TEXT, district TEXT, area TEXT,
          meeting_day TEXT, meeting_time TEXT, venue TEXT, coordinator_id TEXT, max_seats INTEGER,
          status TEXT NOT NULL DEFAULT 'open', created_at TEXT, updated_at TEXT)""",
        """
        CREATE TABLE IF NOT EXISTS chapter_seats (
          id TEXT PRIMARY KEY, chapter_id TEXT NOT NULL, business_id TEXT NOT NULL, member_id TEXT NOT NULL,
          message TEXT, status TEXT NOT NULL, decided_by TEXT, created_at TEXT, updated_at TEXT)""",
        "CREATE UNIQUE INDEX IF NOT EXISTS chapter_seats_one_per_business ON chapter_seats (business_id) WHERE status IN ('waiting', 'approved')",
        "CREATE UNIQUE INDEX IF NOT EXISTS chapter_seats_one_per_member ON chapter_seats (chapter_id, member_id) WHERE status IN ('waiting', 'approved')"};

    static final String[] BLOOD_TABLES = {
        """
        CREATE TABLE IF NOT EXISTS blood_requests (
          id TEXT PRIMARY KEY, member_id TEXT, patient_name TEXT NOT NULL, blood_group TEXT NOT NULL,
          units INTEGER NOT NULL DEFAULT 1, hospital TEXT, city TEXT, district TEXT, contact_phone TEXT, urgency TEXT,
          note TEXT, status TEXT NOT NULL DEFAULT 'open', closed_by TEXT, closes_at TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now())""",
        """
        CREATE TABLE IF NOT EXISTS blood_donors (
          id TEXT PRIMARY KEY, member_id TEXT, name TEXT NOT NULL, blood_group TEXT NOT NULL, city TEXT, district TEXT,
          phone TEXT, available BOOLEAN NOT NULL DEFAULT true, last_donated DATE, hidden BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now())""",
        "CREATE UNIQUE INDEX IF NOT EXISTS blood_donors_one_per_member ON blood_donors (member_id) WHERE member_id IS NOT NULL",
        "CREATE INDEX IF NOT EXISTS blood_requests_member ON blood_requests (member_id, created_at)"};

    /**
     * Migration 013: jobs get an owner, a status, a closing date and a hidden flag; applications a status, one per
     * member per job. Migration 014: the job_alerts table (district / category, NULL = any), each alert once per member.
     */
    static final String[] JOB_COLUMNS = {
        "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS poster_id TEXT",
        "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'open'",
        "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS closes_at TIMESTAMPTZ",
        "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS hidden BOOLEAN NOT NULL DEFAULT false",
        "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()",
        "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS member_id TEXT",
        "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new'",
        "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()",
        "CREATE UNIQUE INDEX IF NOT EXISTS job_applications_one_per_member ON job_applications (job_id, member_id) WHERE member_id IS NOT NULL",
        "CREATE INDEX IF NOT EXISTS job_applications_job ON job_applications (job_id)",
        """
        CREATE TABLE IF NOT EXISTS job_alerts (
          id TEXT PRIMARY KEY, member_id TEXT NOT NULL, district TEXT, category TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now())""",
        "CREATE UNIQUE INDEX IF NOT EXISTS job_alerts_one_each ON job_alerts (member_id, coalesce(lower(district), ''), coalesce(lower(category), ''))",
        "CREATE INDEX IF NOT EXISTS job_alerts_member ON job_alerts (member_id)"};

    private final JdbcTemplate jdbc;
    private final TransactionTemplate ownTransaction;
    private final AtomicBoolean moderationReady = new AtomicBoolean();
    private final AtomicBoolean supportTicketsReady = new AtomicBoolean();
    private final AtomicBoolean websiteTablesReady = new AtomicBoolean();
    private final AtomicBoolean enquiryTablesReady = new AtomicBoolean();
    private final AtomicBoolean referralColumnsReady = new AtomicBoolean();
    private final AtomicBoolean meetingColumnsReady = new AtomicBoolean();
    private final AtomicBoolean chapterTablesReady = new AtomicBoolean();
    private final AtomicBoolean bloodTablesReady = new AtomicBoolean();
    private final AtomicBoolean jobColumnsReady = new AtomicBoolean();

    public LazyTables(JdbcTemplate jdbc, PlatformTransactionManager transactions) {
        this.jdbc = jdbc;
        this.ownTransaction = new TransactionTemplate(transactions);
        this.ownTransaction.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    /**
     * Runs the CREATE statements once, in a transaction of their own. Inside the caller's
     * transaction PostgreSQL would undo them if that request later failed, while the flag
     * would still say "created" — and every later call would fail until a restart.
     */
    private void createOnce(AtomicBoolean ready, String... statements) {
        if (ready.get()) return;
        ownTransaction.executeWithoutResult(status -> {
            for (String sql : statements) jdbc.execute(sql);
        });
        ready.set(true);
    }

    public void ensureSupportTickets() {
        createOnce(supportTicketsReady, SUPPORT_TICKETS);
    }

    /** Report and block tables, created on first use (a no-op once migration 002 has made them). */
    public void ensureModeration() {
        createOnce(moderationReady, REPORTS, BLOCKS);
    }

    /** All the website feature tables (services, bookings, tickets, centres), created on first use like Node's ensureWebsiteTables. */
    public void ensureWebsiteTables() {
        createOnce(websiteTablesReady, SERVICES, SERVICE_BOOKINGS, SUPPORT_TICKETS, COMMUNITY_CENTERS, CENTER_ACTIVITIES);
    }

    /** The B2B requirement tables, created on first use (a no-op when they exist). */
    public void ensureEnquiryTables() {
        createOnce(enquiryTablesReady, ENQUIRY_TABLES);
    }

    /** The referrals.business_id column, added on first use (a no-op when it exists). */
    public void ensureReferralColumns() {
        createOnce(referralColumnsReady, REFERRAL_COLUMNS);
    }

    /** The meetings.mode and meetings.awaiting_id columns, added on first use (a no-op when they exist). */
    public void ensureMeetingColumns() {
        createOnce(meetingColumnsReady, MEETING_COLUMNS);
    }

    /** The chapters and chapter_seats tables with their two one-active-seat indexes, created on first use. */
    public void ensureChapterTables() {
        createOnce(chapterTablesReady, CHAPTER_TABLES);
    }

    /** The blood_requests and blood_donors tables with the one-profile-per-member index, created on first use. */
    public void ensureBloodTables() {
        createOnce(bloodTablesReady, BLOOD_TABLES);
    }

    /** The jobs and job_applications columns and indexes of migration 013, added on first use (a no-op when they exist). */
    public void ensureJobColumns() {
        createOnce(jobColumnsReady, JOB_COLUMNS);
    }
}
