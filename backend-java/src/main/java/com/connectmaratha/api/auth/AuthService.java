package com.connectmaratha.api.auth;

import com.connectmaratha.api.config.JwtService;
import com.connectmaratha.api.location.LocationHierarchy;
import com.connectmaratha.api.mail.MailService;
import com.connectmaratha.api.member.Member;
import com.connectmaratha.api.member.MemberJson;
import com.connectmaratha.api.member.MemberRepository;
import com.connectmaratha.api.schema.LazyTables;
import com.connectmaratha.api.web.ApiException;
import com.connectmaratha.api.web.CurrentUser;
import io.jsonwebtoken.Claims;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * The logic of backend/routes/auth.routes.js, step by step. Replies keep Node's
 * wording, status codes and field names; where Node's own bugs would have been
 * copied (an unretried random member id, a weak OTP generator) the Java version
 * does the safe equivalent without changing what the app sees.
 */
@Service
public class AuthService {

    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATE_TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final SecureRandom RANDOM = new SecureRandom();
    /** bcrypt cost 8, as bcrypt.hashSync(x, 8) in Node. */
    private static final BCryptPasswordEncoder BCRYPT = new BCryptPasswordEncoder(8);

    private final MemberRepository members;
    private final LocationHierarchy locations;
    private final JwtService jwt;
    private final MailService mail;
    private final GoogleTokenVerifier google;
    private final JdbcTemplate jdbc;
    private final TransactionTemplate tx;
    private final LazyTables lazyTables;
    private final boolean production;
    private final boolean allowDevLogin;

    public AuthService(MemberRepository members, LocationHierarchy locations, JwtService jwt, MailService mail,
                       GoogleTokenVerifier google, JdbcTemplate jdbc, TransactionTemplate tx, LazyTables lazyTables,
                       @Value("${app.production:false}") boolean production,
                       @Value("${app.allow-dev-login:false}") boolean allowDevLogin) {
        this.members = members;
        this.locations = locations;
        this.jwt = jwt;
        this.mail = mail;
        this.google = google;
        this.jdbc = jdbc;
        this.tx = tx;
        this.lazyTables = lazyTables;
        this.production = production;
        this.allowDevLogin = allowDevLogin;
    }

    // ------------------------------------------------------------------ register

