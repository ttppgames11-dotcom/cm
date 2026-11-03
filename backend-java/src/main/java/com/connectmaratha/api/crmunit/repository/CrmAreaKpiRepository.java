package com.connectmaratha.api.crmunit.repository;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/**
 * The COUNT queries behind the area KPIs. Table and column names are fixed in the code; everything that comes from data
 * (ids, place names) goes in as a bind parameter. Typed names are compared as lower(trim(column)).
 */
@Repository
public class CrmAreaKpiRepository {

    /** Tables whose rows carry only a typed district name. */
    private static final Set<String> BY_DISTRICT_NAME = Set.of("businesses", "jobs", "events", "support_tickets");

    private final JdbcTemplate jdbc;

    public CrmAreaKpiRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /** id → master name for districts or talukas (a table name from the code, never from a request). */
    public Map<String, String> masterNames(boolean districts, List<String> ids) {
        Map<String, String> out = new LinkedHashMap<>();
        if (ids.isEmpty()) return out;
        String sql = "SELECT id, name FROM " + (districts ? "districts" : "talukas") + " WHERE id IN (" + marks(ids.size()) + ")";
        for (Map<String, Object> r : jdbc.queryForList(sql, ids.toArray())) out.put((String) r.get("id"), (String) r.get("name"));
        return out;
    }

    /** taluka id → the id of its district. */
    public Map<String, String> talukaDistricts(List<String> talukaIds) {
        Map<String, String> out = new LinkedHashMap<>();
        if (talukaIds.isEmpty()) return out;
        String sql = "SELECT id, district_id FROM talukas WHERE id IN (" + marks(talukaIds.size()) + ")";
        for (Map<String, Object> r : jdbc.queryForList(sql, talukaIds.toArray())) out.put((String) r.get("id"), (String) r.get("district_id"));
        return out;
    }

    /** Members in any of the districts or talukas, by id; a member with both ids is counted once. */
    public int countMembers(List<String> districtIds, List<String> talukaIds) {
        List<String> parts = new ArrayList<>();
        List<Object> args = new ArrayList<>();
        if (!districtIds.isEmpty()) {
            parts.add("district_id IN (" + marks(districtIds.size()) + ")");
            args.addAll(districtIds);
        }
        if (!talukaIds.isEmpty()) {
            parts.add("taluka_id IN (" + marks(talukaIds.size()) + ")");
            args.addAll(talukaIds);
        }
        if (parts.isEmpty()) return 0;
        return jdbc.queryForObject("SELECT COUNT(*) FROM members WHERE " + String.join(" OR ", parts), Integer.class, args.toArray());
    }

    /** Rows of the table whose typed district matches one of the (lower-case) names, plus a fixed extra condition. */
    public int countByDistrictNames(String table, List<String> names, String extraCondition) {
        if (!BY_DISTRICT_NAME.contains(table)) throw new IllegalArgumentException("table " + table);
        if (names.isEmpty()) return 0;
        String sql = "SELECT COUNT(*) FROM " + table + " WHERE lower(trim(district)) IN (" + marks(names.size()) + ")"
            + (extraCondition == null ? "" : " AND " + extraCondition);
        return jdbc.queryForObject(sql, Integer.class, names.toArray());
    }

    /** Tickets whose typed taluka and typed district match the (lower-case) names of one taluka and its district. */
    public int countTicketsByTaluka(List<String> talukaNames, List<String> districtNames, boolean openOnly) {
        if (talukaNames.isEmpty() || districtNames.isEmpty()) return 0;
        String sql = "SELECT COUNT(*) FROM support_tickets WHERE lower(trim(taluka)) IN (" + marks(talukaNames.size())
            + ") AND lower(trim(district)) IN (" + marks(districtNames.size()) + ")"
            + (openOnly ? " AND status NOT IN ('Resolved', 'Closed')" : "");
        List<Object> args = new ArrayList<>(talukaNames);
        args.addAll(districtNames);
        return jdbc.queryForObject(sql, Integer.class, args.toArray());
    }

    private static String marks(int n) {
        return String.join(",", java.util.Collections.nCopies(n, "?"));
    }
}
