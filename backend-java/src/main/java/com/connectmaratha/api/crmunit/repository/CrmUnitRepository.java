package com.connectmaratha.api.crmunit.repository;

import com.connectmaratha.api.crmunit.CrmScope.Scope;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/** CRM units: the ladder rows of community_centers (level not NULL) with their owner (migration 017). */
@Repository
public class CrmUnitRepository {

    static final int MAX_LIST = 500;

    private static final String SELECT = """
        SELECT c.*, m.name AS owner_name, m.phone AS owner_phone
        FROM community_centers c LEFT JOIN members m ON m.id = c.owner_id""";

    private static final String LADDER_ORDER =
        "CASE c.level WHEN 'state' THEN 1 WHEN 'branch' THEN 2 WHEN 'division' THEN 3 WHEN 'district' THEN 4 ELSE 5 END, c.name";

    private final JdbcTemplate jdbc;

    public CrmUnitRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Optional<Map<String, Object>> find(String id) {
        return jdbc.queryForList(SELECT + " WHERE c.id = ? AND c.level IS NOT NULL", id).stream().findFirst();
    }

    /** Units inside the scope, in ladder order then by name; null filters are left out. */
    public List<Map<String, Object>> list(String level, String parentId, String search, Scope scope) {
        if (scope.isNone()) return List.of();
        StringBuilder sql = new StringBuilder(SELECT).append(" WHERE c.level IS NOT NULL");
        List<Object> args = new ArrayList<>();
        if (scope.kind().equals("unit")) {
            sql.append(" AND starts_with(c.path, ?)");
            args.add(scope.path());
        }
        if (level != null) {
            sql.append(" AND c.level = ?");
            args.add(level);
        }
        if (parentId != null) {
            sql.append(" AND c.parent_id = ?");
            args.add(parentId);
        }
        if (search != null) {
            sql.append(" AND c.name ILIKE ?");
            args.add("%" + search.trim() + "%");
        }
        sql.append(" ORDER BY ").append(LADDER_ORDER).append(" LIMIT ").append(MAX_LIST);
        return jdbc.queryForList(sql.toString(), args.toArray());
    }

    /** The units above this path (not the unit itself), top first. */
    public List<Map<String, Object>> ancestors(String path) {
        List<String> ids = new ArrayList<>();
        for (String part : path.split("/")) if (!part.isEmpty()) ids.add(part);
        if (ids.isEmpty()) return List.of();
        ids.remove(ids.size() - 1);
        if (ids.isEmpty()) return List.of();
        String marks = String.join(",", ids.stream().map(i -> "?").toList());
        return jdbc.queryForList("SELECT c.id, c.name, c.level, c.path FROM community_centers c WHERE c.id IN (" + marks
            + ") ORDER BY length(c.path)", ids.toArray());
    }

    public Optional<Map<String, Object>> memberName(String memberId) {
        return jdbc.queryForList("SELECT id, name FROM members WHERE id = ?", memberId).stream().findFirst();
    }
}
