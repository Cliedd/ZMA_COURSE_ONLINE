package com.ztf.zma.users.api;

import com.ztf.zma.users.domain.UserPreferences;
import com.ztf.zma.users.domain.UserProfile;
import com.ztf.zma.users.repository.UserPreferencesRepository;
import com.ztf.zma.users.repository.UserProfileRepository;
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

    public UserProfileController(UserProfileRepository profileRepository,
                                  UserPreferencesRepository preferencesRepository) {
        this.profileRepository     = profileRepository;
        this.preferencesRepository = preferencesRepository;
    }

    // ── Internal (called by zma-auth on register) ─────────────────────────────

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

    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> getMyProfile(
            @AuthenticationPrincipal String email) {
        UserProfile profile = findActiveByEmail(email);
        return ResponseEntity.ok(ProfileResponse.from(profile));
    }

    @Transactional
    @PutMapping("/me")
    public ResponseEntity<ProfileResponse> updateMyProfile(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody UpdateProfileRequest request) {

        UserProfile profile = findActiveByEmail(email);

        if (StringUtils.hasText(request.firstName()))         profile.setFirstName(request.firstName());
        if (StringUtils.hasText(request.lastName()))          profile.setLastName(request.lastName());
        if (request.bio() != null)                            profile.setBio(request.bio());
        if (StringUtils.hasText(request.avatarUrl()))         profile.setAvatarUrl(request.avatarUrl());
        if (StringUtils.hasText(request.phoneNumber()))       profile.setPhoneNumber(request.phoneNumber());
        if (StringUtils.hasText(request.preferredLanguage())) profile.setPreferredLanguage(request.preferredLanguage());

        profileRepository.save(profile);
        return ResponseEntity.ok(ProfileResponse.from(profile));
    }

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
     * Soft-delete: anonymize PII and set deletedAt.
     * The auth-service record is NOT deleted here — call zma-auth /logout first.
     */
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

    @GetMapping("/me/preferences")
    public UserPreferences getPreferences(@AuthenticationPrincipal String email) {
        UserProfile profile = findActiveByEmail(email);
        return preferencesRepository.findById(profile.getId())
            .orElseGet(() -> defaultPrefs(profile.getId()));
    }

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

    // ── By ID (inter-service / public) ────────────────────────────────────────

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

    private UserPreferences defaultPrefs(String userId) {
        UserPreferences prefs = new UserPreferences();
        prefs.setUserId(userId);
        return preferencesRepository.save(prefs);
    }
}
