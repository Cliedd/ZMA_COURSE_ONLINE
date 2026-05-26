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
        message.setSubject("Réinitialisation de votre mot de passe — ZMA");
        message.setText(
            "Bonjour,\n\n" +
            "Vous avez demandé la réinitialisation de votre mot de passe.\n\n" +
            "Cliquez sur le lien ci-dessous (valable 1 heure) :\n" +
            resetLink + "\n\n" +
            "Si vous n'avez pas fait cette demande, ignorez ce message.\n\n" +
            "L'équipe ZMA"
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
        message.setSubject("Confirmez votre adresse email — ZMA");
        message.setText(
            "Bienvenue sur ZMA !\n\n" +
            "Confirmez votre adresse email en cliquant sur ce lien (valable 24h) :\n" +
            verifyLink + "\n\n" +
            "L'équipe ZMA"
        );
        mailSender.send(message);
        log.info("Verification email sent to {}", to);
    }
}
