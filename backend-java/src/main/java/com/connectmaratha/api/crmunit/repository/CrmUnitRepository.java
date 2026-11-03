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
        SELECT c.*, m.name AS owner_name, m.phone AS owner_phone, d.name AS area_district_name, t.name AS area_taluka_name
        FROM community_centers c LEFT JOIN members m ON m.id = c.owner_id
        LEFT JOIN districts d ON d.id = c.area_district_id LEFT JOIN talukas t ON t.id = c.area_taluka_id""";

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
        if (scope.kind().equals("staff")) {
            sql.append(" AND c.id = ?");
            args.add(scope.unitId());
        }
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

    // ------------------------------------------------------------------ writes

    /** Inserts a ladder unit (status active); a second unit with the same name under the same parent throws DuplicateKeyException. */
    public int insert(Map<String, Object> u) {
        return jdbc.update("""
            INSERT INTO community_centers (id, name, level, parent_id, path, owner_id, state, division, district, taluka,
              address, created_by, status, updated_at, area_district_id, area_taluka_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', now(), ?, ?)""",
            u.get("id"), u.get("name"), u.get("level"), u.get("parent_id"), u.get("path"), u.get("owner_id"),
            u.get("state"), u.get("division"), u.get("district"), u.get("taluka"), u.get("address"), u.get("created_by"),
            u.get("area_district_id"), u.get("area_taluka_id"));
    }

    /** Renames and/or changes the address; null leaves a value as it is. Also sets the unit's own geography name. */
    public int update(String id, String level, String name, String address) {
        String own = switch (level) {
            case "state" -> "state";
            case "division" -> "division";
            case "district" -> "district";
            case "taluka" -> "taluka";
            default -> null;
        };
        String sql = "UPDATE community_centers SET name = COALESCE(?, name), address = COALESCE(?, address), updated_at = now()"
            + (own != null && name != null ? ", " + own + " = ?" : "") + " WHERE id = ? AND level IS NOT NULL";
        return own != null && name != null ? jdbc.update(sql, name, address, name, id) : jdbc.update(sql, name, address, id);
    }

    public int setStatus(String id, String status) {
        return jdbc.update("UPDATE community_centers SET status = ?, updated_at = now() WHERE id = ? AND level IS NOT NULL", status, id);
    }

    public int setOwner(String unitId, String ownerId) {
        return jdbc.update("UPDATE community_centers SET owner_id = ?, updated_at = now() WHERE id = ? AND level IS NOT NULL", ownerId, unitId);
    }

    /** Makes the member the owner of the unit; 0 rows when the member is already in a unit or the unit already has an owner. */
    public int linkOwner(String memberId, String unitId) {
        return jdbc.update("INSERT INTO crm_unit_members (member_id, unit_id, unit_role) VALUES (?, ?, 'owner') ON CONFLICT DO NOTHING",
            memberId, unitId);
    }

    public int unlinkOwner(String memberId, String unitId) {
        return jdbc.update("DELETE FROM crm_unit_members WHERE member_id = ? AND unit_id = ?", memberId, unitId);
    }

    /** Is the member the owner of an active unit? An archived unit does not hold its owner. */
    public boolean inAUnit(String memberId) {
        return Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS (SELECT 1 FROM crm_unit_members u JOIN community_centers c ON c.id = u.unit_id WHERE u.member_id = ? AND c.status = 'active')", Boolean.class, memberId));
    }

    public Optional<String> roleOf(String memberId) {
        return jdbc.queryForList("SELECT role FROM members WHERE id = ?", String.class, memberId).stream().findFirst();
    }

    /** Members whose id is this text or whose last 10 digits of phone match it (all of them, so a shared phone can be refused). */
    public List<String> membersByIdOrPhone(String idOrPhone) {
        List<String> byId = jdbc.queryForList("SELECT id FROM members WHERE id = ?", String.class, idOrPhone);
        if (!byId.isEmpty()) return byId;
        String digits = idOrPhone.replaceAll("\\D", "");
        if (digits.length() < 10) return List.of();
        return jdbc.queryForList(
            "SELECT id FROM members WHERE right(regexp_replace(coalesce(phone, ''), '\\D', '', 'g'), 10) = ? ORDER BY id",
            String.class, digits.substring(digits.length() - 10));
    }

    /** Frees a member whose unit is archived: the link goes and the archived unit is left without an owner. */
    public void releaseFromArchived(String memberId) {
        jdbc.update("UPDATE community_centers SET owner_id = NULL, updated_at = now() WHERE owner_id = ? AND status = 'archived' AND level IS NOT NULL", memberId);
        jdbc.update("DELETE FROM crm_unit_members WHERE member_id = ? AND unit_id IN (SELECT id FROM community_centers WHERE status = 'archived')", memberId);
    }

    // ------------------------------------------------------------------ staff

    /** The staff of a unit, oldest first: member id, name, phone and since. */
    public List<Map<String, Object>> staffOf(String unitId) {
        return jdbc.queryForList("""
            SELECT m.id, m.name, m.phone, u.created_at AS since
            FROM crm_unit_members u JOIN members m ON m.id = u.member_id
            WHERE u.unit_id = ? AND u.unit_role = 'staff'
            ORDER BY u.created_at, m.id""", unitId);
    }

    public int countStaff(String unitId) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM crm_unit_members WHERE unit_id = ? AND unit_role = 'staff'", Integer.class, unitId);
    }

    /** Locks the unit row until the end of the transaction, so adds to one team line up one after the other. */
    public void lockUnit(String id) {
        jdbc.queryForList("SELECT id FROM community_centers WHERE id = ? FOR UPDATE", id);
    }

    /** Makes the member staff of the unit; 0 rows when they already belong to a unit. */
    public int linkStaff(String memberId, String unitId) {
        return jdbc.update("INSERT INTO crm_unit_members (member_id, unit_id, unit_role) VALUES (?, ?, 'staff') ON CONFLICT DO NOTHING",
            memberId, unitId);
    }

    public int unlinkStaff(String memberId, String unitId) {
        return jdbc.update("DELETE FROM crm_unit_members WHERE member_id = ? AND unit_id = ? AND unit_role = 'staff'", memberId, unitId);
    }

    // ------------------------------------------------------------------ places (migration 019)

    /** Sets the place of a unit; null clears a column. */
    public int updateArea(String unitId, String districtId, String talukaId) {
        return jdbc.update("UPDATE community_centers SET area_district_id = ?, area_taluka_id = ?, updated_at = now() "
            + "WHERE id = ? AND level IS NOT NULL", districtId, talukaId, unitId);
    }

    public boolean districtExists(String districtId) {
        return Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS (SELECT 1 FROM districts WHERE id = ?)", Boolean.class, districtId));
    }

    /** The district id a taluka belongs to, or empty when there is no such taluka. */
    public Optional<String> talukaDistrict(String talukaId) {
        return jdbc.queryForList("SELECT district_id FROM talukas WHERE id = ?", String.class, talukaId).stream().findFirst();
    }
}
