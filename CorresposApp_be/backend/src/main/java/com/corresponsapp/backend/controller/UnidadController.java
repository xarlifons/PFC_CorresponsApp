package com.corresponsapp.backend.controller;

import com.corresponsapp.backend.model.Unidad;
import com.corresponsapp.backend.service.UnidadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/unidad")
public class UnidadController {

    @Autowired
    private UnidadService unidadService;

    // Crear una nueva unidad (userId se obtiene del token)
    @PostMapping("/crear")
    public ResponseEntity<?> crearUnidad(@RequestBody Unidad unidad) {
        try {
            String userId = obtenerUserIdDesdeToken();
            Unidad nueva = unidadService.crearUnidad(unidad, userId);
            return ResponseEntity.ok(nueva);
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body("❌ Error al crear unidad: " + e.getMessage());
        }
    }

    // Unirse a una unidad por código
    @PostMapping("/unirse")
    public ResponseEntity<?> unirseUnidad(@RequestParam String codigo) {
        try {
            String userId = obtenerUserIdDesdeToken();
            Optional<Unidad> unidad = unidadService.unirseUnidad(codigo, userId);
            if (unidad.isPresent()) {
                return ResponseEntity.ok(unidad.get());
            } else {
                return ResponseEntity.badRequest().body("❌ No se encontró una unidad con ese código.");
            }
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body("❌ Error al unirse a la unidad: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerUnidad(@PathVariable String id) {
        try {
            Optional<Unidad> unidad = unidadService.obtenerUnidadPorId(id);
            if (unidad.isPresent()) {
                return ResponseEntity.ok(unidad.get());
            } else {
                return ResponseEntity
                        .badRequest()
                        .body("❌ Unidad no encontrada con ID: " + id);
            }
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body("❌ Error al obtener unidad: " + e.getMessage());
        }
    }


    // Obtener ID usuario autenticado desde JWT
    private String obtenerUserIdDesdeToken() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName(); // asumimos que 'name' es el ID o email
    }
}
