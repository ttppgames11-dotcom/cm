package com.connectmaratha.api.web;

import io.jsonwebtoken.Claims;

/**
 * The logged-in member from a valid login token (id, name, role, tier — the
 * same fields the Node backend puts in its tokens). Declare a parameter of
 * this type in a controller method to receive it (null when logged out).
 */
public record CurrentUser(String id, String name, String role, String tier) {

    public static final String ATTRIBUTE = "cm.currentUser";
    /** Set when a token was sent but is invalid or expired (Node answers 403 then). */
    public static final String INVALID_TOKEN_ATTRIBUTE = "cm.invalidToken";

    static CurrentUser from(Claims claims) {
        Object id = claims.get("id");
        return new CurrentUser(
            id == null ? null : String.valueOf(id),
            claims.get("name") == null ? "" : String.valueOf(claims.get("name")),
            claims.get("role") == null ? "member" : String.valueOf(claims.get("role")),
            claims.get("tier") == null ? "Gold" : String.valueOf(claims.get("tier")));
    }

    public boolean isAdmin() {
        String r = role == null ? "" : role.toLowerCase();
        return r.equals("admin") || r.equals("superadmin");
    }
}
