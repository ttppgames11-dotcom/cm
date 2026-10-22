package com.connectmaratha.api.directory.controller;

import static com.connectmaratha.api.directory.controller.DirectoryErrors.guard;

import com.connectmaratha.api.common.security.CurrentUser;
import com.connectmaratha.api.common.security.RequireAuth;
import com.connectmaratha.api.common.web.ClientIp;
import com.connectmaratha.api.common.web.JsonBody;
import com.connectmaratha.api.directory.service.DairyService;
import com.connectmaratha.api.directory.service.EnquiryLimiter;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** /api/dairy/* and /dairy/* — the dairy part of backend/routes/directories.routes.js. */
@RestController
@RequestMapping({"/api/dairy", "/dairy"})
public class DairyController {

    private final DairyService dairy;
    private final EnquiryLimiter limiter;
    private final JsonBody bodies;

    public DairyController(DairyService dairy, EnquiryLimiter limiter, JsonBody bodies) {
        this.dairy = dairy;
        this.limiter = limiter;
        this.bodies = bodies;
    }

    @GetMapping("/products")
    public Map<String, Object> products(@RequestParam(required = false) String category,
                                        @RequestParam(required = false) String sellerId,
                                        @RequestParam(required = false) String search) {
        return guard(() -> dairy.products(category, sellerId, search));
    }

    @PostMapping("/products")
    @RequireAuth
    public ResponseEntity<Map<String, Object>> addProduct(CurrentUser user, HttpServletRequest req) {
        Map<String, Object> body = bodies.read(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(guard(() -> dairy.addProduct(user, body)));
    }

    @PostMapping("/products/{id}/enquiries")
    public ResponseEntity<Map<String, Object>> enquireProduct(@PathVariable String id, CurrentUser user, HttpServletRequest req) {
        Map<String, Object> body = bodies.read(req);
        limiter.check(ClientIp.of(req));
        return ResponseEntity.status(HttpStatus.CREATED).body(guard(() -> dairy.enquireProduct(user, id, body)));
    }

    /** Login first, then the enquiry limit (Node's order). */
    @PostMapping("/{id}/registrations")
    @RequireAuth
    public ResponseEntity<Map<String, Object>> register(@PathVariable String id, CurrentUser user, HttpServletRequest req) {
        Map<String, Object> body = bodies.read(req);
        limiter.check(ClientIp.of(req));
        return ResponseEntity.status(HttpStatus.CREATED).body(guard(() -> dairy.register(user, id, body)));
    }

    @GetMapping("/{id}/registrations")
    @RequireAuth
    public Map<String, Object> registrations(@PathVariable String id, CurrentUser user) {
        return guard(() -> dairy.registrations(user, id));
    }

    @GetMapping("/{id}")
    public Map<String, Object> detail(@PathVariable String id) {
        return guard(() -> dairy.detail(id));
    }

    @GetMapping
    public Map<String, Object> list(@RequestParam(required = false) String kind,
                                    @RequestParam(required = false) String district,
                                    @RequestParam(required = false) String search) {
        return guard(() -> dairy.list(kind, district, search));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(CurrentUser user, HttpServletRequest req) {
        Map<String, Object> body = bodies.read(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(guard(() -> dairy.create(user, body)));
    }
}
