package com.example.demo;

import com.example.demo.security.JwtFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public UserDetailsService userDetailsService() {
        return new InMemoryUserDetailsManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/v3/api-docs",
                                "/swagger-resources/**",
                                "/webjars/**"
                        ).permitAll()

                        .requestMatchers(HttpMethod.PUT, "/api/doctor/leave/**").hasRole("DOCTOR")
                        .requestMatchers(HttpMethod.PUT, "/api/doctor/return/**").hasRole("DOCTOR")
                        .requestMatchers(HttpMethod.PUT, "/api/doctor/update/**").hasRole("DOCTOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/doctor/delete/**").hasRole("DOCTOR")
                        .requestMatchers(HttpMethod.GET, "/api/doctor/**").hasAnyRole("DOCTOR", "PATIENT")

                        .requestMatchers(HttpMethod.GET, "/api/patient/all").hasRole("DOCTOR")
                        .requestMatchers(HttpMethod.GET, "/api/patient/**").hasAnyRole("DOCTOR", "PATIENT")
                        .requestMatchers(HttpMethod.PUT, "/api/patient/update/**").hasAnyRole("DOCTOR", "PATIENT")
                        .requestMatchers(HttpMethod.DELETE, "/api/patient/delete/**").hasAnyRole("DOCTOR", "PATIENT")

                        .requestMatchers(HttpMethod.GET, "/api/appointment/suggest-doctors/**").hasAnyRole("DOCTOR", "PATIENT")
                        .requestMatchers(HttpMethod.POST, "/api/appointment/book").hasAnyRole("DOCTOR", "PATIENT")
                        .requestMatchers(HttpMethod.GET, "/api/appointment/all").hasRole("DOCTOR")
                        .requestMatchers(HttpMethod.PUT, "/api/appointment/confirm/**").hasRole("DOCTOR")
                        .requestMatchers(HttpMethod.PUT, "/api/appointment/cancel/**").hasRole("DOCTOR")
                        .requestMatchers(HttpMethod.GET, "/api/appointment/patient/**").hasAnyRole("DOCTOR", "PATIENT")
                        .requestMatchers(HttpMethod.GET, "/api/appointment/doctor/**").hasRole("DOCTOR")

                        .requestMatchers("/api/billing/**").hasRole("DOCTOR")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}