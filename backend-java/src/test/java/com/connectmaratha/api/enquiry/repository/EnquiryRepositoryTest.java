package com.connectmaratha.api.enquiry.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.connectmaratha.api.PostgresTestBase;
import com.connectmaratha.api.common.schema.LazyTables;
import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

/** SQL for B2B requirements and quotes: order, filters, counts, the quote upsert and status changes. */
@SpringBootTest
class EnquiryRepositoryTest extends PostgresTestBase {

    @Autowired EnquiryRepository repo;
    @Autowired LazyTables tables;
    @Autowired JdbcTemplate jdbc;

    @BeforeEach
    void empty() {
        tables.ensureEnquiryTables();
        jdbc.update("DELETE FROM enquiries");
    }

    private static EnquiryRow row(String id, String member, String district, String category) {
        return new EnquiryRow(id, member, "T " + id, null, category, null, district, null, null, null,
            "open", null, null, null, 0, false);
    }

    private static QuoteRow quote(String id, String enquiryId, String member, String amount) {
        return new QuoteRow(id, enquiryId, member, "Biz", "Owner", "9822144550", amount, "notes", null, null);
    }

    private void createdAgo(String id, Duration ago) {
        jdbc.update("UPDATE enquiries SET created_at = ? WHERE id = ?", Timestamp.from(Instant.now().minus(ago)), id);
    }

    private static List<String> ids(List<EnquiryRow> rows) {
        return rows.stream().map(EnquiryRow::id).toList();
    }

    @Test
    void listPutsOpenFirstThenNewest() {
        repo.insert(row("ENQ-A", "M1", "Pune", "IT"));
        repo.insert(row("ENQ-B", "M1", "Pune", "IT"));
        repo.insert(row("ENQ-C", "M1", "Pune", "IT"));
        createdAgo("ENQ-A", Duration.ofHours(3));
        createdAgo("ENQ-B", Duration.ofHours(2));
        createdAgo("ENQ-C", Duration.ofHours(1));
        repo.setStatus("ENQ-C", "closed");
        assertThat(ids(repo.list(null, null, null, 100))).containsExactly("ENQ-B", "ENQ-A", "ENQ-C");
    }

    @Test
    void filtersMatchExactlyAndNullMeansAll() {
        repo.insert(row("ENQ-P1", "M1", "Pune", "IT"));
        repo.insert(row("ENQ-N1", "M1", "Nashik", "IT"));
        repo.insert(row("ENQ-P2", "M1", "Pune", "Food"));
        assertThat(ids(repo.list("Pune", null, null, 100))).containsExactlyInAnyOrder("ENQ-P1", "ENQ-P2");
        assertThat(ids(repo.list(null, "IT", null, 100))).containsExactlyInAnyOrder("ENQ-P1", "ENQ-N1");
        assertThat(ids(repo.list("Pune", "Food", null, 100))).containsExactly("ENQ-P2");
        assertThat(repo.list(null, null, null, 100)).hasSize(3);
    }

    @Test
    void limitCapsTheList() {
        repo.insert(row("ENQ-1", "M1", "Pune", "IT"));
        repo.insert(row("ENQ-2", "M1", "Pune", "IT"));
        repo.insert(row("ENQ-3", "M1", "Pune", "IT"));
        assertThat(repo.list(null, null, null, 2)).hasSize(2);
    }

    @Test
    void countsQuotesAndKnowsWhoQuoted() {
        repo.insert(row("ENQ-1", "M1", "Pune", "IT"));
        repo.upsertQuote(quote("QT-1", "ENQ-1", "M2", "100"));
        repo.upsertQuote(quote("QT-2", "ENQ-1", "M3", "200"));
        EnquiryRow seenByM2 = repo.find("ENQ-1", "M2").orElseThrow();
        assertThat(seenByM2.quotesCount()).isEqualTo(2);
        assertThat(seenByM2.quotedByMe()).isTrue();
        assertThat(repo.find("ENQ-1", "M9").orElseThrow().quotedByMe()).isFalse();
        assertThat(repo.find("ENQ-1", null).orElseThrow().quotedByMe()).isFalse();
        assertThat(repo.list(null, null, "M2", 100).get(0).quotedByMe()).isTrue();
        assertThat(repo.find("ENQ-missing", null)).isEmpty();
    }

    @Test
    void upsertQuoteInsertsThenUpdatesKeepingIdAndCreatedAt() {
        repo.insert(row("ENQ-1", "M1", "Pune", "IT"));
        assertThat(repo.upsertQuote(quote("QT-1", "ENQ-1", "M2", "10000"))).isTrue();
        QuoteRow first = repo.findQuote("ENQ-1", "M2").orElseThrow();
        assertThat(repo.upsertQuote(quote("QT-2", "ENQ-1", "M2", "12000"))).isFalse();
        QuoteRow second = repo.findQuote("ENQ-1", "M2").orElseThrow();
        assertThat(second.id()).isEqualTo("QT-1");
        assertThat(second.quoteAmount()).isEqualTo("12000");
        assertThat(second.createdAt()).isEqualTo(first.createdAt());
        assertThat(second.updatedAt()).isAfterOrEqualTo(first.updatedAt());
        assertThat(repo.countQuotes("ENQ-1")).isEqualTo(1);
        assertThat(repo.quoteExists("QT-1")).isTrue();
        assertThat(repo.quoteExists("QT-2")).isFalse();
    }

    @Test
    void setStatusRecordsAndClearsClosedAt() {
        repo.insert(row("ENQ-1", "M1", "Pune", "IT"));
        repo.setStatus("ENQ-1", "closed");
        EnquiryRow closed = repo.find("ENQ-1", null).orElseThrow();
        assertThat(closed.status()).isEqualTo("closed");
        assertThat(closed.closedAt()).isNotNull();
        repo.setStatus("ENQ-1", "open");
        EnquiryRow open = repo.find("ENQ-1", null).orElseThrow();
        assertThat(open.status()).isEqualTo("open");
        assertThat(open.closedAt()).isNull();
    }

    @Test
    void quotesForReturnsOnlyRequestedEnquiries() {
        repo.insert(row("ENQ-1", "M1", "Pune", "IT"));
        repo.insert(row("ENQ-2", "M1", "Pune", "IT"));
        repo.upsertQuote(quote("QT-1", "ENQ-1", "M2", "100"));
        repo.upsertQuote(quote("QT-2", "ENQ-2", "M2", "200"));
        assertThat(repo.quotesFor(List.of("ENQ-1"))).extracting(QuoteRow::enquiryId).containsExactly("ENQ-1");
        assertThat(repo.quotesFor(List.of())).isEmpty();
        assertThat(repo.exists("ENQ-1")).isTrue();
        assertThat(repo.exists("ENQ-9")).isFalse();
    }
}
