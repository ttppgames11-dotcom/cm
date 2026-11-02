package com.connectmaratha.api.crmunit.service;

import com.connectmaratha.api.common.exception.ApiException;
import com.connectmaratha.api.common.schema.LazyTables;
import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.validation.SchemaValidator;
import com.connectmaratha.api.crmunit.ActivityTypes;
import com.connectmaratha.api.crmunit.CrmScope;
import com.connectmaratha.api.crmunit.CrmScope.Scope;
import com.connectmaratha.api.crmunit.dto.CrmActivitySchemas;
import com.connectmaratha.api.crmunit.repository.CrmActivityRepository;
import com.connectmaratha.api.crmunit.repository.CrmUnitRepository;
import com.connectmaratha.api.sangam.repository.ActivityRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * The yearly activities of a CRM unit (12 types, one planned per month). Anyone who can see the unit reads them; the
 * unit's own owner, its staff and admins write (see {@link Scope#writesActivitiesOf}). A request for a unit outside
 * the scope is 404; a member with no CRM access at all is 403 on writes, as in the unit and staff routes.
 */
@Service
public class CrmActivityService {

    static final ZoneId INDIA = ZoneId.of("Asia/Kolkata");
    private static final ObjectMapper JSON = new ObjectMapper();

    private final CrmActivityRepository activities;
    private final CrmUnitRepository units;
    private final CrmScope scopes;
    private final LazyTables tables;
    private final ActivityRepository activity;
    private final TransactionTemplate tx;

