package com.ztf.zma.auth.infrastructure;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Sends password-reset emails.
 * When mail.enabled=false (default in dev), the reset token is only logged.
 */
@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private final JavaMailSender mailSender;

    @Value("${mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${mail.from:noreply@ztfmusic.com}")
    private String mailFrom;

    @Value("${frontend.url:http://localhost}")
    private String frontendUrl;

    public MailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetEmail(String to, String resetToken) {
        String resetLink = frontendUrl + "/reset-password?token=" + resetToken;

        if (!mailEnabled) {
            log.warn("[DEV] Password reset link for {}: {}", to, resetLink);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailFrom);
        message.setTo(to);
        message.setSubject("Reset your password — ZMA");
        message.setText(
            "Hello,\n\n" +
            "You requested a password reset.\n\n" +
            "Click the link below (valid for 1 hour):\n" +
            resetLink + "\n\n" +
            "If you didn't request this, you can safely ignore this email.\n\n" +
            "The ZMA Team"
        );
        mailSender.send(message);
        log.info("Password reset email sent to {}", to);
    }

    public void sendVerificationEmail(String to, String verifyToken) {
        String verifyLink = frontendUrl + "/verify-email?token=" + verifyToken;

        if (!mailEnabled) {
            log.warn("[DEV] Email verification link for {}: {}", to, verifyLink);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailFrom);
        message.setTo(to);
        message.setSubject("Confirm your email address — ZMA");
        message.setText(
            "Welcome to ZMA!\n\n" +
            "Confirm your email address by clicking this link (valid for 24h):\n" +
            verifyLink + "\n\n" +
            "The ZMA Team"
        );
        mailSender.send(message);
        log.info("Verification email sent to {}", to);
    }
}
