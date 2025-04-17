package com.corresponsapp.backend.controller;

import com.corresponsapp.backend.dto.LoginRequest;
import com.corresponsapp.backend.dto.LoginResponse;
import com.corresponsapp.backend.dto.RegisterRequest;
import com.corresponsapp.backend.model.User;
import com.corresponsapp.backend.service.AuthService;
import com.corresponsapp.backend.security.JwtUtil;
import java.util.Optional;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;

    @Autowired
    public AuthController(AuthService authService, JwtUtil jwtUtil) {
        this.authService = authService;
        this.jwtUtil = jwtUtil; // 💡 inyectamos la dependencia
    }

    // auth/register
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest request) {  
        try {
            User newUser = new User(request.getNombre(), request.getEmail(), request.getPassword(), "USER");
            LoginResponse response = authService.register(newUser);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
 // auth/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request.getEmail(), request.getPassword());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(Authentication authentication) {
        try {
            String email = authentication.getName(); // obtenido del JWT
            Optional<User> userOpt = authService.getByEmail(email);

            if (userOpt.isEmpty()) {
                return ResponseEntity.status(401).body("Usuario no encontrado");
            }

            User user = userOpt.get();
            String newToken = jwtUtil.generateToken(user);

            return ResponseEntity.ok(new LoginResponse(
                newToken,
                user.getNombre(),
                user.getEmail(),
                user.getRole(),
                user.getUnidadAsignada()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al renovar token: " + e.getMessage());
        }
    }

}