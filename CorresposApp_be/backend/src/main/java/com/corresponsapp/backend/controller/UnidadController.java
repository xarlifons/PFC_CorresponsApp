package com.corresponsapp.backend.controller;

import com.corresponsapp.backend.dto.ConsensoUmbralLimpiezaUnidad;
import com.corresponsapp.backend.dto.EstadoFase1DTO;
import com.corresponsapp.backend.dto.MiembroDTO;
import com.corresponsapp.backend.dto.TareaInstanciaDTO;
import com.corresponsapp.backend.dto.TareaParametroDTO;
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

import java.time.LocalDate;
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

	@PostMapping("/crear")
	public ResponseEntity<?> crearUnidad(@RequestBody Unidad unidad) {
		try {
			String userId = obtenerUserIdDesdeToken();
			Unidad nueva = unidadService.crearUnidad(unidad, userId);
			
	        System.out.println("[UNIDADCONTROLLER] Unidad " + unidad + " creada con éxito.");
	        
	        Map<String, Object> respuesta = Map.of(
	        		"id", nueva.getId(),
	                "nombre", nueva.getNombre(),
	                "codigoAcceso", nueva.getCodigoAcceso()
	            );
			
			return ResponseEntity.ok(respuesta);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body("[UNIDADCONTROLLER] Error al crear unidad: " + e.getMessage());
		}
	}

	@PostMapping("/unirse")
	public ResponseEntity<?> unirseUnidad(@RequestParam String codigo) {
		try {
			String userId = obtenerUserIdDesdeToken();
			Optional<Unidad> unidad = unidadService.unirseUnidad(codigo, userId);
			if (unidad.isPresent()) {
				
		        System.out.println("[UNIDADCONTROLLER] Usuario/a " + userId + " añadida con éxito a la unidad");
				
				return ResponseEntity.ok(unidad.get());
			} else {
				return ResponseEntity.badRequest().body("[UNIDADCONTROLLER] No se encontró una unidad con ese código.");
			}
		} catch (Exception e) {
			return ResponseEntity.badRequest().body("[UNIDADCONTROLLER] Error al unirse a la unidad: " + e.getMessage());
		}
	}

	@GetMapping("/{unidadId}")
	public ResponseEntity<?> obtenerConfiguracionUnidad(@PathVariable("unidadId") String unidadId) {
		try {
			Optional<Unidad> opt = unidadService.obtenerUnidadPorId(unidadId);
			if (opt.isEmpty()) {
				return ResponseEntity.badRequest().body("[UNIDADCONTROLLER] Unidad no encontrada con ID: " + unidadId);
			}

			Unidad u = opt.get();
			UnidadConfiguracionDTO dto = new UnidadConfiguracionDTO();

			dto.setModulosActivados(u.getModulosActivados());
			dto.setCicloCorresponsabilidad(u.getCicloCorresponsabilidad());
			dto.setEstadoFase1(u.getEstadoFase1());

			List<TareaUnidadDTO> lista = new ArrayList<>();
			if (u.getTareasUnidad() != null) {
				for (Tarea t : u.getTareasUnidad()) {
					TareaUnidadDTO tDto = new TareaUnidadDTO();
					tDto.setId(t.getId());
					tDto.setNombre(t.getNombre());
					tDto.setModulo(t.getModulo());
					tDto.setTiempoEstimado(t.getTiempoEstimado());
					tDto.setDefinicion(t.getDefinicion());
					tDto.setEsPlantilla(t.getEsPlantilla());
					tDto.setPeriodicidad(t.getPeriodicidad());
					tDto.setIntensidad(t.getIntensidad());
					tDto.setCargaMental(t.getCargaMental());

					lista.add(tDto);
				}
			}
			dto.setTareasUnidad(lista);

			return ResponseEntity.ok(dto);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("[UNIDADCONTROLLER] Error al obtener configuración de unidad: " + e.getMessage());
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
						return new MiembroDTO(u.getId(), u.getNombre(), u.getEmail(), u.getSurveyParameters(),
								u.getUmbralLimpieza());
					}).toList();

			UnidadInfoResponse response = new UnidadInfoResponse(unidad.getNombre(), unidad.getModulosActivados(),
					unidad.getCicloCorresponsabilidad(), miembros);

			return ResponseEntity.ok(response);
		} catch (Exception e) {
			return ResponseEntity.status(500).body("[UNIDADCONTROLLER] Error al obtener la información de la unidad: " + e.getMessage());
		}
	}

	private String obtenerUserIdDesdeToken() {
		User userReg = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		String email = userReg.getEmail();

		return userRepository.findByEmail(email).map(user -> {
			System.out.println("[UNIDADCONTROLLER] Usuario encontrado desde Token: " + user.getId());
			return user.getId();
		}).orElseThrow(() -> {
			System.out.println("[UNIDADCONTROLLER] Usuario NO encontrado con email: " + email);
			return new RuntimeException("[UNIDADCONTROLLER] Usuario no encontrado");
		});
	}

	@PutMapping("/{unidadId}/estado-fase1")
	public ResponseEntity<?> actualizarEstadoFase1(@PathVariable String unidadId,
			@RequestBody EstadoFase1DTO estadoDTO) {

		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		System.out.println("[UNIDADCONTROLLER] Usuario autenticado desde SecurityContext: " + auth);

		try {
			Unidad unidadActualizadaEstadoFae1 = unidadService.actualizarEstadoFase1(unidadId,
					estadoDTO.getEstadoFase1());
			return ResponseEntity.ok(unidadActualizadaEstadoFae1);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body("[UNIDADCONTROLLER] Error al actualizar estadoFase1: " + e.getMessage());
		}
	}

	@GetMapping("/{unidadId}/estado-fase1")
	public ResponseEntity<EstadoFase1DTO> obtenerEstadoFase1(@PathVariable("unidadId") String unidadId) {
		try {
			String estado = unidadService.obtenerEstadoFase1(unidadId);
			EstadoFase1DTO dto = new EstadoFase1DTO();
			dto.setEstadoFase1(estado);
			return ResponseEntity.ok(dto);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(new EstadoFase1DTO());
		}
	}

	@GetMapping("/{unidadId}/miembros")
	public ResponseEntity<?> obtenerMiembrosDeUnidad(@PathVariable String unidadId) {
		Optional<Unidad> unidadOpt = unidadRepository.findById(unidadId);

		if (unidadOpt.isEmpty()) {
			return ResponseEntity.status(404).body("[UNIDADCONTROLLER] Unidad no encontrada");
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
			unidadService.configurarUnidad(unidadId, configuracionDTO);
			return ResponseEntity.ok("[UNIDADCONTROLLER]  Unidad configurada correctamente");
		} catch (Exception e) {
			return ResponseEntity.status(400).body("[UNIDADCONTROLLER]  Error al configurar unidad: " + e.getMessage());
		}
	}

	@GetMapping("/{unidadId}/consenso-fase1")
	public ResponseEntity<?> obtenerConsensoInicial(@PathVariable String unidadId) {
		try {
			Map<String, TareaParametroDTO> consenso = unidadService.obtenerConsensoInicial(unidadId);
			System.out.println("[UNIDADCONTROLLER] Consenso generado con " + consenso.size() + " tareas.");
			return ResponseEntity.ok(consenso);
		} catch (Exception e) {
			System.err.println("[UNIDADCONTROLLER] Error en obtener consenso fase 1: " + e.getMessage());
			e.printStackTrace();
			return ResponseEntity.status(500).body("[UNIDADCONTROLLER] Error al obtener consenso fase 1: " + e.getMessage());
		}
	}

	@PostMapping("/{unidadId}/consenso-inicial")
	public ResponseEntity<?> guardarConsensoInicial(@PathVariable String unidadId,
			@RequestBody List<ConsensoUmbralLimpiezaUnidad> consensoInicial) {
		try {
			unidadService.guardarConsensoInicial(unidadId, consensoInicial);
			return ResponseEntity.ok("[UNIDADCONTROLLER] Consenso inicial guardado correctamente");
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("[UNIDADCONTROLLER]  Error al guardar consenso inicial: " + e.getMessage());
		}
	}

	@PutMapping("/{unidadId}/consenso-final")
	public ResponseEntity<?> guardarConsensoFinal(@PathVariable String unidadId,
			@RequestBody List<ConsensoUmbralLimpiezaUnidad> consensoFinal) {
		try {
			unidadService.guardarConsensoFinal(unidadId, consensoFinal);
			return ResponseEntity.ok("[UNIDADCONTROLLER]  Consenso final guardado correctamente");
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.body("[UNIDADCONTROLLER] Error al guardar consenso final: " + e.getMessage());
		}
	}

	@PostMapping("/{unidadId}/tareas/instanciar")
	public ResponseEntity<List<Tarea>> instanciarTareas(
	        @PathVariable String unidadId,
	        @RequestBody List<ConsensoUmbralLimpiezaUnidad> consensoPayload) {
	    try {
	        Unidad unidad = unidadService.obtenerUnidadPorId(unidadId)
	                .orElseThrow(() -> new RuntimeException("Unidad no encontrada"));
	        int ciclo = unidad.getCicloCorresponsabilidad();

	        List<TareaInstanciaDTO> dtos = unidadService.mapearDesdeConsenso(unidadId, consensoPayload);

	        List<Tarea> creadas = unidadService.generarInstancias(unidadId, dtos, ciclo, LocalDate.now());
			System.out.println("[UNIDADCONTROLLER] Instancias creadas y persistidas en la unidad: " + unidadId);

	        return ResponseEntity.ok(creadas);
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
	    }
	}


	@GetMapping("/{unidadId}/tareas/instanciadas")
	public ResponseEntity<List<Tarea>> getTareasInstanciadasDesdeUnidad(@PathVariable String unidadId) {
		try {
			List<Tarea> instanciadas = unidadService.obtenerTareasInstanciadas(unidadId);
			for (Tarea tarea : instanciadas) {
				System.err.println("[UNIDADCONTROLLER] Tareas instanciadas que devuelve el servidor: " + tarea.toString());
			}
			return ResponseEntity.ok(instanciadas);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}

}
