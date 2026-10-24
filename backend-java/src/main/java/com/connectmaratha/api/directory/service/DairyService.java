package com.connectmaratha.api.directory.service;

import static com.connectmaratha.api.directory.service.DirectoryRules.indianMobile;
import static com.connectmaratha.api.directory.service.DirectoryRules.nonBlankString;
import static com.connectmaratha.api.directory.service.DirectoryRules.numberOrZero;
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
import java.util.Optional;
import java.util.function.Predicate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

/** Dairy centres, their products, product enquiries and farmer registrations (directories.routes.js, dairy part). */
@Service
public class DairyService {

    private static final List<String> CATEGORIES = List.of("दूध", "दही", "पनीर", "तूप", "ताक", "श्रीखंड", "इतर");
    private static final List<String> MILK_TYPES = List.of("cow", "buffalo", "both");

    private final DirectoryStore store;
    private final DirectoryRules rules;

    public DairyService(DirectoryStore store, DirectoryRules rules) {
        this.store = store;
        this.rules = rules;
    }

    // ------------------------------------------------------------------ centres

    public Map<String, Object> list(String kind, String district, String search) {
        List<Map<String, Object>> list = store.list(DirectoryStore.DAIRY);
        if (Js.truthy(kind) && !kind.equals("all") && !kind.equals("सर्व")) {
            String k = kind.toLowerCase(Locale.ROOT);
            list = filter(list, d -> lower(d.get("kind")).equals(k));
        }
        if (Js.truthy(district) && !district.equals("सर्व") && !district.equals("all")) {
            String q = district.toLowerCase(Locale.ROOT);
            list = filter(list, d -> containsAny(d, q, "district", "headquarters", "village", "location"));
        }
        if (Js.truthy(search)) {
            String q = search.toLowerCase(Locale.ROOT);
            list = filter(list, d -> containsAny(d, q, "dairyName", "brandName", "village", "district", "centerHead"));
        }
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", "मराठा डेअरी व दुग्ध व्यवसाय केंद्र यादी");
        out.put("count", list.size());
        out.put("dairy", list);
        out.put("data", Map.of("dairy", list));
        return out;
    }

    public Map<String, Object> detail(String id) {
        Map<String, Object> item = store.find(DirectoryStore.DAIRY, id).orElseThrow(DairyService::dairyNotFound);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("dairy", item);
        out.put("data", Map.of("dairy", item));
        return out;
    }

    public Map<String, Object> create(CurrentUser user, Map<String, Object> b) {
        if (!nonBlankString(b.get("dairyName"))) throw validation("डेअरीचे नाव आवश्यक आहे (dairyName is required).");
        if (!nonBlankString(b.get("district"))) throw validation("जिल्हा आवश्यक आहे (district is required).");
        String contact = indianMobile(b.get("contact"));
        if (contact == null) {
            throw validation("कृपया वैध १०-अंकी भारतीय मोबाईल नंबर प्रविष्ट करा (Valid Indian mobile contact is required).");
        }
        List<String> facilities = new ArrayList<>();
        Object rawFacilities = b.get("facilities");
        if (rawFacilities instanceof List<?> list) {
            for (Object f : list) {
                String s = Js.string(f).trim();
                if (!s.isEmpty()) facilities.add(s);
            }
        } else if (rawFacilities instanceof String s) {
            for (String part : s.split(",", -1)) if (!part.trim().isEmpty()) facilities.add(part.trim());
        }
        Object ownerId = user != null && Js.truthy(user.id()) ? user.id() : (Js.truthy(b.get("ownerId")) ? b.get("ownerId") : null);

        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", store.freeShortId(DirectoryStore.DAIRY, "DRY-"));
        item.put("dairyName", ((String) b.get("dairyName")).trim());
        item.put("village", trimmedOr(b.get("village"), ""));
        item.put("taluka", trimmedOr(b.get("taluka"), ""));
        item.put("district", ((String) b.get("district")).trim());
        item.put("morningTiming", trimmedOr(b.get("morningTiming"), ""));
        item.put("eveningTiming", trimmedOr(b.get("eveningTiming"), ""));
        item.put("registeredFarmers", numberOrZero(b.get("registeredFarmers")));
        item.put("centerHead", trimmedOr(b.get("centerHead"), ""));
        item.put("contact", contact);
        item.put("facilities", facilities);
        item.put("milkRateCow", trimmedOr(b.get("milkRateCow"), ""));
        item.put("milkRateBuffalo", trimmedOr(b.get("milkRateBuffalo"), ""));
        item.put("dailyCollection", trimmedOr(b.get("dailyCollection"), ""));
        item.put("kind", "centre");
        item.put("verified", false);
        item.put("ownerId", ownerId);
        item.put("createdAt", DirectoryRules.nowIso());
        store.insert(DirectoryStore.DAIRY, item);

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", "डेअरी केंद्र जोडले गेले!");
        out.put("dairyCenter", item);
        out.put("dairy", item);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("dairyCenter", item);
        data.put("dairy", item);
        out.put("data", data);
        return out;
    }

