package com.connectmaratha.api.job.dto;

import com.connectmaratha.api.common.validation.Rule;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

/** Validation rules for jobs, applications, job actions and application statuses (applied after {@link #normalize}). Unknown fields are ignored. */
public final class JobSchemas {

    private JobSchemas() {}

    public static final Object[] STATUSES = {"new", "shortlisted", "rejected", "hired"};

    public static final Map<String, Rule> JOB = ordered(
        "title", Rule.string().required().min(2).max(100),
        "company", Rule.string().required().min(2).max(100),
        "district", Rule.string().required().min(2).max(100),
        "category", Rule.string().max(50),
        "salary", Rule.string().max(50),
        "job_type", Rule.string().max(30),
        "experience", Rule.string().max(30),
        "desc", Rule.string().max(1000),
        "phone", Rule.string().required().format("phone").min(10).max(15),
        "contact_email", Rule.string().format("email").max(150));

    public static final Map<String, Rule> APPLICATION = ordered(
        "applicant_name", Rule.string().required().min(2).max(100),
        "phone", Rule.string().required().format("phone").min(10).max(15),
        "email", Rule.string().format("email").max(150),
        "resume_summary", Rule.string().max(500));

    public static final Map<String, Rule> ACTION = ordered(
        "action", Rule.string().required().oneOf("close", "extend"));

    public static final Map<String, Rule> STATUS = ordered(
        "status", Rule.string().required().oneOf(STATUSES));

    public static final Map<String, Rule> HIDDEN = ordered("hidden", Rule.bool().required());

    /** The categories the website offers; an alert's category must be one of them. */
    public static final Object[] CATEGORIES = {"IT & Software", "Finance & Accounts", "Manufacturing", "Marketing & Sales", "सामान्य"};

    /** An alert after "any" values (empty, all, सर्व) were removed; at least one of the two must remain (checked in the service). */
    public static final Map<String, Rule> ALERT = ordered(
        "district", Rule.string().max(100),
        "category", Rule.string().oneOf(CATEGORIES));

    private static final Map<String, String> ALIASES = Map.of(
        "jobType", "job_type", "contactEmail", "contact_email", "description", "desc",
        "applicantName", "applicant_name", "resumeSummary", "resume_summary");

    /** A copy of the body with camelCase names mapped to the snake_case ones (the snake_case key wins) and a text action/status trimmed and lower-cased. */
    public static Map<String, Object> normalize(Map<String, Object> body) {
        Map<String, Object> copy = new LinkedHashMap<>(body);
        ALIASES.forEach((camel, snake) -> {
            if (!copy.containsKey(snake) && copy.containsKey(camel)) copy.put(snake, copy.get(camel));
        });
        for (String key : new String[] {"action", "status"}) {
            if (copy.get(key) instanceof String s) copy.put(key, s.trim().toLowerCase(Locale.ROOT));
        }
        return copy;
    }

    private static Map<String, Rule> ordered(Object... pairs) {
        Map<String, Rule> m = new LinkedHashMap<>();
        for (int i = 0; i < pairs.length; i += 2) m.put((String) pairs[i], (Rule) pairs[i + 1]);
        return m;
    }
}
