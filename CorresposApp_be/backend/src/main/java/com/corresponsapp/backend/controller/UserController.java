package com.corresponsapp.backend.controller;

import com.corresponsapp.backend.model.User;
import com.corresponsapp.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @PutMapping("/asignar-unidad/{unidadId}")
    public ResponseEntity<?> asignarUnidad(@PathVariable String unidadId) {
        String email = getEmailDesdeToken();

        // LOG: Inicio del proceso
        System.out.println("📥 Solicitud de asignación de unidad recibida");
        System.out.println("🔐 Email extraído del token JWT: " + email);
        System.out.println("🔍 ID de unidad recibido: " + unidadId);

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            System.out.println("❌ Usuario no encontrado con email: " + email);
            return ResponseEntity.status(404).body("Usuario no encontrado");
        }

        User user = userOpt.get();
        System.out.println("👤 Usuario antes de la actualización: " + user.getEmail() + " | Unidad actual: " + user.getUnidadAsignada());

        user.setUnidadAsignada(unidadId);
        userRepository.save(user);

        System.out.println("✅ Unidad asignada correctamente: " + unidadId + " al usuario: " + user.getEmail());

        return ResponseEntity.ok(user); // 🔄 devolvemos el usuario actualizado
    }


    private String getEmailDesdeToken() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth != null && auth.getPrincipal() instanceof User) {
            User user = (User) auth.getPrincipal();
            System.out.println("🔐 Email extraído del principal (User): " + user.getEmail());
            return user.getEmail();
        } else {
            System.out.println("❌ No se pudo extraer el email: el principal no es un User");
            throw new RuntimeException("No se pudo extraer el email desde el token JWT.");
        }
    }
}
