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

    private static final java.util.regex.Pattern JS_NUMBER = java.util.regex.Pattern.compile(
        "^[+-]?(Infinity|\\d+\\.?\\d*(?:[eE][+-]?\\d+)?|\\.\\d+(?:[eE][+-]?\\d+)?)$");

    /** Number(v): "" and null -> 0, true -> 1, " 12 " -> 12, "0x10" -> 16, "12abc" -> NaN. */
    public static double number(Object v) {
        if (v == null) return 0;
        if (v instanceof Boolean b) return b ? 1 : 0;
        if (v instanceof Number n) return n.doubleValue();
        if (v instanceof java.util.Map<?, ?>) return Double.NaN;
        String s = string(v).strip();
        if (s.isEmpty()) return 0;
        if (s.matches("(?i)0x[0-9a-f]+")) return Long.parseLong(s.substring(2), 16);
        if (s.matches("(?i)0b[01]+")) return Long.parseLong(s.substring(2), 2);
        if (s.matches("(?i)0o[0-7]+")) return Long.parseLong(s.substring(2), 8);
        if (!JS_NUMBER.matcher(s).matches()) return Double.NaN;
        if (s.endsWith("Infinity")) return s.startsWith("-") ? Double.NEGATIVE_INFINITY : Double.POSITIVE_INFINITY;
        return Double.parseDouble(s);
    }

    /** A JavaScript number as Java: whole values as Long (so JSON shows 5, not 5.0), others as Double. */
    public static Number jsNumber(double d) {
        if (d == Math.rint(d) && !Double.isInfinite(d) && Math.abs(d) < 1e15) return (long) d;
        return d;
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