    // ----------------------------------------------------------------- products

    public Map<String, Object> products(String category, String sellerId, String search) {
        List<Map<String, Object>> products = store.list(DirectoryStore.PRODUCTS);
        if (Js.truthy(category) && !category.equals("सर्व") && !category.equals("all")) {
            String c = category.toLowerCase(Locale.ROOT);
            products = filter(products, p -> lower(p.get("category")).equals(c));
        }
        if (Js.truthy(sellerId)) products = filter(products, p -> Js.string(p.get("sellerId")).equals(sellerId));
        if (Js.truthy(search)) {
            String q = search.toLowerCase(Locale.ROOT);
            products = filter(products, p -> containsAny(p, q, "name", "description", "category"));
        }
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("count", products.size());
        out.put("products", products);
        out.put("data", Map.of("products", products));
        return out;
    }

    /** Only an admin, or the owner of the seller dairy centre, can add products. */
    public Map<String, Object> addProduct(CurrentUser user, Map<String, Object> b) {
        if (!nonBlankString(b.get("name"))) throw validation("उत्पादनाचे नाव आवश्यक आहे (Product name is required).");
        Object price = b.get("price");
        if (price == null || "".equals(price) || Double.isNaN(Js.number(price)) || Js.number(price) < 0) {
            throw validation("कृपया वैध किंमत प्रविष्ट करा (Valid positive price is required).");
        }
        List<Map<String, Object>> centres = store.list(DirectoryStore.DAIRY);
        boolean isAdmin = "admin".equals(user.role());
        String sellerId = Js.truthy(b.get("sellerId")) ? Js.string(b.get("sellerId")).trim() : null;

        if (sellerId != null) {
            String wanted = sellerId;
            Map<String, Object> seller = centres.stream().filter(d -> Js.string(d.get("id")).equals(wanted)).findFirst()
                .orElseThrow(() -> ApiException.notFound("DAIRY_NOT_FOUND", "विक्रेता डेअरी सापडली नाही (Seller dairy not found)."));
            if (!isAdmin && !Js.string(seller.get("ownerId")).equals(String.valueOf(user.id()))) {
                throw ApiException.forbidden("FORBIDDEN",
                    "केवळ डेअरी मालक किंवा प्रशासक उत्पादन जोडू शकतात (Only seller dairy owner or admin can add products).");
            }
        } else if (!isAdmin) {
            Map<String, Object> owned = centres.stream().filter(d -> Js.string(d.get("ownerId")).equals(String.valueOf(user.id())))
                .findFirst().orElseThrow(() -> ApiException.forbidden("FORBIDDEN",
                    "उत्पादन जोडण्यासाठी आपल्याकडे डेअरी केंद्र नोंदणी असणे आवश्यक आहे (Forbidden)."));
            sellerId = Js.string(owned.get("id"));
        }

        String category = Js.string(b.get("category") == null ? "undefined" : b.get("category")).trim();
        Map<String, Object> product = new LinkedHashMap<>();
        product.put("id", store.freeShortId(DirectoryStore.PRODUCTS, "PROD-"));
        product.put("name", ((String) b.get("name")).trim());
        product.put("category", CATEGORIES.contains(category) ? category : "इतर");
        product.put("packSize", trimmedOr(b.get("packSize"), "मानक पॅक"));
        product.put("price", Js.jsNumber(Js.number(price)));
        product.put("description", trimmedOr(b.get("description"), ""));
        product.put("sellerId", sellerId);
        product.put("available", b.containsKey("available") ? Js.truthy(b.get("available")) : true);
        product.put("createdAt", DirectoryRules.nowIso());
        store.insert(DirectoryStore.PRODUCTS, product);

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", "उत्पादन यशस्वीरीत्या जोडले गेले!");
        out.put("product", product);
        out.put("data", Map.of("product", product));
        return out;
    }

