package com.synapse.deadline.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Configurações de CORS e CSRF
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            // A nossa API é REST (Stateless), não guarda sessão do utilizador
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authorize -> authorize
                // Liberar rotas públicas
                .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
                .requestMatchers("/login.html", "/css/**", "/js/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/empresa/cadastro").permitAll()
                
                // Qualquer outra rota exigirá o token JWT
                .anyRequest().authenticated()
            );

        return http.build();
    }

    // Regista o BCrypt como o codificador oficial de palavras-passe do projeto
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 👇 2. CRIE ESTE MÉTODO PARA DIZER QUEM PODE ACESSAR A API 👇
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
        
        // Libera o acesso para o seu React
        configuration.setAllowedOrigins(java.util.List.of("http://localhost:5173")); 
        
        // Libera os métodos HTTP (O 'OPTIONS' é o que resolve o seu erro de Preflight!)
        configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS")); 
        
        // Libera o envio de cabeçalhos (como o Content-Type)
        configuration.setAllowedHeaders(java.util.List.of("*")); 
        
        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}