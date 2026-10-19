package com.connectmaratha.api.validation;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Port of the Node backend's middleware/validator.js: same checks, same order,
 * same messages, so the app and website see identical validation errors.
 * Schemas are LinkedHashMaps so "first error" matches Node's field order.
 */
public final class SchemaValidator {

    private SchemaValidator() {}

    /** validate(data, schema, { allowUnknown, atLeastOneOf }) — returns all error messages. */
    public static List<String> validate(Map<String, Object> data, Map<String, Rule> schema,
                                        boolean allowUnknown, List<String> atLeastOneOf) {
        List<String> errors = new ArrayList<>();
        Map<String, Object> input = data == null ? Map.of() : data;

        if (!allowUnknown) {
            for (String key : input.keySet()) {
                if (!schema.containsKey(key)) {
                    errors.add("अनाधिकृत किंवा अज्ञात फील्ड: '" + key + "' (Unrecognized field '" + key + "' is not allowed)");
                }
            }
        }

        for (Map.Entry<String, Rule> e : schema.entrySet()) {
            String err = validateField(e.getKey(), input.get(e.getKey()), e.getValue());
            if (err != null) errors.add(err);
        }

        if (atLeastOneOf != null && !atLeastOneOf.isEmpty()) {
            boolean hasAny = atLeastOneOf.stream().anyMatch(f -> {
                Object v = input.get(f);
                return v != null && (!(v instanceof String s) || !s.trim().isEmpty());
            });
            if (!hasAny) {
                String list = String.join(", ", atLeastOneOf);
                errors.add("किमान एक पर्याय आवश्यक आहे: [" + list + "] (At least one of [" + list + "] is required)");
            }
        }
        return errors;
    }

    /** Throws a 400 VALIDATION_ERROR with { error: first, errors: all } when invalid. */
    public static void check(Map<String, Object> data, Map<String, Rule> schema,
                             boolean allowUnknown, List<String> atLeastOneOf) {
        List<String> errors = validate(data, schema, allowUnknown, atLeastOneOf);
        if (!errors.isEmpty()) throw new ValidationException(errors);
    }

    /** JavaScript's typeof for parsed JSON values, with arrays as "array" like Node's validator. */
    static String typeOf(Object value) {
        if (value instanceof String) return "string";
        if (value instanceof Number) return "number";
        if (value instanceof Boolean) return "boolean";
        if (value instanceof Collection<?> || (value != null && value.getClass().isArray())) return "array";
        return "object";
    }

    static String validateField(String field, Object value, Rule rule) {
        // 1. Missing / null / blank string
        if (value == null || (value instanceof String s && s.trim().isEmpty())) {
            return rule.required ? field + " आवश्यक आहे (" + field + " is required)" : null;
        }

        // 2. Type
        String actualType = typeOf(value);
        if (!rule.types.contains(actualType)) {
            return field + " चे स्वरूप अयोग्य आहे: " + String.join(" किंवा ", rule.types) + " अपेक्षित, "
                + actualType + " मिळाले (" + field + " must be of type " + String.join(" or ", rule.types) + ")";
        }

        // 3. String
        if (actualType.equals("string")) {
            String str = ((String) value).trim();
            if (rule.minLength != null && str.length() < rule.minLength) {
                return field + " ची लांबी किमान " + rule.minLength + " अक्षरे असावी (" + field
                    + " must be at least " + rule.minLength + " characters)";
            }
            if (rule.maxLength != null && str.length() > rule.maxLength) {
                return field + " ची लांबी कमाल " + rule.maxLength + " अक्षरे असावी (" + field
                    + " must not exceed " + rule.maxLength + " characters)";
            }
            if (rule.format != null && Formats.ALL.containsKey(rule.format)
                    && !Formats.ALL.get(rule.format).matcher(str).find()) {
                return field + " चे फॉरमॅट अवैध आहे (" + field + " has an invalid " + rule.format + " format)";
            }
            if (rule.pattern != null && !Pattern.compile(rule.pattern).matcher(str).find()) {
                return rule.patternMessage != null ? rule.patternMessage
                    : field + " चे स्वरूप अवैध आहे (" + field + " format is invalid)";
            }
            if (rule.allowed != null && !rule.allowed.contains(str)) {
                return enumMessage(field, rule);
            }
        }

        // 4. Number
        if (actualType.equals("number")) {
            double n = ((Number) value).doubleValue();
            if (Double.isNaN(n) || Double.isInfinite(n)) {
                return field + " वैध संख्या असावी (" + field + " must be a valid number)";
            }
            if (rule.integer && n != Math.rint(n)) {
                return field + " पूर्णांक संख्या असावी (" + field + " must be an integer)";
            }
            if (rule.min != null && n < rule.min) {
                return field + " चे किमान मूल्य " + jsNumber(rule.min) + " असावे (" + field + " must be at least " + jsNumber(rule.min) + ")";
            }
            if (rule.max != null && n > rule.max) {
                return field + " चे कमाल मूल्य " + jsNumber(rule.max) + " असावे (" + field + " must not exceed " + jsNumber(rule.max) + ")";
            }
            if (rule.allowed != null && rule.allowed.stream().noneMatch(a -> a instanceof Number an && an.doubleValue() == n)) {
                return enumMessage(field, rule);
            }
        }

        // 5. Array
        if (actualType.equals("array")) {
            List<?> list = value instanceof List<?> l ? l : List.copyOf((Collection<?>) value);
            if (rule.minItems != null && list.size() < rule.minItems) {
                return field + " मध्ये किमान " + rule.minItems + " आयटम असावेत (" + field + " must contain at least " + rule.minItems + " items)";
            }
            if (rule.maxItems != null && list.size() > rule.maxItems) {
                return field + " मध्ये कमाल " + rule.maxItems + " आयटम असावेत (" + field + " must contain at most " + rule.maxItems + " items)";
            }
            if (rule.itemRule != null) {
                for (int i = 0; i < list.size(); i++) {
                    String itemErr = validateField(field + "[" + i + "]", list.get(i), rule.itemRule);
                    if (itemErr != null) return itemErr;
                }
            }
        }
        return null;
    }

    private static String enumMessage(String field, Rule rule) {
        String options = rule.allowed.stream().map(String::valueOf).collect(Collectors.joining(", "));
        return field + " चे मूल्य अनुमत पर्यायांपैकी असावे (" + field + " must be one of: " + options + ")";
    }

    /** 5.0 -> "5", like JavaScript prints numbers. */
    private static String jsNumber(double d) {
        return d == Math.rint(d) ? String.valueOf((long) d) : String.valueOf(d);
    }
}
