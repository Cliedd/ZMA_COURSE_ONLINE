package com.ztf.zma.catalog.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ztf.zma.catalog.api.CourseRequest;
import com.ztf.zma.catalog.domain.Course;
import com.ztf.zma.catalog.domain.CourseStatus;
import com.ztf.zma.catalog.domain.Review;
import com.ztf.zma.catalog.infrastructure.CommunityClient;
import com.ztf.zma.catalog.repository.CourseRepository;
import com.ztf.zma.catalog.repository.ReviewRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.text.Normalizer;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final ReviewRepository reviewRepository;
    private final CommunityClient communityClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public CourseService(CourseRepository courseRepository,
                         ReviewRepository reviewRepository,
                         CommunityClient communityClient) {
        this.courseRepository = courseRepository;
        this.reviewRepository = reviewRepository;
        this.communityClient  = communityClient;
    }

    // ── Public listing ────────────────────────────────────────────────────────

    public Page<Course> listPublished(String department, String level, Pageable pageable) {
        boolean hasDept  = StringUtils.hasText(department);
        boolean hasLevel = StringUtils.hasText(level);

        if (hasDept && hasLevel)
            return courseRepository.findByStatusAndDepartmentIgnoreCaseAndLevelIgnoreCaseAndDeletedAtIsNull(
                CourseStatus.PUBLISHED, department, level, pageable);
        if (hasDept)
            return courseRepository.findByStatusAndDepartmentIgnoreCaseAndDeletedAtIsNull(
                CourseStatus.PUBLISHED, department, pageable);
        if (hasLevel)
            return courseRepository.findByStatusAndLevelIgnoreCaseAndDeletedAtIsNull(
                CourseStatus.PUBLISHED, level, pageable);
        return courseRepository.findByStatusAndDeletedAtIsNull(CourseStatus.PUBLISHED, pageable);
    }

    // ── Admin listing (all courses, including unpublished) ────────────────────

    public Page<Course> listAll(Pageable pageable) {
        return courseRepository.findByDeletedAtIsNull(pageable);
    }

    public Page<Course> search(String query, String department, String level, Pageable pageable) {
        // Text search must combine (AND) with department/level when they're also active —
        // pass null rather than "" so the repository's "(:x IS NULL OR ...)" clause is a no-op.
        String dept = StringUtils.hasText(department) ? department : null;
        String lvl  = StringUtils.hasText(level) ? level : null;
        return courseRepository.search(query, dept, lvl, pageable);
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

    // ── Preview lessons ──────────────────────────────────────────────────────

    /**
     * Returns the free-to-preview lesson titles for a course, before purchase.
     *
     * The domain model has no explicit "free lesson" flag on curriculum entries
     * (curriculumJson lessons are plain strings), so the chosen convention is:
     * the first lesson title of each section is free to preview. This mirrors
     * the common "preview the intro of every module" pattern used by course
     * marketplaces and requires no schema change.
     */
    public List<Map<String, String>> getPreviewLessons(String courseId) {
        Course course = getCourseById(courseId); // 404 if unknown/deleted
        List<Map<String, String>> preview = new ArrayList<>();
        String json = course.getCurriculumJson();
        if (!StringUtils.hasText(json)) {
            return preview;
        }
        try {
            JsonNode sections = objectMapper.readTree(json);
            if (!sections.isArray()) return preview;
            for (JsonNode section : sections) {
                String sectionTitle = section.path("title").asText("");
                JsonNode lessons = section.path("lessons");
                if (lessons.isArray() && !lessons.isEmpty()) {
                    JsonNode firstLesson = lessons.get(0);
                    String lessonTitle = firstLesson.isTextual()
                        ? firstLesson.asText()
                        : firstLesson.path("title").asText("");
                    if (StringUtils.hasText(lessonTitle)) {
                        Map<String, String> entry = new java.util.LinkedHashMap<>();
                        entry.put("sectionTitle", sectionTitle);
                        entry.put("lessonTitle", lessonTitle);
                        preview.add(entry);
                    }
                }
            }
        } catch (Exception e) {
            // Malformed curriculumJson — treat as no preview lessons rather than failing the request.
            return new ArrayList<>();
        }
        return preview;
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
        course.setStatus(CourseStatus.DRAFT);
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
        // R10: any substantial change to a published course sends it back for re-review
        if (course.getStatus() == CourseStatus.PUBLISHED) {
            course.setStatus(CourseStatus.REVISION_NEEDED);
        }
        applyRequest(course, req);
        return courseRepository.save(course);
    }

    @Transactional
    public Course publishCourse(String id, boolean published, String callerEmail, String callerRole) {
        Course course = getCourseById(id);
        checkOwnership(course, callerEmail, callerRole);
        course.setStatus(published ? CourseStatus.PUBLISHED : CourseStatus.DRAFT);
        return courseRepository.save(course);
    }

    // ── Publication workflow ─────────────────────────────────────────────────

    /** Teacher submits a DRAFT or REVISION_NEEDED course for admin review. */
    @Transactional
    public Course submitCourse(String id, String callerEmail, String callerRole) {
        Course course = getCourseById(id);
        checkOwnership(course, callerEmail, callerRole);
        requireStatus(course, "submit", CourseStatus.DRAFT, CourseStatus.REVISION_NEEDED);
        course.setStatus(CourseStatus.SUBMITTED);
        course.setReviewComment(null);
        return courseRepository.save(course);
    }

    /** Admin claims a SUBMITTED course to begin reviewing it. */
    @Transactional
    public Course startReview(String id, String callerRole) {
        requireAdmin(callerRole);
        Course course = getCourseById(id);
        requireStatus(course, "start review on", CourseStatus.SUBMITTED);
        course.setStatus(CourseStatus.IN_REVIEW);
        return courseRepository.save(course);
    }

    /** Admin approves an IN_REVIEW course — it becomes visible in the public catalog. */
    @Transactional
    public Course approveCourse(String id, String callerRole) {
        requireAdmin(callerRole);
        Course course = getCourseById(id);
        requireStatus(course, "approve", CourseStatus.IN_REVIEW);
        course.setStatus(CourseStatus.PUBLISHED);
        course.setReviewComment(null);
        Course saved = courseRepository.save(course);
        // Créer automatiquement le canal de chat du cours (fire-and-forget)
        communityClient.createChatRoom(saved.getId(), saved.getTitle(), saved.getTeacherEmail());
        return saved;
    }

    /** Admin rejects an IN_REVIEW course, sending it back to the teacher with feedback. */
    @Transactional
    public Course rejectCourse(String id, String callerRole, String comment) {
        requireAdmin(callerRole);
        if (!StringUtils.hasText(comment)) {
            throw new RuntimeException("A comment is required to reject a course");
        }
        Course course = getCourseById(id);
        requireStatus(course, "reject", CourseStatus.IN_REVIEW);
        course.setStatus(CourseStatus.REVISION_NEEDED);
        course.setReviewComment(comment);
        return courseRepository.save(course);
    }

    /** Admin archives a PUBLISHED course — removed from the catalog, existing buyers keep access. */
    @Transactional
    public Course archiveCourse(String id, String callerRole) {
        requireAdmin(callerRole);
        Course course = getCourseById(id);
        requireStatus(course, "archive", CourseStatus.PUBLISHED);
        course.setStatus(CourseStatus.ARCHIVED);
        return courseRepository.save(course);
    }

    /** Soft delete — marks deletedAt, hides from all public queries */
    @Transactional
    public void deleteCourse(String id, String callerEmail, String callerRole) {
        Course course = getCourseById(id);
        checkOwnership(course, callerEmail, callerRole);
        course.setDeletedAt(Instant.now());
        courseRepository.save(course);
    }

    /** Converts a title to a URL-safe slug, unique in the DB. */
    private String generateUniqueSlug(String title) {
        if (!StringUtils.hasText(title)) title = "course";
        // Normalize unicode → remove accents
        String normalized = Normalizer.normalize(title, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        // Lowercase, replace non-alphanum with hyphen, collapse/trim hyphens
        String base = normalized.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
        if (!StringUtils.hasText(base)) base = "course";

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

    private void requireAdmin(String callerRole) {
        if (!"ADMIN".equals(callerRole)) {
            throw new RuntimeException("Access denied");
        }
    }

    private void requireStatus(Course course, String action, CourseStatus... allowed) {
        for (CourseStatus s : allowed) {
            if (course.getStatus() == s) return;
        }
        throw new RuntimeException("Cannot " + action + " a course in status " + course.getStatus());
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
        if (req.thumbnailUrl()     != null) c.setThumbnailUrl(req.thumbnailUrl());
    }
}
