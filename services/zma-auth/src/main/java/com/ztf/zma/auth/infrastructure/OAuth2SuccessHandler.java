package com.ztf.zma.auth.infrastructure;

import com.ztf.zma.auth.domain.User;
import com.ztf.zma.auth.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.UUID;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository     userRepository;
    private final JwtUtils           jwtUtils;
    private final PasswordEncoder    passwordEncoder;
    private final RedisTokenService  redisTokenService;
    private final UsersServiceClient usersServiceClient;

    @Value("${frontend.url:http://localhost}")
    private String frontendUrl;

    public OAuth2SuccessHandler(UserRepository userRepository,
                                JwtUtils jwtUtils,
                                PasswordEncoder passwordEncoder,
                                RedisTokenService redisTokenService,
                                UsersServiceClient usersServiceClient) {
        this.userRepository    = userRepository;
        this.jwtUtils          = jwtUtils;
        this.passwordEncoder   = passwordEncoder;
        this.redisTokenService = redisTokenService;
        this.usersServiceClient = usersServiceClient;
    }

    @Override
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String rawEmail = oAuth2User.getAttribute("email");
        String email = rawEmail == null ? null : rawEmail.trim().toLowerCase();

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            newUser.setRole("STUDENT");
            newUser.setProvider("GOOGLE");
            newUser.setEmailVerified(true);
            User saved = userRepository.save(newUser);
            usersServiceClient.notifyUserCreated(saved.getId(), saved.getEmail(), saved.getRole());
            return saved;
        });

        String token        = jwtUtils.generateToken(user.getEmail(), user.getRole());
        String refreshToken = redisTokenService.createRefreshToken(user.getEmail());

        response.sendRedirect(frontendUrl + "/dashboard?token=" + token
                              + "&refreshToken=" + refreshToken);
    }
}
