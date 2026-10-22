package com.connectmaratha.api.location.service;

import com.connectmaratha.api.common.exception.ApiException;
import com.connectmaratha.api.common.util.Js;
import com.connectmaratha.api.location.repository.LocationListRepository;
import com.connectmaratha.api.location.repository.LocationListRepository.Level;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Location pick-lists for the sign-up and profile forms (backend/routes/locations.routes.js). */
@Service
@Transactional(readOnly = true)
public class LocationService {

    private final LocationListRepository locations;

    public LocationService(LocationListRepository locations) {
        this.locations = locations;
    }

    public Map<String, Object> countries() {
        return reply(locations.countries(), false);
    }

    public Map<String, Object> states(String countryId) {
        return children(Level.COUNTRY, "countryId", "Country", countryId, Level.STATE);
    }

    public Map<String, Object> districts(String stateId) {
        return children(Level.STATE, "stateId", "State", stateId, Level.DISTRICT);
    }

    public Map<String, Object> talukas(String districtId) {
        return children(Level.DISTRICT, "districtId", "District", districtId, Level.TALUKA);
    }

    /** limit (when given) is 1-500, default 100; page starts at 1. */
    public Map<String, Object> villages(String talukaId, String search, String page, String limit) {
        requireParent(Level.TALUKA, "talukaId", "Taluka", talukaId);
        String q = search != null && !search.trim().isEmpty() ? search.trim() : null;
        Integer limitNum = null;
        int offset = 0;
        if (Js.truthy(limit)) {
            Long p = Js.parseInt(page);
            int pageNum = (int) Math.max(1, p == null || p == 0 ? 1 : p);
            Long l = Js.parseInt(limit);
            limitNum = (int) Math.min(500, Math.max(1, l == null || l == 0 ? 100 : l));
            offset = (pageNum - 1) * limitNum;
        }
        return reply(locations.villages(talukaId, q, limitNum, offset), true);
    }

    private Map<String, Object> children(Level parent, String param, String label, String parentId, Level child) {
        requireParent(parent, param, label, parentId);
        return reply(locations.children(child, parentId), false);
    }

    private void requireParent(Level level, String param, String label, String id) {
        if (!Js.truthy(id)) throw ApiException.plain(HttpStatus.BAD_REQUEST, param + " parameter is required");
        if (!locations.exists(level, id)) throw ApiException.plain(HttpStatus.NOT_FOUND, label + " not found");
    }

    private static Map<String, Object> reply(List<Map<String, Object>> data, boolean withCount) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("data", data);
        if (withCount) out.put("count", data.size());
        return out;
    }
}
