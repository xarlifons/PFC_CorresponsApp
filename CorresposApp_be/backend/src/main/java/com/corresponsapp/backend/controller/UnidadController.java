package com.corresponsapp.backend.controller;

import com.corresponsapp.backend.dto.ConsensoUmbralLimpiezaUnidad;
import com.corresponsapp.backend.dto.EstadoFase1DTO;
import com.corresponsapp.backend.dto.MiembroDTO;
import com.corresponsapp.backend.dto.SurveyParametersDTO;
import com.corresponsapp.backend.dto.TareaUnidadDTO;
import com.corresponsapp.backend.dto.UnidadConfiguracionDTO;
import com.corresponsapp.backend.dto.UnidadInfoResponse;
import com.corresponsapp.backend.model.Tarea;
import com.corresponsapp.backend.model.Unidad;
import com.corresponsapp.backend.model.User;
import com.corresponsapp.backend.service.UnidadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.corresponsapp.backend.repository.UserRepository;
import com.corresponsapp.backend.repository.UnidadRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
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
			return ResponseEntity.badRequest().body("❌ Error al crear unidad: " + e.getMessage());
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
			return ResponseEntity.badRequest().body("❌ Error al unirse a la unidad: " + e.getMessage());
		}
	}

    @GetMapping("/{unidadId}")
    public ResponseEntity<?> obtenerConfiguracionUnidad(@PathVariable("unidadId") String unidadId) {
        try {
            Optional<Unidad> opt = unidadService.obtenerUnidadPorId(unidadId);
            if (opt.isEmpty()) {
                return ResponseEntity
                    .badRequest()
                    .body("❌ Unidad no encontrada con ID: " + unidadId);
            }

            Unidad u = opt.get();
            UnidadConfiguracionDTO dto = new UnidadConfiguracionDTO();

            // Copiamos los campos básicos
            dto.setModulosActivados(u.getModulosActivados());
            dto.setCicloCorresponsabilidad(u.getCicloCorresponsabilidad());
            dto.setEstadoFase1(u.getEstadoFase1());           // ← aquí añadimos estadoFase1

            // Mapeamos tareasUnidad a TareaUnidadDTO
            List<TareaUnidadDTO> lista = new ArrayList<>();
            if (u.getTareasUnidad() != null) {
                for (Tarea t : u.getTareasUnidad()) {
                    TareaUnidadDTO tDto = new TareaUnidadDTO();
                    tDto.setId(t.getId());
                    tDto.setNombre(t.getNombre());
                    tDto.setModulo(t.getModulo());
                    // casteo/redondeo double → int
                    tDto.setTiempoEstimado((int) Math.round(t.getTiempoEstimado()));
                    tDto.setDefinicion(t.getDefinicion());
                    tDto.setEsPlantilla(t.isEsPlantilla());
                    lista.add(tDto);
                }
            }
            dto.setTareasUnidad(lista);

            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("❌ Error al obtener configuración de unidad: " + e.getMessage());
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

			List<MiembroDTO> miembros = unidad.getMiembros().stream().map(userId -> userRepository.findById(userId))
					.filter(Optional::isPresent).map(opt -> {
						User u = opt.get();
						return new MiembroDTO(u.getId(), u.getNombre(), u.getEmail(), u.getSurveyParameters(), u.getUmbralLimpieza() );
					}).toList();

			UnidadInfoResponse response = new UnidadInfoResponse(unidad.getNombre(), unidad.getModulosActivados(),
					unidad.getCicloCorresponsabilidad(), miembros);

			return ResponseEntity.ok(response);
		} catch (Exception e) {
			return ResponseEntity.status(500).body("Error al obtener la información de la unidad: " + e.getMessage());
		}
	}



	private String obtenerUserIdDesdeToken() {
		User userReg = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		String email = userReg.getEmail();
		System.out.println("🔐 Email extraído del JWT (principal): " + email); // debug log
		return userRepository.findByEmail(email).map(user -> {
			System.out.println("✅ Usuario encontrado: " + user.getId());
			return user.getId();
		}).orElseThrow(() -> {
			System.out.println("❌ Usuario NO encontrado con email: " + email);
			return new RuntimeException("Usuario no encontrado");
		});
	}
	
	@PutMapping("/{unidadId}/estado-fase1")
	public ResponseEntity<?> actualizarEstadoFase1(@PathVariable String unidadId,
			@RequestBody EstadoFase1DTO estadoDTO) {

		System.out.println("✅ Se ha accedido correctamente al endpoint /estado-fase1");
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		System.out.println("👤 Usuario autenticado desde SecurityContext: " + auth);
		System.out.println("🔐 Principal: " + auth.getPrincipal());

		try {
			Unidad unidadActualizada = unidadService.actualizarEstadoFase1(unidadId, estadoDTO.getEstadoFase1());
			return ResponseEntity.ok(unidadActualizada);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body("❌ Error al actualizar estadoFase1: " + e.getMessage());
		}
	}

	@GetMapping("/{unidadId}/estado-fase1")
	public ResponseEntity<EstadoFase1DTO> obtenerEstadoFase1(
	    @PathVariable("unidadId") String unidadId
	) {
	    try {
	        String estado = unidadService.obtenerEstadoFase1(unidadId);
	        EstadoFase1DTO dto = new EstadoFase1DTO();
	        dto.setEstadoFase1(estado);
	        return ResponseEntity.ok(dto);
	    } catch (Exception e) {
	        return ResponseEntity
	            .badRequest()
	            .body(new EstadoFase1DTO());
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
	public ResponseEntity<?> configurarUnidad(@PathVariable String unidadId,
			@RequestBody UnidadConfiguracionDTO configuracionDTO) {
		try {
			String userId = obtenerUserIdDesdeToken(); // usuario autenticado
			unidadService.configurarUnidad(unidadId, configuracionDTO);
			return ResponseEntity.ok("✅ Unidad configurada correctamente");
		} catch (Exception e) {
			return ResponseEntity.status(400).body("❌ Error al configurar unidad: " + e.getMessage());
		}
	}
	
	@GetMapping("/{unidadId}/consenso-fase1")
	public ResponseEntity<?> obtenerConsensoFase1(@PathVariable String unidadId) {
	    try {
	        System.out.println("📥 Petición recibida para consenso fase1 de unidad: " + unidadId);
	        Map<String, SurveyParametersDTO> consenso = unidadService.obtenerConsensoFase1(unidadId);
	        System.out.println("✅ Consenso generado con " + consenso.size() + " tareas.");
	        return ResponseEntity.ok(consenso);
	    } catch (Exception e) {
	        System.err.println("❌ Error en obtenerConsensoFase1: " + e.getMessage());
	        e.printStackTrace();
	        return ResponseEntity.status(500).body("❌ Error al obtener consenso fase 1: " + e.getMessage());
	    }
	}
	
	@PostMapping("/{unidadId}/consenso-fase1")
	public ResponseEntity<?> guardarConsensoFase1(
	        @PathVariable String unidadId,
	        @RequestBody List<ConsensoUmbralLimpiezaUnidad> consenso) {
	    try {
	        unidadService.guardarConsensoInicial(unidadId, consenso);
	        return ResponseEntity.ok("✅ Consenso fase 1 guardado correctamente");
	    } catch (Exception e) {
	        return ResponseEntity.status(500).body("❌ Error al guardar consenso fase 1: " + e.getMessage());
	    }
	}

	 @PutMapping("/{unidadId}/consenso-final")
	 public ResponseEntity<?> guardarConsensoFinal(
	         @PathVariable String unidadId,
	         @RequestBody List<ConsensoUmbralLimpiezaUnidad> consensoFinal) {
		 
		 System.out.println("📥 Endpoint CONSENSO-FINAL hit para unidad: " + unidadId);
		    System.out.println("📋 Payload recibido: " + consensoFinal);
	     try {
	         unidadService.guardarConsensoFinal(unidadId, consensoFinal);
	         return ResponseEntity.ok("✅ Consenso final guardado correctamente");
	     } catch (Exception e) {
	         return ResponseEntity
	             .status(HttpStatus.BAD_REQUEST)
	             .body("❌ Error al guardar consenso final: " + e.getMessage());
	     }
	 }

}
