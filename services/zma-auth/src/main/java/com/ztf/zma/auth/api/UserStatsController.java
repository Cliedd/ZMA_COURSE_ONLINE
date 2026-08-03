package com.ztf.zma.auth.api;

import com.ztf.zma.auth.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public, read-only marketing stats. Deliberately separate from
 * {@link AdminUserController}: this exposes a single aggregate count with no
 * authentication and no per-user data (no emails, names, roles, etc.), so it
 * is safe to surface on the public homepage ahead of launch.
 */
@RestController
@RequestMapping("/api/v1/auth/users")
@Tag(name = "Public - Users", description = "Public, unauthenticated aggregate user stats")
public class UserStatsController {

    private final UserRepository userRepository;

    public UserStatsController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Operation(summary = "Count registered users",
        description = "Public marketing stat: total number of registered accounts. No auth required.")
    @GetMapping("/count")
    public UserCountResponse count() {
        return new UserCountResponse(userRepository.count());
    }

    public record UserCountResponse(long count) {}
}
