package com.connectmaratha.api.validation;

import java.util.List;

/**
 * One field's rule — the Node backend's schema entries
 * ({ type, required, minLength, maxLength, format, enum, maxItems, itemRule, ... }).
 * Build with {@code Rule.string().required().max(120)}.
 */
public final class Rule {

    List<String> types = List.of("string");
    boolean required;
    Integer minLength;
    Integer maxLength;
    String format;
    String pattern;
    String patternMessage;
    List<Object> allowed;
    boolean integer;
    Double min;
    Double max;
    Integer minItems;
    Integer maxItems;
    Rule itemRule;

    private Rule() {}

    public static Rule string() { return of("string"); }
    public static Rule bool() { return of("boolean"); }
    public static Rule number() { return of("number"); }
    public static Rule object() { return of("object"); }
    public static Rule array() { return of("array"); }

    /** Several allowed types, e.g. of("string", "array"). */
    public static Rule of(String... types) {
        Rule r = new Rule();
        r.types = List.of(types);
        return r;
    }

    public Rule required() { this.required = true; return this; }
    public Rule min(int minLength) { this.minLength = minLength; return this; }
    public Rule max(int maxLength) { this.maxLength = maxLength; return this; }
    /** A named format from {@link Formats}: email, phone, otp, jwt, memberId, referenceId, safeText, code, url. */
    public Rule format(String format) { this.format = format; return this; }
    public Rule pattern(String regex, String message) { this.pattern = regex; this.patternMessage = message; return this; }
    public Rule oneOf(Object... values) { this.allowed = List.of(values); return this; }
    public Rule integer() { this.integer = true; return this; }
    public Rule minValue(double min) { this.min = min; return this; }
    public Rule maxValue(double max) { this.max = max; return this; }
    public Rule minItems(int n) { this.minItems = n; return this; }
    public Rule maxItems(int n) { this.maxItems = n; return this; }
    public Rule items(Rule itemRule) { this.itemRule = itemRule; return this; }
}
