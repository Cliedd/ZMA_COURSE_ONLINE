package com.ztf.zma.auth.api;

import com.ztf.zma.auth.domain.User;
import com.ztf.zma.auth.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Set;

/**
 * Admin-only endpoints for managing user accounts.
 * Kept separate from AuthController, which owns the public auth flows.
 */
@RestController
@RequestMapping("/api/v1/auth/admin/users")
public class AdminUserController {

    private static final Set<String> ALLOWED_ROLES = Set.of("STUDENT", "TEACHER", "ADMIN");

    private final UserRepository userRepository;

    public AdminUserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ── List all users (paginated) ──────────────────────────────────────────────

    @GetMapping
    public Page<UserSummary> listUsers(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "50") int size,
            Authentication auth) {

        requireAdmin(auth);

        Pageable pageable = PageRequest.of(page, Math.min(size, 500),
                                           Sort.by("createdAt").descending());
        return userRepository.findAll(pageable).map(UserSummary::from);
    }

    // ── Update role ───────────────────────────────────────────────────────────

    @Transactional
    @PatchMapping("/{id}/role")
    public UserSummary updateRole(
            @PathVariable String id,
            @RequestParam String role,
            Authentication auth) {

        requireAdmin(auth);

        String normalizedRole = role == null ? "" : role.toUpperCase();
        if (!ALLOWED_ROLES.contains(normalizedRole)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Invalid role. Allowed: " + ALLOWED_ROLES);
        }

        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        user.setRole(normalizedRole);
        userRepository.save(user);
        return UserSummary.from(user);
    }

    // ── Suspend / reactivate ─────────────────────────────────────────────────────

    @Transactional
    @PatchMapping("/{id}/suspend")
    public UserSummary setSuspended(
            @PathVariable String id,
            @RequestParam boolean suspended,
            Authentication auth) {

        requireAdmin(auth);

        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        user.setSuspended(suspended);
        userRepository.save(user);
        return UserSummary.from(user);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void requireAdmin(Authentication auth) {
        if (auth == null || !"ADMIN".equals(getRole(auth))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin only");
        }
    }

    private String getRole(Authentication auth) {
        return auth.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .filter(a -> a.startsWith("ROLE_"))
            .map(a -> a.substring(5))
            .findFirst()
            .orElse("STUDENT");
    }
}
