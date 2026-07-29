package com.ztf.zma.catalog.repository;

import com.ztf.zma.catalog.domain.Course;
import com.ztf.zma.catalog.domain.CourseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, String> {
    Optional<Course> findBySlugAndDeletedAtIsNull(String slug);
    List<Course>     findByTeacherEmailAndDeletedAtIsNull(String teacherEmail);
    boolean          existsBySlug(String slug);

    // Paginated + filtered public listing (published + not deleted)
    Page<Course> findByStatusAndDeletedAtIsNull(CourseStatus status, Pageable pageable);

    Page<Course> findByStatusAndDepartmentIgnoreCaseAndDeletedAtIsNull(
        CourseStatus status, String department, Pageable pageable);

    Page<Course> findByStatusAndLevelIgnoreCaseAndDeletedAtIsNull(
        CourseStatus status, String level, Pageable pageable);

    Page<Course> findByStatusAndDepartmentIgnoreCaseAndLevelIgnoreCaseAndDeletedAtIsNull(
        CourseStatus status, String department, String level, Pageable pageable);

    // Full-text search on title + short description + description (published + not deleted)
    @Query("""
        SELECT c FROM Course c
        WHERE c.status = com.ztf.zma.catalog.domain.CourseStatus.PUBLISHED
          AND c.deletedAt IS NULL
          AND (LOWER(c.title) LIKE LOWER(CONCAT('%',:q,'%'))
            OR LOWER(c.shortDescription) LIKE LOWER(CONCAT('%',:q,'%'))
            OR LOWER(c.description) LIKE LOWER(CONCAT('%',:q,'%')))
        """)
    Page<Course> search(@Param("q") String query, Pageable pageable);

    // All courses (published + unpublished, not deleted) — for admin
    Page<Course> findByDeletedAtIsNull(Pageable pageable);

    // Legacy slug/email finders (kept for DataLoader compatibility)
    default Optional<Course> findBySlug(String slug) { return findBySlugAndDeletedAtIsNull(slug); }
    default List<Course> findByTeacherEmail(String email) { return findByTeacherEmailAndDeletedAtIsNull(email); }
}
