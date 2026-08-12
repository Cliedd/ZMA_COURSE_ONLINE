package com.ztf.zma.catalog.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quiz_attempts")
public class QuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String quizId;

    @Column(nullable = false)
    private String studentEmail;

    /** Score de 0 à 100 */
    private int score;

    private boolean passed;

    /** Numéro de la tentative (commence à 1) */
    private int attemptNumber;

    private LocalDateTime completedAt;

    @OneToMany(mappedBy = "attempt", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuizAttemptAnswer> answers = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (completedAt == null) completedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getQuizId() { return quizId; }
    public void setQuizId(String quizId) { this.quizId = quizId; }
    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }
    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }
    public boolean isPassed() { return passed; }
    public void setPassed(boolean passed) { this.passed = passed; }
    public int getAttemptNumber() { return attemptNumber; }
    public void setAttemptNumber(int attemptNumber) { this.attemptNumber = attemptNumber; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    public List<QuizAttemptAnswer> getAnswers() { return answers; }
    public void setAnswers(List<QuizAttemptAnswer> answers) { this.answers = answers; }
}
