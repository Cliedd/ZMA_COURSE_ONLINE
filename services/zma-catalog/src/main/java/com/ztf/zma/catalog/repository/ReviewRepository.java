package com.ztf.zma.catalog.repository;

import com.ztf.zma.catalog.domain.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, String> {
    Page<Review> findByCourseIdOrderByCreatedAtDesc(String courseId, Pageable pageable);
    Optional<Review> findByCourseIdAndStudentId(String courseId, String studentId);
    long countByCourseId(String courseId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.courseId = :courseId")
    Double avgRatingByCourseId(@Param("courseId") String courseId);
}
