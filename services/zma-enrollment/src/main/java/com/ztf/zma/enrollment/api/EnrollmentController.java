package com.ztf.zma.enrollment.api;

import com.ztf.zma.enrollment.domain.Enrollment;
import com.ztf.zma.enrollment.service.EnrollmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/enrollments")
@Tag(name = "Enrollments", description = "Inscriptions et progression des étudiants")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    /** Enroll the authenticated student */
    @Operation(summary = "Inscrire l'utilisateur authentifié à un cours", description = "Idempotent : renvoie l'inscription existante si déjà inscrit.")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Enrollment enroll(@Valid @RequestBody EnrollRequest request,
                             Authentication auth) {
        String studentId = auth.getName();
        return enrollmentService.enroll(
            studentId, request.courseId(),
            request.courseTitle(), request.courseLevel());
    }

    /**
     * Internal endpoint — called by zma-payment after a successful payment.
     * Network-isolated: no JWT required (payment service is on the same Docker network).
     */
    @PostMapping("/internal/enroll")
    @ResponseStatus(HttpStatus.CREATED)
    public Enrollment internalEnroll(@RequestBody Map<String, String> body) {
        return enrollmentService.enroll(
            body.get("studentId"),
            body.get("courseId"),
            body.getOrDefault("courseTitle", ""),
            body.getOrDefault("courseLevel", "")
        );
    }

    /** Check enrollment status for the current user */
    @Operation(summary = "Vérifier le statut d'inscription de l'utilisateur authentifié à un cours")
    @GetMapping("/check")
    public Map<String, Object> check(@RequestParam String courseId,
                                     Authentication auth) {
        String studentId = auth.getName();
        boolean enrolled = enrollmentService.isEnrolled(studentId, courseId);
        String enrollmentId = enrolled
            ? enrollmentService.getEnrollmentByStudentAndCourse(studentId, courseId)
                               .map(Enrollment::getId).orElse("")
            : "";
        return Map.of("enrolled", enrolled, "enrollmentId", enrollmentId);
    }

    /** My enrollments */
    @GetMapping("/me")
    public List<Enrollment> getMyEnrollments(Authentication auth) {
        return enrollmentService.getEnrollmentsByStudent(auth.getName());
    }

    /** Teacher or admin: list all students enrolled in a course */
    @GetMapping("/course/{courseId}")
    public List<Enrollment> getByCourse(@PathVariable String courseId,
                                        Authentication auth) {
        String role = getRole(auth);
        if (!"TEACHER".equals(role) && !"ADMIN".equals(role)) {
            throw new RuntimeException("Access denied");
        }
        return enrollmentService.getEnrollmentsByCourse(courseId);
    }

    @GetMapping("/{id}")
    public Enrollment getById(@PathVariable String id, Authentication auth) {
        Enrollment e = enrollmentService.getEnrollmentById(id);
        // Students can only see their own enrollment
        if ("STUDENT".equals(getRole(auth)) && !e.getStudentId().equals(auth.getName())) {
            throw new RuntimeException("Access denied");
        }
        return e;
    }

    @Operation(summary = "Mettre à jour la progression d'une inscription",
               description = "Réservé à l'étudiant propriétaire de l'inscription (vérifié via studentId == utilisateur authentifié). Déclenche l'émission d'un certificat à 100%.")
    @PatchMapping("/{id}/progress")
    public Enrollment updateProgress(@PathVariable String id,
                                     @RequestBody Double progress,
                                     Authentication auth) {
        Enrollment e = enrollmentService.getEnrollmentById(id);
        if (!e.getStudentId().equals(auth.getName())) {
            throw new RuntimeException("Access denied");
        }
        return enrollmentService.updateProgress(id, progress);
    }

    @PatchMapping("/{id}/lessons")
    public Enrollment updateLessons(@PathVariable String id,
                                    @RequestBody Map<String, String> body,
                                    Authentication auth) {
        Enrollment e = enrollmentService.getEnrollmentById(id);
        if (!e.getStudentId().equals(auth.getName())) {
            throw new RuntimeException("Access denied");
        }
        return enrollmentService.updateCompletedLessons(id, body.get("completedLessonsJson"));
    }

    /**
     * Admin/internal: resyncs catalog studentsCount for all courses from actual enrollment data.
     * Fixes counters that were zero before the increment-on-enroll logic was added.
     */
    @PostMapping("/internal/resync-student-counts")
    public Map<String, String> resyncStudentCounts() {
        enrollmentService.resyncAllStudentCounts();
        return Map.of("status", "ok");
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unenroll(@PathVariable String id, Authentication auth) {
        Enrollment e = enrollmentService.getEnrollmentById(id);
        if ("STUDENT".equals(getRole(auth)) && !e.getStudentId().equals(auth.getName())) {
            throw new RuntimeException("Access denied");
        }
        enrollmentService.unenroll(id);
    }

    private String getRole(Authentication auth) {
        return auth.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .filter(a -> a.startsWith("ROLE_"))
            .map(a -> a.substring(5))
            .findFirst().orElse("STUDENT");
    }
}
