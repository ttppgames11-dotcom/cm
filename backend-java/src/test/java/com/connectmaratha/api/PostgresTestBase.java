package com.connectmaratha.api;

import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;
import javax.sql.DataSource;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

/**
 * Real PostgreSQL 16 (embedded, no Docker) with the live schema, built from the
 * repository's own migration files — the same SQL the Node backend applies.
 * Started once per test run and shared by all Spring tests.
 */
public abstract class PostgresTestBase {

    private static final Path MIGRATIONS = Path.of("..", "database", "migrations");

    /** Applied in this order. The 45k-line location data file is not needed here. */
    private static final List<String> SCHEMA_FILES = List.of(
        "001_initial.sql",
        "001_create_location_hierarchy.sql",
        "002_security_moderation.sql",
        "003_account_lifecycle.sql",
        "004_referrals.sql",
        "004_password_resets.sql",
        "005_media.sql");

    /**
     * Columns the live database has that the migrations above do not create:
     * the referral/location ALTERs that database.js runs at startup.
     */
    private static final String EXTRA_COLUMNS = """
        ALTER TABLE members ADD COLUMN IF NOT EXISTS reference_id TEXT;
        ALTER TABLE members ADD COLUMN IF NOT EXISTS referral_id TEXT;
        ALTER TABLE members ADD COLUMN IF NOT EXISTS referred_by TEXT;
        ALTER TABLE members ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0;
        ALTER TABLE members ADD COLUMN IF NOT EXISTS photo TEXT;
        ALTER TABLE members ADD COLUMN IF NOT EXISTS country_id TEXT;
        ALTER TABLE members ADD COLUMN IF NOT EXISTS state_id TEXT;
        ALTER TABLE members ADD COLUMN IF NOT EXISTS district_id TEXT;
        ALTER TABLE members ADD COLUMN IF NOT EXISTS taluka_id TEXT;
        ALTER TABLE members ADD COLUMN IF NOT EXISTS village_id TEXT;
        ALTER TABLE members ADD COLUMN IF NOT EXISTS taluka TEXT;
        ALTER TABLE members ADD COLUMN IF NOT EXISTS village TEXT;
        ALTER TABLE members ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'password';
        ALTER TABLE members ADD COLUMN IF NOT EXISTS last_login_at TEXT;
        """;

    private static final EmbeddedPostgres POSTGRES = start();

    private static EmbeddedPostgres start() {
        try {
            EmbeddedPostgres pg = EmbeddedPostgres.builder().start();
            applySchema(pg.getPostgresDatabase());
            return pg;
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    private static void applySchema(DataSource ds) {
        try (Connection c = ds.getConnection(); Statement st = c.createStatement()) {
            for (String file : SCHEMA_FILES) {
                String sql = Files.readString(MIGRATIONS.resolve(file), StandardCharsets.UTF_8)
                    .replace("﻿", "");
                st.execute(sql);
            }
            st.execute(EXTRA_COLUMNS);
        } catch (IOException | SQLException e) {
            throw new IllegalStateException("Could not build the test schema: " + e.getMessage(), e);
        }
    }

    protected static DataSource dataSource() {
        return POSTGRES.getPostgresDatabase();
    }

    protected static int postgresPort() {
        return POSTGRES.getPort();
    }

    @DynamicPropertySource
    static void datasource(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> POSTGRES.getJdbcUrl("postgres", "postgres"));
        registry.add("spring.datasource.username", () -> "postgres");
        registry.add("spring.datasource.password", () -> "postgres");
    }
}
