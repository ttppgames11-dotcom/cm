package com.connectmaratha.api.common.schema;

import java.util.concurrent.atomic.AtomicBoolean;
import org.springframework.jdbc.core.JdbcTemplate;
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

    private final JdbcTemplate jdbc;
    private final AtomicBoolean moderationReady = new AtomicBoolean();
    private final AtomicBoolean supportTicketsReady = new AtomicBoolean();
    private final AtomicBoolean websiteTablesReady = new AtomicBoolean();

    public LazyTables(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void ensureSupportTickets() {
        if (supportTicketsReady.get()) return;
        jdbc.execute(SUPPORT_TICKETS);
        supportTicketsReady.set(true);
    }

    /** Report and block tables, created on first use (a no-op once migration 002 has made them). */
    public void ensureModeration() {
        if (moderationReady.get()) return;
        jdbc.execute(REPORTS);
        jdbc.execute(BLOCKS);
        moderationReady.set(true);
    }

    /** All the website feature tables (services, bookings, tickets, centres), created on first use like Node's ensureWebsiteTables. */
    public void ensureWebsiteTables() {
        if (websiteTablesReady.get()) return;
        for (String sql : new String[] {SERVICES, SERVICE_BOOKINGS, SUPPORT_TICKETS, COMMUNITY_CENTERS, CENTER_ACTIVITIES}) {
            jdbc.execute(sql);
        }
        websiteTablesReady.set(true);
    }
}
