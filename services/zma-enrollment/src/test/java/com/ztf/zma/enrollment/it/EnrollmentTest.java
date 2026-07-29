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
        assertThat(created.get("studentId")).isEqualTo("student.a@zma.test");
        assertThat(created.get("courseId")).isEqualTo("c-101");
        assertThat(created.get("progress")).isEqualTo(0.0);
    }

    @Test
    void enrollmentIsIdempotentForSameStudentAndCourse() {
        Map<String, Object> first = enroll("student.dup@zma.test", "c-102", "Harmonie Jazz");
        Map<String, Object> second = enroll("student.dup@zma.test", "c-102", "Harmonie Jazz");
        assertThat(second.get("id")).isEqualTo(first.get("id"));
    }

    // ── 2. Progress tracking ────────────────────────────────────────────────

    @Test
    @SuppressWarnings("unchecked")
    void studentCanTrackProgress() {
        Map<String, Object> e = enroll("student.prog@zma.test", "c-201", "Guitare Moderne");
        String enrollmentId = (String) e.get("id");

        HttpEntity<Double> req = new HttpEntity<>(50.0, authHeaders("student.prog@zma.test", "STUDENT"));
        ResponseEntity<Map> resp = rest.exchange(
                url("/api/v1/enrollments/" + enrollmentId + "/progress"),
                HttpMethod.PATCH, req, Map.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody().get("progress")).isEqualTo(50.0);
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

    // ── 4. 100% completion ──────────────────────────────────────────────────

    @Test
    @SuppressWarnings("unchecked")
    void completionAt100PercentSetsCompletedAt() {
        Map<String, Object> e = enroll("student.cert@zma.test", "c-401", "Composition");
        String enrollmentId = (String) e.get("id");

        HttpEntity<Double> req = new HttpEntity<>(100.0, authHeaders("student.cert@zma.test", "STUDENT"));
        ResponseEntity<Map> resp = rest.exchange(
                url("/api/v1/enrollments/" + enrollmentId + "/progress"),
                HttpMethod.PATCH, req, Map.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody().get("progress")).isEqualTo(100.0);
        assertThat(resp.getBody().get("completedAt")).isNotNull();
    }

    // ── 5. Public certificate verification ────────────────────────────────

    @Test
    @SuppressWarnings("unchecked")
    void validCertificateNumberIsPubliclyVerifiableWithoutAJwt() {
        Map<String, Object> e = enroll("student.verify@zma.test", "c-501", "Piano Avancé");
        String enrollmentId = (String) e.get("id");

        HttpEntity<Double> progressReq = new HttpEntity<>(100.0, authHeaders("student.verify@zma.test", "STUDENT"));
        ResponseEntity<Map> progressResp = rest.exchange(
                url("/api/v1/enrollments/" + enrollmentId + "/progress"),
                HttpMethod.PATCH, progressReq, Map.class);
        assertThat(progressResp.getStatusCode()).isEqualTo(HttpStatus.OK);

        String studentId = (String) progressResp.getBody().get("studentId");
        java.util.List<Map<String, Object>> certs = rest.exchange(
                url("/api/v1/certificates/student/" + studentId), HttpMethod.GET,
                new HttpEntity<>(authHeaders("student.verify@zma.test", "STUDENT")),
                new org.springframework.core.ParameterizedTypeReference<java.util.List<Map<String, Object>>>() {}
        ).getBody();
        assertThat(certs).isNotEmpty();
        String certNumber = (String) certs.get(0).get("certNumber");

        // No Authorization header at all — must still succeed.
        ResponseEntity<Map> verifyResp = rest.getForEntity(
                url("/api/v1/certificates/verify/" + certNumber), Map.class);

        assertThat(verifyResp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(verifyResp.getBody().get("valid")).isEqualTo(true);
        assertThat(verifyResp.getBody().get("certNumber")).isEqualTo(certNumber);
        assertThat(verifyResp.getBody().get("courseTitle")).isEqualTo("Piano Avancé");
        assertThat(verifyResp.getBody().get("issuedAt")).isNotNull();
        // Must never leak the student's identity (email is the only identifier stored).
        assertThat(verifyResp.getBody()).doesNotContainKey("studentId");
        assertThat(verifyResp.getBody()).doesNotContainKey("id");
    }

    @Test
    void unknownCertificateNumberReturns404NotAValidFalseBody() {
        ResponseEntity<Map> resp = rest.getForEntity(
                url("/api/v1/certificates/verify/ZMA-DOESNOTEXIST"), Map.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}
