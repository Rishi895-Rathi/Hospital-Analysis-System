package com.example.demo.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // ─── Public ───────────────────────────────────
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/patient/add").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/appointment/book").permitAll()
                        .requestMatchers("/swagger-ui.html",
                                "/swagger-ui/**",
                                "/api-docs/**").permitAll()

                        // ─── Doctor only ──────────────────────────────
                        .requestMatchers(HttpMethod.POST, "/api/doctor/add").hasRole("DOCTOR")
                        .requestMatchers(HttpMethod.PUT, "/api/doctor/update/**").hasRole("DOCTOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/doctor/delete/**").hasRole("DOCTOR")
                        .requestMatchers(HttpMethod.GET, "/api/doctor/**").hasAnyRole("DOCTOR", "PATIENT")

                        // ─── Patient endpoints ────────────────────────
                        .requestMatchers(HttpMethod.GET, "/api/patient/all").hasRole("DOCTOR")
                        .requestMatchers(HttpMethod.GET, "/api/patient/**").hasAnyRole("DOCTOR", "PATIENT")
                        .requestMatchers(HttpMethod.PUT, "/api/patient/update/**").hasAnyRole("DOCTOR", "PATIENT")
                        .requestMatchers(HttpMethod.DELETE, "/api/patient/delete/**").hasAnyRole("DOCTOR", "PATIENT")

                        // ─── Appointment endpoints ────────────────────
                        .requestMatchers(HttpMethod.GET, "/api/appointment/suggest-doctors/**").hasAnyRole("DOCTOR", "PATIENT")
                        .requestMatchers(HttpMethod.POST, "/api/appointment/book").hasAnyRole("DOCTOR", "PATIENT")
                        .requestMatchers(HttpMethod.GET, "/api/appointment/all").hasRole("DOCTOR")
                        .requestMatchers(HttpMethod.PUT, "/api/appointment/confirm/**").hasRole("DOCTOR")
                        .requestMatchers(HttpMethod.PUT, "/api/appointment/cancel/**").hasRole("DOCTOR")
                        .requestMatchers(HttpMethod.GET, "/api/appointment/patient/**").hasAnyRole("DOCTOR", "PATIENT")

                        // ─── Billing endpoints ────────────────────────
                        .requestMatchers("/api/billing/**").hasRole("DOCTOR")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}