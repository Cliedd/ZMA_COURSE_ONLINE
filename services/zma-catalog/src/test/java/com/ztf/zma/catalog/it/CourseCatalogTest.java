package com.ztf.zma.catalog.it;

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
 * Real integration tests for zma-catalog, backed by H2 (PostgreSQL mode).
 */
@ActiveProfiles("test")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class CourseCatalogTest {

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

    private Map<String, Object> courseBody(String title, String department, String level) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("title", title);
        body.put("description", "Description de " + title);
        body.put("shortDescription", "Court résumé");
        body.put("price", 100.0);
        body.put("level", level);
        body.put("department", department);
        body.put("teacherName", "Prof. Test");
        return body;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> createCourse(String teacherEmail, String title, String department, String level) {
        HttpEntity<Map<String, Object>> req = new HttpEntity<>(courseBody(title, department, level),
                authHeaders(teacherEmail, "TEACHER"));
        ResponseEntity<Map> resp = rest.postForEntity(url("/api/v1/courses"), req, Map.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        return resp.getBody();
    }

    // ── 1. Creation by a teacher ────────────────────────────────────────────

    @Test
    void teacherCanCreateOwnCourse() {
        Map<String, Object> created = createCourse("teacher.a@zma.test", "Cours de Piano Avancé", "Musique", "Licence");
        assertThat(created.get("teacherEmail")).isEqualTo("teacher.a@zma.test");
        assertThat(created.get("published")).isEqualTo(false);
    }

    // ── 2. Ownership enforcement: another teacher cannot modify ────────────

    @Test
    void anotherTeacherCannotUpdateSomeoneElsesCourse() {
        Map<String, Object> created = createCourse("owner@zma.test", "Cours Protégé", "Musique", "Licence");
        String id = (String) created.get("id");

        Map<String, Object> updateBody = courseBody("Titre Modifié Sans Droit", "Musique", "Licence");
        HttpEntity<Map<String, Object>> req = new HttpEntity<>(updateBody, authHeaders("intrus@zma.test", "TEACHER"));
        ResponseEntity<Map> resp = rest.exchange(url("/api/v1/courses/" + id), HttpMethod.PUT, req, Map.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void anotherTeacherCannotDeleteSomeoneElsesCourse() {
        Map<String, Object> created = createCourse("owner2@zma.test", "Cours Protégé 2", "Musique", "Licence");
        String id = (String) created.get("id");

        HttpEntity<Void> req = new HttpEntity<>(authHeaders("intrus2@zma.test", "TEACHER"));
        ResponseEntity<Map> resp = rest.exchange(url("/api/v1/courses/" + id), HttpMethod.DELETE, req, Map.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void ownerCanUpdateAndPublishOwnCourse() {
        Map<String, Object> created = createCourse("owner3@zma.test", "Cours Éditable", "Musique", "Licence");
        String id = (String) created.get("id");

        Map<String, Object> updateBody = courseBody("Cours Éditable — Titre Mis à Jour", "Musique", "Licence");
        HttpEntity<Map<String, Object>> updateReq = new HttpEntity<>(updateBody, authHeaders("owner3@zma.test", "TEACHER"));
        ResponseEntity<Map> updateResp = rest.exchange(url("/api/v1/courses/" + id), HttpMethod.PUT, updateReq, Map.class);
        assertThat(updateResp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(updateResp.getBody().get("title")).isEqualTo("Cours Éditable — Titre Mis à Jour");

        HttpEntity<Void> publishReq = new HttpEntity<>(authHeaders("owner3@zma.test", "TEACHER"));
        ResponseEntity<Map> publishResp = rest.exchange(
                url("/api/v1/courses/" + id + "/publish?published=true"), HttpMethod.PATCH, publishReq, Map.class);
        assertThat(publishResp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(publishResp.getBody().get("published")).isEqualTo(true);
    }

    @Test
    void adminCanUpdateAnyonesCourse() {
        Map<String, Object> created = createCourse("owner4@zma.test", "Cours Admin Override", "Musique", "Licence");
        String id = (String) created.get("id");

        Map<String, Object> updateBody = courseBody("Modifié par un Admin", "Musique", "Licence");
        HttpEntity<Map<String, Object>> req = new HttpEntity<>(updateBody, authHeaders("admin@zma.test", "ADMIN"));
        ResponseEntity<Map> resp = rest.exchange(url("/api/v1/courses/" + id), HttpMethod.PUT, req, Map.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    // ── 3. Search / filter by department and level, pagination ─────────────

    @Test
    @SuppressWarnings("unchecked")
    void listingFiltersByDepartmentAndLevelAndPaginates() {
        // Create + publish a batch of distinct courses.
        for (int i = 0; i < 3; i++) {
            Map<String, Object> c = createCourse("filter.teacher@zma.test",
                    "Cours Filtrage " + i, "Jazz", "Master");
            publish((String) c.get("id"), "filter.teacher@zma.test");
        }
        for (int i = 0; i < 2; i++) {
            Map<String, Object> c = createCourse("filter.teacher@zma.test",
                    "Cours Autre " + i, "Classique", "Licence");
            publish((String) c.get("id"), "filter.teacher@zma.test");
        }

        ResponseEntity<Map> filtered = rest.getForEntity(
                url("/api/v1/courses?department=Jazz&level=Master&page=0&size=20"), Map.class);
        assertThat(filtered.getStatusCode()).isEqualTo(HttpStatus.OK);
        List<Map<String, Object>> content = (List<Map<String, Object>>) filtered.getBody().get("content");
        assertThat(content).allSatisfy(c -> {
            assertThat(c.get("department")).isEqualTo("Jazz");
            assertThat(c.get("level")).isEqualTo("Master");
        });
        assertThat(content.size()).isGreaterThanOrEqualTo(3);

        // Pagination: page size 1 returns exactly one item and correct metadata.
        ResponseEntity<Map> page0 = rest.getForEntity(
                url("/api/v1/courses?department=Jazz&level=Master&page=0&size=1"), Map.class);
        List<Map<String, Object>> page0Content = (List<Map<String, Object>>) page0.getBody().get("content");
        assertThat(page0Content).hasSize(1);
        assertThat(page0.getBody().get("totalElements")).isEqualTo(3);
    }

    private void publish(String courseId, String teacherEmail) {
        HttpEntity<Void> req = new HttpEntity<>(authHeaders(teacherEmail, "TEACHER"));
        ResponseEntity<Map> resp = rest.exchange(
                url("/api/v1/courses/" + courseId + "/publish?published=true"), HttpMethod.PATCH, req, Map.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    // ── 4. Admin listing endpoint restricted to ADMIN ───────────────────────

    @Test
    void adminAllEndpointRejectsNonAdmin() {
        HttpEntity<Void> req = new HttpEntity<>(authHeaders("teacher@zma.test", "TEACHER"));
        ResponseEntity<String> resp = rest.exchange(
                url("/api/v1/courses/admin/all"), HttpMethod.GET, req, String.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void adminAllEndpointAllowsAdmin() {
        createCourse("teacherx@zma.test", "Cours Visible Admin", "Musique", "Licence");
        HttpEntity<Void> req = new HttpEntity<>(authHeaders("root-admin@zma.test", "ADMIN"));
        ResponseEntity<Map> resp = rest.exchange(
                url("/api/v1/courses/admin/all"), HttpMethod.GET, req, Map.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    // ── 5. Full-text search (title / description / shortDescription) ───────

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> searchContent(String q) {
        ResponseEntity<Map> resp = rest.getForEntity(
                url("/api/v1/courses?q=" + q + "&page=0&size=50"), Map.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        return (List<Map<String, Object>>) resp.getBody().get("content");
    }

    @Test
    void searchMatchesOnTitleCaseInsensitively() {
        Map<String, Object> created = createCourse("search.teacher@zma.test",
                "Improvisation Jazz Avancée", "Jazz", "Master");
        publish((String) created.get("id"), "search.teacher@zma.test");

        List<Map<String, Object>> results = searchContent("improvisation");
        assertThat(results).extracting(c -> c.get("title"))
                .contains("Improvisation Jazz Avancée");
    }

    @Test
    void searchMatchesOnDescription() {
        Map<String, Object> body = courseBody("Cours Harmonie Contemporaine", "Musique", "Licence");
        body.put("description", "Une exploration unique de la polytonalité expérimentale.");
        HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, authHeaders("search.teacher2@zma.test", "TEACHER"));
        ResponseEntity<Map> createResp = rest.postForEntity(url("/api/v1/courses"), req, Map.class);
        assertThat(createResp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        publish((String) createResp.getBody().get("id"), "search.teacher2@zma.test");

        List<Map<String, Object>> results = searchContent("polytonalité");
        assertThat(results).extracting(c -> c.get("title"))
                .contains("Cours Harmonie Contemporaine");
    }

    @Test
    void searchOnlyReturnsPublishedCourses() {
        // Not published — must not appear in search results.
        createCourse("search.teacher3@zma.test", "Cours Brouillon Introuvable Xyz", "Musique", "Licence");

        List<Map<String, Object>> results = searchContent("IntrouvableXyz");
        assertThat(results).isEmpty();
    }

    @Test
    void blankQueryFallsBackToUnfilteredListing() {
        Map<String, Object> created = createCourse("search.teacher4@zma.test",
                "Cours Requête Vide", "Musique", "Licence");
        publish((String) created.get("id"), "search.teacher4@zma.test");

        ResponseEntity<Map> resp = rest.getForEntity(
                url("/api/v1/courses?q=&page=0&size=50"), Map.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        List<Map<String, Object>> content = (List<Map<String, Object>>) resp.getBody().get("content");
        assertThat(content).extracting(c -> c.get("title")).contains("Cours Requête Vide");
    }

    @Test
    @SuppressWarnings("unchecked")
    void searchCombinesWithDepartmentAndLevelInsteadOfDroppingThem() {
        // Regression test: the search branch of the controller used to ignore department/level
        // entirely once `q` was set, so a text search silently widened the result set instead
        // of narrowing it — the department/level filter appeared to "disappear" client-side.
        Map<String, Object> matching = createCourse("combo.teacher@zma.test",
                "Improvisation Modale Avancée", "Jazz", "Master");
        publish((String) matching.get("id"), "combo.teacher@zma.test");

        // Same search term, but a different department/level — must NOT match once filtered.
        Map<String, Object> sameTextWrongDept = createCourse("combo.teacher2@zma.test",
                "Improvisation Modale Classique", "Musique", "Licence");
        publish((String) sameTextWrongDept.get("id"), "combo.teacher2@zma.test");

        ResponseEntity<Map> resp = rest.getForEntity(
                url("/api/v1/courses?q=Improvisation&department=Jazz&level=Master&page=0&size=50"), Map.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        List<Map<String, Object>> content = (List<Map<String, Object>>) resp.getBody().get("content");

        assertThat(content).extracting(c -> c.get("title"))
                .contains("Improvisation Modale Avancée")
                .doesNotContain("Improvisation Modale Classique");
    }

    // ── 6. Preview lessons ───────────────────────────────────────────────────

    @Test
    @SuppressWarnings("unchecked")
    void previewLessonsReturnsFirstLessonOfEachSection() {
        Map<String, Object> body = courseBody("Cours Piano Complet", "Musique", "Licence");
        body.put("curriculumJson", "[{\"id\":\"s1\",\"title\":\"Bases\",\"lessons\":[\"Posture et position des mains\",\"Gammes majeures\"]},"
                + "{\"id\":\"s2\",\"title\":\"Avancé\",\"lessons\":[\"Improvisation jazz\",\"Composition\"]}]");
        HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, authHeaders("preview.teacher@zma.test", "TEACHER"));
        ResponseEntity<Map> createResp = rest.postForEntity(url("/api/v1/courses"), req, Map.class);
        assertThat(createResp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        String id = (String) createResp.getBody().get("id");

        ResponseEntity<List> resp = rest.getForEntity(url("/api/v1/courses/" + id + "/preview-lessons"), List.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        List<Map<String, String>> lessons = resp.getBody();
        assertThat(lessons).hasSize(2);
        assertThat(lessons.get(0).get("sectionTitle")).isEqualTo("Bases");
        assertThat(lessons.get(0).get("lessonTitle")).isEqualTo("Posture et position des mains");
        assertThat(lessons.get(1).get("sectionTitle")).isEqualTo("Avancé");
        assertThat(lessons.get(1).get("lessonTitle")).isEqualTo("Improvisation jazz");
    }

    @Test
    void previewLessonsReturnsEmptyListWhenNoCurriculum() {
        Map<String, Object> created = createCourse("preview.teacher2@zma.test", "Cours Sans Curriculum", "Musique", "Licence");
        String id = (String) created.get("id");

        ResponseEntity<List> resp = rest.getForEntity(url("/api/v1/courses/" + id + "/preview-lessons"), List.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody()).isEmpty();
    }

    @Test
    void previewLessonsIsPublicNoJwtRequired() {
        Map<String, Object> created = createCourse("preview.teacher3@zma.test", "Cours Public Preview", "Musique", "Licence");
        String id = (String) created.get("id");

        // No Authorization header at all.
        ResponseEntity<List> resp = rest.getForEntity(url("/api/v1/courses/" + id + "/preview-lessons"), List.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void previewLessonsReturns404ForUnknownCourse() {
        ResponseEntity<Map> resp = rest.getForEntity(url("/api/v1/courses/does-not-exist/preview-lessons"), Map.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}
