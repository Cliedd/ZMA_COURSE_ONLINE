package com.ztf.zma.catalog.service;

import com.ztf.zma.catalog.api.*;
import com.ztf.zma.catalog.domain.*;
import com.ztf.zma.catalog.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@Service
@Transactional
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository attemptRepository;

    public QuizService(QuizRepository quizRepository,
                       QuizAttemptRepository attemptRepository) {
        this.quizRepository  = quizRepository;
        this.attemptRepository = attemptRepository;
    }

    public Quiz createOrUpdateQuiz(String lessonId, QuizRequest request) {
        Quiz quiz = quizRepository.findByLessonId(lessonId).orElse(new Quiz());
        quiz.setLessonId(lessonId);
        quiz.setTitle(request.title());
        quiz.setMode(request.mode() != null ? request.mode() : QuizMode.TRAINING);
        quiz.setPassingScore(request.passingScore() != null ? request.passingScore() : 70);

        // Clear and rebuild questions (cascade handles orphan removal)
        quiz.getQuestions().clear();

        if (request.questions() != null) {
            for (QuestionRequest qr : request.questions()) {
                QuizQuestion question = new QuizQuestion();
                question.setQuiz(quiz);
                question.setQuestionText(qr.questionText());
                question.setPositionOrder(qr.positionOrder() != null ? qr.positionOrder() : 0);

                if (qr.options() != null) {
                    for (OptionRequest or : qr.options()) {
                        QuizOption option = new QuizOption();
                        option.setQuestion(question);
                        option.setOptionText(or.optionText());
                        option.setCorrect(or.correct());
                        option.setPositionOrder(or.positionOrder() != null ? or.positionOrder() : 0);
                        question.getOptions().add(option);
                    }
                }
                quiz.getQuestions().add(question);
            }
        }
        return quizRepository.save(quiz);
    }

    @Transactional(readOnly = true)
    public Optional<Quiz> getQuizByLesson(String lessonId) {
        return quizRepository.findByLessonId(lessonId);
    }

    @Transactional(readOnly = true)
    public Quiz getQuizById(String quizId) {
        return quizRepository.findById(quizId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz introuvable"));
    }

    public void deleteQuiz(String quizId) {
        quizRepository.deleteById(quizId);
    }

    public QuizAttempt submitAttempt(String quizId, String studentEmail,
                                     SubmitAttemptRequest request) {
        Quiz quiz = getQuizById(quizId);

        // EXAM : une seule tentative autorisée
        if (quiz.getMode() == QuizMode.EXAM) {
            long count = attemptRepository.countByQuizIdAndStudentEmail(quizId, studentEmail);
            if (count > 0) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Vous avez déjà passé cet examen de passage. Une seule tentative est autorisée.");
            }
        }

        long previousAttempts = attemptRepository.countByQuizIdAndStudentEmail(quizId, studentEmail);

        // Carte questionId → optionId correct
        Map<String, String> correctOptionByQuestion = new HashMap<>();
        for (QuizQuestion q : quiz.getQuestions()) {
            for (QuizOption o : q.getOptions()) {
                if (o.isCorrect()) {
                    correctOptionByQuestion.put(q.getId(), o.getId());
                }
            }
        }

        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuizId(quizId);
        attempt.setStudentEmail(studentEmail);
        attempt.setAttemptNumber((int) previousAttempts + 1);

        int correctCount = 0;
        int totalQuestions = quiz.getQuestions().size();

        if (request.answers() != null) {
            for (AnswerRequest ar : request.answers()) {
                QuizAttemptAnswer answer = new QuizAttemptAnswer();
                answer.setAttempt(attempt);
                answer.setQuestionId(ar.questionId());
                answer.setSelectedOptionId(ar.selectedOptionId());

                String correctOpt = correctOptionByQuestion.get(ar.questionId());
                boolean isCorrect = correctOpt != null && correctOpt.equals(ar.selectedOptionId());
                answer.setCorrect(isCorrect);
                if (isCorrect) correctCount++;

                attempt.getAnswers().add(answer);
            }
        }

        int score = totalQuestions > 0
            ? (int) Math.round((double) correctCount / totalQuestions * 100)
            : 0;
        attempt.setScore(score);
        attempt.setPassed(score >= quiz.getPassingScore());

        return attemptRepository.save(attempt);
    }

    @Transactional(readOnly = true)
    public List<QuizAttempt> getStudentAttempts(String quizId, String studentEmail) {
        return attemptRepository.findByQuizIdAndStudentEmail(quizId, studentEmail);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getQuizStats(String quizId) {
        List<QuizAttempt> all = attemptRepository.findByQuizId(quizId);

        long totalAttempts = all.size();
        long passedFirst   = all.stream()
            .filter(a -> a.isPassed() && a.getAttemptNumber() == 1)
            .count();
        long failed = all.stream().filter(a -> !a.isPassed()).count();
        double avgScore = all.stream()
            .mapToInt(QuizAttempt::getScore)
            .average()
            .orElse(0.0);

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalAttempts", totalAttempts);
        stats.put("passedFirst",   passedFirst);
        stats.put("failed",        failed);
        stats.put("avgScore",      Math.round(avgScore * 10.0) / 10.0);
        return stats;
    }
}
