package com.corresponsapp.backend.controller;

import com.corresponsapp.backend.model.Tarea;
import com.corresponsapp.backend.service.TareaService;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tareas")
public class TareaController {

	private final TareaService tareaService;

	public TareaController(TareaService tareaService) {
		this.tareaService = tareaService;
	}

	@GetMapping
	public ResponseEntity<Resource> getTareasBase() {
		try {
			Resource resource = new ClassPathResource("tareas.json");
			return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(resource);
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(null);
		}
	}

	@PostMapping
	public Tarea crearTarea(@RequestBody Tarea tarea) {
		return tareaService.crearTarea(tarea);
	}

	@GetMapping("/{id}")
	public Optional<Tarea> obtenerTareaPorId(@PathVariable String id) {
		return tareaService.obtenerTareaPorId(id);
	}

	@GetMapping("/unidad/{unidadId}")
	public List<Tarea> obtenerTareasPorUnidad(@PathVariable String unidadId) {
		return tareaService.obtenerTareasPorUnidad(unidadId);
	}

	@GetMapping("/unidad/{unidadId}/modulo/{modulo}")
	public List<Tarea> obtenerTareasPorUnidadYModulo(@PathVariable String unidadId, @PathVariable String modulo) {
		return tareaService.obtenerTareasPorUnidadYModulo(unidadId, modulo);
	}

	@PutMapping("/{id}")
	public Tarea actualizarTarea(@PathVariable String id, @RequestBody Tarea tarea) {
		return tareaService.actualizarTarea(id, tarea);
	}

	@DeleteMapping("/{id}")
	public void eliminarTarea(@PathVariable String id) {
		tareaService.eliminarTarea(id);
	}
}
