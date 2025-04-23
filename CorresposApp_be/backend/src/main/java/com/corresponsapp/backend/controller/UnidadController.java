package com.corresponsapp.backend.controller;

import com.corresponsapp.backend.dto.EstadoFase1DTO;
import com.corresponsapp.backend.dto.MiembroDTO;
import com.corresponsapp.backend.dto.UnidadConfiguracionDTO;
import com.corresponsapp.backend.dto.UnidadInfoResponse;
import com.corresponsapp.backend.model.Unidad;
import com.corresponsapp.backend.model.User;
import com.corresponsapp.backend.service.UnidadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.corresponsapp.backend.repository.UserRepository;
import com.corresponsapp.backend.repository.UnidadRepository;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/unidad")
public class UnidadController {

    @Autowired
    private UnidadService unidadService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UnidadRepository unidadRepository;

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
   
    @GetMapping("/{unidadId}/info-completa")
    public ResponseEntity<?> obtenerInfoCompletaUnidad(@PathVariable String unidadId) {
        try {
            Optional<Unidad> unidadOpt = unidadRepository.findById(unidadId);

            if (unidadOpt.isEmpty()) {
                return ResponseEntity.status(404).body("Unidad no encontrada");
            }

            Unidad unidad = unidadOpt.get();

            List<MiembroDTO> miembros = unidad.getMiembros().stream()
                    .map(userId -> userRepository.findById(userId))
                    .filter(Optional::isPresent)
                    .map(opt -> {
                        User u = opt.get();
                        return new MiembroDTO(u.getId(), u.getNombre(), u.getEmail());
                    })
                    .toList();

            UnidadInfoResponse response = new UnidadInfoResponse(
                    unidad.getNombre(),
                    unidad.getModulosActivados(),
                    unidad.getCicloCorresponsabilidad(),
                    miembros
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al obtener la información de la unidad: " + e.getMessage());
        }
    }
    
    @PutMapping("/{unidadId}/estado-fase1")
    public ResponseEntity<?> actualizarEstadoFase1(
            @PathVariable String unidadId,
            @RequestBody EstadoFase1DTO estadoDTO) {
    	
    	System.out.println("✅ Se ha accedido correctamente al endpoint /estado-fase1");
    	Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    	System.out.println("👤 Usuario autenticado desde SecurityContext: " + auth);
    	System.out.println("🔐 Principal: " + auth.getPrincipal());
    	
        try {         
            Unidad unidadActualizada = unidadService.actualizarEstadoFase1(unidadId, estadoDTO.getEstadoFase1());
            return ResponseEntity.ok(unidadActualizada);
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body("❌ Error al actualizar estadoFase1: " + e.getMessage());
        }
    }
    
    private String obtenerUserIdDesdeToken() {
    	User userReg = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    	String email = userReg.getEmail();
        System.out.println("🔐 Email extraído del JWT (principal): " + email); // debug log
        return userRepository.findByEmail(email)
        		 .map(user -> {
                     System.out.println("✅ Usuario encontrado: " + user.getId());
                     return user.getId();
                 })
                 .orElseThrow(() -> {
                     System.out.println("❌ Usuario NO encontrado con email: " + email);
                     return new RuntimeException("Usuario no encontrado");
                 });
    }
    
    @GetMapping("/{unidadId}/estado-fase1")
    public ResponseEntity<?> obtenerEstadoFase1(@PathVariable String unidadId) {
        try {
            String estado = unidadService.obtenerEstadoFase1(unidadId);
            return ResponseEntity.ok(estado);
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body("❌ Error al obtener estadoFase1: " + e.getMessage());
        }
    }

    @GetMapping("/{unidadId}/miembros")
    public ResponseEntity<?> obtenerMiembrosDeUnidad(@PathVariable String unidadId) {
        Optional<Unidad> unidadOpt = unidadRepository.findById(unidadId);

        if (unidadOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Unidad no encontrada");
        }

        Unidad unidad = unidadOpt.get();
        List<String> idMiembros = unidad.getMiembros();

        List<User> miembros = userRepository.findAllById(idMiembros);
        return ResponseEntity.ok(miembros);
    }
    
    @PutMapping("/{unidadId}/configurar")
    public ResponseEntity<?> configurarUnidad(
            @PathVariable String unidadId,
            @RequestBody UnidadConfiguracionDTO configuracionDTO) {

        try {
            Optional<Unidad> unidadOpt = unidadRepository.findById(unidadId);
            if (unidadOpt.isEmpty()) {
                return ResponseEntity.status(404).body("Unidad no encontrada");
            }

            Unidad unidad = unidadOpt.get();

            unidad.setModulosActivados(configuracionDTO.getModulosActivados());
            unidad.setCicloCorresponsabilidad(configuracionDTO.getCicloCorresponsabilidad());
            unidad.setEstadoFase1("momento2"); // avanzamos en el flujo

            unidadRepository.save(unidad);

            return ResponseEntity.ok(unidad);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("❌ Error al configurar unidad: " + e.getMessage());
        }
    }


}
