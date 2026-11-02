package com.connectmaratha.api.crmunit.service;

import com.connectmaratha.api.common.exception.ApiException;
import com.connectmaratha.api.common.schema.LazyTables;
import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.crmunit.CrmScope;
import com.connectmaratha.api.crmunit.CrmScope.Scope;
import com.connectmaratha.api.crmunit.dto.CrmUnitSchemas;
import com.connectmaratha.api.crmunit.repository.CrmActivityRepository;
import com.connectmaratha.api.crmunit.repository.CrmUnitRepository;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Read-only dashboards over the yearly activities: a unit's own numbers, the roll-up of everything below it and the
 * roll-up by level. Only active units count (an archived unit and everything below it are left out), and every number
 * stays inside the viewer's scope. The activities of all the units involved are read with one query.
 */
@Service
public class CrmRollupService {

    private final CrmUnitRepository units;
    private final CrmActivityRepository activities;
    private final CrmActivityService activityService;
    private final CrmScope scopes;
    private final LazyTables tables;

    public CrmRollupService(CrmUnitRepository units, CrmActivityRepository activities, CrmActivityService activityService,
                            CrmScope scopes, LazyTables tables) {
        this.units = units;
        this.activities = activities;
        this.activityService = activityService;
        this.scopes = scopes;
        this.tables = tables;
    }

    void ensure() {
        tables.ensureCrmUnitTables();
        tables.ensureCrmActivityTables();
    }

    /** One unit: its own numbers, the roll-up of itself and the active units below it, its direct children and the 12 types. */
    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public Map<String, Object> summary(CurrentUser user, String unitId, String yearText) {
        ensure();
        Scope scope = scopes.of(user);
        Map<String, Object> unit = units.find(unitId).orElse(null);
        if (unit == null || !scope.contains((String) unit.get("path"))) {
            throw ApiException.notFound("UNIT_NOT_FOUND", "हे युनिट सापडले नाही (Unit not found).");
        }
        int year = CrmActivityService.yearOf(yearText);
        LocalDate today = LocalDate.now(CrmActivityService.INDIA);

        List<Map<String, Object>> visible = visibleActive(scope);
        String path = (String) unit.get("path");
        List<Map<String, Object>> subtree = new ArrayList<>();
        for (Map<String, Object> u : visible) if (((String) u.get("path")).startsWith(path)) subtree.add(u);
        boolean counted = subtree.stream().anyMatch(u -> u.get("id").equals(unit.get("id")));
        if (!counted) {  // an archived unit asked for directly: itself only
            subtree = new ArrayList<>(List.of(unit));
        }

        Map<String, Map<String, Object>> own = ownNumbers(subtree, year, today);
        Map<String, Object> out = success();
        out.put("year", year);
        out.put("unit", unitRef(unit, true));
        out.put("own", own.get(unitId));
        out.put("rollup", UnitProgress.sum(ownsUnder(subtree, path, own)));
        List<Map<String, Object>> children = new ArrayList<>();
        for (Map<String, Object> c : subtree) {
            if (!unitId.equals(c.get("parent_id"))) continue;
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("unit", unitRef(c, true));
            row.put("own", own.get(c.get("id")));
            row.put("rollup", UnitProgress.sum(ownsUnder(subtree, (String) c.get("path"), own)));
            children.add(row);
        }
        out.put("children", children);
        out.put("types", activityService.types().get("types"));
        return out;
    }


    private static final Map<String, String> LEVEL_LABELS = Map.of(
        "state", "राज्य", "branch", "शाखा", "division", "विभाग", "district", "जिल्हा", "taluka", "तालुका");

