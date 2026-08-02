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

    // Full-text search on title + short description + description (published + not deleted),
    // additionally narrowed by department/level when provided (:department / :level are NULL
    // when not filtering — see CourseService#search) so a text search combines with the other
    // active filters (AND) instead of silently discarding them.
    @Query("""
        SELECT c FROM Course c
        WHERE c.status = com.ztf.zma.catalog.domain.CourseStatus.PUBLISHED
          AND c.deletedAt IS NULL
          AND (CAST(:department AS string) IS NULL OR LOWER(c.department) = LOWER(CAST(:department AS string)))
          AND (CAST(:level AS string) IS NULL OR LOWER(c.level) = LOWER(CAST(:level AS string)))
          AND (LOWER(c.title) LIKE LOWER(CONCAT('%',:q,'%'))
            OR LOWER(c.shortDescription) LIKE LOWER(CONCAT('%',:q,'%'))
            OR LOWER(c.description) LIKE LOWER(CONCAT('%',:q,'%')))
        """)
    Page<Course> search(@Param("q") String query,
                         @Param("department") String department,
                         @Param("level") String level,
                         Pageable pageable);

    // All courses (published + unpublished, not deleted) — for admin
    Page<Course> findByDeletedAtIsNull(Pageable pageable);

    // Legacy slug/email finders (kept for DataLoader compatibility)
    default Optional<Course> findBySlug(String slug) { return findBySlugAndDeletedAtIsNull(slug); }
    default List<Course> findByTeacherEmail(String email) { return findByTeacherEmailAndDeletedAtIsNull(email); }
}