    public ResponseWithStatus register(Map<String, Object> body) {
        String phone = firstTruthyString(body, "phone", "mobile");
        String business = firstTruthyString(body, "business", "organization");
        String name = str(body.get("name"));
        String email = str(body.get("email"));
        String city = str(body.get("city"));

        if (name.isEmpty() || (email.isEmpty() && phone.isEmpty())) {
            throw ApiException.plain(HttpStatus.BAD_REQUEST, "नाव आणि ईमेल किंवा फोन नंबर आवश्यक आहे.");
        }

        String countryId = str(body.get("countryId"));
        String stateId = str(body.get("stateId"));
        String districtId = str(body.get("districtId"));
        String talukaId = str(body.get("talukaId"));
        String villageId = str(body.get("villageId"));
        if (!countryId.isEmpty() || !stateId.isEmpty() || !districtId.isEmpty() || !talukaId.isEmpty() || !villageId.isEmpty()) {
            Optional<String> problem = locations.validate(countryId, stateId, districtId, talukaId, villageId);
            if (problem.isPresent()) throw ApiException.plain(HttpStatus.BAD_REQUEST, problem.get());
        }

        if (members.findExisting(email, phone).isPresent()) {
            throw ApiException.plain(HttpStatus.BAD_REQUEST, "या ईमेल किंवा फोन क्रमांकासह सदस्य आधीच नोंदणीकृत आहे.");
        }

        String password = str(body.get("password"));
        String passwordHash = password.isEmpty() ? null : BCRYPT.encode(password);

        String finalCountry = orDefault(str(body.get("country")), "भारत");
        String finalState = orDefault(str(body.get("state")), "महाराष्ट्र");
        String finalDistrict = orDefault(str(body.get("district")), "पुणे");
        String finalTaluka = str(body.get("taluka"));
        String finalVillage = str(body.get("village"));
        finalCountry = locations.countryName(countryId).orElse(finalCountry);
        finalState = locations.stateName(stateId).orElse(finalState);
        finalDistrict = locations.districtName(districtId).orElse(finalDistrict);
        finalTaluka = locations.talukaName(talukaId).orElse(finalTaluka);
        finalVillage = locations.villageName(villageId).orElse(finalVillage);

        String computedCity = !city.isEmpty() ? city
            : !finalVillage.isEmpty() ? finalVillage + ", " + finalTaluka
            : !finalTaluka.isEmpty() ? finalTaluka + ", " + finalDistrict
            : finalDistrict;

        String referralInput = firstTruthyString(body, "reference_id", "referral_code", "referred_by",
            "referredBy", "referralCode", "referenceId").trim();
        Optional<Member> referrer = referralInput.isEmpty() ? Optional.empty() : findReferrer(referralInput);
        String assignedReferredBy = referrer.map(r -> !isEmpty(r.getReferenceId()) ? r.getReferenceId() : r.getId())
            .orElse(referralInput.isEmpty() ? null : referralInput);

        String memberId = newMemberId();
        String referenceId = "REF-96K-" + digitsOr(memberId);

        Member m = new Member(memberId, name);
        m.setEmail(email);
        m.setPhone(phone);
        m.setPasswordHash(passwordHash);
        m.setAvatar("👤");
        m.setCity(computedCity);
        m.setDistrict(finalDistrict);
        m.setState(finalState);
        m.setCountry(finalCountry);
        m.setCountryId(emptyToNull(countryId));
        m.setStateId(emptyToNull(stateId));
        m.setDistrictId(emptyToNull(districtId));
        m.setTalukaId(emptyToNull(talukaId));
        m.setVillageId(emptyToNull(villageId));
        m.setTaluka(finalTaluka);
        m.setVillage(finalVillage);
        m.setProfession(str(body.get("profession")));
        m.setBusiness(business);
        m.setEducation(str(body.get("education")));
        m.setSkills(joinList(body.get("skills"), ", "));
        m.setAbout(joinList(body.get("about"), "\n"));
        m.setTier("Basic");
        m.setRole("member");
        m.setJoined(today());
        m.setCreatedAt(now());
        m.setReferenceId(referenceId);
        m.setReferralId(referenceId);
        m.setReferredBy(assignedReferredBy);
        m.setTotalReferrals(0);

        tx.executeWithoutResult(status -> {
            members.saveAndFlush(m);
            referrer.ifPresent(r -> members.incrementTotalReferrals(r.getId()));
        });

        Member saved = members.findById(memberId).orElseThrow();
        Map<String, Object> out = MemberJson.of(saved, MemberJson.REGISTERED);
        String token = jwt.generate(saved.getId(), saved.getName(), saved.getRole(), saved.getTier());

        if (saved.getEmail() != null && saved.getEmail().contains("@")) {
            mail.sendWelcome(saved.getEmail(), saved.getName(), saved.getId());
        }

        Map<String, Object> reply = success("नोंदणी यशस्वी झाली!");
        reply.put("token", token);
        reply.put("member", out);
        return new ResponseWithStatus(HttpStatus.CREATED, reply);
    }

    // --------------------------------------------------------------------- login

    public Map<String, Object> login(Map<String, Object> body) {
        String rawId = firstTruthyString(body, "identifier", "phone", "mobile", "email");
        if (rawId.isEmpty()) {
            throw ApiException.plain(HttpStatus.BAD_REQUEST, "कृपया आयडी, ईमेल किंवा फोन प्रविष्ट करा.");
        }
        String cleanId = rawId.trim();
        String digits = cleanId.replaceAll("\\D", "");
        String clean10 = digits.length() >= 10 ? digits.substring(digits.length() - 10) : "";

        Member member = members.findForLogin(cleanId, clean10, "%" + clean10, "%" + clean10 + "%").orElse(null);
        if (member == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "USER_NOT_REGISTERED",
                "वापरकर्ता तपशील आढळले नाहीत. कृपया नोंदणी करा (User details are not fetch, please नोंदणी करा).");
        }
        if (member.getPasswordHash() == null || member.getPasswordHash().isEmpty()) {
            throw ApiException.plain(HttpStatus.UNAUTHORIZED,
                "या खात्यासाठी संकेतशब्द सेट केलेला नाही. कृपया Google सह लॉगिन करा किंवा संकेतशब्द रीसेट करा.");
        }

