package com.connectmaratha.api.crmunit.service;

import com.connectmaratha.api.common.exception.ApiException;
import com.connectmaratha.api.common.schema.LazyTables;
import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.validation.SchemaValidator;
import com.connectmaratha.api.crmunit.CrmScope;
import com.connectmaratha.api.crmunit.CrmScope.Scope;
import com.connectmaratha.api.crmunit.dto.CrmUnitSchemas;
import com.connectmaratha.api.crmunit.repository.CrmUnitRepository;
import com.connectmaratha.api.sangam.repository.ActivityRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * CRM units (युनिट्स): the ladder State → Branch → Division → District → Taluka. Every request asks {@link CrmScope}
 * what the member may reach; units outside the scope are reported as not found. Writes (create, edit, archive,
 * change owner) save the unit, the owner link and the audit entry in one transaction; the bells go out afterwards.
 */
@Service
public class CrmUnitService {

    private static final Logger log = LoggerFactory.getLogger(CrmUnitService.class);
    private static final ObjectMapper JSON = new ObjectMapper();
    private static final List<String> LEVELS = CrmUnitSchemas.LEVELS;
    private static final Set<String> NOT_OWNERS = Set.of("admin", "superadmin", "ceo");

    private final CrmUnitRepository units;
    private final CrmScope scopes;
    private final ActivityRepository activity;
    private final LazyTables tables;
    private final TransactionTemplate tx;
    private final TransactionTemplate ownTransaction;

    public CrmUnitService(CrmUnitRepository units, CrmScope scopes, ActivityRepository activity, LazyTables tables,
                          PlatformTransactionManager transactions) {
        this.units = units;
        this.scopes = scopes;
        this.activity = activity;
        this.tables = tables;
        this.tx = new TransactionTemplate(transactions);
        this.ownTransaction = new TransactionTemplate(transactions);
        this.ownTransaction.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
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
        if (scope.kind().equals("unit") || scope.kind().equals("staff")) unit = units.find(scope.unitId()).map(r -> unitJson(r, scope)).orElse(null);
        out.put("unit", unit);
        out.put("unitRole", scope.unitRole());
        boolean ownsTaluka = unit != null && "taluka".equals(unit.get("level"));
        Map<String, Object> permissions = new LinkedHashMap<>();
        permissions.put("canCreateState", scope.kind().equals("global") && scope.canWrite());
        permissions.put("canCreateUnits", scope.canWrite() && !ownsTaluka);
        permissions.put("canManageStaff", scope.canWrite() && (scope.kind().equals("global") || scope.kind().equals("unit")));
        permissions.put("canWriteActivities", (scope.kind().equals("global") && scope.canWrite()) || scope.kind().equals("unit") || scope.kind().equals("staff"));
        permissions.put("readOnly", !scope.canWrite());
        out.put("permissions", permissions);
        return out;
    }

