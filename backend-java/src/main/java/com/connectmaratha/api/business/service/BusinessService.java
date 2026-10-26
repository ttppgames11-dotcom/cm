package com.connectmaratha.api.business.service;

import com.connectmaratha.api.business.dto.BusinessJson;
import com.connectmaratha.api.business.entity.Business;
import com.connectmaratha.api.business.entity.BusinessReview;
import com.connectmaratha.api.business.repository.BusinessRepository;
import com.connectmaratha.api.business.repository.BusinessReviewRepository;
import com.connectmaratha.api.common.exception.ApiException;
import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.Roles;
import com.connectmaratha.api.common.util.Ids;
import com.connectmaratha.api.common.util.Js;
import com.connectmaratha.api.common.validation.Rule;
import com.connectmaratha.api.common.validation.SchemaValidator;
import com.connectmaratha.api.member.repository.MemberRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Business directory (backend/routes/businesses.routes.js). */
@Service
public class BusinessService {

    private static final ObjectMapper JSON = new ObjectMapper();

    private final BusinessRepository businesses;
    private final BusinessReviewRepository reviews;
    private final MemberRepository members;

    public BusinessService(BusinessRepository businesses, BusinessReviewRepository reviews, MemberRepository members) {
        this.businesses = businesses;
        this.reviews = reviews;
        this.members = members;
    }

