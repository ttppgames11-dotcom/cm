package com.connectmaratha.api.crmunit;

import java.util.List;
import java.util.Optional;

/** The 12 yearly activity types of a CRM unit, in the order they are planned (one per month, January to December). */
public final class ActivityTypes {

    private ActivityTypes() {}

    public record Type(String key, String mr, String en, String icon, int defaultTarget) {}

    public static final List<Type> ALL = List.of(
        new Type("health_checkup", "आरोग्य तपासणी", "Health checkup", "🩺", 200),
        new Type("blood_donation", "रक्तदान", "Blood donation", "🩸", 100),
        new Type("job_fair", "रोजगार मेळावा", "Job fair", "💼", 300),
        new Type("business_expo", "व्यवसाय प्रदर्शन", "Business expo", "🏪", 150),
        new Type("job_business_consultancy", "रोजगार/व्यवसाय मार्गदर्शन", "Job and business consultancy", "🧭", 100),
        new Type("matrimony", "वधू-वर मेळावा", "Matrimony", "💍", 250),
        new Type("education_consultancy", "शिक्षण मार्गदर्शन", "Education consultancy", "🎓", 150),
        new Type("childrens_games", "बालकल्याण क्रीडा", "Children's welfare games", "⚽", 120),
        new Type("spiritual", "अध्यात्मिक उपक्रम", "Spiritual activities", "🕉️", 200),
        new Type("mahila_bachat_gat", "महिला बचत गट", "Mahila bachat gat", "👩‍🌾", 60),
        new Type("krushi_sabha", "कृषी सभा", "Krushi sabha", "🌾", 150),
        new Type("food_expo", "अन्न प्रदर्शन", "Food expo", "🍲", 200));

    public static final Object[] KEYS = ALL.stream().map(Type::key).toArray();

    public static Optional<Type> byKey(String key) {
        return ALL.stream().filter(t -> t.key().equals(key)).findFirst();
    }
}
