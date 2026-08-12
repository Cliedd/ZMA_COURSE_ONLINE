package com.ztf.zma.catalog.api;

import com.ztf.zma.catalog.domain.Quiz;
import com.ztf.zma.catalog.domain.QuizAttempt;
import com.ztf.zma.catalog.domain.QuizOption;
import com.ztf.zma.catalog.domain.QuizQuestion;
import com.ztf.zma.catalog.service.QuizService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/quizzes")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    /** Enseignant : créer ou mettre à jour le quiz d'une leçon */
    @PostMapping("/lesson/{lessonId}")
    @ResponseStatus(HttpStatus.CREATED)
    public Quiz createOrUpdateQuiz(@PathVariable String lessonId,
                                   @RequestBody QuizRequest request,
                                   Authentication auth) {
        requireTeacher(auth);
        return quizService.createOrUpdateQuiz(lessonId, request);
    }

    /** Enseignant : supprimer un quiz */
    @DeleteMapping("/{quizId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteQuiz(@PathVariable String quizId, Authentication auth) {
        requireTeacher(auth);
        quizService.deleteQuiz(quizId);
    }

    /** Enseignant : statistiques d'un quiz */
    @GetMapping("/{quizId}/stats")
    public Map<String, Object> getQuizStats(@PathVariable String quizId, Authentication auth) {
        requireTeacher(auth);
        return quizService.getQuizStats(quizId);
    }

    /**
     * Authentifié : récupère le quiz d'une leçon.
     * Les bonnes réponses sont masquées pour les étudiants.
     */
    @GetMapping("/lesson/{lessonId}")
    public Optional<Quiz> getQuizByLesson(@PathVariable String lessonId, Authentication auth) {
        Optional<Quiz> quizOpt = quizService.getQuizByLesson(lessonId);
        boolean isTeacher = hasRole(auth, "TEACHER") || hasRole(auth, "ADMIN");
        if (!isTeacher) {
            quizOpt.ifPresent(quiz -> {
                for (QuizQuestion q : quiz.getQuestions()) {
                    for (QuizOption o : q.getOptions()) {
                        o.setCorrect(false); // Masquer les bonnes réponses
                    }
                }
            });
        }
        return quizOpt;
    }

    /** Étudiant : soumettre une tentative */
    @PostMapping("/{quizId}/attempts")
    @ResponseStatus(HttpStatus.CREATED)
    public QuizAttempt submitAttempt(@PathVariable String quizId,
                                     @RequestBody SubmitAttemptRequest request,
                                     Authentication auth) {
        return quizService.submitAttempt(quizId, auth.getName(), request);
    }

    /** Étudiant : récupérer ses tentatives pour un quiz */
    @GetMapping("/{quizId}/attempts/me")
    public List<QuizAttempt> getMyAttempts(@PathVariable String quizId,
                                            Authentication auth) {
        return quizService.getStudentAttempts(quizId, auth.getName());
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private void requireTeacher(Authentication auth) {
        if (!hasRole(auth, "TEACHER") && !hasRole(auth, "ADMIN")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Réservé aux enseignants");
        }
    }

    private boolean hasRole(Authentication auth, String role) {
        return auth != null && auth.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .anyMatch(a -> a.equals("ROLE_" + role));
    }
}
