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

    public BusinessService(BusinessRepository businesses, BusinessReviewRepository reviews) {
        this.businesses = businesses;
        this.reviews = reviews;
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
