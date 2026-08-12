package com.ztf.zma.catalog.repository;

import com.ztf.zma.catalog.domain.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface QuizRepository extends JpaRepository<Quiz, String> {
    Optional<Quiz> findByLessonId(String lessonId);
}