    /** Units inside my scope; "all" or empty filters mean no filter. A visitor or a stranger gets an empty list. */
    @Transactional(readOnly = true)
    public Map<String, Object> list(CurrentUser user, String level, String parentId, String search) {
        tables.ensureCrmUnitTables();
        Scope scope = scopes.of(user);
        String lvl = filter(level);
        List<Map<String, Object>> list = new ArrayList<>();
        for (Map<String, Object> row : units.list(lvl == null ? null : lvl.toLowerCase(Locale.ROOT), filter(parentId), filter(search), scope)) {
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

    // ------------------------------------------------------------------ staff

    static final int MAX_STAFF = 10;

    /** The owner and staff of a unit; phone numbers only for those who may manage the team. */
    @Transactional(readOnly = true)
    public Map<String, Object> listStaff(CurrentUser user, String unitId) {
        tables.ensureCrmUnitTables();
        Scope scope = scopes.of(user);
        Map<String, Object> row = inScope(unitId, scope);
        return teamJson(row, scope);
    }

    private Map<String, Object> teamJson(Map<String, Object> row, Scope scope) {
        String id = (String) row.get("id");
        boolean manage = scope.managesStaffOf(id);
        Map<String, Object> owner = null;
        if (row.get("owner_id") != null) {
            owner = new LinkedHashMap<>();
            owner.put("id", row.get("owner_id"));
            owner.put("name", row.get("owner_name"));
        }
        List<Map<String, Object>> staff = new ArrayList<>();
        for (Map<String, Object> s : units.staffOf(id)) {
            Map<String, Object> j = new LinkedHashMap<>();
            j.put("id", s.get("id"));
            j.put("name", s.get("name"));
            if (manage) j.put("phone", s.get("phone"));
            j.put("since", s.get("since") == null ? null : String.valueOf(s.get("since")));
            staff.add(j);
        }
        Map<String, Object> out = success();
        out.put("owner", owner);
        out.put("staff", staff);
        out.put("max", MAX_STAFF);
        out.put("canManage", manage);
        return out;
    }


    /** Adds an existing member to the unit's team (owner of the unit, admin, superadmin); at most 10. */
    public Map<String, Object> addStaff(CurrentUser user, String unitId, Map<String, Object> body) {
        tables.ensureCrmUnitTables();
        Scope scope = scopes.of(user);
        requireWrite(scope);
        Map<String, Object> row = inScope(unitId, scope);
        if (!scope.managesStaffOf(unitId)) throw noAccess();
        if ("archived".equals(row.get("status"))) throw unitArchived();
        Map<String, Object> input = CrmUnitSchemas.normalize(body);
        SchemaValidator.check(input, CrmUnitSchemas.OWNER, true, null);
        String memberId = resolveMember(input, null, CrmUnitService::memberInUnit);
        String name = (String) row.get("name");

        tx.executeWithoutResult(status -> {
            units.lockUnit(unitId);
            units.releaseFromArchived(memberId);
            if (units.countStaff(unitId) >= MAX_STAFF) throw staffLimit();
            if (units.linkStaff(memberId, unitId) == 0) throw memberInUnit();
            audit(user, "CRM_STAFF_ADD", Map.of("unit", unitId, "member", memberId));
        });
        send(unitId, memberId, "🏢 तुम्ही " + name + " युनिटचे कर्मचारी आहात", name + " युनिटचे कर्मचारी म्हणून तुमची नेमणूक झाली");
        Map<String, Object> out = teamJson(units.find(unitId).orElseThrow(), scope);
        out.put("message", "कर्मचारी जोडला. (Staff member added.)");
        return out;
    }

    /** Removes a staff member; their access ends on their next request. */
    public Map<String, Object> removeStaff(CurrentUser user, String unitId, String memberId) {
        tables.ensureCrmUnitTables();
        Scope scope = scopes.of(user);
        requireWrite(scope);
        Map<String, Object> row = inScope(unitId, scope);
        if (!scope.managesStaffOf(unitId)) throw noAccess();
        String name = (String) row.get("name");

        tx.executeWithoutResult(status -> {
            if (units.unlinkStaff(memberId, unitId) == 0) {
                throw ApiException.notFound("STAFF_NOT_FOUND", "हा कर्मचारी सापडला नाही (Staff member not found).");
            }
            audit(user, "CRM_STAFF_REMOVE", Map.of("unit", unitId, "member", memberId));
        });
        send(unitId, memberId, "🏢 " + name + " युनिटमधील तुमचा प्रवेश काढला", "आता तुम्हाला या युनिटचा प्रवेश नाही.");
        Map<String, Object> out = teamJson(units.find(unitId).orElseThrow(), scope);
        out.put("message", "कर्मचारी काढला. (Staff member removed.)");
        return out;
    }

    // ------------------------------------------------------------------ create

    /**
     * Creates a unit one level below its parent (only an admin creates a State) with an existing member as owner.
     * Order of checks: may write → body → level order and parent → owner → save (the unique indexes decide duplicates).
     */
    public Map<String, Object> create(CurrentUser user, Map<String, Object> body) {
        tables.ensureCrmUnitTables();
        Scope scope = scopes.of(user);
        requireWrite(scope);
        Map<String, Object> input = CrmUnitSchemas.normalize(body);
        SchemaValidator.check(input, CrmUnitSchemas.CREATE, true, null);
        input.keySet().retainAll(CrmUnitSchemas.CREATE.keySet());
        String level = (String) input.get("level");
        String parentId = (String) input.get("parent_id");

        Map<String, Object> parent = null;
        if (level.equals("state")) {
            if (parentId != null) throw levelOrder();
            if (!scope.kind().equals("global")) throw noAccess();
        } else {
            if (parentId == null) throw levelOrder();
            parent = inScope(parentId, scope);
            if ("archived".equals(parent.get("status"))) throw unitArchived();
            if (LEVELS.indexOf((String) parent.get("level")) + 1 != LEVELS.indexOf(level)) throw levelOrder();
        }
        String ownerId = resolveMember(input, null, CrmUnitService::ownerInUnit);

        String id = "UNIT-" + level.substring(0, 3).toUpperCase(Locale.ROOT) + "-"
            + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        String name = (String) input.get("name");
        Map<String, Object> unit = new LinkedHashMap<>();
        unit.put("id", id);
        unit.put("name", name);
        unit.put("level", level);
        unit.put("parent_id", parentId);
        unit.put("path", (parent == null ? "/" : (String) parent.get("path")) + id + "/");
        unit.put("owner_id", ownerId);
        for (String geo : new String[] {"state", "division", "district", "taluka"}) {
            unit.put(geo, parent == null ? null : parent.get(geo));
        }
        if (!level.equals("branch")) unit.put(level, name);
        unit.put("address", input.get("address"));
        unit.put("created_by", user.id());

        tx.executeWithoutResult(status -> {
            try {
                units.insert(unit);
            } catch (DuplicateKeyException e) {
                throw unitExists();
            }
            units.releaseFromArchived(ownerId);
            if (units.linkOwner(ownerId, id) == 0) throw ownerInUnit();
            audit(user, "CRM_UNIT_CREATE", Map.of("unit", id, "level", level, "name", name, "owner", ownerId));
        });
        send(id, ownerId, "🏢 तुम्ही युनिटचे मालक आहात", name + " युनिटचे मालक म्हणून तुमची नेमणूक झाली");
        Map<String, Object> out = success();
        out.put("message", "युनिट तयार झाले. (Unit created.)");
        out.put("unit", unitJson(units.find(id).orElseThrow(), scope));
        return out;
    }

    // ------------------------------------------------------------------ edit and archive

    /** Name and address by anyone who can write there; archive / restore only by someone above the unit. */
    public Map<String, Object> update(CurrentUser user, String id, Map<String, Object> body) {
        tables.ensureCrmUnitTables();
        Scope scope = scopes.of(user);
        requireWrite(scope);
        Map<String, Object> row = inScope(id, scope);
        Map<String, Object> input = CrmUnitSchemas.normalize(body);
        SchemaValidator.check(input, CrmUnitSchemas.UPDATE, true, null);
        input.keySet().retainAll(CrmUnitSchemas.UPDATE.keySet());
        if (input.isEmpty()) {
            throw ApiException.badRequest("VALIDATION_ERROR", "बदलण्यासाठी काहीही दिलेले नाही (Nothing to change).");
        }
        String path = (String) row.get("path");
        String current = (String) row.get("status");
        String wanted = (String) input.get("status");
        boolean statusChange = wanted != null && !wanted.equals(current);
        if (statusChange && !scope.containsParentOf(path)) throw noAccess();
        boolean textChange = input.containsKey("name") || input.containsKey("address");
        // an archived unit is read only, unless this very request restores it
        if ("archived".equals(current) && textChange && !"active".equals(wanted)) throw unitArchived();

        tx.executeWithoutResult(status -> {
            if (textChange) {
                try {
                    units.update(id, (String) row.get("level"), (String) input.get("name"), (String) input.get("address"));
                } catch (DuplicateKeyException e) {
                    throw unitExists();
                }
                audit(user, "CRM_UNIT_UPDATE", Map.of("unit", id));
            }
            if (statusChange) {
                units.setStatus(id, wanted);
                audit(user, wanted.equals("archived") ? "CRM_UNIT_ARCHIVE" : "CRM_UNIT_RESTORE", Map.of("unit", id));
            }
        });
        Map<String, Object> out = success();
        out.put("message", "बदल जतन झाला. (Saved.)");
        out.put("unit", unitJson(units.find(id).orElseThrow(), scope));
        return out;
    }

    // ------------------------------------------------------------------ owner

    /** Hands the unit to another member; only someone above the unit may. The old owner loses access at once. */
    public Map<String, Object> changeOwner(CurrentUser user, String id, Map<String, Object> body) {
        tables.ensureCrmUnitTables();
        Scope scope = scopes.of(user);
        requireWrite(scope);
        Map<String, Object> row = inScope(id, scope);
        if (!scope.containsParentOf((String) row.get("path"))) throw noAccess();
        if ("archived".equals(row.get("status"))) throw unitArchived();
        Map<String, Object> input = CrmUnitSchemas.normalize(body);
        SchemaValidator.check(input, CrmUnitSchemas.OWNER, true, null);
        String newOwner = resolveMember(input, (String) row.get("owner_id"), CrmUnitService::ownerInUnit);
        String oldOwner = (String) row.get("owner_id");
        String name = (String) row.get("name");

        if (!newOwner.equals(oldOwner)) {
            tx.executeWithoutResult(status -> {
                if (oldOwner != null) units.unlinkOwner(oldOwner, id);
                units.releaseFromArchived(newOwner);
                if (units.linkOwner(newOwner, id) == 0) throw ownerInUnit();
                units.setOwner(id, newOwner);
                Map<String, Object> details = new LinkedHashMap<>();
                details.put("unit", id);
                details.put("from", oldOwner);
                details.put("to", newOwner);
                audit(user, "CRM_UNIT_OWNER_CHANGE", details);
            });
            send(id, newOwner, "🏢 तुम्ही युनिटचे मालक आहात", name + " युनिटचे मालक म्हणून तुमची नेमणूक झाली");
            if (oldOwner != null) send(id, oldOwner, "🏢 " + name + " युनिटची मालकी काढली", "आता तुम्हाला या युनिटचा प्रवेश नाही.");
        }
        Map<String, Object> out = success();
        out.put("message", "मालक बदलला. (Owner changed.)");
        out.put("unit", unitJson(units.find(id).orElseThrow(), scope));
        return out;
    }

    // ------------------------------------------------------------------ helpers

    private static void requireWrite(Scope scope) {
        if (!scope.canWrite()) throw noAccess();
    }

    /** The one free (or already current), non-admin member the body names by id or phone; `busy` is thrown when they belong to a unit. */
    private String resolveMember(Map<String, Object> input, String currentOwner, java.util.function.Supplier<ApiException> busy) {
        String ref = input.get("owner_member") instanceof String s ? s : (String) input.get("owner_phone");
        if (ref == null) {
            throw ApiException.badRequest("VALIDATION_ERROR", "मालक सदस्याचा आयडी किंवा मोबाईल नंबर द्या (Give the owner's member id or phone).");
        }
        List<String> found = units.membersByIdOrPhone(ref);
        if (found.isEmpty()) throw ApiException.notFound("MEMBER_NOT_FOUND", "हा सदस्य आढळला नाही (Member not found).");
        if (found.size() > 1) {
            throw new ApiException(HttpStatus.CONFLICT, "MEMBER_AMBIGUOUS",
                "हा मोबाईल नंबर एकापेक्षा जास्त सदस्यांचा आहे; सदस्य आयडी द्या (Several members share this phone; give the member id).");
        }
        String memberId = found.get(0);
        String role = units.roleOf(memberId).orElse("member").toLowerCase(Locale.ROOT);
        if (NOT_OWNERS.contains(role)) {
            throw ApiException.badRequest("OWNER_NOT_ALLOWED", "प्लॅटफॉर्म अ‍ॅडमिन किंवा CEO युनिटचा मालक किंवा कर्मचारी होऊ शकत नाही (An admin or CEO cannot own a unit or be its staff).");
        }
        if (!memberId.equals(currentOwner) && units.inAUnit(memberId)) throw busy.get();
        return memberId;
    }

    private void audit(CurrentUser user, String action, Map<String, Object> details) {
        String name = units.memberName(user.id()).map(m -> String.valueOf(m.get("name"))).orElse("सदस्य");
        String json;
        try {
            json = JSON.writeValueAsString(details);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(e);
        }
        activity.audit("LOG-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 6),
            user.id(), name, action, json);
    }

    /** A bell in a transaction of its own; a failed bell never undoes the change. */
    boolean send(String about, String memberId, String title, String message) {
        try {
            ownTransaction.executeWithoutResult(status -> activity.notifyMember(
                "NOTIF-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8),
                memberId, title, message, "crm_unit"));
            return true;
        } catch (RuntimeException e) {
            log.warn("CRM unit {}: could not notify {}", about, memberId, e);
            return false;
        }
    }

    Map<String, Object> inScope(String id, Scope scope) {
        Map<String, Object> row = units.find(id).orElse(null);
        if (row == null || !scope.contains((String) row.get("path"))) {
            throw ApiException.notFound("UNIT_NOT_FOUND", "हे युनिट सापडले नाही (Unit not found).");
        }
        return row;
    }

    private static ApiException noAccess() {
        return ApiException.forbidden("NO_ACCESS", "या विभागासाठी आपल्याकडे प्रवेश नाही (You have no access here).");
    }

    private static ApiException levelOrder() {
        return ApiException.badRequest("INVALID_LEVEL_ORDER",
            "युनिटची पातळी वरच्या युनिटच्या एक पातळी खाली असावी: राज्य → शाखा → विभाग → जिल्हा → तालुका (A unit must sit one level below its parent).");
    }

    private static ApiException unitExists() {
        return new ApiException(HttpStatus.CONFLICT, "UNIT_EXISTS", "या नावाचे युनिट येथे आधीच आहे (A unit with this name already exists here).");
    }

    private static ApiException unitArchived() {
        return new ApiException(HttpStatus.CONFLICT, "UNIT_ARCHIVED", "हे युनिट संग्रहित आहे (This unit is archived).");
    }


    private static ApiException memberInUnit() {
        return new ApiException(HttpStatus.CONFLICT, "MEMBER_IN_UNIT", "हा सदस्य आधीच दुसऱ्या युनिटमध्ये आहे (This member already belongs to a unit).");
    }

    private static ApiException staffLimit() {
        return new ApiException(HttpStatus.CONFLICT, "STAFF_LIMIT", "या युनिटमध्ये जास्तीत जास्त " + MAX_STAFF + " कर्मचारी असू शकतात (A unit can have at most " + MAX_STAFF + " staff).");
    }
    private static ApiException ownerInUnit() {
        return new ApiException(HttpStatus.CONFLICT, "OWNER_IN_UNIT", "हा सदस्य आधीच दुसऱ्या युनिटमध्ये आहे (This member already belongs to a unit).");
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
