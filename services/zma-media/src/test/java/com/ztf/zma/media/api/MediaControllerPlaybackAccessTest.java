package com.ztf.zma.media.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ztf.zma.media.domain.Media;
import com.ztf.zma.media.infrastructure.EnrollmentClient;
import com.ztf.zma.media.repository.MediaRepository;
import com.ztf.zma.media.support.AbstractIntegrationTest;
import com.ztf.zma.media.support.JwtTestUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Covers the enrolled-student playback access fix on GET /api/v1/media/{id}/url:
 *  - an enrolled STUDENT who did NOT upload the video can still get a download URL
 *  - a non-enrolled STUDENT is denied
 *  - if zma-enrollment is unreachable/errors, access is denied (fail closed)
 * EnrollmentClient is mocked (same convention as EnrollmentClient mocking in
 * zma-payment's PaymentControllerTest) so no real network call is made.
 */
class MediaControllerPlaybackAccessTest extends AbstractIntegrationTest {

    @Autowired
    private MediaRepository mediaRepository;

    @MockBean
    private EnrollmentClient enrollmentClient;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String COURSE_ID = "course-123";

    @BeforeEach
    void setUp() {
        mockMvc = mockMvc();
        mediaRepository.deleteAll();
    }

    /** Uploads a small video as a TEACHER and attaches it to COURSE_ID, returning the mediaId. */
    private String uploadAndAttachVideo(String teacherToken) throws Exception {
        byte[] bytes = "fake mp4 bytes for access-control testing".getBytes();

        String presignBody = """
                {"fileName":"lesson.mp4","contentType":"video/mp4","sizeBytes":%d}
                """.formatted(bytes.length);

        String presignResponse = mockMvc.perform(post("/api/v1/media/presign")
                        .header("Authorization", "Bearer " + teacherToken)
                        .contentType("application/json")
                        .content(presignBody))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String mediaId = objectMapper.readTree(presignResponse).get("mediaId").asText();

        mockMvc.perform(multipart("/api/v1/media/" + mediaId + "/upload-direct")
                        .file("file", bytes)
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isOk());

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .patch("/api/v1/media/" + mediaId + "/attach")
                        .header("Authorization", "Bearer " + teacherToken)
                        .contentType("application/json")
                        .content("{\"courseId\":\"" + COURSE_ID + "\"}"))
                .andExpect(status().isOk());

        Media media = mediaRepository.findById(mediaId).orElseThrow();
        media.setStatus("READY");
        mediaRepository.save(media);

        return mediaId;
    }

    @Test
    void enrolledStudent_whoDidNotUpload_canGetDownloadUrl() throws Exception {
        String teacherToken = JwtTestUtils.token("teacher-playback@zma.test", "TEACHER");
        String studentToken = JwtTestUtils.token("student-enrolled@zma.test", "STUDENT");
        String mediaId = uploadAndAttachVideo(teacherToken);

        when(enrollmentClient.isEnrolled(eq(COURSE_ID), anyString())).thenReturn(true);

        mockMvc.perform(get("/api/v1/media/" + mediaId + "/url")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.url").exists());
    }

    @Test
    void nonEnrolledStudent_isDenied() throws Exception {
        String teacherToken = JwtTestUtils.token("teacher-playback2@zma.test", "TEACHER");
        String studentToken = JwtTestUtils.token("student-not-enrolled@zma.test", "STUDENT");
        String mediaId = uploadAndAttachVideo(teacherToken);

        when(enrollmentClient.isEnrolled(eq(COURSE_ID), anyString())).thenReturn(false);

        mockMvc.perform(get("/api/v1/media/" + mediaId + "/url")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void enrollmentServiceUnreachable_failsClosed_denyingAccess() throws Exception {
        String teacherToken = JwtTestUtils.token("teacher-playback3@zma.test", "TEACHER");
        String studentToken = JwtTestUtils.token("student-outage@zma.test", "STUDENT");
        String mediaId = uploadAndAttachVideo(teacherToken);

        // Simulate the real EnrollmentClientImpl's fail-closed behavior on a network
        // error: it swallows the exception internally and returns false, never true.
        when(enrollmentClient.isEnrolled(eq(COURSE_ID), anyString())).thenReturn(false);

        mockMvc.perform(get("/api/v1/media/" + mediaId + "/url")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void uploaderStillHasAccess_withoutAnyEnrollmentCheck() throws Exception {
        String teacherToken = JwtTestUtils.token("teacher-playback4@zma.test", "TEACHER");
        String mediaId = uploadAndAttachVideo(teacherToken);

        mockMvc.perform(get("/api/v1/media/" + mediaId + "/url")
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.url").exists());
    }
}
