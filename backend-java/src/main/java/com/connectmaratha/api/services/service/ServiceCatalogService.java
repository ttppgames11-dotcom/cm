package com.connectmaratha.api.services.service;

import static com.connectmaratha.api.common.util.WebsiteText.cleanMobile;
import static com.connectmaratha.api.common.util.WebsiteText.newId;
import static com.connectmaratha.api.common.util.WebsiteText.text;

import com.connectmaratha.api.common.exception.ApiException;
import com.connectmaratha.api.common.schema.LazyTables;
import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.Roles;
import com.connectmaratha.api.common.util.Js;
import com.connectmaratha.api.common.util.WebsiteText;
import com.connectmaratha.api.common.web.Envelope;
import com.connectmaratha.api.services.entity.ServiceProvider;
import com.connectmaratha.api.services.repository.ServiceProviderRepository;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Local service professionals and bookings, with admin management (backend/routes/services.routes.js). */
@Service
public class ServiceCatalogService {

    private final ServiceProviderRepository providers;
    private final LazyTables tables;

    public ServiceCatalogService(ServiceProviderRepository providers, LazyTables tables) {
        this.providers = providers;
        this.tables = tables;
    }

    public Map<String, Object> publicList() {
        tables.ensureWebsiteTables();
        return list("स्थानिक सेवा व्यावसायिक यादी", providers.findActive());
    }

    @Transactional
    public Map<String, Object> book(CurrentUser user, Map<String, Object> b) {
        String category = text(b.get("serviceCategory"), 100);
        String phone = cleanMobile(b.get("phone"));
        if (category.isEmpty() || !Js.truthy(b.get("phone"))) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "MISSING_FIELDS", "कृपया सेवा प्रकार व संपर्क नंबर प्रविष्ट करा.");
        }
        if (phone.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_PHONE", "कृपया वैध १० अंकी संपर्क नंबर प्रविष्ट करा.");
        }
        tables.ensureWebsiteTables();
        String name = user != null && Js.truthy(user.name()) ? user.name() : first(text(b.get("customerName"), 100), "सन्माननीय ग्राहक");

        Map<String, Object> booking = new LinkedHashMap<>();
        booking.put("id", newId("SBK"));
        booking.put("serviceId", text(b.get("serviceId"), 60));
        booking.put("serviceCategory", category);
        booking.put("professionalName", first(text(b.get("professionalName"), 120), "नजीकचा मराठा सेवा व्यावसायिक"));
        booking.put("customerName", name);
        booking.put("customerId", user != null && Js.truthy(user.id()) ? user.id() : "GUEST");
        booking.put("phone", phone);
        booking.put("address", first(text(b.get("address"), 300), "महाराष्ट्र"));
        booking.put("requestedDate", first(text(b.get("requestedDate"), 60), "लवकरात लवकर (ASAP)"));
        booking.put("notes", text(b.get("requirementNotes"), 1000));
        booking.put("status", "बुकिंग नोंदवली - व्यावसायिक संपर्क साधतील");
        booking.put("createdAt", WebsiteText.nowIso());
        providers.insertBooking((String) booking.get("id"), (String) booking.get("serviceId"), category,
            (String) booking.get("professionalName"), (String) booking.get("customerId"), name, phone,
            (String) booking.get("address"), (String) booking.get("requestedDate"), (String) booking.get("notes"));
        return Envelope.success("सेवा बुकिंग यशस्वी! आमचे व्यावसायिक लवकरच आपल्याशी संपर्क करतील.", Map.of("booking", booking));
    }

    // -------------------------------------------------------------------- admin

    public void requireAdmin(CurrentUser user) {
        if (!Roles.isAdmin(user)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "फक्त प्रशासकांना परवानगी आहे. (Admins only)");
        }
    }

    public Map<String, Object> adminList(CurrentUser user) {
        requireAdmin(user);
        tables.ensureWebsiteTables();
        return list("सेवा व व्यावसायिक यादी", providers.findAllNewest());
    }

    @Transactional
    public Map<String, Object> adminCreate(CurrentUser user, Map<String, Object> b) {
        requireAdmin(user);
        String name = text(b.get("name"), 150);
        String category = text(b.get("category"), 100);
        if (name.isEmpty() || category.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "नाव व सेवा प्रकार आवश्यक आहे.");
        }
        tables.ensureWebsiteTables();
        String id = newId("SRV");
        providers.insertProvider(id, name, category, text(b.get("location"), 150), text(b.get("phone"), 30),
            text(b.get("experience"), 60), text(b.get("pricing"), 100), text(b.get("description"), 1000), user.id());
        return Envelope.success("सेवा व्यावसायिक जोडले!", Map.of("service", json(providers.findById(id).orElseThrow())));
    }

    /** Fields not sent keep their old value; status only changes to "active" or "hidden". */
    @Transactional
    public Map<String, Object> adminUpdate(CurrentUser user, String id, Map<String, Object> b) {
        requireAdmin(user);
        tables.ensureWebsiteTables();
        ServiceProvider old = providers.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "सेवा सापडली नाही."));
        Object status = b.get("status");
        String newStatus = "active".equals(status) || "hidden".equals(status) ? (String) status : old.getStatus();
        providers.updateProvider(id,
            text(b.containsKey("name") ? b.get("name") : old.getName(), 150),
            text(b.containsKey("category") ? b.get("category") : old.getCategory(), 100),
            text(b.containsKey("location") ? b.get("location") : old.getLocation(), 150),
            text(b.containsKey("phone") ? b.get("phone") : old.getPhone(), 30),
            text(b.containsKey("experience") ? b.get("experience") : old.getExperience(), 60),
            text(b.containsKey("pricing") ? b.get("pricing") : old.getPricing(), 100),
            text(b.containsKey("description") ? b.get("description") : old.getDescription(), 1000),
            newStatus, WebsiteText.nowIso());
        return Envelope.success("सेवा माहिती अद्ययावत केली!", Map.of("service", json(providers.findById(id).orElseThrow())));
    }

    @Transactional
    public Map<String, Object> adminDelete(CurrentUser user, String id) {
        requireAdmin(user);
        tables.ensureWebsiteTables();
        providers.deleteProvider(id);
        return Envelope.success("सेवा हटवली.", Map.of("id", id));
    }

    // ------------------------------------------------------------------ helpers

    private static Map<String, Object> list(String message, List<ServiceProvider> rows) {
        List<Map<String, Object>> services = new ArrayList<>();
        for (ServiceProvider p : rows) services.add(json(p));
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("services", services);
        data.put("count", services.size());
        return Envelope.success(message, data);
    }

    static Map<String, Object> json(ServiceProvider p) {
        Map<String, Object> o = new LinkedHashMap<>();
        o.put("id", p.getId());
        o.put("name", p.getName());
        o.put("category", p.getCategory());
        o.put("location", orEmpty(p.getLocation()));
        o.put("phone", orEmpty(p.getPhone()));
        o.put("experience", orEmpty(p.getExperience()));
        o.put("pricing", orEmpty(p.getPricing()));
        o.put("description", orEmpty(p.getDescription()));
        o.put("status", p.getStatus());
        o.put("createdAt", p.getCreatedAt());
        return o;
    }

    private static String orEmpty(String v) {
        return v == null ? "" : v;
    }

    private static String first(String value, String fallback) {
        return value.isEmpty() ? fallback : value;
    }
}
