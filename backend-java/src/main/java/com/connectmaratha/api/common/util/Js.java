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

    /** String(v): 5.0 -> "5", [1, 2] -> "1,2", objects -> "[object Object]". */
    public static String string(Object v) {
        if (v == null) return "null";
        if (v instanceof Double d && d == Math.rint(d) && !d.isInfinite() && Math.abs(d) < 1e15) return String.valueOf(d.longValue());
        if (v instanceof java.util.List<?> list) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < list.size(); i++) {
                if (i > 0) sb.append(',');
                if (list.get(i) != null) sb.append(string(list.get(i)));
            }
            return sb.toString();
        }
        if (v instanceof java.util.Map<?, ?>) return "[object Object]";
        return String.valueOf(v);
    }

    /** String(v || '') */
    public static String textOrEmpty(Object v) {
        return truthy(v) ? string(v) : "";
    }

    /** v || fallback, as text */
    public static String orElse(Object v, String fallback) {
        return truthy(v) ? string(v) : fallback;
    }

    /** A value as text, or null when it is falsy (so a SQL filter can be skipped). */
    public static String nullIfFalsy(Object v) {
        return truthy(v) ? string(v) : null;
    }

    private static final java.util.regex.Pattern INT_PREFIX = java.util.regex.Pattern.compile("^\\s*([+-]?\\d+)");
    private static final java.util.regex.Pattern FLOAT_PREFIX = java.util.regex.Pattern.compile(
        "^\\s*([+-]?(?:Infinity|\\d+\\.?\\d*(?:[eE][+-]?\\d+)?|\\.\\d+(?:[eE][+-]?\\d+)?))");

    /** parseInt(String(v), 10): the leading whole number, or null for NaN. */
    public static Long parseInt(Object v) {
        java.util.regex.Matcher m = INT_PREFIX.matcher(string(v));
        if (!m.find()) return null;
        try {
            return Long.parseLong(m.group(1));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /** parseFloat(String(v)): the leading number, or null for NaN. */
    public static Double parseFloat(Object v) {
        java.util.regex.Matcher m = FLOAT_PREFIX.matcher(string(v));
        if (!m.find()) return null;
        String s = m.group(1);
        if (s.endsWith("Infinity")) return s.startsWith("-") ? Double.NEGATIVE_INFINITY : Double.POSITIVE_INFINITY;
        return Double.parseDouble(s);
    }
}
