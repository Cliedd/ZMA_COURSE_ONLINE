package com.ztf.zma.catalog.repository;

import com.ztf.zma.catalog.domain.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, String> {
    List<QuizAttempt> findByQuizIdAndStudentEmail(String quizId, String studentEmail);
    long countByQuizIdAndStudentEmail(String quizId, String studentEmail);
    List<QuizAttempt> findByQuizIdIn(List<String> quizIds);
    List<QuizAttempt> findByQuizId(String quizId);
}
