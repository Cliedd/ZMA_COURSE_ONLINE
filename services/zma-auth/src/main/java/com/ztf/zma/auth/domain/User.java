package com.ztf.zma.auth.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role = "STUDENT";

    /** LOCAL = email/password, GOOGLE = OAuth2 */
    @Column(nullable = false, columnDefinition = "varchar(255) default 'LOCAL'")
    private String provider = "LOCAL";

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean emailVerified = false;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean suspended = false;

    @Column(nullable = false, updatable = false,
            columnDefinition = "timestamp with time zone default now()")
    private Instant createdAt = Instant.now();

    /**
     * TOTP MFA (RFC 6238), opt-in for ADMIN/TEACHER accounts. Only becomes true
     * once the user has confirmed setup with a valid code — see
     * AuthController#mfaVerify. While false, mfaSecret may hold a "pending"
     * (unconfirmed) secret from an in-progress /mfa/setup call.
     */
    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean mfaEnabled = false;

    @Column(name = "mfa_secret")
    private String mfaSecret;

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }

    public boolean isSuspended() { return suspended; }
    public void setSuspended(boolean suspended) { this.suspended = suspended; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public boolean isMfaEnabled() { return mfaEnabled; }
    public void setMfaEnabled(boolean mfaEnabled) { this.mfaEnabled = mfaEnabled; }

    public String getMfaSecret() { return mfaSecret; }
    public void setMfaSecret(String mfaSecret) { this.mfaSecret = mfaSecret; }
}
