package com.example.demo.security;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // NOTE: this is a same-origin demo app with a plain HTML/JS frontend served by
                // Spring itself, not a public multi-client API. CSRF is disabled here to keep the
                // session-login flow simple and reliable. If you ever open this API to another
                // origin, or move to a real production deployment, re-enable CSRF protection
                // (or switch to token-based auth, e.g. JWT) instead of leaving this as-is.
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/", "/index.html", "/login.html", "/register.html",
                                "/style.css", "/auth.js", "/index.js", "/favicon.ico"
                        ).permitAll()
                        .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form
                        .loginProcessingUrl("/api/auth/login")
                        .usernameParameter("email")
                        .passwordParameter("password")
                        .successHandler((req, res, authentication) -> res.setStatus(HttpServletResponse.SC_OK))
                        .failureHandler((req, res, ex) ->
                                res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid email or password"))
                )
                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .logoutSuccessHandler((req, res, authentication) -> res.setStatus(HttpServletResponse.SC_OK))
                )
                .exceptionHandling(handling -> handling
                        .authenticationEntryPoint((req, res, ex) ->
                                res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Please log in"))
                );

        return http.build();
    }
}
