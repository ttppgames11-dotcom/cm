package com.connectmaratha.api.quiz.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A quiz result for the leaderboard (table quiz_submissions). */
@Entity
@Table(name = "quiz_submissions")
public class QuizSubmission {

    @Id private String id;
    @Column(name = "candidate_name", nullable = false) private String candidateName;
    private String city;
    private String category;
    private Integer score;
    private Integer total;
    private Integer percentage;
    private Integer points;
    private Integer streak;
    @Column(name = "rank_title") private String rankTitle;
    @Column(name = "created_at") private String createdAt;
    @Column(name = "member_id") private String memberId;

    public String getId() { return id; }
    public String getCandidateName() { return candidateName; }
    public String getCity() { return city; }
    public String getCategory() { return category; }
    public Integer getScore() { return score; }
    public Integer getTotal() { return total; }
    public Integer getPercentage() { return percentage; }
    public Integer getPoints() { return points; }
    public Integer getStreak() { return streak; }
    public String getRankTitle() { return rankTitle; }
    public String getCreatedAt() { return createdAt; }
    public String getMemberId() { return memberId; }
}
