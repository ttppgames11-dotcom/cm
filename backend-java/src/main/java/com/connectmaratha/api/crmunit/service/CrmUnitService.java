package com.connectmaratha.api.crmunit.service;

import com.connectmaratha.api.common.exception.ApiException;
import com.connectmaratha.api.common.schema.LazyTables;
import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.crmunit.CrmScope;
import com.connectmaratha.api.crmunit.CrmScope.Scope;
import com.connectmaratha.api.crmunit.repository.CrmUnitRepository;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * CRM units (युनिट्स): the ladder State → Branch → Division → District → Taluka. Every request asks {@link CrmScope}
 * what the member may reach; units outside the scope are reported as not found.
 */
@Service
public class CrmUnitService {

    public static final List<String> LEVELS = List.of("state", "branch", "division", "district", "taluka");

    private final CrmUnitRepository units;
    private final CrmScope scopes;
    private final LazyTables tables;

    public CrmUnitService(CrmUnitRepository units, CrmScope scopes, LazyTables tables) {
        this.units = units;
        this.scopes = scopes;
        this.tables = tables;
    }

    // ------------------------------------------------------------------ reads

    /** Who am I here: my unit, my role and what I may do. */
    @Transactional(readOnly = true)
    public Map<String, Object> me(CurrentUser user) {
        tables.ensureCrmUnitTables();
        Scope scope = scopes.of(user);
        Map<String, Object> out = success();
        Map<String, Object> account = new LinkedHashMap<>();
        account.put("id", user.id());
        account.put("name", units.memberName(user.id()).map(m -> m.get("name")).orElse(user.name()));
        out.put("account", account);
        out.put("scopeKind", scope.kind());
        Map<String, Object> unit = null;
        if (scope.kind().equals("unit")) unit = units.find(scope.unitId()).map(r -> unitJson(r, scope)).orElse(null);
        out.put("unit", unit);
        out.put("unitRole", scope.unitRole());
        boolean ownsTaluka = unit != null && "taluka".equals(unit.get("level"));
        Map<String, Object> permissions = new LinkedHashMap<>();
        permissions.put("canCreateState", scope.kind().equals("global") && scope.canWrite());
        permissions.put("canCreateUnits", scope.canWrite() && !ownsTaluka);
        permissions.put("canManageStaff", false);
        permissions.put("canWriteActivities", false);
        permissions.put("readOnly", !scope.canWrite());
        out.put("permissions", permissions);
        return out;
    }

    /** Units inside my scope; "all" or empty filters mean no filter. A visitor or a stranger gets an empty list. */
    @Transactional(readOnly = true)
    public Map<String, Object> list(CurrentUser user, String level, String parentId, String search) {
        tables.ensureCrmUnitTables();
        Scope scope = scopes.of(user);
        List<Map<String, Object>> list = new ArrayList<>();
        for (Map<String, Object> row : units.list(filter(level) == null ? null : filter(level).toLowerCase(Locale.ROOT), filter(parentId), filter(search), scope)) {
            list.add(unitJson(row, scope));
        }
        Map<String, Object> out = success();
        out.put("count", list.size());
        out.put("units", list);
        return out;
    }

    /** One unit with the chain above it; a unit outside my scope is 404. */
    @Transactional(readOnly = true)
    public Map<String, Object> get(CurrentUser user, String id) {
        tables.ensureCrmUnitTables();
        Scope scope = scopes.of(user);
        Map<String, Object> row = inScope(id, scope);
        List<Map<String, Object>> ancestors = new ArrayList<>();
        for (Map<String, Object> a : units.ancestors((String) row.get("path"))) {
            Map<String, Object> j = new LinkedHashMap<>();
            j.put("id", a.get("id"));
            j.put("name", a.get("name"));
            j.put("level", a.get("level"));
            ancestors.add(j);
        }
        Map<String, Object> out = success();
        out.put("unit", unitJson(row, scope));
        out.put("ancestors", ancestors);
        return out;
    }

    // ------------------------------------------------------------------ helpers

    Map<String, Object> inScope(String id, Scope scope) {
        Map<String, Object> row = units.find(id).orElse(null);
        if (row == null || !scope.contains((String) row.get("path"))) {
            throw ApiException.notFound("UNIT_NOT_FOUND", "हे युनिट सापडले नाही (Unit not found).");
        }
        return row;
    }

    /** A unit as the viewer may see it: the owner's phone only for someone who can write. */
    static Map<String, Object> unitJson(Map<String, Object> row, Scope viewer) {
        Map<String, Object> u = new LinkedHashMap<>();
        u.put("id", row.get("id"));
        u.put("name", row.get("name"));
        u.put("level", row.get("level"));
        u.put("parentId", row.get("parent_id"));
        u.put("path", row.get("path"));
        u.put("state", row.get("state"));
        u.put("division", row.get("division"));
        u.put("district", row.get("district"));
        u.put("taluka", row.get("taluka"));
        u.put("address", row.get("address"));
        u.put("status", row.get("status"));
        Map<String, Object> owner = null;
        if (row.get("owner_id") != null) {
            owner = new LinkedHashMap<>();
            owner.put("id", row.get("owner_id"));
            owner.put("name", row.get("owner_name"));
            if (viewer.canWrite()) owner.put("phone", row.get("owner_phone"));
        }
        u.put("owner", owner);
        u.put("createdAt", row.get("created_at") == null ? null : String.valueOf(row.get("created_at")));
        u.put("updatedAt", row.get("updated_at") == null ? null : String.valueOf(row.get("updated_at")));
        return u;
    }

    static String filter(String value) {
        if (value == null) return null;
        String v = value.trim();
        return v.isEmpty() || v.equalsIgnoreCase("all") ? null : v;
    }

    static Map<String, Object> success() {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        return out;
    }
}
