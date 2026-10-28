package com.connectmaratha.api.blood.repository;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/** All blood request and donor SQL, and the one-time copy of the old directory_records entries. */
@Repository
public class BloodRepository {

    private static final Logger log = LoggerFactory.getLogger(BloodRepository.class);
    private static final ObjectMapper JSON = new ObjectMapper();
    private static final Set<String> GROUPS = Set.of("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-");

    /** A donor with eligible (90 days since the last donation), can_donate_from and the owner's name. */
    private static final String DONOR_SELECT = """
        SELECT d.*, (d.last_donated IS NULL OR d.last_donated <= current_date - 90) AS eligible,
               CASE WHEN d.last_donated > current_date - 90 THEN d.last_donated + 90 END AS can_donate_from,
               m.name AS owner_name
        FROM blood_donors d LEFT JOIN members m ON m.id = d.member_id""";

    private final JdbcTemplate jdbc;

    public BloodRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // ------------------------------------------------------------------ donors

    public boolean existsDonor(String id) {
        return Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS (SELECT 1 FROM blood_donors WHERE id = ?)", Boolean.class, id));
    }

    public Optional<Map<String, Object>> findDonor(String id) {
        return jdbc.queryForList(DONOR_SELECT + " WHERE d.id = ?", id).stream().findFirst();
    }

    public Optional<Map<String, Object>> donorOfMember(String memberId) {
        return jdbc.queryForList(DONOR_SELECT + " WHERE d.member_id = ?", memberId).stream().findFirst();
    }

    /** Visible donors, available ones first, then newest; optional exact group and district (trimmed, any case). */
    public List<Map<String, Object>> visibleDonors(String bloodGroup, String district) {
        StringBuilder sql = new StringBuilder(DONOR_SELECT).append(" WHERE NOT d.hidden");
        List<Object> args = new ArrayList<>();
        filters(sql, args, "d", bloodGroup, district);
        sql.append(" ORDER BY (d.available AND (d.last_donated IS NULL OR d.last_donated <= current_date - 90)) DESC, d.created_at DESC, d.id");
        return jdbc.queryForList(sql.toString(), args.toArray());
    }

    public List<Map<String, Object>> allDonors() {
        return jdbc.queryForList(DONOR_SELECT + " ORDER BY d.created_at DESC, d.id");
    }

    /**
     * Inserts the member's profile or updates it (one per member, enforced by the unique index, so two first saves at
     * the same instant leave one row). The hidden flag is never changed here. Returns true when a row was inserted.
     */
    public boolean upsertDonor(String newId, String memberId, String name, String group, String city, String district,
                               String phone, boolean available, LocalDate lastDonated) {
        return Boolean.TRUE.equals(jdbc.queryForObject("""
            INSERT INTO blood_donors (id, member_id, name, blood_group, city, district, phone, available, last_donated)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (member_id) WHERE member_id IS NOT NULL DO UPDATE SET
              name = EXCLUDED.name, blood_group = EXCLUDED.blood_group, city = EXCLUDED.city, district = EXCLUDED.district,
              phone = EXCLUDED.phone, available = EXCLUDED.available, last_donated = EXCLUDED.last_donated, updated_at = now()
            RETURNING (xmax = 0)""", Boolean.class,
            newId, memberId, name, group, city, district, phone, available, lastDonated == null ? null : java.sql.Date.valueOf(lastDonated)));
    }

    public int deleteDonorOfMember(String memberId) {
        return jdbc.update("DELETE FROM blood_donors WHERE member_id = ?", memberId);
    }

    public int setDonorHidden(String id, boolean hidden) {
        return jdbc.update("UPDATE blood_donors SET hidden = ?, updated_at = now() WHERE id = ?", hidden, id);
    }

    // ------------------------------------------------------------------ old entries

    /**
     * Copies the old website entries (directory_records collections bloodRequests and bloodDonors) into the new
     * tables, keeping their ids and without an owner. Old requests have no date and are copied closed. A row
     * without a known blood group or a name is skipped; a row copied before is left alone. Returns
     * {requestsCopied, donorsCopied}.
     */
    public int[] copyOldEntries() {
        int requests = 0;
        int donors = 0;
        for (Map<String, Object> rec : jdbc.queryForList(
                "SELECT collection, id, data FROM directory_records WHERE collection IN ('bloodRequests', 'bloodDonors') ORDER BY seq")) {
            JsonNode d;
            try {
                d = JSON.readTree(String.valueOf(rec.get("data")));
            } catch (Exception e) {
                log.warn("Old blood entry {} is not JSON; skipped", rec.get("id"));
                continue;
            }
            String id = String.valueOf(rec.get("id"));
            String group = first(d, "bloodGroup", "group");
            if (!GROUPS.contains(group)) continue;
            if ("bloodDonors".equals(rec.get("collection"))) {
                String name = first(d, "name");
                if (name.isEmpty()) continue;
                donors += jdbc.update("""
                    INSERT INTO blood_donors (id, name, blood_group, city, district, phone)
                    VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT (id) DO NOTHING""",
                    id, name, group, first(d, "city"), first(d, "district"), first(d, "phone", "contactPhone", "contact"));
            } else {
                String patient = first(d, "patientName", "patient");
                if (patient.isEmpty()) continue;
                int units = d.path("units").canConvertToInt() && d.path("units").asInt() >= 1 && d.path("units").asInt() <= 20
                    ? d.path("units").asInt() : 1;
                requests += jdbc.update("""
                    INSERT INTO blood_requests (id, patient_name, blood_group, units, hospital, city, district, contact_phone,
                      urgency, status, closes_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'closed', now()) ON CONFLICT (id) DO NOTHING""",
                    id, patient, group, units, first(d, "hospital"), first(d, "city"), first(d, "district"),
                    first(d, "contactPhone", "contact", "phone"), first(d, "urgency"));
            }
        }
        return new int[] {requests, donors};
    }

    // ------------------------------------------------------------------ helpers

    private static void filters(StringBuilder sql, List<Object> args, String alias, String bloodGroup, String district) {
        if (bloodGroup != null && !bloodGroup.isBlank()) {
            sql.append(" AND ").append(alias).append(".blood_group = ?");
            args.add(bloodGroup.trim());
        }
        if (district != null && !district.isBlank()) {
            sql.append(" AND lower(trim(").append(alias).append(".district)) = lower(trim(?))");
            args.add(district);
        }
    }

    /** The first non-blank text among the named fields, trimmed; "" when none. */
    private static String first(JsonNode d, String... names) {
        for (String n : names) {
            JsonNode v = d.get(n);
            if (v != null && !v.isNull() && !v.asText().isBlank()) return v.asText().trim();
        }
        return "";
    }
}
