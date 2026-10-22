package com.connectmaratha.api.admin.service;

import com.connectmaratha.api.admin.repository.AdminStatsRepository;
import com.connectmaratha.api.admin.repository.AdminStatsRepository.Table;
import com.connectmaratha.api.common.exception.ApiException;
import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.util.Js;
import com.connectmaratha.api.member.dto.MemberJson;
import com.connectmaratha.api.member.entity.Member;
import com.connectmaratha.api.member.repository.MemberRepository;
import java.lang.management.ManagementFactory;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.function.Predicate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Admin dashboard data (backend/routes/admin.routes.js). */
@Service
public class AdminService {

    /** Roles that may read the admin data (contains members' email and phone). */
    private static final Set<String> ADMIN_ROLES = Set.of("admin", "superadmin", "ceo");

    private final AdminStatsRepository stats;
    private final MemberRepository members;

    public AdminService(AdminStatsRepository stats, MemberRepository members) {
        this.stats = stats;
        this.members = members;
    }

    public void requireAdmin(CurrentUser user) {
        String role = user == null || user.role() == null ? "" : user.role().toLowerCase(Locale.ROOT);
        if (!ADMIN_ROLES.contains(role)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "ADMIN_ONLY", "फक्त प्रशासकांना परवानगी आहे. (Admins only)");
        }
    }

    /** Real counts only: 0 means there are none yet. */
    @Transactional(readOnly = true)
    public Map<String, Object> metrics(CurrentUser user) {
        requireAdmin(user);
        Number[] campaigns = stats.campaignTotals();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("totalMembers", stats.count(Table.MEMBERS));
        m.put("totalBusinesses", stats.count(Table.BUSINESSES));
        m.put("totalReferrals", stats.count(Table.REFERRALS));
        m.put("totalDonationsAmount", numberOrZero(campaigns[0]));
        m.put("totalDonors", numberOrZero(campaigns[1]));
        m.put("totalEvents", stats.count(Table.EVENTS));
        m.put("totalPosts", stats.count(Table.POSTS));
        m.put("serverStatus", "Online");
        m.put("dbEngine", "SQLite3 (Pure SQL Native / ACID Compliant)"); // same text as the Node reply
        m.put("uptime", ManagementFactory.getRuntimeMXBean().getUptime() / 1000.0);
        return reply("metrics", m);
    }

    /** Sample entries, as in the Node backend (there is no audit log table yet). */
    public Map<String, Object> auditLogs() {
        List<Map<String, Object>> logs = List.of(
            log("LOG-01", "अमोल जाधव (Admin)", "सदस्य पडताळणी मंजूर", "M1008 - विकास गायकवाड यांचे KYC मंजूर केले", "२ तासांपूर्वी"),
            log("LOG-02", "प्रिया देशमुख", "व्यवसाय नोंदणी", "B06 - वीरशैली सॉफ्टवेअर लिस्टिंग मंजूर", "५ तासांपूर्वी"),
            log("LOG-03", "सिस्टम", "स्वयंचलित बॅकअप", "SQLite डेटाबेस बॅकअप यशस्वीरित्या पूर्ण", "काल रात्री १२:००"));
        return reply("logs", logs);
    }

    /** Only admin and superadmin (not ceo), as in Node. */
    @Transactional
    public Map<String, Object> verifyMember(CurrentUser user, String memberId, Map<String, Object> body) {
        String role = user.role() == null ? "" : user.role().toLowerCase(Locale.ROOT);
        if (!role.equals("admin") && !role.equals("superadmin")) {
            throw ApiException.plain(HttpStatus.FORBIDDEN, "फक्त प्रशासकांना परवानगी आहे. (Admins only)");
        }
        stats.setVerifiedProfile(memberId, Js.truthy(body.get("status")) ? 1 : 0);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", "सदस्य पडताळणी स्थिती बदलली!");
        return out;
    }

    /** All members with contact details, newest first, filtered like the Node endpoint, plus counts. */
    @Transactional(readOnly = true)
    public Map<String, Object> users(CurrentUser user, String search, String role, String verified) {
        requireAdmin(user);
        List<Map<String, Object>> rows = new ArrayList<>();
        // ORDER BY created_at DESC (PostgreSQL puts missing dates first).
        List<Member> all = new ArrayList<>(members.findAll());
        all.sort(Comparator.comparing(Member::getCreatedAt, Comparator.nullsFirst(Comparator.reverseOrder())));
        for (Member m : all) rows.add(adminUser(m));

        List<Map<String, Object>> users = rows;
        String q = Js.textOrEmpty(search).trim().toLowerCase(Locale.ROOT);
        if (!q.isEmpty()) {
            users = filter(users, u -> List.of("id", "name", "email", "phone", "district", "city").stream()
                .anyMatch(k -> Js.textOrEmpty(u.get(k)).toLowerCase(Locale.ROOT).contains(q)));
        }
        String r = Js.textOrEmpty(role);
        if (!r.isEmpty() && !r.equals("all")) {
            users = filter(users, u -> Js.orElse(u.get("role"), "member").toLowerCase(Locale.ROOT).equals(r.toLowerCase(Locale.ROOT)));
        }
        String v = Js.textOrEmpty(verified);
        if (v.equals("true") || v.equals("false")) {
            boolean want = v.equals("true");
            users = filter(users, u -> Boolean.TRUE.equals(u.get("verified")) == want);
        }

        Map<String, Object> counts = new LinkedHashMap<>();
        counts.put("total", rows.size());
        counts.put("activeUsersNow", rows.size());
        counts.put("superadmins", countRoles(rows, "superadmin"));
        counts.put("admins", countRoles(rows, "admin", "ceo"));
        counts.put("districtHeads", countRoles(rows, "district_admin", "district_head"));
        counts.put("chapterPresidents", countRoles(rows, "chapter_president", "chapter_head"));
        counts.put("verifiedMembers", rows.stream().filter(u -> Boolean.TRUE.equals(u.get("verified"))).count());
        counts.put("pendingVerifications", rows.stream().filter(u -> !Boolean.TRUE.equals(u.get("verified"))).count());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("users", users);
        data.put("stats", counts);
        return reply("data", data);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> user(CurrentUser user, String id) {
        requireAdmin(user);
        Member m = members.findById(id)
            .orElseThrow(() -> ApiException.notFound("NOT_FOUND", "सदस्य आढळला नाही."));
        Map<String, Object> json = adminUser(m);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("data", Map.of("user", json));
        out.put("user", json);
        return out;
    }

    private static Map<String, Object> adminUser(Member m) {
        Map<String, Object> u = MemberJson.raw(m);
        boolean verified = m.getVerifiedProfile() != null && m.getVerifiedProfile().intValue() == 1;
        u.put("verified", verified);
        u.put("verificationStatus", verified ? "प्रमाणित (Verified)" : "प्रलंबित (Pending)");
        return u;
    }

    private static long countRoles(List<Map<String, Object>> rows, String... roles) {
        Set<String> wanted = Set.of(roles);
        return rows.stream().filter(u -> wanted.contains(Js.textOrEmpty(u.get("role")).toLowerCase(Locale.ROOT))).count();
    }

    private static List<Map<String, Object>> filter(List<Map<String, Object>> list, Predicate<Map<String, Object>> keep) {
        return list.stream().filter(keep).toList();
    }

    private static Number numberOrZero(Number n) {
        if (n == null) return 0;
        double d = n.doubleValue();
        return d == Math.rint(d) ? (Number) (long) d : (Number) d;
    }

    private static Map<String, Object> log(String id, String user, String action, String details, String when) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", id);
        m.put("user_name", user);
        m.put("action", action);
        m.put("details", details);
        m.put("created_at", when);
        return m;
    }

    private static Map<String, Object> reply(String key, Object value) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put(key, value);
        return out;
    }
}
