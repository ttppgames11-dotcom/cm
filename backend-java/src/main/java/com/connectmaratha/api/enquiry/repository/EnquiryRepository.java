package com.connectmaratha.api.enquiry.repository;

import com.connectmaratha.api.common.schema.LazyTables;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/** All SQL for B2B requirements and quotes. The tables are created on first use. */
@Repository
public class EnquiryRepository {

    /** quoted_by_me is about the member passed as the first parameter (NULL: nobody). */
    private static final String SELECT = """
        SELECT e.*,
               (SELECT COUNT(*) FROM enquiry_quotes q WHERE q.enquiry_id = e.id) AS quotes_count,
               EXISTS (SELECT 1 FROM enquiry_quotes q WHERE q.enquiry_id = e.id AND q.member_id = CAST(? AS TEXT)) AS quoted_by_me
        FROM enquiries e
        """;
    private static final String NEWEST_FIRST = " ORDER BY e.created_at DESC, e.id DESC";

    private final JdbcTemplate jdbc;
    private final LazyTables tables;

    public EnquiryRepository(JdbcTemplate jdbc, LazyTables tables) {
        this.jdbc = jdbc;
        this.tables = tables;
    }

    public boolean exists(String id) {
        tables.ensureEnquiryTables();
        return Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS (SELECT 1 FROM enquiries WHERE id = ?)", Boolean.class, id));
    }

    public boolean quoteExists(String id) {
        tables.ensureEnquiryTables();
        return Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS (SELECT 1 FROM enquiry_quotes WHERE id = ?)", Boolean.class, id));
    }

    /** Saves the text fields; the status starts as open and the database sets the dates. */
    public void insert(EnquiryRow e) {
        tables.ensureEnquiryTables();
        jdbc.update("""
            INSERT INTO enquiries (id, member_id, title, description, category, city, district, budget, client_name, phone)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            e.id(), e.memberId(), e.title(), e.description(), e.category(), e.city(), e.district(), e.budget(),
            e.clientName(), e.phone());
    }

    public Optional<EnquiryRow> find(String id, String viewerId) {
        tables.ensureEnquiryTables();
        return jdbc.query(SELECT + " WHERE e.id = ?", EnquiryRepository::toEnquiry, viewerId, id).stream().findFirst();
    }

    /** Open ones first, then newest first. A null filter means all. */
    public List<EnquiryRow> list(String district, String category, String viewerId, int limit) {
        tables.ensureEnquiryTables();
        // CAST: PostgreSQL cannot tell the type of a bare "? IS NULL".
        return jdbc.query(SELECT + """
             WHERE (CAST(? AS TEXT) IS NULL OR e.district = ?)
               AND (CAST(? AS TEXT) IS NULL OR e.category = ?)
             ORDER BY (e.status = 'open') DESC, e.created_at DESC, e.id DESC
             LIMIT ?""",
            EnquiryRepository::toEnquiry, viewerId, district, district, category, category, limit);
    }

    public List<EnquiryRow> listByMember(String memberId) {
        tables.ensureEnquiryTables();
        return jdbc.query(SELECT + " WHERE e.member_id = ?" + NEWEST_FIRST, EnquiryRepository::toEnquiry, null, memberId);
    }

    public List<EnquiryRow> listAll() {
        tables.ensureEnquiryTables();
        return jdbc.query(SELECT + NEWEST_FIRST, EnquiryRepository::toEnquiry, (Object) null);
    }

    /** Quotes on these requirements, most recently changed first. */
    public List<QuoteRow> quotesFor(Collection<String> enquiryIds) {
        if (enquiryIds.isEmpty()) return List.of();
        tables.ensureEnquiryTables();
        String placeholders = String.join(", ", Collections.nCopies(enquiryIds.size(), "?"));
        return jdbc.query("SELECT * FROM enquiry_quotes WHERE enquiry_id IN (" + placeholders + ") ORDER BY updated_at DESC, id DESC",
            EnquiryRepository::toQuote, enquiryIds.toArray());
    }

    public Optional<QuoteRow> findQuote(String enquiryId, String memberId) {
        tables.ensureEnquiryTables();
        return jdbc.query("SELECT * FROM enquiry_quotes WHERE enquiry_id = ? AND member_id = ?",
            EnquiryRepository::toQuote, enquiryId, memberId).stream().findFirst();
    }

    /**
     * Saves a member's quote: true when it is new, false when it replaced their earlier quote
     * (which keeps its id and created_at). xmax = 0 only for a freshly inserted row.
     */
    public boolean upsertQuote(QuoteRow q) {
        tables.ensureEnquiryTables();
        return Boolean.TRUE.equals(jdbc.queryForObject("""
            INSERT INTO enquiry_quotes (id, enquiry_id, member_id, business_name, owner_name, phone, quote_amount, proposal_notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (enquiry_id, member_id) DO UPDATE SET
              business_name = EXCLUDED.business_name, owner_name = EXCLUDED.owner_name, phone = EXCLUDED.phone,
              quote_amount = EXCLUDED.quote_amount, proposal_notes = EXCLUDED.proposal_notes, updated_at = now()
            RETURNING (xmax = 0) AS inserted""",
            Boolean.class, q.id(), q.enquiryId(), q.memberId(), q.businessName(), q.ownerName(), q.phone(),
            q.quoteAmount(), q.proposalNotes()));
    }

    public int countQuotes(String enquiryId) {
        tables.ensureEnquiryTables();
        Integer n = jdbc.queryForObject("SELECT COUNT(*) FROM enquiry_quotes WHERE enquiry_id = ?", Integer.class, enquiryId);
        return n == null ? 0 : n;
    }

    /** Closing records when (re-closing keeps the first time); reopening clears it. */
    public void setStatus(String id, String status) {
        tables.ensureEnquiryTables();
        jdbc.update("""
            UPDATE enquiries
               SET status = ?,
                   closed_at = CASE WHEN CAST(? AS TEXT) = 'closed' THEN COALESCE(closed_at, now()) ELSE NULL END,
                   updated_at = now()
             WHERE id = ?""", status, status, id);
    }

    private static EnquiryRow toEnquiry(ResultSet rs, int rowNum) throws SQLException {
        return new EnquiryRow(rs.getString("id"), rs.getString("member_id"), rs.getString("title"),
            rs.getString("description"), rs.getString("category"), rs.getString("city"), rs.getString("district"),
            rs.getString("budget"), rs.getString("client_name"), rs.getString("phone"), rs.getString("status"),
            instant(rs, "created_at"), instant(rs, "updated_at"), instant(rs, "closed_at"),
            rs.getInt("quotes_count"), rs.getBoolean("quoted_by_me"));
    }

    private static QuoteRow toQuote(ResultSet rs, int rowNum) throws SQLException {
        return new QuoteRow(rs.getString("id"), rs.getString("enquiry_id"), rs.getString("member_id"),
            rs.getString("business_name"), rs.getString("owner_name"), rs.getString("phone"),
            rs.getString("quote_amount"), rs.getString("proposal_notes"),
            instant(rs, "created_at"), instant(rs, "updated_at"));
    }

    private static Instant instant(ResultSet rs, String column) throws SQLException {
        Timestamp t = rs.getTimestamp(column);
        return t == null ? null : t.toInstant();
    }
}
