package com.connectmaratha.api.quiz.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A Maratha-history quiz question (table quiz_questions). */
@Entity
@Table(name = "quiz_questions")
public class QuizQuestion {

    @Id @Column(name = "question_id") private String questionId;
    private String language;
    @Column(nullable = false) private String category;
    @Column(name = "sub_category") private String subCategory;
    @Column(nullable = false) private String difficulty;
    @Column(name = "question_type", nullable = false) private String questionType;
    @Column(nullable = false) private String question;
    @Column(name = "option_a", nullable = false) private String optionA;
    @Column(name = "option_b", nullable = false) private String optionB;
    @Column(name = "option_c", nullable = false) private String optionC;
    @Column(name = "option_d", nullable = false) private String optionD;
    @Column(name = "correct_answer", nullable = false) private String correctAnswer;
    @Column(nullable = false) private String explanation;
    @Column(name = "historical_period") private String historicalPeriod;
    private String person;
    private String fort;
    private String battle;
    private Integer year;
    private String source;
    @Column(name = "source_url") private String sourceUrl;
    @Column(name = "verification_status") private String verificationStatus;
    @Column(name = "created_at") private String createdAt;

    public String getQuestionId() { return questionId; }
    public String getLanguage() { return language; }
    public String getCategory() { return category; }
    public String getSubCategory() { return subCategory; }
    public String getDifficulty() { return difficulty; }
    public String getQuestionType() { return questionType; }
    public String getQuestion() { return question; }
    public String getOptionA() { return optionA; }
    public String getOptionB() { return optionB; }
    public String getOptionC() { return optionC; }
    public String getOptionD() { return optionD; }
    public String getCorrectAnswer() { return correctAnswer; }
    public String getExplanation() { return explanation; }
    public String getHistoricalPeriod() { return historicalPeriod; }
    public String getPerson() { return person; }
    public String getFort() { return fort; }
    public String getBattle() { return battle; }
    public Integer getYear() { return year; }
    public String getSource() { return source; }
    public String getSourceUrl() { return sourceUrl; }
    public String getVerificationStatus() { return verificationStatus; }
    public String getCreatedAt() { return createdAt; }
}
