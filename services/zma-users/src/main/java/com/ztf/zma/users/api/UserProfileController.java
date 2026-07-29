package com.ztf.zma.users.api;

import com.ztf.zma.users.domain.UserPreferences;
import com.ztf.zma.users.domain.UserProfile;
import com.ztf.zma.users.infrastructure.CatalogClient;
import com.ztf.zma.users.infrastructure.MediaClient;
import com.ztf.zma.users.repository.UserPreferencesRepository;
import com.ztf.zma.users.repository.UserProfileRepository;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
public class UserProfileController {

    private final UserProfileRepository     profileRepository;
    private final UserPreferencesRepository preferencesRepository;
    private final MediaClient               mediaClient;
    private final CatalogClient             catalogClient;

    public UserProfileController(UserProfileRepository profileRepository,
                                  UserPreferencesRepository preferencesRepository,
                                  MediaClient mediaClient,
                                  CatalogClient catalogClient) {
        this.profileRepository     = profileRepository;
        this.preferencesRepository = preferencesRepository;
        this.mediaClient           = mediaClient;
        this.catalogClient         = catalogClient;
    }

    // ── Internal (called by zma-auth on register) ─────────────────────────────

    @Operation(summary = "Internal: create a profile", description = "Called by zma-auth on registration.")
    @Transactional
    @PostMapping("/internal/create")
    @ResponseStatus(HttpStatus.CREATED)
    public void internalCreate(@Valid @RequestBody InternalCreateRequest request) {
        if (profileRepository.existsById(request.id())) {
            return; // idempotent
        }
        UserProfile profile = new UserProfile();
        profile.setId(request.id());
        profile.setEmail(request.email());
        profile.setRole(request.role() != null ? request.role() : "STUDENT");
        profileRepository.save(profile);

        // Create default preferences
        UserPreferences prefs = new UserPreferences();
        prefs.setUserId(request.id());
        preferencesRepository.save(prefs);
    }

    // ── Current user ──────────────────────────────────────────────────────────

    @Operation(summary = "Get my profile")
    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> getMyProfile(
            @AuthenticationPrincipal String email) {
        UserProfile profile = findActiveByEmail(email);
        return ResponseEntity.ok(ProfileResponse.from(profile));
    }

    @Operation(summary = "Update my profile")
    @Transactional
    @PutMapping("/me")
    public ResponseEntity<ProfileResponse> updateMyProfile(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody UpdateProfileRequest request) {

        UserProfile profile = findActiveByEmail(email);
        applyProfileUpdate(profile, request);
        return ResponseEntity.ok(ProfileResponse.from(profile));
    }

    @Operation(summary = "Update my avatar (legacy)", description = "Prefer POST /me/avatar.")
    @Transactional
    @PatchMapping("/me/avatar")
    public ResponseEntity<ProfileResponse> updateAvatar(
            @AuthenticationPrincipal String email,
            @RequestParam String avatarUrl) {

        UserProfile profile = findActiveByEmail(email);
        profile.setAvatarUrl(avatarUrl);
        profileRepository.save(profile);
        return ResponseEntity.ok(ProfileResponse.from(profile));
    }

    /**
     * Set the current user's avatar from either a mediaId (a zma-media upload that
     * has already gone through presign -> upload -> confirm and is READY — its
     * confirmed download URL is resolved here and stored) or a direct avatarUrl.
     * Reuses the same update path as PUT /me rather than duplicating persistence logic.
     */
    @Operation(summary = "Set my avatar", description = "Accepts either mediaId (a confirmed zma-media upload) or a direct avatarUrl.")
    @Transactional
    @PostMapping("/me/avatar")
    public ResponseEntity<ProfileResponse> setMyAvatar(
            @AuthenticationPrincipal String email,
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestBody AvatarUpdateRequest request) {

        UserProfile profile = findActiveByEmail(email);

        String resolvedAvatarUrl = request.avatarUrl();
        if (!StringUtils.hasText(resolvedAvatarUrl)) {
            if (!StringUtils.hasText(request.mediaId())) {
                throw new RuntimeException("Either mediaId or avatarUrl is required");
            }
            String bearerToken = authorizationHeader.startsWith("Bearer ")
                    ? authorizationHeader.substring(7) : authorizationHeader;
            resolvedAvatarUrl = mediaClient.resolveAvatarUrl(request.mediaId(), bearerToken);
            if (!StringUtils.hasText(resolvedAvatarUrl)) {
                throw new RuntimeException("Could not resolve avatar from mediaId");
            }
        }

        applyProfileUpdate(profile, new UpdateProfileRequest(
                null, null, null, resolvedAvatarUrl, null, null));
        return ResponseEntity.ok(ProfileResponse.from(profile));
    }

