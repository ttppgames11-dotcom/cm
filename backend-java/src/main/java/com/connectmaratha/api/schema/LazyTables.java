package com.connectmaratha.api.schema;

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

    private final JdbcTemplate jdbc;
    private final AtomicBoolean supportTicketsReady = new AtomicBoolean();

    public LazyTables(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void ensureSupportTickets() {
        if (supportTicketsReady.get()) return;
        jdbc.execute(SUPPORT_TICKETS);
        supportTicketsReady.set(true);
    }
}
