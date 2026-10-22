package com.connectmaratha.api.ai.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Optional question-and-answer file for the assistant (a JSON list of { question, topic, category,
 * answer: { mr, hi, en }, source }), searched by keywords like the Node backend does. Without the
 * file the assistant answers from its built-in guidance.
 */
@Component
public class KnowledgeBase {

    private static final Logger log = LoggerFactory.getLogger(KnowledgeBase.class);

    public record Match(Map<String, Object> item, int score) {}

    private final List<Map<String, Object>> items = new ArrayList<>();

    public KnowledgeBase(ObjectMapper json,
                         @Value("${AI_KNOWLEDGE_FILE:../Connect-Maratha-AI-Agent/backend/data/connect_maratha_content.json}") String file) {
        Path path = Path.of(file);
        try {
            if (Files.exists(path)) {
                items.addAll(json.readValue(Files.readString(path), new TypeReference<List<Map<String, Object>>>() {}));
                log.info("[AI Agent] Loaded {} Q&A items from knowledge base.", items.size());
            }
        } catch (Exception e) {
            log.warn("[AI Agent] Could not load knowledge base file: {}", e.getMessage());
        }
    }

    public int size() {
        return items.size();
    }

    /** lowercase, NFKC, only letters/digits/spaces/Devanagari, single spaces. */
    static String normalize(Object value) {
        String s = value == null ? "" : String.valueOf(value);
        s = Normalizer.normalize(s.toLowerCase(Locale.ROOT), Normalizer.Form.NFKC);
        return s.replaceAll("[^A-Za-z0-9_\\s\\u0900-\\u097F]", " ").replaceAll("\\s+", " ").trim();
    }

    /** The best-scoring entry, or empty below the match threshold (6). */
    public Optional<Match> search(String query, String lang) {
        if (items.isEmpty() || query == null || query.isEmpty()) return Optional.empty();
        String qNorm = normalize(query);
        List<String> tokens = new ArrayList<>();
        for (String t : qNorm.split(" ")) if (t.length() > 1) tokens.add(t);

        Map<String, Object> best = null;
        int highest = 0;
        for (Map<String, Object> item : items) {
            int score = 0;
            String qText = normalize(item.get("question"));
            String topic = normalize(item.get("topic"));
            String category = normalize(item.get("category"));
            String answerText = normalize(answerFor(item, lang));
            if (qNorm.equals(qText) || qText.contains(qNorm) || qNorm.contains(qText)) score += 50;
            for (String token : tokens) {
                if (qText.contains(token)) score += 8;
                if (topic.contains(token)) score += 5;
                if (category.contains(token)) score += 4;
                if (answerText.contains(token)) score += 1;
            }
            if (score > highest) {
                highest = score;
                best = item;
            }
        }
        return highest >= 6 ? Optional.of(new Match(best, highest)) : Optional.empty();
    }

    @SuppressWarnings("unchecked")
    private static Object answerFor(Map<String, Object> item, String lang) {
        Object answer = item.get("answer");
        if (!(answer instanceof Map<?, ?> m)) return "";
        Map<String, Object> a = (Map<String, Object>) m;
        Object v = a.get(lang);
        return v != null && !"".equals(v) ? v : a.get("en");
    }
}
