package com.connectmaratha.api.portal.service;

import com.connectmaratha.api.common.util.Js;
import com.connectmaratha.api.common.validation.Rule;
import com.connectmaratha.api.culture.service.CultureService;
import com.connectmaratha.api.directory.service.DirectoryStore;
import com.connectmaratha.api.portal.dto.PortalSchemas;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;

/**
 * The older community lists of the website: doctors, blood requests and donors, matrimony,
 * grievances, volunteers, women's help and loan applications (the endpoints that lived in
 * backend/server.js). Records are stored in the shared records table: the defaults below plus
 * only the fields allowed by {@link PortalSchemas}, so a sender can never set the server's own
 * fields (id, verified, createdAt...). Node kept everything that was sent.
 */
@Service
public class PortalService {

    public static final String DOCTORS = "doctors";
    public static final String BLOOD_REQUESTS = "bloodRequests";
    public static final String BLOOD_DONORS = "bloodDonors";
    public static final String MATRIMONY = "matrimony";
    public static final String GRIEVANCES = "grievances";
    public static final String VOLUNTEERS = "volunteers";
    public static final String WOMEN_HELP = "womenHelp";
    public static final String BANK_LOANS = "bankLoans";

    /** Fields that are saved but never shown in the public list (the website does not display them). */
    private static final Map<String, Set<String>> PRIVATE_FIELDS = Map.of(MATRIMONY, Set.of("phone"));

    private final DirectoryStore store;

    public PortalService(DirectoryStore store) {
        this.store = store;
    }

    /** A whole list, newest first (the reply is the bare list, as in Node). For admins. */
    public List<Map<String, Object>> list(String collection) {
        return store.list(collection);
    }

    /** The list as anyone may see it: the same, minus the private fields. */
    public List<Map<String, Object>> publicList(String collection) {
        Set<String> hidden = PRIVATE_FIELDS.getOrDefault(collection, Set.of());
        List<Map<String, Object>> rows = store.list(collection);
        if (hidden.isEmpty()) return rows;
        return rows.stream().map(row -> {
            Map<String, Object> copy = new LinkedHashMap<>(row);
            copy.keySet().removeAll(hidden);
            return copy;
        }).toList();
    }

    public Map<String, Object> addDoctor(Map<String, Object> body) {
        Map<String, Object> record = new LinkedHashMap<>();
        record.put("id", store.freeShortId(DOCTORS, "DOC-"));
        record.put("rating", "5.0 ★ (नवीन नोंदणी)");
        record.put("icon", "🩺");
        return save(DOCTORS, record, body, PortalSchemas.DOCTOR, "डॉक्टर प्रोफाइल यशस्वीरीत्या जोडले गेले!", "doctor");
    }

    public Map<String, Object> addBloodRequest(Map<String, Object> body) {
        Map<String, Object> record = new LinkedHashMap<>();
        record.put("id", store.freeShortId(BLOOD_REQUESTS, "REQ-", 3));
        record.put("time", "आत्ताच");
        return save(BLOOD_REQUESTS, record, body, PortalSchemas.BLOOD_REQUEST, "🚨 तातडीची रक्त मागणी प्रसारित करण्यात आली!", "request");
    }

    public Map<String, Object> addBloodDonor(Map<String, Object> body) {
        Map<String, Object> record = new LinkedHashMap<>();
        record.put("id", store.freeShortId(BLOOD_DONORS, "DON-"));
        record.put("totalDonations", 1);
        record.put("lastDonated", "नवीन नोंदणी");
        return save(BLOOD_DONORS, record, body, PortalSchemas.BLOOD_DONOR, "❤️ रक्तदाता नोंदणी यशस्वी झाली!", "donor");
    }

    public Map<String, Object> addMatrimony(Map<String, Object> body) {
        boolean groom = genderContainsGroom(body.get("gender"));
        Map<String, Object> record = new LinkedHashMap<>();
        record.put("id", store.freeShortId(MATRIMONY, "CM-" + (groom ? "M" : "F") + "-", 3));
        record.put("verified", true);
        record.put("photo", groom ? "👨‍💼" : "👩‍💼");
        record.put("caste", "९६ कुळी मराठा");
        return save(MATRIMONY, record, body, PortalSchemas.MATRIMONY, "💍 विवाह प्रोफाइल यशस्वीरीत्या नोंदवले गेले!", "profile");
    }

    public Map<String, Object> addGrievance(Map<String, Object> body) {
        return save(GRIEVANCES, dated(GRIEVANCES, "GRV-"), body, PortalSchemas.GRIEVANCE, "📜 मागणी/निवेदन यशस्वीरीत्या सादर केले गेले!", "grievance");
    }

    public Map<String, Object> addVolunteer(Map<String, Object> body) {
        return save(VOLUNTEERS, dated(VOLUNTEERS, "VOL-"), body, PortalSchemas.VOLUNTEER, "🤝 स्वयंसेवक नोंदणी यशस्वीरीत्या पूर्ण झाली!", "volunteer");
    }

    public Map<String, Object> addWomenHelp(Map<String, Object> body) {
        return save(WOMEN_HELP, dated(WOMEN_HELP, "WHELP-"), body, PortalSchemas.WOMEN_HELP, "🌸 मदत व मार्गदर्शनाची विनंती नोंदवली गेली!", "help");
    }

    public Map<String, Object> addLoan(Map<String, Object> body) {
        Map<String, Object> record = new LinkedHashMap<>();
        record.put("id", store.freeShortId(BANK_LOANS, "LN-"));
        return save(BANK_LOANS, record, body, PortalSchemas.LOAN, "🏦 कर्ज अर्ज यशस्वीरीत्या सादर केला गेला!", "loan");
    }

    // ------------------------------------------------------------------ helpers

    private Map<String, Object> dated(String collection, String prefix) {
        Map<String, Object> record = new LinkedHashMap<>();
        record.put("id", store.freeShortId(collection, prefix));
        record.put("createdAt", CultureService.marathiDate(LocalDate.now(ZoneId.systemDefault())));
        return record;
    }

    /** defaults first, then the sender's values for the allowed fields only (no allowed field is a default). */
    private Map<String, Object> save(String collection, Map<String, Object> defaults, Map<String, Object> body,
                                     Map<String, Rule> allowed, String message, String key) {
        Map<String, Object> record = new LinkedHashMap<>(defaults);
        for (Map.Entry<String, Object> e : body.entrySet()) {
            if (allowed.containsKey(e.getKey()) && !record.containsKey(e.getKey())) record.put(e.getKey(), e.getValue());
        }
        store.insert(collection, record);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", message);
        out.put(key, record);
        return out;
    }

    /** (gender || '').includes('वर'). The schema guarantees gender is text when present. */
    private static boolean genderContainsGroom(Object gender) {
        return Js.truthy(gender) && gender instanceof String s && s.contains("वर");
    }
}
