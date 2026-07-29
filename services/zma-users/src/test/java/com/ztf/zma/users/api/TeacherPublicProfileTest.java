package com.ztf.zma.users.api;

import com.ztf.zma.users.domain.UserProfile;
import com.ztf.zma.users.infrastructure.CatalogClient;
import com.ztf.zma.users.infrastructure.MediaClient;
import com.ztf.zma.users.repository.UserProfileRepository;
import com.ztf.zma.users.support.AbstractIntegrationTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Coverage for GET /api/v1/users/teachers/{id}/public-profile (Task 3):
 *  - public (no Authorization header at all)
 *  - no sensitive fields (email/phone) in the JSON
 *  - course count sourced from CatalogClient
 *  - 404 for unknown / non-teacher / deleted ids
 */
class TeacherPublicProfileTest extends AbstractIntegrationTest {

    @Autowired
    private UserProfileRepository profileRepository;

    @MockBean
    private CatalogClient catalogClient;

    @MockBean
    private MediaClient mediaClient;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = mockMvc();
        profileRepository.deleteAll();
    }

    @Test
    void publicProfile_isAccessibleWithoutAuthAndHidesSensitiveFields() throws Exception {
        UserProfile teacher = new UserProfile();
        teacher.setId("t-1");
        teacher.setEmail("teach@zma.test");
        teacher.setRole("TEACHER");
        teacher.setFirstName("Ada");
        teacher.setLastName("Lovelace");
        teacher.setBio("Piano & composition");
        teacher.setAvatarUrl("https://cdn.example/ada.jpg");
        teacher.setPhoneNumber("+123456789");
        profileRepository.save(teacher);

        when(catalogClient.countCoursesByTeacherEmail("teach@zma.test")).thenReturn(7);

        mockMvc.perform(get("/api/v1/users/teachers/t-1/public-profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("t-1"))
                .andExpect(jsonPath("$.firstName").value("Ada"))
                .andExpect(jsonPath("$.lastName").value("Lovelace"))
                .andExpect(jsonPath("$.bio").value("Piano & composition"))
                .andExpect(jsonPath("$.avatarUrl").value("https://cdn.example/ada.jpg"))
                .andExpect(jsonPath("$.courseCount").value(7))
                .andExpect(jsonPath("$.email").doesNotExist())
                .andExpect(jsonPath("$.phoneNumber").doesNotExist());
    }

    @Test
    void publicProfile_unknownId_returns404() throws Exception {
        mockMvc.perform(get("/api/v1/users/teachers/does-not-exist/public-profile"))
                .andExpect(status().isNotFound());
    }

    @Test
    void publicProfile_nonTeacherRole_returns404() throws Exception {
        UserProfile student = new UserProfile();
        student.setId("s-1");
        student.setEmail("student@zma.test");
        student.setRole("STUDENT");
        student.setFirstName("Sam");
        profileRepository.save(student);

        mockMvc.perform(get("/api/v1/users/teachers/s-1/public-profile"))
                .andExpect(status().isNotFound());
    }

    @Test
    void publicProfile_deletedTeacher_returns404() throws Exception {
        UserProfile teacher = new UserProfile();
        teacher.setId("t-2");
        teacher.setEmail("gone@zma.test");
        teacher.setRole("TEACHER");
        teacher.setDeletedAt(Instant.now());
        profileRepository.save(teacher);

        mockMvc.perform(get("/api/v1/users/teachers/t-2/public-profile"))
                .andExpect(status().isNotFound());
    }
}
