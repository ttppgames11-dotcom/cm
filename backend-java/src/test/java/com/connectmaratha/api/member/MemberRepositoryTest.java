package com.connectmaratha.api.member;

import static org.assertj.core.api.Assertions.assertThat;

import com.connectmaratha.api.PostgresTestBase;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootTest
class MemberRepositoryTest extends PostgresTestBase {

    @Autowired
    MemberRepository members;

    @Test
    void readsARowWrittenTheWayTheNodeBackendWritesIt() {
        // Insert with plain SQL, exactly like auth.routes.js register does.
        new JdbcTemplate(dataSource()).update("""
            INSERT INTO members (id, name, email, phone, password_hash, avatar, city, district, state, country,
              profession, business, education, skills, about, tier, role, joined, created_at,
              reference_id, referral_id, referred_by, total_referrals)
            VALUES ('M7001', 'Node Row', 'node.row@example.com', '9876500001', '$2a$08$hash', '👤', 'Pune', 'पुणे',
              'महाराष्ट्र', 'भारत', 'Dev', '', 'BE', 'Flutter, Node', 'hi', 'Basic', 'member',
              '2026-10-19', '2026-10-19 10:00:00', 'REF-96K-7001', 'REF-96K-7001', 'REF-96K-1001', 2)
            """);

        Member m = members.findById("M7001").orElseThrow();
        assertThat(m.getName()).isEqualTo("Node Row");
        assertThat(m.getDistrict()).isEqualTo("पुणे");
        assertThat(m.getSkills()).isEqualTo("Flutter, Node");
        assertThat(m.getReferenceId()).isEqualTo("REF-96K-7001");
        assertThat(m.getReferredBy()).isEqualTo("REF-96K-1001");
        assertThat(m.getTotalReferrals()).isEqualTo(2);
        assertThat(m.getVerifiedProfile()).isEqualTo(1); // column default

        assertThat(members.findByEmailIgnoreCase("NODE.ROW@example.com")).isPresent();
        assertThat(members.findByReferralCode("ref-96k-7001")).map(Member::getId).contains("M7001");
    }

    @Test
    void savesARowTheNodeBackendCanRead() {
        Member m = new Member("M7002", "Java Row");
        m.setEmail("java.row@example.com");
        m.setReferenceId("REF-96K-7002");
        m.setTotalReferrals(0);
        members.saveAndFlush(m);

        Map<String, Object> row = new JdbcTemplate(dataSource())
            .queryForMap("SELECT name, email, reference_id, total_referrals FROM members WHERE id = 'M7002'");
        assertThat(row).containsEntry("name", "Java Row")
            .containsEntry("reference_id", "REF-96K-7002")
            .containsEntry("total_referrals", 0);
    }
}
