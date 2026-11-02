package com.connectmaratha.api.crmunit.service;

import com.connectmaratha.api.common.exception.ApiException;
import com.connectmaratha.api.common.schema.LazyTables;
import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.crmunit.ActivityTypes;
import com.connectmaratha.api.crmunit.CrmScope;
import com.connectmaratha.api.crmunit.CrmScope.Scope;
import com.connectmaratha.api.crmunit.repository.CrmActivityRepository;
import com.connectmaratha.api.crmunit.repository.CrmUnitRepository;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * The yearly activities of a CRM unit (12 types, one planned per month). Anyone who can see the unit reads them; the
 * unit's own owner, its staff and admins write (see {@link Scope#writesActivitiesOf}). A request for a unit outside
 * the scope is 404.
 */
@Service
public class CrmActivityService {

    static final ZoneId INDIA = ZoneId.of("Asia/Kolkata");

    private final CrmActivityRepository activities;
    private final CrmUnitRepository units;
    private final CrmScope scopes;
    private final LazyTables tables;

    public CrmActivityService(CrmActivityRepository activities, CrmUnitRepository units, CrmScope scopes, LazyTables tables) {
        this.activities = activities;
        this.units = units;
        this.scopes = scopes;
        this.tables = tables;
    }

    void ensure() {
        tables.ensureCrmUnitTables();
        tables.ensureCrmActivityTables();
    }

    /** The 12 types (anyone may ask). */
    public Map<String, Object> types() {
        List<Map<String, Object>> list = new ArrayList<>();
        for (ActivityTypes.Type t : ActivityTypes.ALL) {
            Map<String, Object> j = new LinkedHashMap<>();
            j.put("key", t.key());
            j.put("mr", t.mr());
            j.put("en", t.en());
            j.put("icon", t.icon());
            j.put("defaultTarget", t.defaultTarget());
            list.add(j);
        }
        Map<String, Object> out = success();
        out.put("types", list);
        return out;
    }

    /** One unit's activities of a year with the status of each and the year's progress. */
    @Transactional(readOnly = true)
    public Map<String, Object> list(CurrentUser user, String unitId, String yearText, String type, String status) {
        ensure();
        Scope scope = scopes.of(user);
        Map<String, Object> unit = unitInScope(unitId, scope);
        int year = yearOf(yearText);
        LocalDate today = LocalDate.now(INDIA);

        List<Map<String, Object>> all = new ArrayList<>();
        for (Map<String, Object> row : activities.list(unitId, year, null)) all.add(activityJson(row, today));
        String wantedType = filter(type);
        String wantedStatus = filter(status);
        List<Map<String, Object>> shown = new ArrayList<>();
        for (Map<String, Object> a : all) {
            if (wantedType != null && !wantedType.equals(a.get("type"))) continue;
            if (wantedStatus != null && !wantedStatus.equals(a.get("status"))) continue;
            shown.add(a);
        }
        Map<String, Object> out = success();
        out.put("year", year);
        out.put("count", shown.size());
        out.put("activities", shown);
        out.put("progress", progress(all));
        out.put("canWrite", scope.writesActivitiesOf(unitId));
        out.put("canDelete", scope.managesStaffOf(unitId));
        out.put("unitStatus", unit.get("status"));
        return out;
    }

    // ------------------------------------------------------------------ helpers

    Map<String, Object> unitInScope(String unitId, Scope scope) {
        Map<String, Object> row = units.find(unitId).orElse(null);
        if (row == null || !scope.contains((String) row.get("path"))) {
            throw ApiException.notFound("UNIT_NOT_FOUND", "हे युनिट सापडले नाही (Unit not found).");
        }
        return row;
    }

    /** The year asked for (default: this year in India); 2000 to 2100 only. */
    static int yearOf(String text) {
        if (text == null || text.isBlank()) return LocalDate.now(INDIA).getYear();
        try {
            int y = Integer.parseInt(text.trim());
            if (y >= 2000 && y <= 2100) return y;
        } catch (NumberFormatException ignored) {
            // falls through to the error below
        }
        throw ApiException.badRequest("INVALID_ACTIVITY", "वर्ष २००० ते २१०० दरम्यान असावे (The year must be between 2000 and 2100).");
    }

    /** "done" stays done; anything else whose date has passed is "overdue". */
    static String derivedStatus(String stored, LocalDate date, LocalDate today) {
        if ("done".equals(stored)) return "done";
        return date.isBefore(today) ? "overdue" : stored;
    }

    static Map<String, Object> activityJson(Map<String, Object> row, LocalDate today) {
        LocalDate date = LocalDate.parse(String.valueOf(row.get("scheduled_date")));
        Map<String, Object> a = new LinkedHashMap<>();
        a.put("id", row.get("id"));
        a.put("unitId", row.get("unit_id"));
        a.put("year", row.get("year"));
        a.put("type", row.get("type"));
        a.put("title", row.get("title"));
        a.put("scheduledDate", date.toString());
        a.put("targetCount", row.get("target_count"));
        a.put("attendeeCount", row.get("attendee_count"));
        a.put("notes", row.get("notes"));
        a.put("photoUrl", row.get("photo_url"));
        a.put("status", derivedStatus((String) row.get("status"), date, today));
        a.put("completedAt", row.get("completed_at") == null ? null : String.valueOf(row.get("completed_at")));
        return a;
    }

    /** Counts of the year's activities by status, targets and head counts, and how many of the 12 types are covered. */
    static Map<String, Object> progress(List<Map<String, Object>> all) {
        int planned = 0, inProgress = 0, done = 0, overdue = 0, target = 0, achieved = 0;
        Set<Object> covered = new HashSet<>();
        for (Map<String, Object> a : all) {
            switch ((String) a.get("status")) {
                case "done" -> { done++; achieved += ((Number) a.get("attendeeCount")).intValue(); }
                case "overdue" -> overdue++;
                case "in_progress" -> inProgress++;
                default -> planned++;
            }
            target += ((Number) a.get("targetCount")).intValue();
            covered.add(a.get("type"));
        }
        int total = all.size();
        int required = ActivityTypes.ALL.size();
        Map<String, Object> p = new LinkedHashMap<>();
        p.put("total", total);
        p.put("planned", planned);
        p.put("in_progress", inProgress);
        p.put("done", done);
        p.put("overdue", overdue);
        p.put("targetTotal", target);
        p.put("achievedTotal", achieved);
        p.put("typesCovered", covered.size());
        p.put("typesRequired", required);
        p.put("coveragePct", Math.round(covered.size() * 100f / required));
        p.put("completionPct", total == 0 ? 0 : Math.round(done * 100f / total));
        return p;
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