    public Map<String, Object> list(CurrentUser viewer, String cat, String district, String search) {
        String viewerId = viewerId(viewer);
        String catFilter = Js.truthy(cat) && !"all".equals(cat) ? cat : null;
        String districtFilter = Js.truthy(district) && !"सर्व".equals(district) ? district : null;
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Business b : businesses.search(catFilter, districtFilter, Js.nullIfFalsy(search))) rows.add(BusinessJson.business(b, viewerId));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("count", rows.size());
        out.put("businesses", rows);
        return out;
    }

    public Map<String, Object> detail(CurrentUser viewer, String id) {
        Business b = businesses.findById(id)
            .filter(found -> !isHidden(found) || canManage(viewer, found))
            .orElseThrow(BusinessService::notFound);
        Map<String, Object> json = BusinessJson.business(b, viewerId(viewer));
        List<Map<String, Object>> list = new ArrayList<>();
        for (BusinessReview r : reviews.findForBusiness(id)) list.add(BusinessJson.review(r));
        json.put("reviews", list);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("business", json);
        return out;
    }

    @Transactional
    public Map<String, Object> create(CurrentUser user, Map<String, Object> body) {
        Object name = body.get("name");
        Object owner = body.get("owner");
        Object cat = body.get("cat");
        if (!Js.truthy(name) || !Js.truthy(owner) || !Js.truthy(cat)) {
            throw ApiException.plain(HttpStatus.BAD_REQUEST, "व्यवसायाचे नाव, मालकाचे नाव आणि वर्गवारी आवश्यक आहे.");
        }
        String category = Js.string(cat);
        String photo = switch (category) {
            case "restaurant" -> "🍛";
            case "it" -> "💻";
            case "manufacturing" -> "⚙️";
            case "travel" -> "🚌";
            default -> "🏢";
        };
        String id = Ids.twoDigit("B", businesses::existsById);
        businesses.insertBusiness(id, Js.string(name), Js.string(owner), category,
            Js.orElse(body.get("city"), "पुणे"), Js.orElse(body.get("district"), "पुणे"), photo,
            Js.textOrEmpty(body.get("phone")), Js.textOrEmpty(body.get("whatsapp")), Js.textOrEmpty(body.get("website")),
            Js.orElse(body.get("hours"), "सकाळी ९ ते रात्री ८"), servicesJson(body.get("services")),
            Js.textOrEmpty(body.get("offers")), user.id());

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", "व्यवसाय यशस्वीरित्या नोंदवला गेला!");
        out.put("business", BusinessJson.business(businesses.findById(id).orElseThrow(), user.id()));
        return out;
    }

    private static final String NAME_OWNER_CAT = "व्यवसायाचे नाव, मालकाचे नाव आणि वर्गवारी आवश्यक आहे.";
    private static final Map<String, Rule> VISIBILITY = Map.of("hidden", Rule.bool().required());

    /**
     * Edit by the owner or an admin. Fields left out keep their value; name, owner and category
     * cannot be emptied. id, owner_id, status and rating are never changed here.
     */
    @Transactional
    public Map<String, Object> update(CurrentUser user, String id, Map<String, Object> body) {
        Business b = businesses.findById(id).orElseThrow(BusinessService::notFound);
        requireManager(user, b);
        for (String required : List.of("name", "owner", "cat")) {
            if (body.containsKey(required) && Js.textOrEmpty(body.get(required)).isBlank()) {
                throw ApiException.plain(HttpStatus.BAD_REQUEST, NAME_OWNER_CAT);
            }
        }
        businesses.updateBusiness(id,
            field(body, "name", b.getName()), field(body, "owner", b.getOwner()), field(body, "cat", b.getCat()),
            field(body, "city", b.getCity()), field(body, "district", b.getDistrict()),
            field(body, "phone", b.getPhone()), field(body, "whatsapp", b.getWhatsapp()), field(body, "website", b.getWebsite()),
            field(body, "hours", b.getHours()),
            body.containsKey("services") ? servicesJson(body.get("services")) : b.getServices(),
            field(body, "offers", b.getOffers()));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", "व्यवसाय अद्ययावत केला गेला! (Business updated.)");
        out.put("business", BusinessJson.business(businesses.findById(id).orElseThrow(), user.id()));
        return out;
    }

    /** Hide (status hidden) or show (visible) a business; the owner or an admin. */
    @Transactional
    public Map<String, Object> setVisibility(CurrentUser user, String id, Map<String, Object> body) {
        SchemaValidator.check(body, VISIBILITY, false, null);
        Business b = businesses.findById(id).orElseThrow(BusinessService::notFound);
        requireManager(user, b);
        businesses.setStatus(id, Boolean.TRUE.equals(body.get("hidden")) ? "hidden" : "visible");
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("business", BusinessJson.business(businesses.findById(id).orElseThrow(), user.id()));
        return out;
    }

    private static final Map<String, Rule> ASSIGN_OWNER = Map.of("memberId", Rule.string().required());

    /** Admins only: hands a business to another member. */
    @Transactional
    public Map<String, Object> assignOwner(CurrentUser admin, String id, Map<String, Object> body) {
        if (!Roles.isAdmin(admin)) throw ApiException.forbidden("ADMIN_ONLY", "फक्त प्रशासकांना परवानगी आहे. (Admins only)");
        SchemaValidator.check(body, ASSIGN_OWNER, false, null);
        businesses.findById(id).orElseThrow(BusinessService::notFound);
        String memberId = Js.textOrEmpty(body.get("memberId")).trim();
        if (!members.existsById(memberId)) {
            throw ApiException.notFound("MEMBER_NOT_FOUND", "सदस्य आढळला नाही (Member not found).");
        }
        businesses.setOwner(id, memberId);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("business", BusinessJson.business(businesses.findById(id).orElseThrow(), admin.id()));
        return out;
    }

    /** The member's own businesses, hidden ones included, newest first. */
    public Map<String, Object> mine(CurrentUser user) {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Business b : businesses.findByOwner(user.id())) rows.add(BusinessJson.business(b, user.id()));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("count", rows.size());
        out.put("businesses", rows);
        return out;
    }

    @Transactional
    public Map<String, Object> addReview(String businessId, Map<String, Object> body) {
        Object rating = body.get("rating");
        reviews.insertReview(Ids.millis("REV-", reviews::existsById), businessId,
            Js.orElse(body.get("member_name"), "सदस्य"), Js.truthy(rating) ? Js.string(rating) : "5",
            Js.textOrEmpty(body.get("text")));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", "अभिप्राय नोंदवला गेला!");
        return out;
    }

    private static String viewerId(CurrentUser viewer) {
        return viewer == null ? null : viewer.id();
    }

    private static boolean isHidden(Business b) {
        return "hidden".equals(b.getStatus());
    }

    /** The owner or an admin. */
    private static boolean canManage(CurrentUser user, Business b) {
        return user != null && (user.id() != null && user.id().equals(b.getOwnerId()) || Roles.isAdmin(user));
    }

    private static void requireManager(CurrentUser user, Business b) {
        if (!canManage(user, b)) {
            throw ApiException.forbidden("NOT_OWNER",
                "फक्त व्यवसायाचा मालक किंवा प्रशासक हे बदलू शकतात (Only the owner or an admin can change this).");
        }
    }

    /** The value sent for a text field, or the stored one when the field was left out. */
    private static String field(Map<String, Object> body, String key, String current) {
        return body.containsKey(key) ? Js.textOrEmpty(body.get(key)) : current;
    }

    private static ApiException notFound() {
        return ApiException.plain(HttpStatus.NOT_FOUND, "व्यवसाय सापडला नाही.");
    }

    /** A list as JSON; a single value becomes a one-item list; nothing becomes []. */
    private static String servicesJson(Object services) {
        Object list = services instanceof List<?> ? services : (Js.truthy(services) ? List.of(services) : List.of());
        try {
            return JSON.writeValueAsString(list);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }
}
