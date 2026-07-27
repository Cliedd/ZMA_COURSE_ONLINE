package com.ztf.zma.auth.api;

import com.ztf.zma.auth.domain.User;
import com.ztf.zma.auth.repository.UserRepository;
import com.ztf.zma.auth.infrastructure.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Auth", description = "Registration, login, tokens and account recovery")
public class AuthController {

    private static final Set<String> ALLOWED_ROLES   = Set.of("STUDENT", "TEACHER");
    private static final int  LOGIN_MAX_ATTEMPTS      = 5;
    private static final Duration LOGIN_WINDOW        = Duration.ofMinutes(10);
    private static final int  RESET_MAX_ATTEMPTS      = 3;
    private static final Duration RESET_WINDOW        = Duration.ofHours(1);

    private final UserRepository      userRepository;
    private final JwtUtils            jwtUtils;
    private final PasswordEncoder     passwordEncoder;
    private final RedisTokenService   redisTokenService;
    private final MailService         mailService;
    private final UsersServiceClient  usersServiceClient;
    private final RateLimiterService  rateLimiter;

    public AuthController(UserRepository userRepository,
                          JwtUtils jwtUtils,
                          PasswordEncoder passwordEncoder,
                          RedisTokenService redisTokenService,
                          MailService mailService,
                          UsersServiceClient usersServiceClient,
                          RateLimiterService rateLimiter) {
        this.userRepository    = userRepository;
        this.jwtUtils          = jwtUtils;
        this.passwordEncoder   = passwordEncoder;
        this.redisTokenService = redisTokenService;
        this.mailService       = mailService;
        this.usersServiceClient = usersServiceClient;
        this.rateLimiter       = rateLimiter;
    }

    // ── Register ──────────────────────────────────────────────────────────────