    public Map<String, Object> enquireProduct(CurrentUser user, String productId, Map<String, Object> b) {
        Map<String, Object> product = store.find(DirectoryStore.PRODUCTS, productId)
            .orElseThrow(() -> ApiException.notFound("PRODUCT_NOT_FOUND", "उत्पादन सापडले नाही (Product not found)."));
        if (!nonBlankString(b.get("name"))) throw validation("नाव आवश्यक आहे (Name is required).");
        String phone = indianMobile(b.get("phone"));
        if (phone == null) throw validation("कृपया वैध १०-अंकी भारतीय मोबाईल नंबर प्रविष्ट करा (Valid 10-digit Indian mobile required).");
        String name = ((String) b.get("name")).trim();

        Map<String, Object> enquiry = new LinkedHashMap<>();
        enquiry.put("id", DirectoryRules.timedId("DENQ-"));
        enquiry.put("productId", product.get("id"));
        enquiry.put("productName", product.get("name"));
        enquiry.put("sellerId", Js.truthy(product.get("sellerId")) ? product.get("sellerId") : null);
        enquiry.put("memberId", user != null && Js.truthy(user.id()) ? user.id() : null);
        enquiry.put("name", name);
        enquiry.put("phone", phone);
        enquiry.put("quantity", trimmedOrEmpty(b.get("quantity")));
        enquiry.put("deliveryCity", trimmedOrEmpty(b.get("deliveryCity")));
        enquiry.put("message", trimmedOrEmpty(b.get("message")));
        enquiry.put("createdAt", DirectoryRules.nowIso());
        store.insert(DirectoryStore.PRODUCT_ENQUIRIES, enquiry);

        if (Js.truthy(product.get("sellerId"))) {
            Optional<Map<String, Object>> seller = store.find(DirectoryStore.DAIRY, product.get("sellerId"));
            if (seller.isPresent() && Js.truthy(seller.get().get("ownerId"))) {
                rules.notifyOwner(seller.get().get("ownerId"), "नवीन उत्पादन चौकशी (Dairy Product Enquiry)",
                    name + " यांनी \"" + Js.string(product.get("name")) + "\" साठी चौकशी पाठवली आहे (फोन: " + phone + ").", "dairy_enquiry");
            }
        }
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", "उत्पादन चौकशी यशस्वीरीत्या नोंदवली गेली!");
        out.put("enquiry", enquiry);
        out.put("data", Map.of("enquiry", enquiry));
        return out;
    }

    // ------------------------------------------------------------ registrations

