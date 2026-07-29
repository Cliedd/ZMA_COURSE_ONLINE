package com.ztf.zma.auth.infrastructure;

import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.net.URLEncoder;

/**
 * Thin wrapper around the RFC 6238-compliant googleauth library for secret
 * generation and code verification. The otpauth:// URI is built by hand
 * here rather than via the library's own
 * GoogleAuthenticatorQRGenerator.getOtpAuthURL() — that method doesn't
 * return the raw URI, it builds a third-party QR-image URL
 * (api.qrserver.com) with the TOTP secret embedded in the query string.
 * Rendering that as an <img> would leak every user's MFA secret to a
 * public third party. The frontend renders the QR code client-side from
 * the raw URI instead (e.g. the `qrcode` npm package) — nobody but this
 * server and the user's authenticator app ever sees the secret.
 */
@Service
public class MfaService {

    /** Shown as the "issuer" in the user's authenticator app. */
    public static final String ISSUER = "ZTF Music Academy";

    private final GoogleAuthenticator googleAuthenticator = new GoogleAuthenticator();

    /** Generates a fresh random secret. Not yet persisted/confirmed by the caller. */
    public GoogleAuthenticatorKey generateSecret() {
        return googleAuthenticator.createCredentials();
    }

    /** Builds the raw otpauth:// URI (RFC — "Key Uri Format") for the frontend to render as a QR code itself. */
    public String getOtpAuthUri(GoogleAuthenticatorKey key, String accountEmail) {
        String label = urlEncode(ISSUER) + ":" + urlEncode(accountEmail);
        return "otpauth://totp/" + label
                + "?secret=" + key.getKey()
                + "&issuer=" + urlEncode(ISSUER)
                + "&algorithm=SHA1&digits=6&period=30";
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }

    /** Verifies a 6-digit TOTP code against the given secret. */
    public boolean verifyCode(String secret, String code) {
        if (secret == null || code == null) return false;
        try {
            int numericCode = Integer.parseInt(code.trim());
            return googleAuthenticator.authorize(secret, numericCode);
        } catch (NumberFormatException e) {
            return false;
        }
    }
}
