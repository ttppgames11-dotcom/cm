package com.connectmaratha.api.auth;


import com.connectmaratha.api.ratelimit.AuthRateLimiter;
import com.connectmaratha.api.validation.SchemaValidator;
import com.connectmaratha.api.web.ApiException;
import com.connectmaratha.api.web.CurrentUser;
import com.connectmaratha.api.web.JsonBody;
import com.connectmaratha.api.web.RequireAuth;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * /api/auth/* — the same 11 endpoints as backend/routes/auth.routes.js, in the
 * same order of checks: login-attempt limits, then input validation, then logic.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final List<String> REGISTER_ONE_OF = List.of("email", "phone", "mobile");

    private final AuthService auth;
    private final AuthRateLimiter limiter;
    private final JsonBody bodies;

    public AuthController(AuthService auth, AuthRateLimiter limiter, JsonBody bodies) {
        this.auth = auth;
        this.limiter = limiter;
        this.bodies = bodies;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(HttpServletRequest req, HttpServletResponse res) {
        Map<String, Object> body = bodies.read(req);
        limiter.check(req, res, body);
        SchemaValidator.check(body, AuthSchemas.REGISTER, true, REGISTER_ONE_OF);
        AuthService.ResponseWithStatus out = auth.register(body);
        return ResponseEntity.status(out.status()).body(out.body());
    }

    @PostMapping("/login")
    public Map<String, Object> login(HttpServletRequest req, HttpServletResponse res) {
        Map<String, Object> body = bodies.read(req);
        limiter.check(req, res, body);
        SchemaValidator.check(body, AuthSchemas.LOGIN, true, null);
        return auth.login(body);
    }

    @PostMapping("/google")
    public Map<String, Object> google(HttpServletRequest req, HttpServletResponse res) throws Exception {
        Map<String, Object> body = bodies.read(req);
        limiter.check(req, res, body);
        SchemaValidator.check(body, AuthSchemas.GOOGLE, false, null);
        if (!auth.googleConfigured()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "GOOGLE_NOT_CONFIGURED",
                "Google लॉगिन सध्या उपलब्ध नाही. कृपया मोबाईल/ईमेल व पासवर्डने लॉगिन करा. (Google sign-in is not available yet.)");
        }
        return auth.googleLogin(body);
    }

    @RequireAuth
    @GetMapping("/me")
    public Map<String, Object> me(CurrentUser user) {
        return auth.me(user);
    }

    @PostMapping("/forgot-password")
    public Map<String, Object> forgotPassword(HttpServletRequest req, HttpServletResponse res) {
        Map<String, Object> body = bodies.read(req);
        limiter.check(req, res, body);
        SchemaValidator.check(body, AuthSchemas.FORGOT_PASSWORD, false, null);
        return auth.forgotPassword(body);
    }

    @PostMapping("/verify-reset-otp")
    public Map<String, Object> verifyResetOtp(HttpServletRequest req, HttpServletResponse res) {
        Map<String, Object> body = bodies.read(req);
        limiter.check(req, res, body);
        SchemaValidator.check(body, AuthSchemas.VERIFY_RESET_OTP, false, null);
        return auth.verifyResetOtp(body);
    }

    @PostMapping("/reset-password")
    public Map<String, Object> resetPassword(HttpServletRequest req, HttpServletResponse res) {
        Map<String, Object> body = bodies.read(req);
        limiter.check(req, res, body);
        SchemaValidator.check(body, AuthSchemas.RESET_PASSWORD, false, null);
        return auth.resetPassword(body);
    }

    /** The app's account deletion: needs login, password re-checked. */
    @RequireAuth
    @DeleteMapping("/account")
    public Map<String, Object> deleteAccount(CurrentUser user, HttpServletRequest req) {
        Map<String, Object> body = bodies.read(req);
        SchemaValidator.check(body, AuthSchemas.DELETE_ACCOUNT, false, null);
        Object password = body.get("password");
        return auth.deleteAccount(user, password instanceof String s ? s : null);
    }

    /**
     * The website's account deletion. Logged in: deletes (password checked).
     * Logged out: only records a request for staff — a phone or email alone
     * must never delete an account.
     */
    @PostMapping("/delete-account")
    public Map<String, Object> deleteAccountFromWebsite(CurrentUser user, HttpServletRequest req, HttpServletResponse res) {
        Map<String, Object> body = bodies.read(req);
        limiter.check(req, res, body);
        if (user != null && user.id() != null) {
            Object password = body.get("password");
            return auth.deleteAccount(user, password instanceof String s ? s : null);
        }
        return auth.requestAccountDeletion(body);
    }

    @GetMapping("/referrals/verify/{code}")
    public Map<String, Object> verifyReferral(@PathVariable String code) {
        return auth.verifyReferral(code);
    }

    @RequireAuth
    @GetMapping("/referrals/my-referrals")
    public Map<String, Object> myReferrals(CurrentUser user) {
        return auth.myReferrals(user);
    }

    /** The referral check's "not found" reply carries its own fields (isValid: false). */
    @ExceptionHandler(AuthService.NotFoundWithBody.class)
    public ResponseEntity<Map<String, Object>> notFoundWithBody(AuthService.NotFoundWithBody e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.body());
    }
}
