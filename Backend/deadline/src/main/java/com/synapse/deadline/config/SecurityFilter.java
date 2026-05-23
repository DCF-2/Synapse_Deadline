package com.synapse.deadline.config;

import com.synapse.deadline.repository.EmpresaRepository;
import com.synapse.deadline.service.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    @Autowired
    private TokenService tokenService;

    @Autowired
    private EmpresaRepository repository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        // 1. Extrai o token do cabeçalho Authorization
        String token = recoverToken(request);
        
        if (token != null) {
            // 2. Valida o token e pega o e-mail (subject)
            String email = tokenService.validarToken(token);

            if (email.isEmpty()) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token inválido");
                return;
            }

            // 3. Se o e-mail for válido, busca a empresa e autentica no Spring Security
            var empresa = repository.findByEmailLogin(email).orElse(null);

            if (empresa == null) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Empresa não encontrada no token");
                return;
            }

            // Cria o objeto de autenticação do Spring (sem roles/permissões por enquanto)
            var authentication = new UsernamePasswordAuthenticationToken(empresa, null, Collections.emptyList());

            // Salva a autenticação no contexto do Spring para essa requisição
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        // 4. Continua o fluxo normal da requisição
        filterChain.doFilter(request, response);
    }

    private String recoverToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        return authHeader.replace("Bearer ", "");
    }
}