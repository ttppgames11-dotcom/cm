package com.connectmaratha.api.quiz.controller;

import com.connectmaratha.api.common.web.JsonBody;
import com.connectmaratha.api.quiz.service.QuizService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** /api/quiz/* — the same endpoints as backend/routes/quiz.routes.js. */
@RestController
@RequestMapping("/api/quiz")
public class QuizController {

    private final QuizService quiz;
    private final JsonBody bodies;

    public QuizController(QuizService quiz, JsonBody bodies) {
        this.quiz = quiz;
        this.bodies = bodies;
    }

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        return quiz.stats();
    }

    @GetMapping("/categories")
    public Map<String, Object> categories() {
        return quiz.categories();
    }

    @GetMapping("/questions")
    public Map<String, Object> questions(@RequestParam(required = false) String category,
                                         @RequestParam(required = false) String difficulty,
                                         @RequestParam(required = false) String type,
                                         @RequestParam(required = false) String count) {
        return quiz.questions(category, difficulty, type, count);
    }

    @GetMapping("/daily")
    public Map<String, Object> daily() {
        return quiz.daily();
    }

    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submit(HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(quiz.submit(bodies.read(req)));
    }

    @GetMapping("/leaderboard")
    public Map<String, Object> leaderboard() {
        return quiz.leaderboard();
    }
}
