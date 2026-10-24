package com.connectmaratha.api.crm.repository;

import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Repository;

/**
 * Community centres and their front-desk activity log (tables community_centers and
 * center_activities). A centre comes with today's visitors and today's collection, counted
 * from the activity log by the same SQL the Node backend uses.
 */
@Repository
public class CommunityCenterRepository {

    private static final String SELECT = """
        SELECT c.id, c.name, c.tier, c.division, c.district, c.taluka, c.address, c.contact_person, c.phone,
          (SELECT COUNT(*) FROM center_activities a WHERE a.center_id = c.id AND a.type = 'CHECK_IN'
             AND SUBSTR(a.created_at, 1, 10) = SUBSTR(CAST(CURRENT_TIMESTAMP AS TEXT), 1, 10)) AS today_visitors,
          (SELECT COALESCE(SUM(a.amount), 0) FROM center_activities a WHERE a.center_id = c.id AND a.type = 'FINANCE_RECEIPT'
             AND SUBSTR(a.created_at, 1, 10) = SUBSTR(CAST(CURRENT_TIMESTAMP AS TEXT), 1, 10)) AS daily_collection
        FROM community_centers c""";

    private final EntityManager em;

    public CommunityCenterRepository(EntityManager em) {
        this.em = em;
    }

    /** Active centres, optionally limited by tier, district and division; by name. */
    public List<Map<String, Object>> findActive(String tier, String district, String division) {
        String sql = SELECT + """
             WHERE c.status = 'active'
              AND (CAST(:tier AS TEXT) IS NULL OR c.tier = CAST(:tier AS TEXT))
              AND (CAST(:district AS TEXT) IS NULL OR c.district = CAST(:district AS TEXT))
              AND (CAST(:division AS TEXT) IS NULL OR c.division = CAST(:division AS TEXT))
            ORDER BY c.name""";
        List<?> rows = em.createNativeQuery(sql).setParameter("tier", tier).setParameter("district", district)
            .setParameter("division", division).getResultList();
        List<Map<String, Object>> out = new ArrayList<>();
        for (Object r : rows) out.add(toMap((Object[]) r));
        return out;
    }

    public Optional<Map<String, Object>> find(String id) {
        List<?> rows = em.createNativeQuery(SELECT + " WHERE c.id = :id").setParameter("id", id).getResultList();
        return rows.isEmpty() ? Optional.empty() : Optional.of(toMap((Object[]) rows.get(0)));
    }

    public void insertCenter(String id, String name, String tier, String division, String district, String taluka,
                             String address, String contactPerson, String phone) {
        em.createNativeQuery("""
                INSERT INTO community_centers (id, name, tier, division, district, taluka, address, contact_person, phone)
                VALUES (:id, :name, :tier, :division, :district, :taluka, :address, :contactPerson, :phone)""")
            .setParameter("id", id).setParameter("name", name).setParameter("tier", tier)
            .setParameter("division", division).setParameter("district", district).setParameter("taluka", taluka)
            .setParameter("address", address).setParameter("contactPerson", contactPerson).setParameter("phone", phone)
            .executeUpdate();
    }

    public void insertCheckIn(String id, String centerId, String person, String phone, String purpose, String desk, String by) {
        em.createNativeQuery("""
                INSERT INTO center_activities (id, center_id, type, person_name, phone, purpose, desk, recorded_by)
                VALUES (:id, :centerId, 'CHECK_IN', :person, :phone, :purpose, :desk, :by)""")
            .setParameter("id", id).setParameter("centerId", centerId).setParameter("person", person)
            .setParameter("phone", phone).setParameter("purpose", purpose).setParameter("desk", desk)
            .setParameter("by", by).executeUpdate();
    }

    public void insertReceipt(String id, String centerId, String person, String category, double amount, String mode, String by) {
        em.createNativeQuery("""
                INSERT INTO center_activities (id, center_id, type, person_name, category, amount, payment_mode, recorded_by)
                VALUES (:id, :centerId, 'FINANCE_RECEIPT', :person, :category, CAST(:amount AS NUMERIC), :mode, :by)""")
            .setParameter("id", id).setParameter("centerId", centerId).setParameter("person", person)
            .setParameter("category", category).setParameter("amount", amount).setParameter("mode", mode)
            .setParameter("by", by).executeUpdate();
    }

    private static Map<String, Object> toMap(Object[] r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", r[0]);
        m.put("name", r[1]);
        m.put("tier", orEmpty(r[2]));
        m.put("division", orEmpty(r[3]));
        m.put("district", orEmpty(r[4]));
        m.put("taluka", orEmpty(r[5]));
        m.put("address", orEmpty(r[6]));
        m.put("contactPerson", orEmpty(r[7]));
        m.put("phone", orEmpty(r[8]));
        m.put("todayVisitors", number(r[9]));
        m.put("dailyCollection", number(r[10]));
        return m;
    }

    private static Object orEmpty(Object v) {
        return v == null ? "" : v;
    }

    /** Number(value) || 0, written like JavaScript (50, not 50.0). */
    private static Number number(Object v) {
        if (v == null) return 0L;
        double d = v instanceof BigDecimal b ? b.doubleValue() : ((Number) v).doubleValue();
        if (Double.isNaN(d)) return 0L;
        return d == Math.rint(d) && Math.abs(d) < 1e15 ? (Number) (long) d : (Number) d;
    }
}