    /**
     * One table per level that has visible active units (top level first): a row per unit with its own numbers and the
     * roll-up of everything below it, and the totals of the level. ?level= keeps one level. A member with no access gets none.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> rollup(CurrentUser user, String yearText, String levelText) {
        ensure();
        Scope scope = scopes.of(user);
        int year = CrmActivityService.yearOf(yearText);
        String wanted = levelText == null || levelText.isBlank() || levelText.equalsIgnoreCase("all") ? null : levelText.trim().toLowerCase();
        if (wanted != null && !CrmUnitSchemas.LEVELS.contains(wanted)) {
            throw ApiException.badRequest("INVALID_ACTIVITY", "स्तर वैध नाही (The level is not valid).");
        }
        LocalDate today = LocalDate.now(CrmActivityService.INDIA);
        List<Map<String, Object>> visible = visibleActive(scope);
        Map<String, Map<String, Object>> own = ownNumbers(visible, year, today);

        List<Map<String, Object>> levels = new ArrayList<>();
        for (String level : CrmUnitSchemas.LEVELS) {
            if (wanted != null && !wanted.equals(level)) continue;
            List<Map<String, Object>> atLevel = new ArrayList<>();
            for (Map<String, Object> u : visible) if (level.equals(u.get("level"))) atLevel.add(u);
            if (atLevel.isEmpty()) continue;
            List<Map<String, Object>> rows = new ArrayList<>();
            List<Map<String, Object>> owns = new ArrayList<>();
            for (Map<String, Object> u : atLevel) {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("unit", unitRef(u, false));
                row.put("own", own.get(u.get("id")));
                row.put("rollup", UnitProgress.sum(ownsUnder(visible, (String) u.get("path"), own)));
                rows.add(row);
                owns.add(own.get(u.get("id")));
            }
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("level", level);
            entry.put("levelLabel", LEVEL_LABELS.get(level));
            entry.put("unitsCount", atLevel.size());
            entry.put("totals", UnitProgress.sum(owns));
            entry.put("units", rows);
            levels.add(entry);
        }
        Map<String, Object> out = success();
        out.put("year", year);
        out.put("levels", levels);
        return out;
    }
    // ------------------------------------------------------------------ helpers

    /** The units the viewer can see, minus archived ones and the units below them. */
    List<Map<String, Object>> visibleActive(Scope scope) {
        List<Map<String, Object>> all = units.list(null, null, null, scope);
        List<String> archivedPaths = new ArrayList<>();
        for (Map<String, Object> u : all) if ("archived".equals(u.get("status"))) archivedPaths.add((String) u.get("path"));
        List<Map<String, Object>> out = new ArrayList<>();
        for (Map<String, Object> u : all) {
            String path = (String) u.get("path");
            if ("archived".equals(u.get("status"))) continue;
            if (archivedPaths.stream().anyMatch(path::startsWith)) continue;
            out.add(u);
        }
        return out;
    }

    /** The own numbers of each unit by id, from one query for all their activities of the year. */
    Map<String, Map<String, Object>> ownNumbers(List<Map<String, Object>> list, int year, LocalDate today) {
        List<String> ids = new ArrayList<>();
        for (Map<String, Object> u : list) ids.add((String) u.get("id"));
        Map<String, List<Map<String, Object>>> rowsByUnit = new HashMap<>();
        for (Map<String, Object> row : activities.rowsForUnits(ids, year)) {
            rowsByUnit.computeIfAbsent((String) row.get("unit_id"), k -> new ArrayList<>()).add(row);
        }
        Map<String, Map<String, Object>> out = new HashMap<>();
        for (String id : ids) out.put(id, UnitProgress.own(rowsByUnit.getOrDefault(id, List.of()), today));
        return out;
    }

    /** The own numbers of the units in the list whose path starts with the given path (the unit itself and everything below). */
    static List<Map<String, Object>> ownsUnder(List<Map<String, Object>> list, String path, Map<String, Map<String, Object>> own) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (Map<String, Object> u : list) if (((String) u.get("path")).startsWith(path)) out.add(own.get(u.get("id")));
        return out;
    }

    static Map<String, Object> unitRef(Map<String, Object> u, boolean withStatus) {
        Map<String, Object> j = new LinkedHashMap<>();
        j.put("id", u.get("id"));
        j.put("name", u.get("name"));
        j.put("level", u.get("level"));
        if (withStatus) j.put("status", u.get("status"));
        return j;
    }

    static Map<String, Object> success() {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        return out;
    }
}
