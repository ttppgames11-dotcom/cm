package com.connectmaratha.api.crmunit.repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
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
}
