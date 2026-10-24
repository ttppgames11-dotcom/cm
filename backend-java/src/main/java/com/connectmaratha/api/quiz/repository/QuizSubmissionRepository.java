package com.connectmaratha.api.quiz.repository;

import com.connectmaratha.api.quiz.entity.QuizSubmission;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface QuizSubmissionRepository extends JpaRepository<QuizSubmission, String> {

    @Query(nativeQuery = true, value = "SELECT * FROM quiz_submissions ORDER BY points DESC, created_at DESC LIMIT 20")
    List<QuizSubmission> top20();

    /** Numbers arrive as the client sent them and PostgreSQL converts them, as with Node. */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(nativeQuery = true, value = """
        INSERT INTO quiz_submissions (id, candidate_name, city, category, score, total, percentage, points, streak, rank_title, created_at)
        VALUES (:id, :name, :city, :category, CAST(:score AS INTEGER), CAST(:total AS INTEGER), CAST(:percentage AS INTEGER),
                CAST(:points AS INTEGER), CAST(:streak AS INTEGER), :rankTitle, to_char(now(), 'YYYY-MM-DD HH24:MI:SS'))""")
    void insertSubmission(@Param("id") String id, @Param("name") String name, @Param("city") String city,
                          @Param("category") String category, @Param("score") String score, @Param("total") String total,
                          @Param("percentage") String percentage, @Param("points") String points,
                          @Param("streak") String streak, @Param("rankTitle") String rankTitle);
}
