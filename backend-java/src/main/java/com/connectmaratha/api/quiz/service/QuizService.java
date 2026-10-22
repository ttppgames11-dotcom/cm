package com.connectmaratha.api.quiz.service;

import com.connectmaratha.api.common.util.Js;
import com.connectmaratha.api.quiz.entity.QuizQuestion;
import com.connectmaratha.api.quiz.entity.QuizSubmission;
import com.connectmaratha.api.quiz.repository.QuizQuestionRepository;
import com.connectmaratha.api.quiz.repository.QuizSubmissionRepository;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Predicate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Maratha-history quiz: questions, daily challenge, results and leaderboard (backend/routes/quiz.routes.js). */
@Service
public class QuizService {

    /** Marathi or English category names -> the stored English name. */
    private static final Map<String, String> CATEGORY = new LinkedHashMap<>();
    static {
        CATEGORY.put("सर्व", "ALL");
        String[][] pairs = {
            {"छत्रपती शिवराय व स्वराज्य", "Chhatrapati Shivaji Maharaj"},
            {"छत्रपती संभाजी महाराज", "Chhatrapati Sambhaji Maharaj"},
            {"छत्रपती राजाराम महाराज", "Chhatrapati Rajaram Maharaj"},
            {"महारानी ताराबाई", "Maharani Tarabai"},
            {"पेशवे", "Peshwas"},
            {"मराठा सरदार व सेनापती", "Maratha Warriors & Commanders"},
            {"अभेद्य दुर्ग व स्थापत्य", "Forts & Fort Architecture"},
            {"महापराक्रमी रणसंग्राम", "Battles & Military Campaigns"},
            {"मराठा प्रशासन व अष्टप्रधान", "Maratha Administration"},
            {"मराठा आरमार व जलदुर्ग", "Maratha Navy"},
            {"ऐतिहासिक दिनविशेष व कालपट", "Important Dates & Chronology"},
            {"मराठा साम्राज्य व नंतरचा इतिहास", "Maratha Empire / Later History"},
            {"साहित्य, बखरी व संस्कृती", "Literature, Sources & Culture"},
        };
        for (String[] p : pairs) {
            CATEGORY.put(p[0], p[1]);
            CATEGORY.put(p[1], p[1]);
        }
    }

    private static final Map<String, String> DIFFICULTY = Map.of(
        "प्राथमिक", "easy", "easy", "easy", "मध्यम", "medium", "medium", "medium", "प्रगत", "hard", "hard", "hard");

    private final QuizQuestionRepository questions;
    private final QuizSubmissionRepository submissions;

    public QuizService(QuizQuestionRepository questions, QuizSubmissionRepository submissions) {
        this.questions = questions;
        this.submissions = submissions;
    }

    public Map<String, Object> stats() {
        Map<String, Object> categories = new LinkedHashMap<>();
        for (Object[] r : questions.countByCategory()) categories.put(String.valueOf(r[0]), ((Number) r[1]).longValue());
        Map<String, Object> difficulties = new LinkedHashMap<>();
        for (Object[] r : questions.countByDifficulty()) difficulties.put(String.valueOf(r[0]), ((Number) r[1]).longValue());
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("total_questions", questions.count());
        out.put("target_architecture", 20000);
        out.put("categories", categories);
        out.put("difficulties", difficulties);
        out.put("verification_status", "100% verified against Maharashtra State Gazetteers & Sabhasad Bakhar");
        return out;
    }

