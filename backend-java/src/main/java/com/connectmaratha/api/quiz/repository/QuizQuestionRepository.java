package com.connectmaratha.api.quiz.repository;

import com.connectmaratha.api.quiz.entity.QuizQuestion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, String> {

    /** [category, count], most questions first. */
    @Query(nativeQuery = true, value = "SELECT category, COUNT(*) AS count FROM quiz_questions GROUP BY category ORDER BY count DESC")
    List<Object[]> countByCategory();

    /** [difficulty, count]. */
    @Query(nativeQuery = true, value = "SELECT difficulty, COUNT(*) AS count FROM quiz_questions GROUP BY difficulty")
    List<Object[]> countByDifficulty();

    String FILTER = """
        SELECT * FROM quiz_questions
        WHERE (CAST(:category AS TEXT) IS NULL
               OR category = CAST(:category AS TEXT) OR category ILIKE CONCAT('%', CAST(:categoryLike AS TEXT), '%'))
          AND (CAST(:difficulty AS TEXT) IS NULL OR difficulty = CAST(:difficulty AS TEXT))
          AND (CAST(:type AS TEXT) IS NULL OR question_type = CAST(:type AS TEXT))
        """;

    @Query(nativeQuery = true, value = FILTER + " ORDER BY question_id ASC")
    List<QuizQuestion> filtered(@Param("category") String category, @Param("categoryLike") String categoryLike,
                                @Param("difficulty") String difficulty, @Param("type") String type);

    /** A random selection of up to `count` matching questions. */
    @Query(nativeQuery = true, value = FILTER + " ORDER BY RANDOM() LIMIT :count")
    List<QuizQuestion> random(@Param("category") String category, @Param("categoryLike") String categoryLike,
                              @Param("difficulty") String difficulty, @Param("type") String type, @Param("count") long count);

    @Query(nativeQuery = true, value = "SELECT * FROM quiz_questions WHERE category = :category ORDER BY question_id ASC LIMIT 5")
    List<QuizQuestion> firstFive(@Param("category") String category);
}