    @Operation(summary = "Register a new account",
        description = "Creates a STUDENT or TEACHER account, sends a verification email, " +
                      "and returns an access/refresh token pair.")
    @Transactional
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already in use");
        }

        String role = (request.role() != null && ALLOWED_ROLES.contains(request.role()))
            ? request.role() : "STUDENT";

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(role);
        user.setProvider("LOCAL");
        user.setEmailVerified(false);
        userRepository.save(user);

        // Send verification email (async-safe — fire-and-forget on mail failure)
        try {
            String verifyToken = redisTokenService.createVerifyToken(user.getEmail());
            mailService.sendVerificationEmail(user.getEmail(), verifyToken);
        } catch (Exception e) {
            // Log but do not fail registration
        }

        usersServiceClient.notifyUserCreated(user.getId(), user.getEmail(), user.getRole());

        String token        = jwtUtils.generateToken(user.getEmail(), user.getRole());
        String refreshToken = redisTokenService.createRefreshToken(user.getEmail());
        return new AuthResponse(token, refreshToken, user.getEmail(), user.getRole(),
                                user.getId(), jwtUtils.getExpirationMs() / 1000);
    }

    // ── Verify Email ──────────────────────────────────────────────────────────

    @PostMapping("/verify-email")
    @Transactional
    public ResponseEntity<Map<String, String>> verifyEmail(
            @Valid @RequestBody VerifyEmailRequest request) {

        String email = redisTokenService.getEmailByVerifyToken(request.token())
            .orElseThrow(() -> new RuntimeException("Invalid or expired verification token"));

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        user.setEmailVerified(true);
        userRepository.save(user);
        redisTokenService.invalidateVerifyToken(request.token());

        return ResponseEntity.ok(Map.of("message", "Email verified successfully"));
    }

    /** Resend verification email */
    @PostMapping("/resend-verification")
    public ResponseEntity<Map<String, String>> resendVerification(
            @AuthenticationPrincipal String email) {

        userRepository.findByEmail(email).ifPresent(user -> {
            if (!user.isEmailVerified()) {
                String token = redisTokenService.createVerifyToken(email);
                mailService.sendVerificationEmail(email, token);
            }
        });
        return ResponseEntity.ok(Map.of("message", "Verification email sent if applicable"));
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    @Operation(summary = "Log in with email/password",
        description = "Rate-limited per IP. Rejects Google-only accounts, wrong credentials " +
                      "and suspended accounts.")
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request,
                              HttpServletRequest httpRequest) {
        String ip = getClientIp(httpRequest);

        if (rateLimiter.isRateLimited("login", ip, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW)) {
            throw new RuntimeException("Too many login attempts. Try again in 10 minutes.");
        }

        User user = userRepository.findByEmail(normalizeEmail(request.email()))
            .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if ("GOOGLE".equals(user.getProvider())) {
            throw new RuntimeException("Please log in with Google");
        }
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        if (user.isSuspended()) {
            throw new RuntimeException("Account is suspended");
        }

        // Reset counter on successful login
        rateLimiter.reset("login", ip);

        String token        = jwtUtils.generateToken(user.getEmail(), user.getRole());
        String refreshToken = redisTokenService.createRefreshToken(user.getEmail());
        return new AuthResponse(token, refreshToken, user.getEmail(), user.getRole(),
                                user.getId(), jwtUtils.getExpirationMs() / 1000);
    }

    // ── Logout ────────────────────────────────────────────────────────────────

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            HttpServletRequest request,
            @RequestParam(required = false) String refreshToken) {

        String token = extractBearerToken(request);
        if (token != null) {
            long ttl = jwtUtils.getRemainingTtlSeconds(token);
            redisTokenService.blacklistToken(token, ttl);
        }
        if (StringUtils.hasText(refreshToken)) {
            redisTokenService.invalidateRefreshToken(refreshToken);
        }
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    // ── Refresh ───────────────────────────────────────────────────────────────

    @Operation(summary = "Exchange a refresh token for a new access/refresh token pair",
        description = "Single-use: the supplied refresh token is invalidated whether the " +
                      "exchange succeeds or the account turns out to be suspended.")
    @PostMapping("/refresh")
    public AuthResponse refresh(@Valid @RequestBody RefreshRequest request) {
        String email = redisTokenService.getEmailByRefreshToken(request.refreshToken())
            .orElseThrow(() -> new RuntimeException("Invalid or expired refresh token"));

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isSuspended()) {
            // Token belongs to an account that has since been suspended: revoke it.
            redisTokenService.invalidateRefreshToken(request.refreshToken());
            throw new RuntimeException("Account is suspended");
        }

        redisTokenService.invalidateRefreshToken(request.refreshToken());
        String newToken        = jwtUtils.generateToken(user.getEmail(), user.getRole());
        String newRefreshToken = redisTokenService.createRefreshToken(user.getEmail());
        return new AuthResponse(newToken, newRefreshToken, user.getEmail(), user.getRole(),
                                user.getId(), jwtUtils.getExpirationMs() / 1000);
    }

    // ── Forgot Password ───────────────────────────────────────────────────────

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request,
            HttpServletRequest httpRequest) {

        String ip = getClientIp(httpRequest);
        if (rateLimiter.isRateLimited("reset", ip, RESET_MAX_ATTEMPTS, RESET_WINDOW)) {
            throw new RuntimeException("Too many reset attempts. Try again later.");
        }

        userRepository.findByEmail(normalizeEmail(request.email())).ifPresent(user -> {
            String resetToken = redisTokenService.createResetToken(user.getEmail());
            mailService.sendPasswordResetEmail(user.getEmail(), resetToken);
        });
        return ResponseEntity.ok(Map.of("message",
            "If this email is registered, a reset link has been sent."));
    }

    // ── Reset Password ────────────────────────────────────────────────────────

    @Transactional
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        String email = redisTokenService.getEmailByResetToken(request.resetToken())
            .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        redisTokenService.invalidateResetToken(request.resetToken());

        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }

    // ── Me ────────────────────────────────────────────────────────────────────

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(@AuthenticationPrincipal String email) {
        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(Map.of(
            "id",            user.getId(),
            "email",         user.getEmail(),
            "role",          user.getRole(),
            "provider",      user.getProvider(),
            "emailVerified", user.isEmailVerified(),
            "createdAt",     user.getCreatedAt().toString()
        ));
    }

    // ── SecurityConfig: expose new endpoints ──────────────────────────────────

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String extractBearerToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(xff)) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    /**
     * Emails are stored/looked-up case-insensitively (Postgres string equality
     * is case-sensitive by default): without this, "User@Example.com" and
     * "user@example.com" would be treated as distinct accounts, allowing
     * duplicate registration and login mismatches.
     */
    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}
