package com.connectmaratha.api.common.web;

import jakarta.servlet.http.HttpServletRequest;

/** The caller's IP, found the same way as the Node backend's getClientIp(). */
public final class ClientIp {

    private ClientIp() {}

    public static String of(HttpServletRequest req) {
        String forwarded = req.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            String first = forwarded.split(",")[0].trim();
            if (!first.isEmpty()) return clean(first);
        }
        String realIp = req.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) return clean(realIp.trim());
        String remote = req.getRemoteAddr();
        return clean(remote == null ? "127.0.0.1" : remote);
    }

    private static String clean(String ip) {
        return ip.startsWith("::ffff:") ? ip.substring(7) : ip;
    }
}
