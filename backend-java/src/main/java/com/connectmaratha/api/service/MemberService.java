package com.connectmaratha.api.service;

import com.connectmaratha.api.dto.MemberJson;
import com.connectmaratha.api.entity.Member;
import com.connectmaratha.api.repository.MemberRepository;
import com.connectmaratha.api.util.Js;
import com.connectmaratha.api.web.ApiException;
import com.connectmaratha.api.web.CurrentUser;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Member directory, profile view and profile edit (backend/routes/members.routes.js). */
@Service
public class MemberService {

    private final MemberRepository members;

    public MemberService(MemberRepository members) {
        this.members = members;
    }

    public Map<String, Object> list(String district, String tier, String profession, String search) {
        String districtFilter = Js.truthy(district) && !"सर्व".equals(district) ? district : null;
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Member m : members.search(districtFilter, Js.nullIfFalsy(tier),
                                       Js.nullIfFalsy(profession), Js.nullIfFalsy(search))) {
            rows.add(MemberJson.of(m, MemberJson.LIST));
        }
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("count", rows.size());
        out.put("members", rows);
        return out;
    }

    public Map<String, Object> stats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalMembers", members.count());
        stats.put("goldMembers", members.countByTier("Gold"));
        stats.put("platinumMembers", members.countByTier("Platinum"));
        stats.put("activeDistricts", members.countDistinctDistricts());
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("stats", stats);
        return out;
    }

    /** Email and phone are private: only the member and admins see them. */
    public Map<String, Object> detail(String id, CurrentUser viewer) {
        Member m = members.findById(id)
            .orElseThrow(() -> ApiException.plain(HttpStatus.NOT_FOUND, "सदस्य आढळला नाही."));
        Map<String, Object> member = MemberJson.of(m, MemberJson.DETAIL);
        if (!isSelfOrAdmin(viewer, m.getId())) {
            member.remove("email");
            member.remove("phone");
        }
        MemberJson.parseInterests(member);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("member", member);
        return out;
    }

    /** Fields left out of the request stay as they are. */
    @Transactional
    public Map<String, Object> update(String id, Map<String, Object> body, CurrentUser user) {
        if (!isSelfOrAdmin(user, id)) {
            throw ApiException.plain(HttpStatus.FORBIDDEN,
                "आपण फक्त आपली स्वतःची माहिती बदलू शकता. (You can only edit your own profile)");
        }
        Member m = members.findById(id)
            .orElseThrow(() -> ApiException.plain(HttpStatus.NOT_FOUND, "सदस्य सापडला नाही."));

        if (body.get("name") != null) m.setName(String.valueOf(body.get("name")));
        if (body.get("city") != null) m.setCity(String.valueOf(body.get("city")));
        if (body.get("district") != null) m.setDistrict(String.valueOf(body.get("district")));
        if (body.get("profession") != null) m.setProfession(String.valueOf(body.get("profession")));
        if (body.get("business") != null) m.setBusiness(String.valueOf(body.get("business")));
        if (body.get("education") != null) m.setEducation(String.valueOf(body.get("education")));
        if (body.get("phone") != null) m.setPhone(String.valueOf(body.get("phone")));
        String skills = textFromListOrString(body.get("skills"), ", ");
        if (skills != null) m.setSkills(skills);
        String about = textFromListOrString(body.get("about"), "\n");
        if (about != null) m.setAbout(about);
        members.saveAndFlush(m);

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", "माहिती अद्ययावत केली!");
        out.put("member", MemberJson.of(m, MemberJson.UPDATED));
        return out;
    }

    /** A list becomes its trimmed, non-empty items joined; a string is trimmed; anything else is "not sent". */
    private static String textFromListOrString(Object value, String separator) {
        if (value instanceof List<?> list) {
            List<String> parts = new ArrayList<>();
            for (Object o : list) {
                String s = String.valueOf(o).trim();
                if (!s.isEmpty()) parts.add(s);
            }
            return String.join(separator, parts);
        }
        if (value instanceof String s) return s.trim();
        return null;
    }

    static boolean isSelfOrAdmin(CurrentUser user, String memberId) {
        if (user == null) return false;
        return String.valueOf(user.id()).equals(String.valueOf(memberId)) || user.isAdmin();
    }
}
