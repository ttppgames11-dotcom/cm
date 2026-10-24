package com.connectmaratha.api.directory.service;

import static com.connectmaratha.api.directory.service.DirectoryRules.indianMobile;
import static com.connectmaratha.api.directory.service.DirectoryRules.nonBlankString;
import static com.connectmaratha.api.directory.service.DirectoryRules.trimmedOr;
import static com.connectmaratha.api.directory.service.DirectoryRules.trimmedOrEmpty;
import static com.connectmaratha.api.directory.service.DirectoryRules.validation;

import com.connectmaratha.api.common.exception.ApiException;
import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.util.Js;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.stereotype.Service;

/** Builders / real-estate projects and their enquiries (backend/routes/directories.routes.js, builders part). */
@Service
public class BuilderService {

    private static final String PHONE_REQUIRED = "कृपया वैध १०-अंकी भारतीय मोबाईल नंबर प्रविष्ट करा (Valid 10-digit Indian phone required).";
    private static final List<String> PROJECT_TYPES = List.of("flats", "villas", "plots");

    private final DirectoryStore store;
    private final DirectoryRules rules;

    public BuilderService(DirectoryStore store, DirectoryRules rules) {
        this.store = store;
        this.rules = rules;
    }

    public Map<String, Object> list() {
        List<Map<String, Object>> builders = store.list(DirectoryStore.BUILDERS);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("count", builders.size());
        out.put("builders", builders);
        out.put("data", Map.of("builders", builders));
        return out;
    }

    public Map<String, Object> detail(String id) {
        Map<String, Object> builder = store.find(DirectoryStore.BUILDERS, id).orElseThrow(BuilderService::notFound);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("builder", builder);
        return out;
    }

    public Map<String, Object> create(CurrentUser user, Map<String, Object> b) {
        String phone = indianMobile(b.get("phone"));
        if (phone == null) throw validation(PHONE_REQUIRED);

        Object projectType = b.get("projectType");
        if (projectType != null && !PROJECT_TYPES.contains(Js.string(projectType).toLowerCase(Locale.ROOT))) {
            throw validation("projectType must be one of \"flats\", \"villas\", \"plots\".");
        }
        Object flats = b.get("flatsDelivered");
        boolean flatsGiven = flats != null && !"".equals(flats);
        if (flatsGiven) {
            double n = Js.number(flats);
            if (Double.isNaN(n) || n < 0) throw validation("flatsDelivered must be a number greater than or equal to 0.");
        }
        List<String> amenities = new ArrayList<>();
        Object rawAmenities = b.get("amenities");
        if (rawAmenities != null) {
            if (!(rawAmenities instanceof List<?> list)) throw validation("amenities must be an array of strings.");
            if (list.size() > 12) throw validation("amenities can contain at most 12 items.");
            for (Object a : list) {
                String s = Js.textOrEmpty(a).trim();
                if (s.length() > 100) s = s.substring(0, 100);
                if (!s.isEmpty()) amenities.add(s);
            }
        }
        Number discountPercent = null;
        Object pctRaw = b.get("memberDiscountPercent");
        if (pctRaw != null && !"".equals(pctRaw)) {
            double pct = Js.number(pctRaw);
            if (Double.isNaN(pct) || pct < 0 || pct > 10) throw validation("memberDiscountPercent must be a number between 0 and 10.");
            discountPercent = Js.jsNumber(pct);
        }

        String rera = Js.textOrEmpty(b.get("reraNumber")).trim();
        boolean reraApproved = !rera.isEmpty();
        String discountForMembers = discountPercent != null && discountPercent.doubleValue() > 0
            ? "मराठा महासंघ सदस्यांसाठी विशेष " + Js.string(discountPercent) + "% सवलत" : null;
        Object ownerId = user != null && Js.truthy(user.id()) ? user.id() : (Js.truthy(b.get("ownerId")) ? b.get("ownerId") : null);

        String devName = Js.string(firstTruthy(b, "मराठा बिल्डर्स", "developer", "name", "ownerName")).trim();
        String projName = Js.string(firstTruthy(b, devName + " हाइट्स", "projectName", "projects")).trim();
        String city = Js.string(firstTruthy(b, "महाराष्ट्र", "city", "location")).trim();
        String config = Js.string(firstTruthy(b, "गृहनिर्माण", "configuration", "specialty", "category")).trim();

        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", store.freeShortId(DirectoryStore.BUILDERS, "BLD-"));
        item.put("developer", devName);
        item.put("name", devName);
        item.put("projectName", projName);
        item.put("projects", projName);
        item.put("location", city);
        item.put("city", city);
        item.put("configuration", config);
        item.put("category", Js.truthy(b.get("category")) ? Js.string(b.get("category")).trim() : config);
        item.put("phone", phone);
        item.put("ownerName", trimmedOr(b.get("ownerName"), devName));
        item.put("ownerId", ownerId);
        item.put("projectType", Js.truthy(projectType) ? Js.string(projectType).toLowerCase(Locale.ROOT) : "flats");
        item.put("flatsDelivered", flatsGiven ? Js.jsNumber(Js.number(flats)) : 0L);
        item.put("amenities", amenities);
        item.put("possessionDate", trimmedOr(b.get("possessionDate"), "तयार (Ready)"));
        item.put("reraNumber", rera);
        item.put("rera", reraApproved ? rera : "नोंदणीकृत");
        item.put("reraApproved", reraApproved);
        item.put("memberDiscountPercent", discountPercent);
        item.put("discountForMembers", discountForMembers);
        item.put("experience", trimmedOr(b.get("experience"), "१०+ वर्षे"));
        item.put("icon", trimmedOr(b.get("icon"), "🏢"));
        Object desc = discountForMembers != null ? discountForMembers
            : firstTruthy(b, "विश्वासार्ह व दर्जेदार गृहप्रकल्प उभारणीतील अग्रगण्य मराठा ब्रँड.", "desc", "description");
        item.put("desc", desc);
        item.put("createdAt", DirectoryRules.nowIso());
        store.insert(DirectoryStore.BUILDERS, item);

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", "🏗️ बिल्डर प्रोजेक्ट चौकशी यशस्वीरीत्या नोंदवली गेली!");
        out.put("project", item);
        out.put("builder", item);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("project", item);
        data.put("builder", item);
        out.put("data", data);
        return out;
    }

