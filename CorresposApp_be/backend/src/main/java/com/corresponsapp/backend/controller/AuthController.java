package com.corresponsapp.backend.controller;

import com.corresponsapp.backend.dto.LoginRequest;
import com.corresponsapp.backend.dto.LoginResponse;
import com.corresponsapp.backend.dto.RegisterRequest;
import com.corresponsapp.backend.model.User;
import com.corresponsapp.backend.service.AuthService;
import com.corresponsapp.backend.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;

    public AuthController(AuthService authService, JwtUtil jwtUtil) {
        this.authService = authService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest request) {  
        try {
            User newUser = new User(request.getNombre(), request.getEmail(), request.getPassword(), "USER");
            LoginResponse response = authService.register(newUser);
            
            System.out.println("[AUTENTICACIÓN] Nuevo usuario/a en la BD.");
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request.getEmail(), request.getPassword());
            
            System.out.println("[AUTENTICACIÓN] Usuario/a con correo-e " + request.getEmail() + " autenticado en la app.");
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("[AUTENTICACIÓN] Error: " + e.getMessage());
        }
    }
   
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(Authentication authentication) {
        try {
            User userReg = (User) authentication.getPrincipal(); 

            String newToken = jwtUtil.generateToken(userReg);

            return ResponseEntity.ok(new LoginResponse(
                newToken,
                userReg.getId(),
                userReg.getNombre(),
                userReg.getEmail(),
                userReg.getRole(),
                userReg.getUnidadAsignada()
            ));
        } catch (Exception e) {
            System.out.println("[AUTENTICACIÓN] ❌ Error al renovar token: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("[AUTENTICACIÓN] Error al renovar token: " + e.getMessage());
        }
    }

}