package com.connectmaratha.api.common.schema;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.connectmaratha.api.PostgresTestBase;
import com.connectmaratha.api.sangam.repository.ReferralReceiverRepository;
import com.connectmaratha.api.sangam.repository.ReferralReceiverRepository.Receiver;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

/** The referrals.business_id column and the "who can receive a referral" queries. */
@SpringBootTest
class ReferralTablesTest extends PostgresTestBase {

    @Autowired LazyTables tables;
    @Autowired JdbcTemplate jdbc;
    @Autowired PlatformTransactionManager txManager;
    @Autowired ReferralReceiverRepository receivers;

    @BeforeEach
    void fixtures() {
        jdbc.update("DELETE FROM businesses WHERE name LIKE 'Zr%'");
        for (String id : List.of("M9601", "M9602", "M9603")) {
            jdbc.update("INSERT INTO members (id, name) VALUES (?, ?) ON CONFLICT (id) DO NOTHING", id, "Member " + id);
        }
        business("ZRB1", "Zr Visible", "M9601", "visible");
        business("ZRB2", "Zr Hidden", "M9602", "hidden");
        business("ZRB3", "Zr Second", "M9601", null);
        business("ZRB4", "Zr NoOwner", null, "visible");
    }

    private void business(String id, String name, String ownerId, String status) {
        jdbc.update("INSERT INTO businesses (id, name, owner, cat, owner_id, status) VALUES (?, ?, 'x', 'it', ?, ?)", id, name, ownerId, status);
    }

    @Test
    void migrationFileMatchesTheJavaCopy() throws Exception {
        String file = Files.readString(Path.of("..", "database", "migrations", "009_referrals_business.sql"), UTF_8);
        assertThat(normalise(file)).isEqualTo(normalise(LazyTables.REFERRAL_COLUMNS + ";"));
    }

    @Test
    void columnSurvivesAFailedRequest() {
        jdbc.execute("ALTER TABLE referrals DROP COLUMN IF EXISTS business_id");
        LazyTables fresh = new LazyTables(jdbc, txManager);
        try {
            assertThatThrownBy(() -> new TransactionTemplate(txManager).executeWithoutResult(status -> {
                fresh.ensureReferralColumns();
                throw new IllegalStateException("the request fails after the column was needed");
            })).isInstanceOf(IllegalStateException.class);
            assertThat(jdbc.queryForObject(
                "SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'referrals' AND column_name = 'business_id'", Integer.class))
                .isEqualTo(1);
        } finally {
            jdbc.execute(LazyTables.REFERRAL_COLUMNS);
        }
    }

    @Test
    void receiversAreOwnersOfVisibleBusinessesOnly() {
        List<Receiver> found = receivers.receivers("M9603", 200).stream().filter(r -> r.id().startsWith("M960")).toList();
        assertThat(found).extracting(Receiver::id).containsExactly("M9601");
        assertThat(found.get(0).businesses()).extracting(ReferralReceiverRepository.Biz::name).containsExactly("Zr Second", "Zr Visible");
    }

    @Test
    void callerIsExcluded() {
        assertThat(receivers.receivers("M9601", 200).stream().filter(r -> r.id().startsWith("M960")).toList()).isEmpty();
    }

    @Test
    void ownsVisibleBusinessChecks() {
        assertThat(receivers.ownsVisibleBusiness("M9601")).isTrue();
        assertThat(receivers.ownsVisibleBusiness("M9602")).isFalse();
        assertThat(receivers.ownsVisibleBusiness("M9603")).isFalse();
        assertThat(receivers.ownsVisibleBusiness("M9601", "ZRB1")).isTrue();
        assertThat(receivers.ownsVisibleBusiness("M9601", "ZRB2")).isFalse();
        assertThat(receivers.ownsVisibleBusiness("M9602", "ZRB2")).isFalse();
    }

    private static String normalise(String sql) {
        String noComments = Arrays.stream(sql.replace("\uFEFF", "").split("\\R"))
            .filter(line -> !line.trim().startsWith("--"))
            .collect(Collectors.joining("\n"));
        return noComments.replaceAll("\\s+", " ").trim();
    }
}