    public Map<String, Object> enquire(CurrentUser user, String builderId, Map<String, Object> b) {
        Map<String, Object> builder = store.find(DirectoryStore.BUILDERS, builderId).orElseThrow(BuilderService::notFound);
        if (!nonBlankString(b.get("name"))) throw validation("नाव आवश्यक आहे (Name is required).");
        String phone = indianMobile(b.get("phone"));
        if (phone == null) throw validation(PHONE_REQUIRED);
        String name = ((String) b.get("name")).trim();

        Map<String, Object> enquiry = new LinkedHashMap<>();
        enquiry.put("id", DirectoryRules.timedId("ENQ-"));
        enquiry.put("builderId", builder.get("id"));
        enquiry.put("developer", Js.truthy(builder.get("developer")) ? builder.get("developer") : Js.truthy(builder.get("name")) ? builder.get("name") : "");
        enquiry.put("projectName", Js.truthy(builder.get("projectName")) ? builder.get("projectName") : Js.truthy(builder.get("projects")) ? builder.get("projects") : "");
        enquiry.put("name", name);
        enquiry.put("phone", phone);
        enquiry.put("budget", trimmedOrEmpty(b.get("budget")));
        enquiry.put("preferredCity", trimmedOrEmpty(b.get("preferredCity")));
        enquiry.put("message", trimmedOrEmpty(b.get("message")));
        enquiry.put("memberId", user != null && Js.truthy(user.id()) ? user.id() : null);
        enquiry.put("createdAt", DirectoryRules.nowIso());
        store.insert(DirectoryStore.BUILDER_ENQUIRIES, enquiry);

        if (Js.truthy(builder.get("ownerId"))) {
            String project = Js.orElse(builder.get("projectName"), "आपल्या प्रोजेक्ट");
            rules.notifyOwner(builder.get("ownerId"), "नवीन प्रोजेक्ट चौकशी (New Project Enquiry)",
                name + " यांनी " + project + "साठी चौकशी नोंदवली आहे (फोन: " + phone + ").", "enquiry");
        }
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", "चौकशी यशस्वीरीत्या नोंदवली गेली!");
        out.put("enquiry", enquiry);
        return out;
    }

    private static ApiException notFound() {
        return ApiException.notFound("BUILDER_NOT_FOUND", "बिल्डर आढळला नाही (Builder not found).");
    }

    /** a || b || c || fallback over body fields */
    private static Object firstTruthy(Map<String, Object> b, Object fallback, String... keys) {
        for (String k : keys) if (Js.truthy(b.get(k))) return b.get(k);
        return fallback;
    }
}
