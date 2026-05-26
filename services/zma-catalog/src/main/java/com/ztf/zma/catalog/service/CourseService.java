package com.ztf.zma.catalog.service;

import com.ztf.zma.catalog.api.CourseRequest;
import com.ztf.zma.catalog.domain.Course;
import com.ztf.zma.catalog.domain.Review;
import com.ztf.zma.catalog.repository.CourseRepository;
import com.ztf.zma.catalog.repository.ReviewRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.text.Normalizer;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final ReviewRepository reviewRepository;

    public CourseService(CourseRepository courseRepository,
                         ReviewRepository reviewRepository) {
        this.courseRepository = courseRepository;
        this.reviewRepository = reviewRepository;
    }

    // ── Public listing ────────────────────────────────────────────────────────

    public Page<Course> listPublished(String department, String level, Pageable pageable) {
        boolean hasDept  = StringUtils.hasText(department);
        boolean hasLevel = StringUtils.hasText(level);

        if (hasDept && hasLevel)
            return courseRepository.findByPublishedAndDepartmentIgnoreCaseAndLevelIgnoreCaseAndDeletedAtIsNull(
                true, department, level, pageable);
        if (hasDept)
            return courseRepository.findByPublishedAndDepartmentIgnoreCaseAndDeletedAtIsNull(true, department, pageable);
        if (hasLevel)
            return courseRepository.findByPublishedAndLevelIgnoreCaseAndDeletedAtIsNull(true, level, pageable);
        return courseRepository.findByPublishedAndDeletedAtIsNull(true, pageable);
    }

    // ── Admin listing (all courses, including unpublished) ────────────────────

    public Page<Course> listAll(Pageable pageable) {
        return courseRepository.findByDeletedAtIsNull(pageable);
    }

    public Page<Course> search(String query, Pageable pageable) {
        return courseRepository.search(query, pageable);
    }

    // ── Single course ─────────────────────────────────────────────────────────

    public Course getCourseById(String id) {
        return courseRepository.findById(id)
            .filter(c -> !c.isDeleted())
            .orElseThrow(() -> new RuntimeException("Course not found"));
    }

    public Course getCourseBySlug(String slug) {
        return courseRepository.findBySlug(slug)
            .orElseThrow(() -> new RuntimeException("Course not found"));
    }

    public List<Course> getCoursesByTeacherEmail(String email) {
        return courseRepository.findByTeacherEmail(email);
    }

    // ── Stats ─────────────────────────────────────────────────────────────────

    public Map<String, Object> getCourseStats(String id) {
        Course course = getCourseById(id);
        long reviewCount   = reviewRepository.countByCourseId(id);
        Double avgRating   = reviewRepository.avgRatingByCourseId(id);
        return Map.of(
            "courseId",       id,
            "studentsCount",  course.getStudentsCount() != null ? course.getStudentsCount() : 0,
            "reviewCount",    reviewCount,
            "averageRating",  avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0,
            "lessonCount",    course.getLessonCount() != null ? course.getLessonCount() : 0
        );
    }

    // ── Reviews ───────────────────────────────────────────────────────────────

    public Page<Review> getReviews(String courseId, Pageable pageable) {
        getCourseById(courseId); // validate course exists
        return reviewRepository.findByCourseIdOrderByCreatedAtDesc(courseId, pageable);
    }

    @Transactional
    public Review addReview(String courseId, String studentId, int rating, String comment) {
        if (rating < 1 || rating > 5) throw new RuntimeException("Rating must be between 1 and 5");
        getCourseById(courseId); // validate course exists

        // Upsert: one review per student per course
        Review review = reviewRepository.findByCourseIdAndStudentId(courseId, studentId)
            .orElseGet(() -> {
                Review r = new Review();
                r.setCourseId(courseId);
                r.setStudentId(studentId);
                return r;
            });
        review.setRating(rating);
        review.setComment(comment);
        Review saved = reviewRepository.save(review);

        // Update denormalized rating on course
        refreshCourseRating(courseId);
        return saved;
    }

    @Transactional
    private void refreshCourseRating(String courseId) {
        Double avg = reviewRepository.avgRatingByCourseId(courseId);
        courseRepository.findById(courseId).ifPresent(c -> {
            c.setRating(avg != null ? Math.round(avg * 10.0) / 10.0 : null);
            courseRepository.save(c);
        });
    }

    // ── Write operations ──────────────────────────────────────────────────────

    @Transactional
    public Course createCourse(CourseRequest req, String teacherEmail) {
        Course course = new Course();
        course.setTeacherEmail(teacherEmail);
        course.setPublished(false);
        applyRequest(course, req);
        // Auto-generate slug if not provided or empty
        if (!StringUtils.hasText(course.getSlug())) {
            course.setSlug(generateUniqueSlug(req.title()));
        }
        return courseRepository.save(course);
    }

    @Transactional
    public Course updateCourse(String id, CourseRequest req, String callerEmail, String callerRole) {
        Course course = getCourseById(id);
        checkOwnership(course, callerEmail, callerRole);
        applyRequest(course, req);
        return courseRepository.save(course);
    }

    @Transactional
    public Course publishCourse(String id, boolean published, String callerEmail, String callerRole) {
        Course course = getCourseById(id);
        checkOwnership(course, callerEmail, callerRole);
        course.setPublished(published);
        return courseRepository.save(course);
    }

    /** Soft delete — marks deletedAt, hides from all public queries */
    @Transactional
    public void deleteCourse(String id, String callerEmail, String callerRole) {
        Course course = getCourseById(id);
        checkOwnership(course, callerEmail, callerRole);
        course.setDeletedAt(Instant.now());
        course.setPublished(false);
        courseRepository.save(course);
    }

    /** Converts a title to a URL-safe slug, unique in the DB. */
    private String generateUniqueSlug(String title) {
        if (!StringUtils.hasText(title)) title = "cours";
        // Normalize unicode → remove accents
        String normalized = Normalizer.normalize(title, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        // Lowercase, replace non-alphanum with hyphen, collapse/trim hyphens
        String base = normalized.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
        if (!StringUtils.hasText(base)) base = "cours";

        String candidate = base;
        int attempt = 0;
        while (courseRepository.findBySlug(candidate).isPresent()) {
            attempt++;
            if (attempt == 1) {
                candidate = base + "-" + UUID.randomUUID().toString().substring(0, 6);
            } else {
                candidate = base + "-" + UUID.randomUUID().toString().substring(0, 6);
            }
        }
        return candidate;
    }

    private void checkOwnership(Course course, String callerEmail, String callerRole) {
        if (!"ADMIN".equals(callerRole) && !callerEmail.equals(course.getTeacherEmail())) {
            throw new RuntimeException("Access denied");
        }
    }

    private void applyRequest(Course c, CourseRequest req) {
        if (req.title()            != null) c.setTitle(req.title());
        if (req.slug()             != null) c.setSlug(req.slug());
        if (req.description()      != null) c.setDescription(req.description());
        if (req.shortDescription() != null) c.setShortDescription(req.shortDescription());
        if (req.price()            != null) c.setPrice(req.price());
        if (req.level()            != null) c.setLevel(req.level());
        if (req.department()       != null) c.setDepartment(req.department());
        if (req.filiere()          != null) c.setFiliere(req.filiere());
        if (req.ects()             != null) c.setEcts(req.ects());
        if (req.teacherName()      != null) c.setTeacherName(req.teacherName());
        if (req.durationHours()    != null) c.setDurationHours(req.durationHours());
        if (req.gradientIndex()    != null) c.setGradientIndex(req.gradientIndex());
        if (req.skillsJson()       != null) c.setSkillsJson(req.skillsJson());
        if (req.curriculumJson()   != null) {
            c.setCurriculumJson(req.curriculumJson());
            // Recompute lessonCount from curriculumJson length estimate
            // (full parse avoided — lesson count from structured data set externally)
        }
        if (req.debouches()        != null) c.setDebouches(req.debouches());
    }
}