    /** A farmer registers to supply milk to a centre; once per member per centre. */
    public Map<String, Object> register(CurrentUser user, String dairyId, Map<String, Object> b) {
        Map<String, Object> dairy = store.find(DirectoryStore.DAIRY, dairyId).orElseThrow(DairyService::dairyNotFound);
        if (!nonBlankString(b.get("farmerName"))) throw validation("शेतकऱ्याचे नाव आवश्यक आहे (Farmer name is required).");
        String phone = indianMobile(b.get("phone"));
        if (phone == null) throw validation("कृपया वैध १०-अंकी भारतीय मोबाईल नंबर प्रविष्ट करा (Valid 10-digit Indian phone required).");

        String centreId = Js.string(dairy.get("id"));
        boolean already = store.list(DirectoryStore.REGISTRATIONS).stream().anyMatch(r ->
            Js.string(r.get("dairyId")).equals(centreId) && Js.string(r.get("memberId")).equals(String.valueOf(user.id())));
        if (already) {
            throw new ApiException(HttpStatus.CONFLICT, "DUPLICATE_REGISTRATION",
                "तुम्ही या संकलन केंद्रासाठी आधीच शेतकरी नोंदणी केली आहे (Already registered for this centre).");
        }
        String milkType = Js.string(b.get("milkType") == null ? "undefined" : b.get("milkType")).toLowerCase(Locale.ROOT);
        String farmerName = ((String) b.get("farmerName")).trim();

        Map<String, Object> registration = new LinkedHashMap<>();
        registration.put("id", DirectoryRules.timedId("REG-"));
        registration.put("dairyId", dairy.get("id"));
        registration.put("dairyName", firstTruthy(dairy, "संकलन केंद्र", "dairyName", "brandName", "name"));
        registration.put("memberId", user.id());
        registration.put("farmerName", farmerName);
        registration.put("phone", phone);
        registration.put("village", trimmedOr(b.get("village"), ""));
        registration.put("cattleCount", numberOrZero(b.get("cattleCount")));
        registration.put("milkType", MILK_TYPES.contains(milkType) ? milkType : "cow");
        registration.put("expectedDailyLitres", numberOrZero(b.get("expectedDailyLitres")));
        registration.put("status", "pending");
        registration.put("createdAt", DirectoryRules.nowIso());
        store.insert(DirectoryStore.REGISTRATIONS, registration);

        if (Js.truthy(dairy.get("ownerId"))) {
            rules.notifyOwner(dairy.get("ownerId"), "नवीन शेतकरी नोंदणी (New Farmer Registration)",
                farmerName + " यांनी " + Js.orElse(dairy.get("dairyName"), "डेअरी केंद्रा") + "साठी दूध नोंदणी केली आहे (अपेक्षित: "
                    + Js.string(registration.get("expectedDailyLitres")) + " लिटर).", "dairy_registration");
        }
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", "शेतकरी नोंदणी यशस्वीरीत्या पूर्ण झाली!");
        out.put("registration", registration);
        out.put("data", Map.of("registration", registration));
        return out;
    }

    /** Only the centre's owner or an admin; never public. */
    public Map<String, Object> registrations(CurrentUser user, String dairyId) {
        Map<String, Object> dairy = store.find(DirectoryStore.DAIRY, dairyId).orElseThrow(DairyService::dairyNotFound);
        boolean isAdmin = "admin".equals(user.role());
        boolean isOwner = Js.truthy(dairy.get("ownerId")) && Js.string(dairy.get("ownerId")).equals(String.valueOf(user.id()));
        if (!isAdmin && !isOwner) {
            throw ApiException.forbidden("FORBIDDEN",
                "नोंदण्या पाहण्याची परवानगी फक्त केंद्र मालक किंवा प्रशासकाला आहे (Only centre owner or admin can read registrations).");
        }
        String centreId = Js.string(dairy.get("id"));
        List<Map<String, Object>> list = filter(store.list(DirectoryStore.REGISTRATIONS), r -> Js.string(r.get("dairyId")).equals(centreId));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("count", list.size());
        out.put("registrations", list);
        out.put("data", Map.of("registrations", list));
        return out;
    }

    // ------------------------------------------------------------------ helpers

    private static ApiException dairyNotFound() {
        return ApiException.notFound("DAIRY_NOT_FOUND", "डेअरी सापडली नाही (Dairy not found).");
    }

    private static String lower(Object v) {
        return Js.textOrEmpty(v).toLowerCase(Locale.ROOT);
    }

    private static boolean containsAny(Map<String, Object> item, String q, String... keys) {
        for (String k : keys) if (lower(item.get(k)).contains(q)) return true;
        return false;
    }

    private static List<Map<String, Object>> filter(List<Map<String, Object>> list, Predicate<Map<String, Object>> keep) {
        return list.stream().filter(keep).toList();
    }

    private static Object firstTruthy(Map<String, Object> m, Object fallback, String... keys) {
        for (String k : keys) if (Js.truthy(m.get(k))) return m.get(k);
        return fallback;
    }
}
