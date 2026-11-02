package com.connectmaratha.api.crmunit.repository;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/** The crm_activities table (migration 018): a unit's yearly activities. */
@Repository
public class CrmActivityRepository {

    private final JdbcTemplate jdbc;

    public CrmActivityRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /** One unit's activities of a year, by date; a null type leaves the type filter out. */
    public List<Map<String, Object>> list(String unitId, int year, String type) {
        StringBuilder sql = new StringBuilder("SELECT * FROM crm_activities WHERE unit_id = ? AND year = ?");
        if (type != null) {
            return jdbc.queryForList(sql.append(" AND type = ? ORDER BY scheduled_date, created_at, id").toString(), unitId, year, type);
        }
        return jdbc.queryForList(sql.append(" ORDER BY scheduled_date, created_at, id").toString(), unitId, year);
    }

    public Optional<Map<String, Object>> find(String unitId, String activityId) {
        return jdbc.queryForList("SELECT * FROM crm_activities WHERE unit_id = ? AND id = ?", unitId, activityId).stream().findFirst();
    }

    public int insert(Map<String, Object> a) {
        return jdbc.update("""
            INSERT INTO crm_activities (id, unit_id, year, type, title, scheduled_date, target_count, notes, status, created_by)
            VALUES (?, ?, ?, ?, ?, CAST(? AS DATE), ?, ?, 'planned', ?)""",
            a.get("id"), a.get("unit_id"), a.get("year"), a.get("type"), a.get("title"), a.get("scheduled_date"),
            a.get("target_count"), a.get("notes"), a.get("created_by"));
    }

    /** Changes the given fields while the activity is not done (0 rows when it is done or gone). */
    public int update(String unitId, String id, Map<String, Object> fields) {
        StringBuilder sql = new StringBuilder("UPDATE crm_activities SET updated_at = now()");
        List<Object> args = new ArrayList<>();
        if (fields.containsKey("scheduled_date")) {
            sql.append(", scheduled_date = CAST(? AS DATE), year = ?");
            args.add(fields.get("scheduled_date"));
            args.add(fields.get("year"));
        }
        for (String column : new String[] {"target_count", "title", "notes", "photo_url", "status"}) {
            if (fields.containsKey(column)) {
                sql.append(", ").append(column).append(" = ?");
                args.add(fields.get(column));
            }
        }
        sql.append(" WHERE unit_id = ? AND id = ? AND status <> 'done'");
        args.add(unitId);
        args.add(id);
        return jdbc.update(sql.toString(), args.toArray());
    }

    /** Marks the activity done with its proof; 0 rows when it is already done or gone, so only one request can win. */
    public int complete(String unitId, String id, int attendees, String notes, String photoUrl, String memberId) {
        return jdbc.update("""
            UPDATE crm_activities SET status = 'done', attendee_count = ?, notes = ?, photo_url = COALESCE(?, photo_url),
              completed_at = now(), completed_by = ?, updated_at = now()
            WHERE unit_id = ? AND id = ? AND status <> 'done'""", attendees, notes, photoUrl, memberId, unitId, id);
    }

    /** Removes an activity that is not done; 0 rows when it is done or gone (the check and the delete are one statement). */
    public int deleteIfNotDone(String unitId, String id) {
        return jdbc.update("DELETE FROM crm_activities WHERE unit_id = ? AND id = ? AND status <> 'done'", unitId, id);
    }

    public int delete(String unitId, String id) {
        return jdbc.update("DELETE FROM crm_activities WHERE unit_id = ? AND id = ?", unitId, id);
    }

    /** The types the unit already has in the year. */
    public Set<String> typesOfYear(String unitId, int year) {
        return new HashSet<>(jdbc.queryForList("SELECT DISTINCT type FROM crm_activities WHERE unit_id = ? AND year = ?", String.class, unitId, year));
    }

    /** Locks the unit row until the end of the transaction, so two plan clicks line up one after the other. */
    public void lockUnit(String unitId) {
        jdbc.queryForList("SELECT id FROM community_centers WHERE id = ? FOR UPDATE", unitId);
    }

    /** All the activity rows of the given units in the year (one query for a whole roll-up). */
    public List<Map<String, Object>> rowsForUnits(List<String> unitIds, int year) {
        if (unitIds.isEmpty()) return List.of();
        String marks = String.join(",", unitIds.stream().map(i -> "?").toList());
        List<Object> args = new ArrayList<>(unitIds);
        args.add(year);
        return jdbc.queryForList("SELECT unit_id, type, status, scheduled_date, target_count, attendee_count FROM crm_activities WHERE unit_id IN ("
            + marks + ") AND year = ?", args.toArray());
    }
}