    public CrmActivityService(CrmActivityRepository activities, CrmUnitRepository units, CrmScope scopes, LazyTables tables,
                              ActivityRepository activity, PlatformTransactionManager transactions) {
        this.activities = activities;
        this.units = units;
        this.scopes = scopes;
        this.tables = tables;
        this.activity = activity;
        this.tx = new TransactionTemplate(transactions);
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

    // ------------------------------------------------------------------ plan and write

    /** Creates the missing types of the year, one per month on the 15th (types the unit already has that year are skipped). */
    public Map<String, Object> plan(CurrentUser user, String unitId, Map<String, Object> body) {
        ensure();
        writer(user, unitId);
        Map<String, Object> input = CrmActivitySchemas.normalize(body);
        SchemaValidator.check(input, CrmActivitySchemas.PLAN, true, null);
        int year = input.get("year") == null ? LocalDate.now(INDIA).getYear() : ((Number) input.get("year")).intValue();
        Map<String, Integer> targets = targetsOf(input.get("targets"));

        List<String> createdIds = new ArrayList<>();
        tx.executeWithoutResult(status -> {
            activities.lockUnit(unitId);
            Set<String> have = activities.typesOfYear(unitId, year);
            for (int i = 0; i < ActivityTypes.ALL.size(); i++) {
                ActivityTypes.Type t = ActivityTypes.ALL.get(i);
                if (have.contains(t.key())) continue;
                String id = newId();
                Map<String, Object> a = new LinkedHashMap<>();
                a.put("id", id);
                a.put("unit_id", unitId);
                a.put("year", year);
                a.put("type", t.key());
                a.put("title", t.mr());
                a.put("scheduled_date", String.format("%d-%02d-15", year, i + 1));
                a.put("target_count", targets.getOrDefault(t.key(), t.defaultTarget()));
                a.put("created_by", user.id());
                activities.insert(a);
                createdIds.add(id);
            }
            audit(user, "CRM_PLAN_CREATE", Map.of("unit", unitId, "year", year, "created", createdIds.size()));
        });
        LocalDate today = LocalDate.now(INDIA);
        List<Map<String, Object>> created = new ArrayList<>();
        for (String id : createdIds) created.add(activityJson(activities.find(unitId, id).orElseThrow(), today));
        Map<String, Object> out = success();
        out.put("message", created.size() + " उपक्रम आराखड्यात जोडले. (" + created.size() + " activities added to the plan.)");
        out.put("year", year);
        out.put("created", created);
        out.put("skipped", ActivityTypes.ALL.size() - created.size());
        return out;
    }

    /** Adds one activity (the title defaults to the type's Marathi name). */
    public Map<String, Object> add(CurrentUser user, String unitId, Map<String, Object> body) {
        ensure();
        writer(user, unitId);
        Map<String, Object> input = CrmActivitySchemas.normalize(body);
        SchemaValidator.check(input, CrmActivitySchemas.ADD, true, null);
        input.keySet().retainAll(CrmActivitySchemas.ADD.keySet());
        String type = (String) input.get("type");
        String date = (String) input.get("scheduled_date");
        int year = yearOfDate(date);
        String id = newId();
        Map<String, Object> a = new LinkedHashMap<>();
        a.put("id", id);
        a.put("unit_id", unitId);
        a.put("year", year);
        a.put("type", type);
        a.put("title", input.get("title") != null ? input.get("title") : ActivityTypes.byKey(type).orElseThrow().mr());
        a.put("scheduled_date", date);
        a.put("target_count", input.get("target_count") == null ? 0 : ((Number) input.get("target_count")).intValue());
        a.put("notes", input.get("notes"));
        a.put("created_by", user.id());
        tx.executeWithoutResult(status -> {
            activities.insert(a);
            audit(user, "CRM_ACTIVITY_ADD", Map.of("unit", unitId, "activity", id, "type", type));
        });
        Map<String, Object> out = success();
        out.put("message", "उपक्रम नोंदवला. (Activity added.)");
        out.put("activity", activityJson(activities.find(unitId, id).orElseThrow(), LocalDate.now(INDIA)));
        return out;
    }

    /** Changes the date, target, title, note, photo link or status (planned / in progress) of an activity that is not done. */
    public Map<String, Object> update(CurrentUser user, String unitId, String activityId, Map<String, Object> body) {
        ensure();
        writer(user, unitId);
        Map<String, Object> row = activities.find(unitId, activityId).orElseThrow(CrmActivityService::activityNotFound);
        if ("done".equals(row.get("status"))) throw alreadyDone();
        Map<String, Object> input = CrmActivitySchemas.normalize(body);
        SchemaValidator.check(input, CrmActivitySchemas.UPDATE, true, null);
        input.keySet().retainAll(CrmActivitySchemas.UPDATE.keySet());
        if (input.isEmpty()) {
            throw ApiException.badRequest("INVALID_ACTIVITY", "बदलण्यासाठी काहीही दिलेले नाही (Nothing to change).");
        }
        if ("done".equals(input.get("status"))) {
            throw ApiException.badRequest("USE_COMPLETE", "\"पूर्ण\" करण्यासाठी पुरावा देऊन पूर्ण करा वापरा (Use complete, with proof).");
        }
        if (input.get("scheduled_date") != null) input.put("year", yearOfDate((String) input.get("scheduled_date")));
        checkPhoto(input.get("photo_url"));
        tx.executeWithoutResult(status -> {
            if (activities.update(unitId, activityId, input) == 0) throw alreadyDone();
            audit(user, "CRM_ACTIVITY_UPDATE", Map.of("unit", unitId, "activity", activityId));
        });
        Map<String, Object> out = success();
        out.put("message", "उपक्रम अद्ययावत झाला. (Activity updated.)");
        out.put("activity", activityJson(activities.find(unitId, activityId).orElseThrow(), LocalDate.now(INDIA)));
        return out;
    }

    /** Marks an activity done. Proof is required (a head count and a note); done is final. */
    public Map<String, Object> complete(CurrentUser user, String unitId, String activityId, Map<String, Object> body) {
        ensure();
        writer(user, unitId);
        Map<String, Object> row = activities.find(unitId, activityId).orElseThrow(CrmActivityService::activityNotFound);
        if ("done".equals(row.get("status"))) throw alreadyDone();
        Map<String, Object> input = CrmActivitySchemas.normalize(body);
        if (input.get("attendee_count") == null || !(input.get("notes") instanceof String n) || n.length() < 3) {
            throw ApiException.badRequest("PROOF_REQUIRED",
                "पुरावा आवश्यक आहे: उपस्थिती संख्या आणि किमान ३ अक्षरांची नोंद (Proof needed: a head count and a note).");
        }
        SchemaValidator.check(input, CrmActivitySchemas.COMPLETE, true, null);
        input.keySet().retainAll(CrmActivitySchemas.COMPLETE.keySet());
        checkPhoto(input.get("photo_url"));
        tx.executeWithoutResult(status -> {
            int changed = activities.complete(unitId, activityId, ((Number) input.get("attendee_count")).intValue(),
                (String) input.get("notes"), (String) input.get("photo_url"), user.id());
            if (changed == 0) throw alreadyDone();
            audit(user, "CRM_ACTIVITY_COMPLETE", Map.of("unit", unitId, "activity", activityId));
        });
        Map<String, Object> out = success();
        out.put("message", "उपक्रम पूर्ण म्हणून नोंदवला. (Activity marked done.)");
        out.put("activity", activityJson(activities.find(unitId, activityId).orElseThrow(), LocalDate.now(INDIA)));
        return out;
    }

    /** Removes an activity: the unit's owner or an admin; a done record only an admin. */
    public Map<String, Object> delete(CurrentUser user, String unitId, String activityId) {
        ensure();
        Scope scope = scopes.of(user);
        if (scope.isNone()) throw noAccess();
        Map<String, Object> unit = unitInScope(unitId, scope);
        if (!scope.managesStaffOf(unitId)) throw noAccess();
        if ("archived".equals(unit.get("status"))) throw unitArchived();
        Map<String, Object> row = activities.find(unitId, activityId).orElseThrow(CrmActivityService::activityNotFound);
        if ("done".equals(row.get("status")) && !scope.kind().equals("global")) throw noAccess();
        tx.executeWithoutResult(status -> {
            activities.delete(unitId, activityId);
            audit(user, "CRM_ACTIVITY_DELETE", Map.of("unit", unitId, "activity", activityId, "type", String.valueOf(row.get("type"))));
        });
        Map<String, Object> out = success();
        out.put("message", "उपक्रम काढला. (Activity removed.)");
        out.put("deletedId", activityId);
        return out;
    }

    /** The unit when this member may write its activities; otherwise 403 / 404 / 409 as the order of checks says. */
    private Map<String, Object> writer(CurrentUser user, String unitId) {
        Scope scope = scopes.of(user);
        if (scope.isNone()) throw noAccess();
        Map<String, Object> unit = unitInScope(unitId, scope);
        if (!scope.writesActivitiesOf(unitId)) throw noAccess();
        if ("archived".equals(unit.get("status"))) throw unitArchived();
        return unit;
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

    /** A real date (YYYY-MM-DD) in 2000-2100; returns its year. */
    static int yearOfDate(String date) {
        try {
            int y = LocalDate.parse(date).getYear();
            if (y >= 2000 && y <= 2100) return y;
        } catch (DateTimeParseException ignored) {
            // falls through to the error below
        }
        throw ApiException.badRequest("INVALID_ACTIVITY", "कृपया वैध तारीख (YYYY-MM-DD, २००० ते २१००) द्या (Give a valid date).");
    }

    /** The target numbers of a plan: whole numbers (or numeric texts) from 0 to a million, by type key; empty ones are left out. */
    private static Map<String, Integer> targetsOf(Object raw) {
        Map<String, Integer> out = new LinkedHashMap<>();
        if (!(raw instanceof Map<?, ?> map)) return out;
        for (ActivityTypes.Type t : ActivityTypes.ALL) {
            Object v = map.get(t.key());
            if (v == null || (v instanceof String s && s.isBlank())) continue;
            try {
                double d = v instanceof Number num ? num.doubleValue() : Double.parseDouble(((String) v).trim());
                if (d != Math.rint(d) || d < 0 || d > CrmActivitySchemas.MAX_COUNT) throw new NumberFormatException();
                out.put(t.key(), (int) d);
            } catch (NumberFormatException | ClassCastException e) {
                throw ApiException.badRequest("INVALID_ACTIVITY", "लक्ष्य संख्या वैध नाही (The target is not a valid number).");
            }
        }
        return out;
    }

    private static void checkPhoto(Object url) {
        if (url == null) return;
        String u = (String) url;
        if (!(u.startsWith("http://") || u.startsWith("https://") || u.startsWith("/"))) {
            throw ApiException.badRequest("INVALID_ACTIVITY", "फोटो लिंक http / https किंवा / ने सुरू व्हावी (The photo link must start with http, https or /).");
        }
    }

    private void audit(CurrentUser user, String action, Map<String, Object> details) {
        String name = units.memberName(user.id()).map(m -> String.valueOf(m.get("name"))).orElse("सदस्य");
        String json;
        try {
            json = JSON.writeValueAsString(details);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(e);
        }
        activity.audit("LOG-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 6), user.id(), name, action, json);
    }

    private static String newId() {
        return "ACT-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
    }

    private static ApiException noAccess() {
        return ApiException.forbidden("NO_ACCESS", "या युनिटचे उपक्रम बदलण्याचा अधिकार नाही (You cannot change this unit's activities).");
    }

    private static ApiException unitArchived() {
        return new ApiException(HttpStatus.CONFLICT, "UNIT_ARCHIVED", "हे युनिट संग्रहित आहे (This unit is archived).");
    }

    private static ApiException alreadyDone() {
        return new ApiException(HttpStatus.CONFLICT, "ALREADY_DONE", "पूर्ण झालेला उपक्रम बदलता येत नाही (A finished activity cannot be changed).");
    }

    private static ApiException activityNotFound() {
        return ApiException.notFound("ACTIVITY_NOT_FOUND", "उपक्रम सापडला नाही (Activity not found).");
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
