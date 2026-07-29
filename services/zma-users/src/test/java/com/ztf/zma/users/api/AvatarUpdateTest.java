package com.ztf.zma.users.api;

import com.ztf.zma.users.domain.UserProfile;
import com.ztf.zma.users.infrastructure.CatalogClient;
import com.ztf.zma.users.infrastructure.MediaClient;
import com.ztf.zma.users.repository.UserPreferencesRepository;
import com.ztf.zma.users.repository.UserProfileRepository;
import com.ztf.zma.users.support.AbstractIntegrationTest;
import com.ztf.zma.users.support.JwtTestUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Round-trip coverage for POST /api/v1/users/me/avatar (Task 2):
 * mediaId -> resolved via MediaClient -> avatarUrl persisted on the profile,
 * and the direct-avatarUrl shortcut, reusing the same update path as PUT /me.
 */
class AvatarUpdateTest extends AbstractIntegrationTest {

    @Autowired
    private UserProfileRepository profileRepository;

    @Autowired
    private UserPreferencesRepository preferencesRepository;

    @MockBean
    private MediaClient mediaClient;

    @MockBean
    private CatalogClient catalogClient;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = mockMvc();
        preferencesRepository.deleteAll();
        profileRepository.deleteAll();
    }

    private UserProfile createProfile(String id, String email, String role) {
        UserProfile p = new UserProfile();
        p.setId(id);
        p.setEmail(email);
        p.setRole(role);
        p.setFirstName("Jane");
        p.setLastName("Doe");
        return profileRepository.save(p);
    }

    @Test
    void setAvatar_viaMediaId_resolvesThroughMediaClientAndPersists() throws Exception {
        createProfile("u-1", "jane@zma.test", "STUDENT");
        String token = JwtTestUtils.token("jane@zma.test", "STUDENT");

        when(mediaClient.resolveAvatarUrl(eq("media-42"), any()))
                .thenReturn("https://cdn.example/avatars/media-42.jpg");

        mockMvc.perform(post("/api/v1/users/me/avatar")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"mediaId\":\"media-42\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.avatarUrl").value("https://cdn.example/avatars/media-42.jpg"));

        verify(mediaClient).resolveAvatarUrl(eq("media-42"), eq(token));

        UserProfile updated = profileRepository.findById("u-1").orElseThrow();
        org.assertj.core.api.Assertions.assertThat(updated.getAvatarUrl())
                .isEqualTo("https://cdn.example/avatars/media-42.jpg");
    }

    @Test
    void setAvatar_viaDirectUrl_skipsMediaClientAndPersists() throws Exception {
        createProfile("u-2", "bob@zma.test", "STUDENT");
        String token = JwtTestUtils.token("bob@zma.test", "STUDENT");

        mockMvc.perform(post("/api/v1/users/me/avatar")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"avatarUrl\":\"https://cdn.example/direct.png\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.avatarUrl").value("https://cdn.example/direct.png"));

        verify(mediaClient, org.mockito.Mockito.never()).resolveAvatarUrl(any(), any());
    }

    @Test
    void setAvatar_withNeitherField_returnsBadRequest() throws Exception {
        createProfile("u-3", "carl@zma.test", "STUDENT");
        String token = JwtTestUtils.token("carl@zma.test", "STUDENT");

        mockMvc.perform(post("/api/v1/users/me/avatar")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void setAvatar_whenMediaClientCannotResolve_returnsBadRequest() throws Exception {
        createProfile("u-4", "dana@zma.test", "STUDENT");
        String token = JwtTestUtils.token("dana@zma.test", "STUDENT");

        when(mediaClient.resolveAvatarUrl(eq("missing"), any())).thenReturn(null);

        mockMvc.perform(post("/api/v1/users/me/avatar")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"mediaId\":\"missing\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void setAvatar_requiresAuthentication() throws Exception {
        mockMvc.perform(post("/api/v1/users/me/avatar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"avatarUrl\":\"https://cdn.example/x.png\"}"))
                .andExpect(status().isForbidden());
    }
}
