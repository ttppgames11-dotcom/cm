package com.connectmaratha.api.common.util;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.regex.Pattern;

/** Input cleaning and id helpers of the website features (backend/utils/websiteTables.js). */
public final class WebsiteText {

    private static final Pattern TAGS = Pattern.compile("<[^>]*>");
    private static final Pattern MOBILE = Pattern.compile("^[6-9]\\d{9}$");
    private static final SecureRandom RANDOM = new SecureRandom();
    /** new Date().toISOString(): always milliseconds and Z. */
    private static final DateTimeFormatter JS_ISO = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").withZone(ZoneOffset.UTC);

    private WebsiteText() {}

    /** Trimmed text with tags removed, cut to max characters; missing values become "". */
    public static String text(Object value, int max) {
        if (value == null) return "";
        String s = TAGS.matcher(Js.string(value)).replaceAll("").trim();
        return s.length() > max ? s.substring(0, max) : s;
    }

    /** Last 10 digits of an Indian mobile number, or "" when it isn't one. */
    public static String cleanMobile(Object value) {
        String digits = Js.textOrEmpty(value).replaceAll("\\D", "");
        String last10 = digits.length() > 10 ? digits.substring(digits.length() - 10) : digits;
        return MOBILE.matcher(last10).matches() ? last10 : "";
    }

    /** prefix-TIMEINBASE36RANDOM4, e.g. SBK-MH3K2P9QA1B2 (prefix may be empty: "-MH3K..."). */
    public static String newId(String prefix) {
        return prefix + "-" + Long.toString(System.currentTimeMillis(), 36).toUpperCase(Locale.ROOT)
            + Ids.base36(4).toUpperCase(Locale.ROOT);
    }

    public static String nowIso() {
        return JS_ISO.format(Instant.now());
    }
}
