package com.connectmaratha.api.common.schema;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.connectmaratha.api.PostgresTestBase;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;

/** The B2B requirement tables: created by Java on first use, identical to migration 008. */
@SpringBootTest
class EnquiryTablesTest extends PostgresTestBase {

    @Autowired LazyTables tables;
    @Autowired JdbcTemplate jdbc;

    @Test
    void migrationFileMatchesTheJavaCopy() throws Exception {
        String file = Files.readString(Path.of("..", "database", "migrations", "008_enquiries.sql"), UTF_8);
        assertThat(normalise(file)).isEqualTo(normalise(LazyTables.ENQUIRY_TABLES));
    }

    @Test
    void tablesAreCreatedOnceAndEnforceTheRules() {
        tables.ensureEnquiryTables();
        tables.ensureEnquiryTables(); // second call is a no-op
        jdbc.update("INSERT INTO enquiries (id, member_id, title, category, district) VALUES ('ENQ-T1','M1','Title','IT','Pune')");
        assertThat(jdbc.queryForObject("SELECT status FROM enquiries WHERE id='ENQ-T1'", String.class)).isEqualTo("open");
        assertThatThrownBy(() -> jdbc.update("UPDATE enquiries SET status='done' WHERE id='ENQ-T1'"))
            .isInstanceOf(DataIntegrityViolationException.class);
        String quote = "INSERT INTO enquiry_quotes (id, enquiry_id, member_id, business_name, phone) VALUES (?, 'ENQ-T1', 'M2', 'B', '9822144550')";
        jdbc.update(quote, "QT-1");
        assertThatThrownBy(() -> jdbc.update(quote, "QT-2")).isInstanceOf(DuplicateKeyException.class);
        jdbc.update("DELETE FROM enquiries WHERE id='ENQ-T1'");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM enquiry_quotes WHERE enquiry_id='ENQ-T1'", Integer.class)).isZero();
    }

    /** Without BOM and "--" comment lines, every run of whitespace as one space. */
    private static String normalise(String sql) {
        String noComments = Arrays.stream(sql.replace("﻿", "").split("\\R"))
            .filter(line -> !line.trim().startsWith("--"))
            .collect(Collectors.joining("\n"));
        return noComments.replaceAll("\\s+", " ").trim();
    }
}
