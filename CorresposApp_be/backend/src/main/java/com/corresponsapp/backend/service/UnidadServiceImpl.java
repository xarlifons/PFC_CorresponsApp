package com.corresponsapp.backend.service;

import com.corresponsapp.backend.dto.ConsensoUmbralLimpiezaUnidad;
import com.corresponsapp.backend.dto.SurveyParametersDTO;
import com.corresponsapp.backend.dto.TareaInstanciaDTO;
import com.corresponsapp.backend.dto.TareaUnidadDTO;
import com.corresponsapp.backend.dto.UnidadConfiguracionDTO;
import com.corresponsapp.backend.model.Tarea;
import com.corresponsapp.backend.model.Unidad;
import com.corresponsapp.backend.repository.TareaRepository;
import com.corresponsapp.backend.repository.UnidadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UnidadServiceImpl implements UnidadService {

	private final UnidadRepository unidadRepository;
	private final TareaPlantillaService tareaPlantillaService;
	private final TareaRepository tareaRepository;

	@Autowired
	private SurveyService surveyService;

	@Autowired
	public UnidadServiceImpl(UnidadRepository unidadRepository, TareaPlantillaService tareaPlantillaService,
			TareaRepository tareaRepository, SurveyService surveyService) {
		super();
		this.unidadRepository = unidadRepository;
		this.tareaPlantillaService = tareaPlantillaService;
		this.tareaRepository = tareaRepository;
		this.surveyService = surveyService;
	}

	@Override
	public Unidad crearUnidad(Unidad unidad, String creadorId) {
		unidad.setCreadorId(creadorId);
		unidad.setCodigoAcceso(generarCodigoAleatorio());
		unidad.setMiembros(new ArrayList<>(List.of(creadorId)));
		unidad.setModulosActivados(new ArrayList<>());
		return unidadRepository.save(unidad);
	}

	@Override
	public Optional<Unidad> unirseUnidad(String codigoAcceso, String userId) {
		return unidadRepository.findByCodigoAcceso(codigoAcceso).map(unidad -> {
			if (!unidad.getMiembros().contains(userId)) {
				unidad.getMiembros().add(userId);
				unidadRepository.save(unidad);
			}
			return unidad;
		});
	}

	@Override
	public Optional<Unidad> obtenerUnidadPorId(String id) {
		return unidadRepository.findById(id);
	}

	@Override
	public Unidad actualizarEstadoFase1(String unidadId, String nuevoEstado) {
		Optional<Unidad> unidadOpt = unidadRepository.findById(unidadId);
		if (unidadOpt.isEmpty()) {
			throw new RuntimeException("Unidad no encontrada");
		}
		Unidad unidad = unidadOpt.get();
		unidad.setEstadoFase1(nuevoEstado);
		return unidadRepository.save(unidad);
	}

	@Override
	public String obtenerEstadoFase1(String unidadId) {
		Optional<Unidad> unidadOpt = unidadRepository.findById(unidadId);
		if (unidadOpt.isEmpty()) {
			throw new RuntimeException("Unidad no encontrada");
		}
		return unidadOpt.get().getEstadoFase1();
	}

	@Override
	public Unidad configurarUnidad(String unidadId, UnidadConfiguracionDTO configuracionDTO) {
		Unidad unidad = unidadRepository.findById(unidadId)
				.orElseThrow(() -> new IllegalArgumentException("Unidad no encontrada"));

		// Actualizar configuración básica
		unidad.setModulosActivados(configuracionDTO.getModulosActivados());
		unidad.setCicloCorresponsabilidad(configuracionDTO.getCicloCorresponsabilidad());

		// Si hay tareas definidas, completar desde plantilla y copiar asignaciones
		if (configuracionDTO.getTareasUnidad() != null && !configuracionDTO.getTareasUnidad().isEmpty()) {
			List<Tarea> tareasCompletas = configuracionDTO.getTareasUnidad().stream().map(dto -> {
				// 1) Rellenar datos base desde plantilla
				Tarea t = tareaPlantillaService.completarDatosDesdePlantilla(dto);

				// 2) Copiar los nuevos campos de asignación
				if (dto.getAsignadoA() != null) {
					t.setAsignadoA(dto.getAsignadoA());
				}
				t.setPeriodicidad((float) dto.getPeriodicidad());
				t.setIntensidad((float) dto.getIntensidad());
				t.setCargaMental((float) dto.getCargaMental());
				t.setUnidadId(unidadId);
				t.setEsPlantilla(false);

				return t;
			}).collect(Collectors.toList());

			unidad.setTareasUnidad(tareasCompletas);
		}

		// Avanzar estado de Fase1
		unidad.setEstadoFase1("momento2");

		// Logging para debug (sin cambios)
		System.out.println("📥 Modulos recibidos: " + configuracionDTO.getModulosActivados());
		System.out.println("📥 Ciclo recibido: " + configuracionDTO.getCicloCorresponsabilidad());
		if (configuracionDTO.getTareasUnidad() != null) {
			configuracionDTO.getTareasUnidad().forEach(t -> System.out.println("📥 Tarea recibida -> " + t));
		}

		// Guardar y devolver
		return unidadRepository.save(unidad);
	}

	// Método privado para generar un código aleatorio de 6 caracteres en mayúsculas
	private String generarCodigoAleatorio() {
		return UUID.randomUUID().toString().replaceAll("-", "").substring(0, 6).toUpperCase();
	}

	@Override
	public void guardarConsensoInicial(String unidadId, List<ConsensoUmbralLimpiezaUnidad> consenso) {
		Unidad unidad = unidadRepository.findById(unidadId)
				.orElseThrow(() -> new RuntimeException("Unidad no encontrada"));

		unidad.setConsensoInicial(consenso);
		unidadRepository.save(unidad);

		System.out.println("✅ Consenso de umbral de limpieza guardado para unidad: " + unidadId);
	}

	@Override
	public Map<String, SurveyParametersDTO> obtenerConsensoInicial(String unidadId) {

		return surveyService.calcularPromediosPorTarea(unidadId);
	}

	@Override
	public void guardarConsensoFinal(String unidadId, List<ConsensoUmbralLimpiezaUnidad> consensoFinal) {
		Unidad unidad = unidadRepository.findById(unidadId)
				.orElseThrow(() -> new RuntimeException("Unidad no encontrada con ID: " + unidadId));

		// Asigna la lista de consenso a la unidad
		unidad.setConsensoUnidad(consensoFinal);

		// Avanza el estado de fase 1 a momento4
		unidad.setEstadoFase1("momento4");

		unidadRepository.save(unidad);
	}

	@Override
	public List<Tarea> generarInstancias(String unidadId, List<TareaInstanciaDTO> dtos, int cicloDias,
			LocalDate startDate) {

		Unidad unidad = unidadRepository.findById(unidadId)
				.orElseThrow(() -> new RuntimeException("Unidad no encontrada"));
		List<Tarea> plantillas = unidad.getTareasUnidad();

		List<Tarea> instancias = new ArrayList<>();

		for (TareaInstanciaDTO dto : dtos) {
			 System.out.println("📌 Tarea recibida: " + dto.getId() +
                     " | Periodicidad: " + dto.getPeriodicidad() +
                     " | Intensidad: " + dto.getIntensidad() +
                     " | CargaMental: " + dto.getCargaMental());
			Tarea plantilla = plantillas.stream().filter(p -> p.getId().equals(dto.getId())).findFirst()
					.orElseThrow(() -> new RuntimeException("Plantilla no encontrada: " + dto.getId()));

			float periodicidad = (float) (dto.getPeriodicidad() > 0 ? dto.getPeriodicidad() : 1f);
			float diaActual = 0f;

			while (diaActual < cicloDias) {
				LocalDate fecha = startDate.plusDays((long) diaActual);

				Tarea t = new Tarea();
				t.setNombre(plantilla.getNombre());
				t.setDefinicion(plantilla.getDefinicion());
				t.setModulo(plantilla.getModulo());
				t.setTiempoEstimado(plantilla.getTiempoEstimado());

				t.setUnidadId(unidadId);
				t.setAsignadoA(dto.getAsignadoA());
				t.setPeriodicidad(periodicidad);
				t.setIntensidad((float) dto.getIntensidad());
				t.setCargaMental((float) dto.getCargaMental());

				t.setFechaProgramada(fecha);
				t.setEsPlantilla(false);

				instancias.add(t);

				diaActual += periodicidad;
			}
		}

		unidad.setTareasUnidad(instancias);
		unidadRepository.save(unidad);

		return instancias;
	}

	public List<Tarea> obtenerTareasInstanciadas(String unidadId) {
		Unidad unidad = obtenerUnidadPorId(unidadId).orElseThrow(() -> new RuntimeException("Unidad no encontrada"));
		return unidad.getTareasUnidad().stream().filter(t -> !t.getEsPlantilla()).collect(Collectors.toList());
	}

}
