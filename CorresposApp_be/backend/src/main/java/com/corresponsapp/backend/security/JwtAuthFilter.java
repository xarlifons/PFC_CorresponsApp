package com.corresponsapp.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.corresponsapp.backend.repository.UserRepository;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public JwtAuthFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

//    @Override
//    protected void doFilterInternal(
//            HttpServletRequest request,
//            HttpServletResponse response,
//            FilterChain filterChain
//    ) throws ServletException, IOException {
//        String authHeader = request.getHeader("Authorization");
//
//        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
//            filterChain.doFilter(request, response);
//            return;
//        }
//
//        String token = authHeader.substring(7);
//        String email = jwtUtil.extractUsername(token);
//
//        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
//            userRepository.findByEmail(email).ifPresent(user -> {
//                if (jwtUtil.validateToken(token, email)) {
//                    UsernamePasswordAuthenticationToken authToken =
//                        new UsernamePasswordAuthenticationToken(user.getEmail(), null, Collections.emptyList());
//                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
//                    SecurityContextHolder.getContext().setAuthentication(authToken);
//                }
//            });
//        }
//
//        filterChain.doFilter(request, response);
//    }
    
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("ℹ️ No se procesó JWT: cabecera Authorization ausente o mal formada para esta petición.");
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        String email = jwtUtil.extractUsername(token);

        System.out.println("🔍 Token recibido: " + token);
        System.out.println("📧 Email extraído del token: " + email);

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            userRepository.findByEmail(email).ifPresentOrElse(user -> {
                if (jwtUtil.validateToken(token, email)) {
                    System.out.println("✅ Token válido. Autenticando al usuario.");
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                            		user, null,  List.of(new SimpleGrantedAuthority("ROLE_USER")));
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    System.out.println("❌ Token inválido.");
                }
            }, () -> {
                System.out.println("❌ Usuario no encontrado en la base de datos con email: " + email);
            });
        }

        filterChain.doFilter(request, response);
    }

}
