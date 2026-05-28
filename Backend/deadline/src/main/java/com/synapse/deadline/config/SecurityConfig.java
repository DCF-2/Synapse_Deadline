package com.synapse.deadline.config;

import com.synapse.deadline.controller.ProdutoEmpresaController;
import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final ProdutoEmpresaController produtoEmpresaController;

    private final SecurityFilter securityFilter;

    @Value("${cors.allowed.origins}")
    private String allowedOrigins;

    public SecurityConfig(SecurityFilter securityFilter, ProdutoEmpresaController produtoEmpresaController) {
        this.securityFilter = securityFilter;
        this.produtoEmpresaController = produtoEmpresaController;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authorize -> authorize

                // --- ENDPOINTS PÚBLICOS DO FRONTEND ---
                .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/empresa/cadastro").permitAll()

                // --- ENDPOINTS PÚBLICOS DO CONSUMIDOR ---
                // O asterisco duplo (/**) garante que /oferta/publico/1 (detalhes) também fica aberto
                .requestMatchers(HttpMethod.GET, "/oferta/publico/**").permitAll() 
                .requestMatchers(HttpMethod.GET, "/empresa/ramo/publico").permitAll()
                
                // Permite que o frontend busque a lista de categorias sem token!
                .requestMatchers(HttpMethod.GET, "/categoria").permitAll() 
                
                // Ferramentas de Dev
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**").permitAll()

                // Qualquer outra requisição precisa de autenticação
                .anyRequest().authenticated()
            )
            .headers(headers -> headers.frameOptions(frame -> frame.disable()))
            .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.stream(allowedOrigins.split(",")).map(String::trim).toList());
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
