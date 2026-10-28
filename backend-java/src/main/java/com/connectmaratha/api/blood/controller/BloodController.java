package com.connectmaratha.api.blood.controller;

import com.connectmaratha.api.blood.service.BloodService;
import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.RequireAuth;
import com.connectmaratha.api.common.web.JsonBody;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** /api/blood: blood requests and donor profiles (Node kept these as loose records; see BloodService). */
@RestController
@RequestMapping("/api/blood")
public class BloodController {

    private final BloodService blood;
    private final JsonBody bodies;

    public BloodController(BloodService blood, JsonBody bodies) {
        this.blood = blood;
        this.bodies = bodies;
    }

    /** Visible donors; phone numbers only when logged in. Optional ?bloodGroup= and ?district=. */
    @GetMapping("/donors")
    public Map<String, Object> donors(CurrentUser user,
                                      @RequestParam(required = false) String bloodGroup,
                                      @RequestParam(required = false) String district) {
        return blood.donors(user, bloodGroup, district);
    }

    /** Your donor profile, or { donor: null }. */
    @RequireAuth
    @GetMapping("/donors/me")
    public Map<String, Object> myDonor(CurrentUser user) {
        return blood.myDonor(user);
    }

    /** Create or update your donor profile. */
    @RequireAuth
    @PostMapping("/donors")
    public ResponseEntity<Map<String, Object>> saveMyDonor(CurrentUser user, HttpServletRequest req) {
        return blood.saveMyDonor(user, bodies.read(req));
    }

    @RequireAuth
    @DeleteMapping("/donors/me")
    public Map<String, Object> deleteMyDonor(CurrentUser user) {
        return blood.deleteMyDonor(user);
    }
}
