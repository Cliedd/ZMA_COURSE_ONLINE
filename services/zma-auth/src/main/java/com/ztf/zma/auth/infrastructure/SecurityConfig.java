package com.ztf.zma.auth.infrastructure;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final JwtAuthFilter        jwtAuthFilter;

    @Value("${cors.allowed-origins:http://localhost:5173,http://localhost}")
    private String allowedOrigins;

    @Value("${google.oauth.client-id:}")
    private String googleClientId;

    @Value("${google.oauth.client-secret:}")
    private String googleClientSecret;

    @Value("${google.oauth.scope:profile,email}")
    private String googleScope;

    // The {baseUrl} template resolves from the request as zma-auth sees it —
    // which, behind the gateway's internal proxy call, is the private
    // Railway hostname (zma-auth.railway.internal:8081), not the public URL
    // registered in Google Cloud Console. Hardcoding the public base avoids
    // depending on forwarded-header propagation through the proxy chain.
    @Value("${google.oauth.public-base-url:http://localhost:8080}")
    private String googlePublicBaseUrl;

    @Value("${frontend.url:http://localhost}")
    private String frontendUrl;

    public SecurityConfig(OAuth2SuccessHandler oAuth2SuccessHandler,
                          JwtAuthFilter jwtAuthFilter) {
        this.oAuth2SuccessHandler = oAuth2SuccessHandler;
        this.jwtAuthFilter        = jwtAuthFilter;
    }

    private boolean googleOAuthConfigured() {
        return !googleClientId.isBlank() && !googleClientSecret.isBlank();
    }

    // Built by hand instead of Spring Boot's registration-properties
    // auto-configuration, which validates client-id/client-secret as
    // non-empty as soon as that namespace is bound — crashing the whole
    // service at boot when Google credentials aren't configured.
    @Bean
    public ClientRegistrationRepository clientRegistrationRepository() {
        if (!googleOAuthConfigured()) {
            return registrationId -> null;
        }
        ClientRegistration google = ClientRegistration.withRegistrationId("google")
                .clientId(googleClientId)
                .clientSecret(googleClientSecret)
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri(googlePublicBaseUrl + "/login/oauth2/code/google")
                .scope(googleScope.split(","))
                .authorizationUri("https://accounts.google.com/o/oauth2/v2/auth")
                .tokenUri("https://www.googleapis.com/oauth2/v4/token")
                .userInfoUri("https://www.googleapis.com/oauth2/v3/userinfo")
                .userNameAttributeName("sub")
                .jwkSetUri("https://www.googleapis.com/oauth2/v3/certs")
                .clientName("Google")
                .build();
        return new InMemoryClientRegistrationRepository(google);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(allowedOrigins.split(",")));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-Requested-With"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) ->
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized"))
                .accessDeniedHandler((request, response, accessDeniedException) ->
                    response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access Denied"))
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/v1/auth/register",
                    "/api/v1/auth/login",
                    "/api/v1/auth/refresh",
                    "/api/v1/auth/forgot-password",
                    "/api/v1/auth/reset-password",
                    "/api/v1/auth/verify-email",
                    // permitAll: also serves the unauthenticated "completing an MFA
                    // login" case (challengeToken proves the password step already
                    // succeeded). The "confirming /mfa/setup" case checks the
                    // authenticated principal itself inside the controller.
                    "/api/v1/auth/mfa/verify",
                    // Public marketing stat (aggregate count only, no personal data) —
                    // used by the homepage sign-up counter ahead of course launch.
                    "/api/v1/auth/users/count",
                    "/login/**",
                    "/oauth2/**",
                    "/actuator/health",
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html"
                ).permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .oauth2Login(oauth2 -> oauth2
                .successHandler(oAuth2SuccessHandler)
                // Spring's default failure target ("/login?error") is resolved
                // relative to the request as zma-auth sees it — the private
                // Railway hostname behind the gateway proxy, which a real
                // browser can never reach. Must be an absolute, public URL.
                .failureUrl(frontendUrl + "/auth/login?error=oauth")
            );
        return http.build();
    }
}