    public Map<String, Object> categories() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Object[] r : questions.countByCategory()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("category", r[0]);
            row.put("count", ((Number) r[1]).longValue());
            rows.add(row);
        }
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("count", rows.size());
        out.put("categories", rows);
        return out;
    }

    /** Filtered questions; count=N picks N at random, otherwise all in question order. */
    public Map<String, Object> questions(String category, String difficulty, String type, String count) {
        Predicate<String> chosen = v -> Js.truthy(v) && !v.equals("सर्व") && !v.equals("ALL");
        String dbCategory = chosen.test(category) ? CATEGORY.getOrDefault(category, category) : null;
        String dbDifficulty = chosen.test(difficulty) ? DIFFICULTY.getOrDefault(difficulty, difficulty) : null;
        String dbType = Js.truthy(type) && !type.equals("all") ? type : null;
        Long n = Js.truthy(count) && !count.equals("all") ? Js.parseInt(count) : null;

        List<QuizQuestion> found = n != null && n > 0
            ? questions.random(dbCategory, category, dbDifficulty, dbType, n)
            : questions.filtered(dbCategory, category, dbDifficulty, dbType);
        List<Map<String, Object>> rows = new ArrayList<>();
        for (QuizQuestion q : found) rows.add(question(q));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("count", rows.size());
        out.put("questions", rows);
        return out;
    }

    public Map<String, Object> daily() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (QuizQuestion q : questions.firstFive("Chhatrapati Shivaji Maharaj")) rows.add(question(q));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("date", LocalDate.now(ZoneOffset.UTC).toString());
        out.put("title", "आजचा ऐतिहासिक प्रश्न व क्विझ (Daily Swarajya Challenge)");
        out.put("questions", rows);
        return out;
    }

    /** Saves a result. Missing fields get Node's defaults; null stays null (as with JavaScript defaults). */
    @Transactional
    public Map<String, Object> submit(Map<String, Object> b) {
        Object category = b.containsKey("category") ? b.get("category") : "सर्वसमावेशक";
        Object score = b.containsKey("score") ? b.get("score") : 0;
        Object total = b.containsKey("total") ? b.get("total") : 10;
        Object points = b.containsKey("points") ? b.get("points") : 0;
        Object streak = b.containsKey("streak") ? b.get("streak") : 0;
        Object rankTitle = b.containsKey("rank_title") ? b.get("rank_title") : "जागृत मावळा";

        double t = Js.number(total);
        double percentage = t > 0 ? jsRound(Js.number(score) / t * 100) : 0;
        String id = shortId();
        submissions.insertSubmission(id, Js.orElse(b.get("candidate_name"), "मावळा"), Js.orElse(b.get("city"), "महाराष्ट्र"),
            category == null ? null : Js.string(category), sql(score), sql(total),
            Double.isNaN(percentage) ? "NaN" : String.valueOf((long) percentage), sql(points), sql(streak),
            rankTitle == null ? null : Js.string(rankTitle));

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("message", "क्विझ निकाल यशस्वीरीत्या नोंदवला गेला!");
        out.put("submission", submission(submissions.findById(id).orElseThrow()));
        return out;
    }

    public Map<String, Object> leaderboard() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (QuizSubmission s : submissions.top20()) rows.add(submission(s));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("count", rows.size());
        out.put("leaderboard", rows);
        return out;
    }

    /** "SUB-" + last 6 digits of the time, moving on to the next free number when taken. */
    private String shortId() {
        String ms = String.valueOf(System.currentTimeMillis());
        int n = Integer.parseInt(ms.substring(ms.length() - 6));
        for (int i = 0; i < 1_000_000; i++) {
            String id = "SUB-" + String.format("%06d", (n + i) % 1_000_000);
            if (!submissions.existsById(id)) return id;
        }
        return "SUB-" + System.currentTimeMillis();
    }

    /** Math.round: halves go up (towards +infinity). */
    private static double jsRound(double v) {
        return Double.isNaN(v) || Double.isInfinite(v) ? v : Math.floor(v + 0.5);
    }

    private static String sql(Object v) {
        return v == null ? null : Js.string(v);
    }

    static Map<String, Object> question(QuizQuestion q) {
        Map<String, Object> o = new LinkedHashMap<>();
        o.put("question_id", q.getQuestionId());
        o.put("language", q.getLanguage());
        o.put("category", q.getCategory());
        o.put("sub_category", q.getSubCategory());
        o.put("difficulty", q.getDifficulty());
        o.put("question_type", q.getQuestionType());
        o.put("question", q.getQuestion());
        o.put("option_a", q.getOptionA());
        o.put("option_b", q.getOptionB());
        o.put("option_c", q.getOptionC());
        o.put("option_d", q.getOptionD());
        o.put("correct_answer", q.getCorrectAnswer());
        o.put("explanation", q.getExplanation());
        o.put("historical_period", q.getHistoricalPeriod());
        o.put("person", q.getPerson());
        o.put("fort", q.getFort());
        o.put("battle", q.getBattle());
        o.put("year", q.getYear());
        o.put("source", q.getSource());
        o.put("source_url", q.getSourceUrl());
        o.put("verification_status", q.getVerificationStatus());
        o.put("created_at", q.getCreatedAt());
        return o;
    }

    static Map<String, Object> submission(QuizSubmission s) {
        Map<String, Object> o = new LinkedHashMap<>();
        o.put("id", s.getId());
        o.put("candidate_name", s.getCandidateName());
        o.put("city", s.getCity());
        o.put("category", s.getCategory());
        o.put("score", s.getScore());
        o.put("total", s.getTotal());
        o.put("percentage", s.getPercentage());
        o.put("points", s.getPoints());
        o.put("streak", s.getStreak());
        o.put("rank_title", s.getRankTitle());
        o.put("created_at", s.getCreatedAt());
        o.put("member_id", s.getMemberId());
        return o;
    }
}
