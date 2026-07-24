package com.ztf.zma.catalog.api;

import com.ztf.zma.catalog.domain.Course;
import com.ztf.zma.catalog.domain.Review;
import com.ztf.zma.catalog.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    // ── Admin listing (all courses, including unpublished) ────────────────────

    @GetMapping("/admin/all")
    public Page<Course> listAllCourses(
            @RequestParam(defaultValue = "0")   int page,
            @RequestParam(defaultValue = "500") int size,
            Authentication auth) {
        String role = getRole(auth);
        if (!"ADMIN".equals(role)) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.FORBIDDEN, "Admin only");
        }
        Pageable pageable = PageRequest.of(page, Math.min(size, 500), Sort.by("title").ascending());
        return courseService.listAll(pageable);
    }

    // ── Public listing ────────────────────────────────────────────────────────

    @GetMapping
    public Page<Course> listCourses(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, Math.min(size, 100),
                                           Sort.by("title").ascending());
        if (q != null && !q.isBlank()) {
            return courseService.search(q.trim(), pageable);
        }
        return courseService.listPublished(department, level, pageable);
    }

    @GetMapping("/{id}")
    public Course getCourse(@PathVariable String id) {
        return courseService.getCourseById(id);
    }

    @GetMapping("/slug/{slug}")
    public Course getCourseBySlug(@PathVariable String slug) {
        return courseService.getCourseBySlug(slug);
    }

    @GetMapping("/teacher/{email}")
    public List<Course> getCoursesByTeacher(@PathVariable String email) {
        return courseService.getCoursesByTeacherEmail(email);
    }

    // ── Stats ─────────────────────────────────────────────────────────────────

    @GetMapping("/{id}/stats")
    public Map<String, Object> getCourseStats(@PathVariable String id) {
        return courseService.getCourseStats(id);
    }

    // ── Curriculum ────────────────────────────────────────────────────────────

    /** Returns the curriculumJson field as a raw JSON string in a wrapper */
    @GetMapping("/{id}/curriculum")
    public Map<String, Object> getCurriculum(@PathVariable String id) {
        Course course = courseService.getCourseById(id);
        return Map.of(
            "courseId",      id,
            "curriculum",    course.getCurriculumJson() != null ? course.getCurriculumJson() : "[]",
            "lessonCount",   course.getLessonCount() != null ? course.getLessonCount() : 0
        );
    }

    // ── Reviews ───────────────────────────────────────────────────────────────

    @GetMapping("/{id}/reviews")
    public Page<Review> getReviews(
            @PathVariable String id,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return courseService.getReviews(id, PageRequest.of(page, Math.min(size, 50)));
    }

    @PostMapping("/{id}/reviews")
    @ResponseStatus(HttpStatus.CREATED)
    public Review addReview(
            @PathVariable String id,
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        int rating   = ((Number) body.get("rating")).intValue();
        String comment = (String) body.getOrDefault("comment", "");
        return courseService.addReview(id, auth.getName(), rating, comment);
    }

    // ── Write (TEACHER / ADMIN) ───────────────────────────────────────────────

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Course createCourse(@Valid @RequestBody CourseRequest request,
                               Authentication auth) {
        return courseService.createCourse(request, auth.getName());
    }

    @PutMapping("/{id}")
    public Course updateCourse(@PathVariable String id,
                               @Valid @RequestBody CourseRequest request,
                               Authentication auth) {
        return courseService.updateCourse(id, request, auth.getName(), getRole(auth));
    }

    // ── Publication workflow ─────────────────────────────────────────────────

    @PostMapping("/{id}/submit")
    public Course submitCourse(@PathVariable String id, Authentication auth) {
        return courseService.submitCourse(id, auth.getName(), getRole(auth));
    }

    @PostMapping("/{id}/review/start")
    public Course startReview(@PathVariable String id, Authentication auth) {
        return courseService.startReview(id, getRole(auth));
    }

    @PostMapping("/{id}/review/approve")
    public Course approveCourse(@PathVariable String id, Authentication auth) {
        return courseService.approveCourse(id, getRole(auth));
    }

    @PostMapping("/{id}/review/reject")
    public Course rejectCourse(@PathVariable String id,
                               @RequestBody Map<String, Object> body,
                               Authentication auth) {
        String comment = (String) body.get("comment");
        return courseService.rejectCourse(id, getRole(auth), comment);
    }

    @PostMapping("/{id}/archive")
    public Course archiveCourse(@PathVariable String id, Authentication auth) {
        return courseService.archiveCourse(id, getRole(auth));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCourse(@PathVariable String id, Authentication auth) {
        courseService.deleteCourse(id, auth.getName(), getRole(auth));
    }

    // ── Internal endpoint (used by zma-payment, zma-enrollment) ──────────────

    /**
     * Returns course metadata including price — no JWT required.
     * Accessible only within the Docker network.
     */
    @GetMapping("/internal/{id}")
    public Map<String, Object> getCourseInternal(@PathVariable String id) {
        Course course = courseService.getCourseById(id);
        return Map.of(
            "id",          course.getId(),
            "title",       course.getTitle() != null ? course.getTitle() : "",
            "level",       course.getLevel() != null ? course.getLevel() : "",
            "price",       course.getPrice() != null ? course.getPrice() : 0.0,
            "lessonCount", course.getLessonCount() != null ? course.getLessonCount() : 0,
            "published",   course.getStatus() == com.ztf.zma.catalog.domain.CourseStatus.PUBLISHED
        );
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String getRole(Authentication auth) {
        return auth.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .filter(a -> a.startsWith("ROLE_"))
            .map(a -> a.substring(5))
            .findFirst()
            .orElse("STUDENT");
    }
}