    /**
     * Soft-delete: anonymize PII and set deletedAt.
     * The auth-service record is NOT deleted here — call zma-auth /logout first.
     */
    @Operation(summary = "Delete (anonymize) my profile")
    @Transactional
    @DeleteMapping("/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMyProfile(@AuthenticationPrincipal String email) {
        UserProfile profile = findActiveByEmail(email);
        // Anonymize PII
        profile.setFirstName("Deleted");
        profile.setLastName("User");
        profile.setBio(null);
        profile.setAvatarUrl(null);
        profile.setPhoneNumber(null);
        profile.setEmail("deleted-" + UUID.randomUUID() + "@zma.invalid");
        profile.setDeletedAt(Instant.now());
        profileRepository.save(profile);
    }

    // ── Preferences ───────────────────────────────────────────────────────────

    @Operation(summary = "Get my preferences")
    @GetMapping("/me/preferences")
    public UserPreferences getPreferences(@AuthenticationPrincipal String email) {
        UserProfile profile = findActiveByEmail(email);
        return preferencesRepository.findById(profile.getId())
            .orElseGet(() -> defaultPrefs(profile.getId()));
    }

    @Operation(summary = "Update my preferences")
    @Transactional
    @PutMapping("/me/preferences")
    public UserPreferences updatePreferences(
            @AuthenticationPrincipal String email,
            @RequestBody Map<String, Object> body) {

        UserProfile profile = findActiveByEmail(email);
        UserPreferences prefs = preferencesRepository.findById(profile.getId())
            .orElseGet(() -> defaultPrefs(profile.getId()));

        if (body.containsKey("language"))              prefs.setLanguage((String) body.get("language"));
        if (body.containsKey("timezone"))              prefs.setTimezone((String) body.get("timezone"));
        if (body.containsKey("emailNotifications"))    prefs.setEmailNotifications((Boolean) body.get("emailNotifications"));
        if (body.containsKey("chatEmailNotifications")) prefs.setChatEmailNotifications((Boolean) body.get("chatEmailNotifications"));
        if (body.containsKey("commentNotifications"))  prefs.setCommentNotifications((Boolean) body.get("commentNotifications"));

        return preferencesRepository.save(prefs);
    }

    // ── Public ────────────────────────────────────────────────────────────────

    /**
     * Public-safe view of a teacher's profile (no auth required — see SecurityConfig).
     * 404s for unknown ids and for ids that exist but aren't a TEACHER, since from the
     * caller's perspective "not a teacher" and "no such teacher" are indistinguishable.
     */
    @Operation(summary = "Get a teacher's public profile", description = "Public endpoint — no email/phone exposed.")
    @GetMapping("/teachers/{id}/public-profile")
    public ResponseEntity<TeacherPublicProfileResponse> getTeacherPublicProfile(@PathVariable String id) {
        UserProfile profile = profileRepository.findById(id)
            .filter(p -> !p.isDeleted())
            .filter(p -> "TEACHER".equals(p.getRole()))
            .orElseThrow(() -> new RuntimeException("Profile not found"));

        int courseCount = catalogClient.countCoursesByTeacherEmail(profile.getEmail());
        return ResponseEntity.ok(TeacherPublicProfileResponse.from(profile, courseCount));
    }

    // ── By ID (inter-service / public) ────────────────────────────────────────

    @Operation(summary = "Get a profile by id", description = "Inter-service / authenticated lookup.")
    @GetMapping("/{id}")
    public ResponseEntity<ProfileResponse> getById(@PathVariable String id) {
        UserProfile profile = profileRepository.findById(id)
            .filter(p -> !p.isDeleted())
            .orElseThrow(() -> new RuntimeException("Profile not found"));
        return ResponseEntity.ok(ProfileResponse.from(profile));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private UserProfile findActiveByEmail(String email) {
        return profileRepository.findByEmail(email)
            .filter(p -> !p.isDeleted())
            .orElseThrow(() -> new RuntimeException("Profile not found"));
    }

    /** Shared PATCH-semantics apply logic used by both PUT /me and POST /me/avatar. */
    private void applyProfileUpdate(UserProfile profile, UpdateProfileRequest request) {
        if (StringUtils.hasText(request.firstName()))         profile.setFirstName(request.firstName());
        if (StringUtils.hasText(request.lastName()))          profile.setLastName(request.lastName());
        if (request.bio() != null)                            profile.setBio(request.bio());
        if (StringUtils.hasText(request.avatarUrl()))         profile.setAvatarUrl(request.avatarUrl());
        if (StringUtils.hasText(request.phoneNumber()))       profile.setPhoneNumber(request.phoneNumber());
        if (StringUtils.hasText(request.preferredLanguage())) profile.setPreferredLanguage(request.preferredLanguage());
        profileRepository.save(profile);
    }

    private UserPreferences defaultPrefs(String userId) {
        UserPreferences prefs = new UserPreferences();
        prefs.setUserId(userId);
        return preferencesRepository.save(prefs);
    }
}
