package com.connectmaratha.api.common.util;

/** JavaScript-style truthiness and string coercion, so request handling matches the Node code line for line. */
public final class Js {

    private Js() {}

    /** JS truthiness: null, "", false and 0 are falsy. */
    public static boolean truthy(Object v) {
        if (v == null) return false;
        if (v instanceof String s) return !s.isEmpty();
        if (v instanceof Boolean b) return b;
        if (v instanceof Number n) return n.doubleValue() != 0;
        return true;
    }

    /** String(v || '') */
    public static String textOrEmpty(Object v) {
        return truthy(v) ? String.valueOf(v) : "";
    }

    /** v || fallback, as text */
    public static String orElse(Object v, String fallback) {
        return truthy(v) ? String.valueOf(v) : fallback;
    }

    /** A value as text, or null when it is falsy (so a SQL filter can be skipped). */
    public static String nullIfFalsy(Object v) {
        return truthy(v) ? String.valueOf(v) : null;
    }
}
