package com.connectmaratha.api.crmunit.service;

import com.connectmaratha.api.common.exception.ApiException;
import com.connectmaratha.api.common.schema.LazyTables;
import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.crmunit.CrmScope;
import com.connectmaratha.api.crmunit.CrmScope.Scope;
import com.connectmaratha.api.crmunit.repository.CrmAreaKpiRepository;
import com.connectmaratha.api.crmunit.repository.CrmUnitRepository;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Counts of members (by id) and businesses, jobs, events and tickets (by the typed district name) in the places of a
 * unit and of the active units below it. Only district and taluka units carry a place; a district that is already in
 * the set covers its talukas. Counts only: no names, phones or other personal data.
 */
@Service
public class CrmAreaKpiService {

    private final CrmUnitRepository units;
    private final CrmAreaKpiRepository counts;
    private final CrmRollupService rollups;
    private final CrmScope scopes;
    private final LazyTables tables;

    public CrmAreaKpiService(CrmUnitRepository units, CrmAreaKpiRepository counts, CrmRollupService rollups, CrmScope scopes,
                             LazyTables tables) {
        this.units = units;
        this.counts = counts;
        this.rollups = rollups;
        this.scopes = scopes;
        this.tables = tables;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> areaKpis(CurrentUser user, String unitId) {
        tables.ensureCrmUnitTables();
        tables.ensureWebsiteTables();
        tables.ensureJobColumns();
        Scope scope = scopes.of(user);
        Map<String, Object> unit = units.find(unitId).orElse(null);
        if (unit == null || !scope.contains((String) unit.get("path"))) {
            throw ApiException.notFound("UNIT_NOT_FOUND", "हे युनिट सापडले नाही (Unit not found).");
        }

        // the unit and the active units below it that the viewer may see (an archived unit asked for directly: itself only)
        String path = (String) unit.get("path");
        List<Map<String, Object>> subtree = new ArrayList<>();
        for (Map<String, Object> u : rollups.visibleActive(scope)) if (((String) u.get("path")).startsWith(path)) subtree.add(u);
        if (subtree.stream().noneMatch(u -> u.get("id").equals(unit.get("id")))) subtree = new ArrayList<>(List.of(unit));

        // the places: a district comes from a unit without a taluka; a taluka from a unit that has one
        Set<String> districtIds = new LinkedHashSet<>();
        Set<String> talukaIds = new LinkedHashSet<>();
        int unitsCounted = 0;
        for (Map<String, Object> u : subtree) {
            String d = (String) u.get("area_district_id");
            String t = (String) u.get("area_taluka_id");
            if (d == null && t == null) continue;
            unitsCounted++;
            if (t != null) talukaIds.add(t); else districtIds.add(d);
        }
        // a taluka whose district is already in the set is counted through the district
        Map<String, String> ofTaluka = counts.talukaDistricts(new ArrayList<>(talukaIds));
        talukaIds.removeIf(t -> districtIds.contains(ofTaluka.get(t)));

        Map<String, String> districtNames = counts.masterNames(true, new ArrayList<>(districtIds));
        Map<String, String> talukaNames = counts.masterNames(false, new ArrayList<>(talukaIds));
        List<String> districtHalves = new ArrayList<>();
        for (String name : districtNames.values()) districtHalves.addAll(halves(name));

        boolean talukaOnly = districtIds.isEmpty() && !talukaIds.isEmpty();

        int members = counts.countMembers(new ArrayList<>(districtIds), new ArrayList<>(talukaIds));
        Integer businesses = null, jobsOpen = null, events = null;
        int ticketsTotal = counts.countByDistrictNames("support_tickets", districtHalves, null);
        int ticketsOpen = counts.countByDistrictNames("support_tickets", districtHalves, "status NOT IN ('Resolved', 'Closed')");
        if (!talukaOnly) {
            businesses = counts.countByDistrictNames("businesses", districtHalves, null);
            jobsOpen = counts.countByDistrictNames("jobs", districtHalves, "status = 'open' AND (closes_at IS NULL OR closes_at > now()) AND hidden = false");
            events = counts.countByDistrictNames("events", districtHalves, null);
        }
        // tickets also carry a typed taluka, so talukas that no district covers can be counted by taluka and district name
        Map<String, String> talukaDistrictNames = counts.masterNames(true, new ArrayList<>(new LinkedHashSet<>(ofTaluka.values())));
        for (String t : talukaIds) {
            List<String> tHalves = halves(talukaNames.get(t));
            List<String> dHalves = halves(talukaDistrictNames.get(ofTaluka.get(t)));
            ticketsTotal += counts.countTicketsByTaluka(tHalves, dHalves, false);
            ticketsOpen += counts.countTicketsByTaluka(tHalves, dHalves, true);
        }

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("unit", CrmRollupService.unitRef(unit, false));
        Map<String, Object> places = new LinkedHashMap<>();
        places.put("districts", placeList(districtNames));
        places.put("talukas", placeList(talukaNames));
        out.put("places", places);
        Map<String, Object> kpis = new LinkedHashMap<>();
        kpis.put("members", kpi(members, false));
        kpis.put("businesses", kpi(businesses, true));
        kpis.put("jobsOpen", kpi(jobsOpen, true));
        kpis.put("eventsCount", kpi(events, true));
        kpis.put("ticketsTotal", kpi(ticketsTotal, true));
        kpis.put("ticketsOpen", kpi(ticketsOpen, true));
        out.put("kpis", kpis);
        out.put("talukaOnly", talukaOnly);
        out.put("unitsCounted", unitsCounted);
        return out;
    }

    /** A master name like "Pune / पुणे" as its lower-case halves ["pune", "पुणे"]; empty parts are dropped. */
    static List<String> halves(String masterName) {
        List<String> out = new ArrayList<>();
        if (masterName == null) return out;
        for (String part : masterName.split("/")) {
            String h = part.trim().toLowerCase(Locale.ROOT);
            if (!h.isEmpty()) out.add(h);
        }
        return out;
    }

    private static List<Map<String, Object>> placeList(Map<String, String> names) {
        List<Map<String, Object>> list = new ArrayList<>();
        names.forEach((id, name) -> {
            Map<String, Object> p = new LinkedHashMap<>();
            p.put("id", id);
            p.put("name", name);
            list.add(p);
        });
        return list;
    }

    private static Map<String, Object> kpi(Integer value, boolean byName) {
        Map<String, Object> k = new LinkedHashMap<>();
        k.put("value", value);
        k.put("byName", byName);
        return k;
    }
}
