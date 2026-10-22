package com.connectmaratha.api.location.repository;

import jakarta.persistence.EntityManager;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Repository;

/**
 * The location pick-lists (countries -> states -> districts -> talukas -> villages), sorted
 * by name in the database exactly as the Node backend sorts them. Each row has id, the parent
 * id, name and code; the parent id key is lowercase (countryid, stateid, ...) because that is
 * what PostgreSQL returns for Node's unquoted "AS countryId".
 */
@Repository
public class LocationListRepository {

    private final EntityManager em;

    public LocationListRepository(EntityManager em) {
        this.em = em;
    }

    public List<Map<String, Object>> countries() {
        List<Map<String, Object>> out = new ArrayList<>();
        for (Object o : em.createNativeQuery("SELECT id, name, code FROM countries ORDER BY name ASC").getResultList()) {
            Object[] r = (Object[]) o;
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", r[0]);
            m.put("name", r[1]);
            m.put("code", r[2]);
            out.add(m);
        }
        return out;
    }

    public boolean exists(Level level, String id) {
        return !em.createNativeQuery("SELECT id FROM " + level.table + " WHERE id = :id")
            .setParameter("id", id).setMaxResults(1).getResultList().isEmpty();
    }

    /** Children of one parent, e.g. the states of a country. */
    public List<Map<String, Object>> children(Level child, String parentId) {
        return rows(child, em.createNativeQuery("SELECT id, " + child.parentColumn + ", name, code FROM " + child.table
            + " WHERE " + child.parentColumn + " = :parent ORDER BY name ASC")
            .setParameter("parent", parentId).getResultList());
    }

    /** Villages of a taluka, optionally filtered by name and paged (limit null = all). */
    public List<Map<String, Object>> villages(String talukaId, String search, Integer limit, Integer offset) {
        StringBuilder sql = new StringBuilder("SELECT id, taluka_id, name, code FROM villages WHERE taluka_id = :parent");
        if (search != null) sql.append(" AND name ILIKE CONCAT('%', CAST(:search AS TEXT), '%')");
        sql.append(" ORDER BY name ASC");
        if (limit != null) sql.append(" LIMIT ").append(limit).append(" OFFSET ").append(offset);
        var q = em.createNativeQuery(sql.toString()).setParameter("parent", talukaId);
        if (search != null) q.setParameter("search", search);
        return rows(Level.VILLAGE, q.getResultList());
    }

    private static List<Map<String, Object>> rows(Level level, List<?> result) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (Object o : result) {
            Object[] r = (Object[]) o;
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", r[0]);
            m.put(level.parentKey, r[1]);
            m.put("name", r[2]);
            m.put("code", r[3]);
            out.add(m);
        }
        return out;
    }

    public enum Level {
        COUNTRY("countries", null, null),
        STATE("states", "country_id", "countryid"),
        DISTRICT("districts", "state_id", "stateid"),
        TALUKA("talukas", "district_id", "districtid"),
        VILLAGE("villages", "taluka_id", "talukaid");

        final String table;
        final String parentColumn;
        final String parentKey;

        Level(String table, String parentColumn, String parentKey) {
            this.table = table;
            this.parentColumn = parentColumn;
            this.parentKey = parentKey;
        }
    }
}
