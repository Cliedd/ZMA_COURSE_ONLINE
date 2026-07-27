package com.ztf.zma.enrollment.it;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Real integration tests for zma-enrollment, backed by H2 (PostgreSQL mode).
 */
@ActiveProfiles("test")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class EnrollmentTest {

    @LocalServerPort
    int port;

    @Autowired
    TestRestTemplate rest;

    private String url(String path) {
        return "http://localhost:" + port + path;
    }

    private HttpHeaders authHeaders(String email, String role) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(TestJwt.token(email, role));
        return headers;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> enroll(String studentEmail, String courseId, String courseTitle) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("courseId", courseId);
        body.put("courseTitle", courseTitle);
        HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, authHeaders(studentEmail, "STUDENT"));
        ResponseEntity<Map> resp = rest.postForEntity(url("/api/v1/enrollments"), req, Map.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        return resp.getBody();
    }

    // ── 1. Student enrollment ───────────────────────────────────────────────

    @Test
    void studentCanEnrollInCourse() {
        Map<String, Object> created = enroll("student.a@zma.test", "c-101", "Solfège Débutant");
        assertThat(created.get("studentEmail")).isEqualTo("student.a@zma.test");
        assertThat(created.get("courseId")).isEqualTo("c-101");
        assertThat(created.get("progressPercentage")).isEqualTo(0.0);
        assertThat(created.get("completed")).isEqualTo(false);
    }

    @Test
    void duplicateEnrollmentIsRejected() {
        enroll("student.dup@zma.test", "c-102", "Harmonie Jazz");
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("courseId", "c-102");
        body.put("courseTitle", "Harmonie Jazz");
        HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, authHeaders("student.dup@zma.test", "STUDENT"));
        ResponseEntity<Map> second = rest.postForEntity(url("/api/v1/enrollments"), req, Map.class);
        assertThat(second.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    // ── 2. Progress tracking & lesson completion ────────────────────────────

    @Test
    @SuppressWarnings("unchecked")
    void studentCanMarkLessonsCompleteAndTrackProgress() {
        Map<String, Object> e = enroll("student.prog@zma.test", "c-201", "Guitare Moderne");
        String enrollmentId = (String) e.get("id");

        Map<String, Object> completeBody = new LinkedHashMap<>();
        completeBody.put("lessonId", "les-1");
        completeBody.put("totalCourseLessons", 4);
        HttpEntity<Map<String, Object>> req = new HttpEntity<>(completeBody, authHeaders("student.prog@zma.test", "STUDENT"));

        ResponseEntity<Map> resp = rest.exchange(
                url("/api/v1/enrollments/" + enrollmentId + "/complete-lesson"),
                HttpMethod.POST, req, Map.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody().get("progressPercentage")).isEqualTo(25.0);
        List<String> completed = (List<String>) resp.getBody().get("completedLessonIds");
        assertThat(completed).contains("les-1");
    }

    // ── 3. Isolation: student cannot view another's enrollment ───────────────

    @Test
    void studentCannotAccessSomeoneElsesEnrollment() {
        Map<String, Object> e = enroll("owner.student@zma.test", "c-301", "Chant");
        String enrollmentId = (String) e.get("id");

        HttpEntity<Void> req = new HttpEntity<>(authHeaders("intrus.student@zma.test", "STUDENT"));
        ResponseEntity<Map> resp = rest.exchange(
                url("/api/v1/enrollments/" + enrollmentId), HttpMethod.GET, req, Map.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    // ── 4. Certificate generation ───────────────────────────────────────────

    @Test
    @SuppressWarnings("unchecked")
    void certificateGeneratedWhenCourse100PercentComplete() {
        Map<String, Object> e = enroll("student.cert@zma.test", "c-401", "Composition");
        String enrollmentId = (String) e.get("id");

        Map<String, Object> completeBody = new LinkedHashMap<>();
        completeBody.put("lessonId", "les-final");
        completeBody.put("totalCourseLessons", 1);
        HttpEntity<Map<String, Object>> req = new HttpEntity<>(completeBody, authHeaders("student.cert@zma.test", "STUDENT"));

        ResponseEntity<Map> resp = rest.exchange(
                url("/api/v1/enrollments/" + enrollmentId + "/complete-lesson"),
                HttpMethod.POST, req, Map.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody().get("completed")).isEqualTo(true);
        assertThat(resp.getBody().get("certificateUrl")).isNotNull();

        // Download certificate
        HttpEntity<Void> getCert = new HttpEntity<>(authHeaders("student.cert@zma.test", "STUDENT"));
        ResponseEntity<Map> certResp = rest.exchange(
                url("/api/v1/enrollments/" + enrollmentId + "/certificate"), HttpMethod.GET, getCert, Map.class);
        assertThat(certResp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(certResp.getBody().get("studentName")).isEqualTo("student.cert@zma.test");
    }
}
