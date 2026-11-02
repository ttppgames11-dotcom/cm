package com.connectmaratha.api.crmunit;

import com.connectmaratha.api.common.schema.LazyTables;
import com.connectmaratha.api.common.security.CurrentUser;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * The one place that decides who sees and changes which CRM units. The answer comes from the member's row in the
 * database (never from the token's role), so removing an owner or an admin takes effect on their next request:
 * admin / superadmin → everything, can write; ceo → everything, read only; owner of an active unit → that unit and
 * everything below it, can write; anyone else (or a visitor) → nothing.
 */
@Component
public class CrmScope {

    /** What a member may reach: kind is "global", "unit" (an owner: the unit and below), "staff" (the own unit only) or "none"; path (units only) ends with "/". */
    public record Scope(String kind, String unitId, String unitRole, String path, boolean write) {

        static final Scope NONE = new Scope("none", null, null, null, false);

        public boolean isNone() {
            return kind.equals("none");
        }

        public boolean canWrite() {
            return write;
        }

        /** Is the unit with this path inside the scope? A path ending in "/" keeps /UNIT-1/ apart from /UNIT-10/. */
        public boolean contains(String unitPath) {
            if (unitPath == null) return false;
            return switch (kind) {
                case "global" -> true;
                case "unit" -> unitPath.startsWith(path);
                case "staff" -> unitPath.equals(path);
                default -> false;
            };
        }

        /** May this scope add and remove the staff of the unit: an admin, or the owner of exactly that unit. */
        public boolean managesStaffOf(String id) {
            if (!write) return false;
            return kind.equals("global") || (kind.equals("unit") && id != null && id.equals(unitId));
        }

        /** Is the scope above the unit with this path, i.e. does it hold the unit's parent? Never true for the scope's own unit. */
        public boolean containsParentOf(String unitPath) {
            if (!write || unitPath == null) return false;
            if (kind.equals("global")) return true;
            return kind.equals("unit") && contains(parentPath(unitPath));
        }
    }

    /** "/A/B/C/" → "/A/B/"; a top unit's parent is "/". */
    static String parentPath(String path) {
        String trimmed = path.endsWith("/") ? path.substring(0, path.length() - 1) : path;
        int cut = trimmed.lastIndexOf('/');
        return cut < 0 ? "/" : trimmed.substring(0, cut + 1);
    }

    private final JdbcTemplate jdbc;
    private final LazyTables tables;

    public CrmScope(JdbcTemplate jdbc, LazyTables tables) {
        this.jdbc = jdbc;
        this.tables = tables;
    }

    public Scope of(CurrentUser user) {
        if (user == null || user.id() == null) return Scope.NONE;
        tables.ensureCrmUnitTables();
        List<Map<String, Object>> rows = jdbc.queryForList("""
            SELECT m.role, u.unit_id, u.unit_role, c.path, c.status, c.level
            FROM members m LEFT JOIN crm_unit_members u ON u.member_id = m.id
            LEFT JOIN community_centers c ON c.id = u.unit_id
            WHERE m.id = ?""", user.id());
        if (rows.isEmpty()) return Scope.NONE;
        Map<String, Object> row = rows.get(0);
        String role = row.get("role") == null ? "" : row.get("role").toString().toLowerCase(Locale.ROOT);
        if (role.equals("admin") || role.equals("superadmin")) return new Scope("global", null, null, null, true);
        if (role.equals("ceo")) return new Scope("global", null, null, null, false);
        boolean owner = "owner".equals(row.get("unit_role"));
        boolean staff = "staff".equals(row.get("unit_role"));
        boolean usable = row.get("path") != null && row.get("level") != null && "active".equals(row.get("status"));
        if (owner && usable) {
            return new Scope("unit", (String) row.get("unit_id"), "owner", (String) row.get("path"), true);
        }
        if (staff && usable) {
            return new Scope("staff", (String) row.get("unit_id"), "staff", (String) row.get("path"), false);
        }
        return Scope.NONE;
    }
}
