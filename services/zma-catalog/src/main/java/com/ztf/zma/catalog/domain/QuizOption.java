package com.ztf.zma.catalog.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "quiz_options")
public class QuizOption {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    @JsonIgnore
    private QuizQuestion question;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String optionText;

    private boolean correct = false;

    private int positionOrder;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public QuizQuestion getQuestion() { return question; }
    public void setQuestion(QuizQuestion question) { this.question = question; }
    public String getOptionText() { return optionText; }
    public void setOptionText(String optionText) { this.optionText = optionText; }
    public boolean isCorrect() { return correct; }
    public void setCorrect(boolean correct) { this.correct = correct; }
    public int getPositionOrder() { return positionOrder; }
    public void setPositionOrder(int positionOrder) { this.positionOrder = positionOrder; }
}
