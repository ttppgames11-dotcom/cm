package com.connectmaratha.api.sangam.controller;

import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.RequireAuth;
import com.connectmaratha.api.common.web.JsonBody;
import com.connectmaratha.api.sangam.service.ChapterService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** /api/admin/chapters: admins create, edit, close and reopen chapters. */
@RestController
@RequestMapping("/api/admin/chapters")
public class ChapterAdminController {

    private final ChapterService chapters;
    private final JsonBody bodies;

    public ChapterAdminController(ChapterService chapters, JsonBody bodies) {
        this.chapters = chapters;
        this.bodies = bodies;
    }

    /** Every chapter, open and closed, with seat counts. */
    @RequireAuth
    @GetMapping
    public Map<String, Object> list(CurrentUser user) {
        return chapters.adminList(user);
    }

    @RequireAuth
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(CurrentUser user, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(chapters.create(user, bodies.read(req)));
    }

    /** Edit any field, change the coordinator, or set status open/closed. */
    @RequireAuth
    @PutMapping("/{id}")
    public Map<String, Object> update(@PathVariable String id, CurrentUser user, HttpServletRequest req) {
        return chapters.update(user, id, bodies.read(req));
    }
}