        String password = str(body.get("password"));
        boolean matches = BCRYPT.matches(password, member.getPasswordHash());
        boolean devBypass = !production && allowDevLogin && "password123".equals(body.get("password"));
        if (!matches && !devBypass) {
            throw ApiException.plain(HttpStatus.UNAUTHORIZED, "अवैध संकेतशब्द (Incorrect password).");
        }

        Map<String, Object> out = MemberJson.of(member, MemberJson.ALL);
        MemberJson.parseInterests(out);
        MemberJson.ensureReferral(out);

        Map<String, Object> reply = success("लॉगिन यशस्वी झाले!");
        reply.put("token", jwt.generate(member.getId(), member.getName(), member.getRole(), member.getTier()));
        reply.put("member", out);
        return reply;
    }

    // ------------------------------------------------------------------- google

    public boolean googleConfigured() {
        return google.configured();
    }

    public Map<String, Object> googleLogin(Map<String, Object> body) throws Exception {
        Map<String, Object> info = google.verify((String) body.get("idToken")).orElseThrow(() ->
            new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_GOOGLE_TOKEN",
                "Google खाते सत्यापित करता आले नाही. कृपया पुन्हा प्रयत्न करा."));

        String email = String.valueOf(info.get("email")).trim().toLowerCase();
        Member member = members.findByEmailIgnoreCase(email).orElse(null);

        if (member == null) {
            if (!Boolean.TRUE.equals(body.get("register"))) {
                throw new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_REGISTERED",
                    "वापरकर्ता तपशील आढळले नाहीत. कृपया आधी नोंदणी करा.");
            }
            Map<?, ?> consent = body.get("legalCompliance") instanceof Map<?, ?> c ? c : Map.of();
            if (!Boolean.TRUE.equals(consent.get("termsAccepted")) || !Boolean.TRUE.equals(consent.get("privacyAccepted"))
                    || !Boolean.TRUE.equals(consent.get("ageConfirmed"))) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "CONSENT_REQUIRED",
                    "नोंदणीसाठी अटी, गोपनीयता धोरण व १८+ वयाची पुष्टी आवश्यक आहे.");
            }
            String memberId = newMemberId();
            String displayName = info.get("name") == null || String.valueOf(info.get("name")).isEmpty()
                ? email.split("@")[0] : String.valueOf(info.get("name"));
            displayName = displayName.trim();
            if (displayName.length() > 100) displayName = displayName.substring(0, 100);
            String referenceId = "REF-96K-" + digitsOr(memberId);

            Member m = new Member(memberId, displayName);
            m.setEmail(email);
            m.setPhone("");
            m.setAvatar("👤");
            m.setCity(""); m.setDistrict(""); m.setState(""); m.setCountry("");
            m.setProfession(""); m.setBusiness(""); m.setEducation(""); m.setSkills(""); m.setAbout("");
            m.setTier("Basic");
            m.setRole("member");
            m.setJoined(today());
            m.setCreatedAt(now());
            m.setReferenceId(referenceId);
            m.setReferralId(referenceId);
            m.setTotalReferrals(0);
            members.saveAndFlush(m);
            member = members.findById(memberId).orElseThrow();
        }

        Map<String, Object> out = MemberJson.of(member, MemberJson.ALL);
        MemberJson.parseInterests(out);
        Map<String, Object> reply = success("Google लॉगिन यशस्वी झाले!");
        reply.put("token", jwt.generate(member.getId(), member.getName(), member.getRole(), member.getTier()));
        reply.put("member", out);
        return reply;
    }

    // ----------------------------------------------------------------------- me

    public Map<String, Object> me(CurrentUser user) {
        Member member = members.findById(String.valueOf(user.id())).orElse(null);
        if (member == null) throw ApiException.plain(HttpStatus.NOT_FOUND, "सदस्य आढळला नाही.");
        Map<String, Object> out = MemberJson.of(member, MemberJson.ME);
        MemberJson.parseInterests(out);
        Map<String, Object> reply = new LinkedHashMap<>();
        reply.put("success", true);
        reply.put("member", out);
        return reply;
    }

    // ---------------------------------------------------------- password reset

    public Map<String, Object> forgotPassword(Map<String, Object> body) {
        String email = str(body.get("email")).trim();
        if (email.isEmpty()) {
            throw ApiException.plain(HttpStatus.BAD_REQUEST, "कृपया नोंदणीकृत ईमेल पत्ता प्रविष्ट करा (Please provide registered email).");
        }
        String cleanEmail = email.toLowerCase();
        Member member = members.findByEmailIgnoreCase(cleanEmail).orElse(null);
        if (member == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND",
                "या ईमेल आयडीसह कोणताही वापरकर्ता आढळला नाही. कृपया नोंदणीकृत ईमेल तपासा.");
        }

        String otp = String.valueOf(100000 + RANDOM.nextInt(900000));
        OffsetDateTime expiresAt = OffsetDateTime.now(ZoneOffset.UTC).plusMinutes(10);
        jdbc.update("""
            INSERT INTO password_resets (email, member_id, otp_hash, expires_at, attempts, created_at)
            VALUES (?, ?, ?, ?, 0, NOW())
            ON CONFLICT (email) DO UPDATE SET
              member_id = EXCLUDED.member_id, otp_hash = EXCLUDED.otp_hash,
              expires_at = EXCLUDED.expires_at, attempts = 0, created_at = NOW()""",
            cleanEmail, member.getId(), BCRYPT.encode(otp), expiresAt);

        mail.sendPasswordResetOtp(cleanEmail, member.getName(), otp);

        Map<String, Object> reply = success("सुरक्षा OTP आपल्या नोंदणीकृत ईमेलवर यशस्वीरीत्या पाठवला आहे.");
        reply.put("email", cleanEmail);
        return reply;
    }

    public Map<String, Object> verifyResetOtp(Map<String, Object> body) {
        String cleanEmail = str(body.get("email")).trim().toLowerCase();
        String cleanOtp = str(body.get("otp")).trim();

        List<Map<String, Object>> rows = jdbc.queryForList(
            "SELECT * FROM password_resets WHERE LOWER(email) = ?", cleanEmail);
        if (rows.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "NO_OTP_REQUESTED",
                "कोणतीही सक्रिय OTP विनंती आढळली नाही. कृपया पुन्हा OTP मागवा.");
        }
        Map<String, Object> record = rows.get(0);

        Instant expiresAt = toInstant(record.get("expires_at"));
        if (Instant.now().isAfter(expiresAt)) {
            deleteReset(cleanEmail);
            throw new ApiException(HttpStatus.BAD_REQUEST, "OTP_EXPIRED",
                "हा OTP कालबाह्य झाला आहे (१० मिनिटांची मुदत संपली). कृपया नवीन OTP मागवा.");
        }
        int attempts = ((Number) record.get("attempts")).intValue();
        if (attempts >= 5) {
            deleteReset(cleanEmail);
            throw new ApiException(HttpStatus.BAD_REQUEST, "TOO_MANY_ATTEMPTS",
                "अनेक चुकीचे प्रयत्न झाले आहेत. सुरक्षेसाठी हा OTP रद्द केला आहे. कृपया नवीन OTP मागवा.");
        }
        if (!BCRYPT.matches(cleanOtp, String.valueOf(record.get("otp_hash")))) {
            jdbc.update("UPDATE password_resets SET attempts = attempts + 1 WHERE LOWER(email) = ?", cleanEmail);
            int remaining = 5 - (attempts + 1);
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_OTP",
                "अवैध OTP. कृपया पुन्हा तपासा (उर्वरित प्रयत्न: " + Math.max(remaining, 0) + ").");
        }

        String memberId = members.findByEmailIgnoreCase(cleanEmail).map(Member::getId).orElse(null);
        Map<String, Object> reply = success("OTP यशस्वीरीत्या सत्यापित झाला!");
        reply.put("resetToken", jwt.generateResetToken(memberId, cleanEmail));
        return reply;
    }

    public Map<String, Object> resetPassword(Map<String, Object> body) {
        String cleanEmail = str(body.get("email")).trim().toLowerCase();
        String resetToken = str(body.get("resetToken"));
        String newPassword = str(body.get("newPassword"));

        if (newPassword.length() < 8) {
            throw ApiException.plain(HttpStatus.BAD_REQUEST, "पासवर्ड किमान ८ अक्षरांचा असणे आवश्यक आहे.");
        }
        Claims claims = jwt.parse(resetToken).orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN,
            "INVALID_RESET_TOKEN", "पासवर्ड रीसेट सत्राची मुदत संपली आहे किंवा अवैध आहे. कृपया पुन्हा प्रयत्न करा."));
        Object tokenEmail = claims.get("email");
        if (!"password_reset".equals(claims.get("purpose")) || tokenEmail == null
                || !String.valueOf(tokenEmail).toLowerCase().equals(cleanEmail)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "TOKEN_MISMATCH", "अवैध पासवर्ड रीसेट विनंती.");
        }

        if (members.findByEmailIgnoreCase(cleanEmail).isEmpty()) {
            throw ApiException.plain(HttpStatus.NOT_FOUND, "वापरकर्ता आढळला नाही.");
        }
        jdbc.update("UPDATE members SET password_hash = ? WHERE LOWER(email) = ?", BCRYPT.encode(newPassword), cleanEmail);
        deleteReset(cleanEmail);
        return success("पासवर्ड यशस्वीरीत्या बदलला गेला आहे! आता आपण नवीन पासवर्डने लॉगिन करू शकता.");
    }

    private void deleteReset(String cleanEmail) {
        jdbc.update("DELETE FROM password_resets WHERE LOWER(email) = ?", cleanEmail);
    }

    // ---------------------------------------------------------- account delete

    /** DELETE /account and the logged-in half of POST /delete-account. */
    public Map<String, Object> deleteAccount(CurrentUser user, String password) {
        if (user == null || user.id() == null) {
            throw ApiException.plain(HttpStatus.UNAUTHORIZED, "प्रमाणीकरण आवश्यक आहे (Authentication required)");
        }
        String memberId = user.id();
        Member member = members.findById(memberId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
            "USER_NOT_FOUND", "सदस्य आढळला नाही (Member not found)"));

        if (member.getPasswordHash() != null && !member.getPasswordHash().isEmpty()) {
            if (password == null || password.isEmpty()) {
                throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_PASSWORD",
                    "कृपया आपला पासवर्ड प्रविष्ट करा (Please provide your password)");
            }
            if (!BCRYPT.matches(password, member.getPasswordHash())) {
                throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_PASSWORD", "चुकीचा पासवर्ड (Incorrect password)");
            }
        }

        // Tables that may not exist everywhere are cleaned up outside the transaction:
        // on PostgreSQL a failing statement aborts the whole transaction.
        for (String sql : List.of("DELETE FROM media WHERE owner_id = ?", "DELETE FROM refresh_tokens WHERE member_id = ?")) {
            try {
                jdbc.update(sql, memberId);
            } catch (RuntimeException ignored) {
                // Table not present here.
            }
        }

        tx.executeWithoutResult(status -> {
            List<String> likedPosts = jdbc.queryForList("SELECT post_id FROM post_likes WHERE member_id = ?", String.class, memberId);
            jdbc.update("DELETE FROM post_likes WHERE member_id = ?", memberId);
            for (String postId : likedPosts) {
                if (postId != null) {
                    Integer left = jdbc.queryForObject("SELECT COUNT(*) FROM post_likes WHERE post_id = ?", Integer.class, postId);
                    jdbc.update("UPDATE posts SET likes_count = ? WHERE id = ?", left == null ? 0 : left, postId);
                }
            }

            jdbc.update("DELETE FROM post_comments WHERE author_id = ?", memberId);

            for (String postId : jdbc.queryForList("SELECT id FROM posts WHERE author_id = ?", String.class, memberId)) {
                jdbc.update("DELETE FROM post_comments WHERE post_id = ?", postId);
                jdbc.update("DELETE FROM post_likes WHERE post_id = ?", postId);
            }
            jdbc.update("DELETE FROM posts WHERE author_id = ?", memberId);

            jdbc.update("DELETE FROM notifications WHERE member_id = ?", memberId);

            List<String> groups = jdbc.queryForList("SELECT group_id FROM group_members WHERE member_id = ?", String.class, memberId);
            jdbc.update("DELETE FROM group_members WHERE member_id = ?", memberId);
            for (String groupId : groups) {
                if (groupId != null) {
                    Integer left = jdbc.queryForObject("SELECT COUNT(*) FROM group_members WHERE group_id = ?", Integer.class, groupId);
                    jdbc.update("UPDATE groups SET members_count = ? WHERE id = ?", left == null ? 0 : left, groupId);
                }
            }

            List<String> events = jdbc.queryForList("SELECT event_id FROM event_rsvps WHERE member_id = ?", String.class, memberId);
            jdbc.update("DELETE FROM event_rsvps WHERE member_id = ?", memberId);
            for (String eventId : events) {
                if (eventId != null) {
                    Integer left = jdbc.queryForObject("SELECT COUNT(*) FROM event_rsvps WHERE event_id = ?", Integer.class, eventId);
                    jdbc.update("UPDATE events SET rsvp_count = ? WHERE id = ?", left == null ? 0 : left, eventId);
                }
            }

            jdbc.update("DELETE FROM meetings WHERE requester_id = ? OR recipient_id = ?", memberId, memberId);
            jdbc.update("DELETE FROM referrals WHERE giver_id = ? OR recipient_id = ?", memberId, memberId);
            jdbc.update("UPDATE donations SET donor_id = NULL, donor_name = 'Deleted Member' WHERE donor_id = ?", memberId);

            if (member.getEmail() != null && !member.getEmail().isEmpty()) {
                jdbc.update("DELETE FROM password_resets WHERE LOWER(email) = ?", member.getEmail().toLowerCase());
            }
            jdbc.update("DELETE FROM members WHERE id = ?", memberId);
        });

        Map<String, Object> reply = new LinkedHashMap<>();
        reply.put("success", true);
        reply.put("deleted", true);
        reply.put("message", "खाते आणि सर्व वैयक्तिक डेटा यशस्वीरित्या कायमस्वरूपी हटवला गेला आहे (Account and personal data deleted successfully).");
        return reply;
    }

    /** Website "Delete account" page when nobody is logged in: records a request for staff. */
    public Map<String, Object> requestAccountDeletion(Map<String, Object> body) {
        String identifier = firstTruthyString(body, "identifier", "phone", "email").trim();
        if (identifier.length() > 120) identifier = identifier.substring(0, 120);
        if (identifier.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "IDENTIFIER_REQUIRED", "कृपया नोंदणीकृत मोबाइल नंबर किंवा ईमेल टाका.");
        }
        if (!Boolean.TRUE.equals(body.get("confirmation"))) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "CONFIRMATION_REQUIRED", "कृपया पुष्टीकरण चेकबॉक्स निवडा.");
        }

        String digits = identifier.replaceAll("\\D", "");
        String last10 = digits.length() >= 10 ? digits.substring(digits.length() - 10) : "";
        Optional<Member> member = members.findForDeletionRequest(identifier, last10, "%" + last10);

        if (member.isPresent()) {
            Member m = member.get();
            lazyTables.ensureSupportTickets();
            List<String> open = jdbc.queryForList(
                "SELECT id FROM support_tickets WHERE source = 'account_deletion' AND requester_id = ? AND status NOT IN ('Resolved', 'Closed')",
                String.class, m.getId());
            if (open.isEmpty()) {
                String reason = str(body.get("reason")).trim();
                if (reason.length() > 500) reason = reason.substring(0, 500);
                String nowIso = Instant.now().toString();
                jdbc.update("""
                    INSERT INTO support_tickets (id, source, title, description, category, priority, status,
                      requester_id, requester_name, requester_phone, requester_email, sla_hours, audit_trail, updated_at)
                    VALUES (?, 'account_deletion', ?, ?, 'Account Deletion', 'High', 'New', ?, ?, ?, ?, 720, ?, ?)""",
                    "DEL-" + Long.toString(System.currentTimeMillis(), 36).toUpperCase(),
                    "Account deletion request: " + m.getId(),
                    "Web request to delete account " + m.getId() + ". Verify the requester before deleting."
                        + (reason.isEmpty() ? "" : " Reason: " + reason),
                    m.getId(), nz(m.getName()), nz(m.getPhone()), nz(m.getEmail()),
                    "[{\"action\":\"CREATED\",\"by\":\"web delete-account page\",\"timestamp\":\"" + nowIso + "\"}]", nowIso);
            }
        }

        // Same answer whether or not the account exists.
        Map<String, Object> reply = new LinkedHashMap<>();
        reply.put("success", true);
        reply.put("requested", true);
        reply.put("deleted", false);
        reply.put("message", "आपली खाते हटवण्याची विनंती प्राप्त झाली आहे. पडताळणीनंतर ३० दिवसांत खाते व वैयक्तिक डेटा हटवला जाईल. "
            + "(Your deletion request was received; after verification the account and personal data are deleted within 30 days.)");
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("requested", true);
        data.put("deleted", false);
        reply.put("data", data);
        return reply;
    }

    // --------------------------------------------------------------- referrals

    public Map<String, Object> verifyReferral(String rawCode) {
        String code = rawCode == null ? "" : rawCode.trim();
        if (code.isEmpty()) throw ApiException.plain(HttpStatus.BAD_REQUEST, "रेफरल कोड आवश्यक आहे.");

        Optional<Member> referrer = findReferrer(code);
        if (referrer.isPresent()) {
            Member r = referrer.get();
            Map<String, Object> info = new LinkedHashMap<>();
            info.put("id", r.getId());
            info.put("name", r.getName());
            info.put("reference_id", orDefault(r.getReferenceId(), r.getId()));
            info.put("referral_id", orDefault(r.getReferralId(), orDefault(r.getReferenceId(), r.getId())));
            info.put("district", orDefault(r.getDistrict(), "महाराष्ट्र"));
            info.put("city", nz(r.getCity()));
            Map<String, Object> reply = success("सत्यापित रेफरल कोड");
            reply.put("isValid", true);
            reply.put("referrer", info);
            return reply;
        }

        String upper = code.toUpperCase();
        Map<String, String[]> official = Map.of(
            "CM-OFFICIAL-2026", new String[] {"Connect Maratha अधिकृत केंद्रीय मंच", "महाराष्ट्र"},
            "CM-ADMIN-001", new String[] {"Connect Maratha मुख्य नियामक कार्यालय", "महाराष्ट्र"},
            "CM-PUN-0842", new String[] {"अमोल तुकाराम जाधव", "पुणे"});
        if (official.containsKey(upper)) {
            Map<String, Object> info = new LinkedHashMap<>();
            info.put("id", upper);
            info.put("name", official.get(upper)[0]);
            info.put("reference_id", upper);
            info.put("referral_id", upper);
            info.put("district", official.get(upper)[1]);
            info.put("city", "महाराष्ट्र");
            Map<String, Object> reply = success("अधिकृत रेफरल कोड");
            reply.put("isValid", true);
            reply.put("referrer", info);
            return reply;
        }

        Map<String, Object> reply = new LinkedHashMap<>();
        reply.put("success", false);
        reply.put("isValid", false);
        reply.put("error", "हा रेफरल आयडी आढळला नाही.");
        throw new NotFoundWithBody(reply);
    }

    public Map<String, Object> myReferrals(CurrentUser user) {
        Member member = members.findById(String.valueOf(user.id())).orElse(null);
        if (member == null) throw ApiException.plain(HttpStatus.NOT_FOUND, "सदस्य सापडला नाही.");

        Map<String, Object> populated = MemberJson.of(member, MemberJson.ALL);
        MemberJson.ensureReferral(populated);
        String myRefId = String.valueOf(populated.get("reference_id")).toUpperCase();
        String myCode = String.valueOf(populated.get("referral_id")).toUpperCase();
        String myId = String.valueOf(populated.get("id")).toUpperCase();

        List<Map<String, Object>> referred = new ArrayList<>();
        for (Member m : members.findReferredBy(member.getId(), myRefId, myCode, myId)) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", m.getId());
            row.put("name", m.getName());
            row.put("phone", isEmpty(m.getPhone()) ? "" : m.getPhone().substring(0, Math.min(4, m.getPhone().length())) + " •••••");
            row.put("district", !isEmpty(m.getDistrict()) ? m.getDistrict() : !isEmpty(m.getCity()) ? m.getCity() : "पुणे");
            row.put("city", !isEmpty(m.getCity()) ? m.getCity() : nz(m.getDistrict()));
            row.put("joined", !isEmpty(m.getJoined()) ? m.getJoined()
                : !isEmpty(m.getCreatedAt()) ? m.getCreatedAt().split("T")[0] : "2026-03-01");
            row.put("status", "सक्रिय (Active)");
            referred.add(row);
        }

        int total = Math.max(((Number) populated.get("total_referrals")).intValue(), referred.size());
        Object shareCode = !isEmpty((String) populated.get("reference_id")) ? populated.get("reference_id") : populated.get("id");

        Map<String, Object> reply = new LinkedHashMap<>();
        reply.put("success", true);
        reply.put("reference_id", populated.get("reference_id"));
        reply.put("referral_id", !isEmpty((String) populated.get("referral_id")) ? populated.get("referral_id") : populated.get("reference_id"));
        reply.put("total_referrals", total);
        reply.put("share_link", "https://connectmaratha.com/register?ref=" + shareCode);
        reply.put("referred_members", referred);
        return reply;
    }

    // ----------------------------------------------------------------- helpers

    /** A reply body carrying its own fields, sent with 404 (the referral check's not-found shape). */
    public static class NotFoundWithBody extends RuntimeException {
        private final transient Map<String, Object> body;

        NotFoundWithBody(Map<String, Object> body) {
            super("not found", null, false, false);
            this.body = body;
        }

        public Map<String, Object> body() { return body; }
    }

    /** A successful reply plus the HTTP status to send it with. */
    public record ResponseWithStatus(HttpStatus status, Map<String, Object> body) {}

    private Optional<Member> findReferrer(String code) {
        String digits = code.replaceAll("\\D", "");
        return members.findReferrer(code.toUpperCase(), digits.length() >= 10 ? digits.substring(digits.length() - 10) : "");
    }

    /** M + 4 digits, retried so two sign-ups never collide on the same id. */
    private String newMemberId() {
        for (int i = 0; i < 20; i++) {
            String candidate = "M" + (1000 + RANDOM.nextInt(9000));
            if (!members.existsById(candidate)) return candidate;
        }
        throw new IllegalStateException("Could not allocate a member ID");
    }

    private static Map<String, Object> success(String message) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("success", true);
        m.put("message", message);
        return m;
    }

    /** JavaScript's {@code a || b || ''} over string fields: the first non-empty string. */
    private static String firstTruthyString(Map<String, Object> body, String... keys) {
        for (String k : keys) {
            Object v = body.get(k);
            if (v instanceof String s && !s.isEmpty()) return s;
            if (v != null && !(v instanceof String) && !(v instanceof Boolean b && !b)
                    && !(v instanceof Number n && n.doubleValue() == 0)) {
                return String.valueOf(v);
            }
        }
        return "";
    }

    private static String str(Object v) {
        return v instanceof String s ? s : v == null ? "" : String.valueOf(v);
    }

    private static boolean isEmpty(String s) {
        return s == null || s.isEmpty();
    }

    private static String nz(String s) {
        return s == null ? "" : s;
    }

    private static String orDefault(String value, String fallback) {
        return isEmpty(value) ? fallback : value;
    }

    private static String emptyToNull(String s) {
        return isEmpty(s) ? null : s;
    }

    private static String digitsOr(String id) {
        String digits = id.replaceAll("\\D", "");
        return digits.isEmpty() ? String.valueOf(1000 + RANDOM.nextInt(9000)) : digits;
    }

    /** Node: arrays are trimmed, blanks dropped and joined; strings are trimmed; anything else is empty. */
    private static String joinList(Object v, String separator) {
        if (v instanceof List<?> list) {
            List<String> parts = new ArrayList<>();
            for (Object o : list) {
                String s = String.valueOf(o).trim();
                if (!s.isEmpty()) parts.add(s);
            }
            return String.join(separator, parts);
        }
        return v instanceof String s ? s.trim() : "";
    }

    private static String today() {
        return OffsetDateTime.now(ZoneOffset.UTC).format(DATE);
    }

    private static String now() {
        return OffsetDateTime.now(ZoneOffset.UTC).format(DATE_TIME);
    }

    private static Instant toInstant(Object ts) {
        if (ts instanceof java.sql.Timestamp t) return t.toInstant();
        if (ts instanceof OffsetDateTime o) return o.toInstant();
        return Instant.parse(String.valueOf(ts));
    }
}
