package com.connectmaratha.api.member.controller;

import com.connectmaratha.api.member.service.MemberService;

import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.web.JsonBody;
import com.connectmaratha.api.common.security.RequireAuth;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** /api/members/* — the same endpoints as backend/routes/members.routes.js. */
@RestController
@RequestMapping("/api/members")
public class MemberController {

    private final MemberService members;
    private final JsonBody bodies;

    public MemberController(MemberService members, JsonBody bodies) {
        this.members = members;
        this.bodies = bodies;
    }

    @GetMapping
    public Map<String, Object> list(@RequestParam(required = false) String district,
                                    @RequestParam(required = false) String profession,
                                    @RequestParam(required = false) String search,
                                    @RequestParam(required = false) String tier) {
        return members.list(district, tier, profession, search);
    }

    @GetMapping({"/stats", "/stats/summary"})
    public Map<String, Object> stats() {
        return members.stats();
    }

    @GetMapping("/{id}")
    public Map<String, Object> detail(@PathVariable String id, CurrentUser viewer) {
        return members.detail(id, viewer);
    }

    @PutMapping("/{id}")
    @RequireAuth
    public Map<String, Object> update(@PathVariable String id, CurrentUser user, HttpServletRequest req) {
        return members.update(id, bodies.read(req), user);
    }
}
