package com.corresponsapp.backend.service;

import com.corresponsapp.backend.dto.ConsensoUmbralLimpiezaUnidad;
import com.corresponsapp.backend.dto.SurveyParametersDTO;
import com.corresponsapp.backend.dto.TareaInstanciaDTO;
import com.corresponsapp.backend.dto.TareaParametroDTO;
import com.corresponsapp.backend.dto.UnidadConfiguracionDTO;
import com.corresponsapp.backend.model.Tarea;
import com.corresponsapp.backend.model.Unidad;
import com.corresponsapp.backend.model.User;
//import com.corresponsapp.backend.repository.TareaRepository;
import com.corresponsapp.backend.repository.UnidadRepository;
import com.corresponsapp.backend.repository.UserRepository;
import com.corresponsapp.backend.service.GrupoTareasLoader.TareaDelGrupo;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UnidadServiceImpl implements UnidadService {

	private final UnidadRepository unidadRepository;
	private final TareaPlantillaService tareaPlantillaService;
	private final GrupoTareasLoader grupoTareasLoader;
	private final UserRepository userRepository;

	public UnidadServiceImpl(UnidadRepository unidadRepository, TareaPlantillaService tareaPlantillaService,
			GrupoTareasLoader grupoTareasLoader, UserRepository userRepository, SurveyService surveyService) {
		this.unidadRepository = unidadRepository;
		this.tareaPlantillaService = tareaPlantillaService;
		this.grupoTareasLoader = grupoTareasLoader;
		this.userRepository = userRepository;
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
		Unidad unidad = unidadRepository.findById(unidadId)
				.orElseThrow(() -> new RuntimeException("[UNIDADSERVICEIMPL] Unidad no encontrada"));
		unidad.setEstadoFase1(nuevoEstado);
		return unidadRepository.save(unidad);
	}

	@Override
	public String obtenerEstadoFase1(String unidadId) {
		Unidad unidad = unidadRepository.findById(unidadId)
				.orElseThrow(() -> new RuntimeException("[UNIDADSERVICEIMPL] Unidad no encontrada"));
		return unidad.getEstadoFase1();
	}

	@Override
	public Unidad configurarUnidad(String unidadId, UnidadConfiguracionDTO configuracionDTO) {
		Unidad unidad = unidadRepository.findById(unidadId)
				.orElseThrow(() -> new IllegalArgumentException("[UNIDADSERVICEIMPL] Unidad no encontrada"));

		unidad.setModulosActivados(configuracionDTO.getModulosActivados());
		unidad.setCicloCorresponsabilidad(configuracionDTO.getCicloCorresponsabilidad());

		if (configuracionDTO.getTareasUnidad() != null && !configuracionDTO.getTareasUnidad().isEmpty()) {
			List<Tarea> tareasCompletas = configuracionDTO.getTareasUnidad().stream().map(dto -> {
				Tarea t = tareaPlantillaService.completarDatosDesdePlantilla(dto);
				if (dto.getAsignadaA() != null)
					t.setAsignadaA(dto.getAsignadaA());
				t.setPeriodicidad(dto.getPeriodicidad());
				t.setIntensidad(dto.getIntensidad());
				t.setCargaMental(dto.getCargaMental());
				t.setUnidadId(unidadId);
				t.setEsPlantilla(false);
				return t;
			}).collect(Collectors.toList());
			unidad.setTareasUnidad(tareasCompletas);
		}

		unidad.setEstadoFase1("momento2");
		return unidadRepository.save(unidad);
	}

	private String generarCodigoAleatorio() {
		return UUID.randomUUID().toString().replaceAll("-", "").substring(0, 6).toUpperCase();
	}

	@Override
	public void guardarConsensoInicial(String unidadId, List<ConsensoUmbralLimpiezaUnidad> consenso) {
		Unidad unidad = unidadRepository.findById(unidadId)
				.orElseThrow(() -> new RuntimeException("[UNIDADSERVICEIMPL] Unidad no encontrada"));
		unidad.setConsensoInicial(consenso);
		unidadRepository.save(unidad);
	}

	@Override
	public Map<String, TareaParametroDTO> obtenerConsensoInicial(String unidadId) {
		List<User> usuarios = userRepository.findByUnidadAsignada(unidadId);
		Map<String, List<SurveyParametersDTO>> respuestasPorTarea = new HashMap<>();

		for (User usuario : usuarios) {
			List<SurveyParametersDTO> respuestas = usuario.getSurveyParameters();
			
			if (respuestas == null) {
				System.out.println("[UNIDADSERVICEIMPL] Sin respuestas de encuesta");
				continue;
			}

			Map<String, TareaParametroDTO> respuestasPropagadas = grupoTareasLoader
					.propagarParametrosConNombres(respuestas);
			System.out.println("[UNIDADSERVICEIMPL] Tareas propagadas para " + usuario.getEmail() + ":");
			for (Map.Entry<String, TareaParametroDTO> entry : respuestasPropagadas.entrySet()) {
				System.out.println(" - " + entry.getKey() + " → " + entry.getValue().getNombre());
			}

			for (Map.Entry<String, TareaParametroDTO> entry : respuestasPropagadas.entrySet()) {
				SurveyParametersDTO dto = new SurveyParametersDTO();
				dto.setTarea(entry.getKey());
				dto.setPeriodicidad((float) entry.getValue().getPeriodicidad());
				dto.setCargaMental((float) entry.getValue().getCargaMental());
				dto.setIntensidad((float) entry.getValue().getIntensidad());

				respuestasPorTarea.computeIfAbsent(entry.getKey(), k -> new ArrayList<>()).add(dto);
			}
		}

		Map<String, TareaParametroDTO> promedios = new HashMap<>();
		for (Map.Entry<String, List<SurveyParametersDTO>> entry : respuestasPorTarea.entrySet()) {
			String tareaId = entry.getKey();
			List<SurveyParametersDTO> lista = entry.getValue();

			float sumaP = 0, sumaI = 0, sumaC = 0;
			for (SurveyParametersDTO r : lista) {
				sumaP += r.getPeriodicidad();
				sumaI += r.getIntensidad();
				sumaC += r.getCargaMental();
			}
			int total = lista.size();
			TareaDelGrupo datos = grupoTareasLoader.obtenerAjustesDeTarea(tareaId);
			String nombre = datos != null ? datos.nombre : "Tarea desconocida";

			float p = Math.round(sumaP / total * 100.0f) / 100.0f;
			float i = Math.round(sumaI / total * 100.0f) / 100.0f;
			float c = Math.round(sumaC / total * 100.0f) / 100.0f;

			promedios.put(tareaId, new TareaParametroDTO(tareaId, nombre, p, c, i));
		}

		return promedios;
	}

	@Override
	public void guardarConsensoFinal(String unidadId, List<ConsensoUmbralLimpiezaUnidad> consensoFinal) {
		Unidad unidad = unidadRepository.findById(unidadId)
				.orElseThrow(() -> new RuntimeException("[UNIDADSERVICEIMPL] Unidad no encontrada con ID: " + unidadId));
		unidad.setConsensoUnidad(consensoFinal);
		unidad.setEstadoFase1("momento4");
		unidadRepository.save(unidad);
	}

	@Override
	public List<Tarea> generarInstancias(String unidadId, List<TareaInstanciaDTO> dtos, int cicloDias,
			LocalDate startDate) {
		Unidad unidad = unidadRepository.findById(unidadId)
				.orElseThrow(() -> new RuntimeException("[UNIDADSERVICEIMPL] Unidad no encontrada"));
		List<Tarea> plantillas = unidad.getTareasUnidad();
		List<Tarea> instancias = new ArrayList<>();

		for (TareaInstanciaDTO dto : dtos) {
			System.out.println("📌 Tarea recibida: " + dto.getId() + " | Periodicidad: " + dto.getPeriodicidad()
					+ " | Intensidad: " + dto.getIntensidad() + " | CargaMental: " + dto.getCargaMental()
					+ " | AsignadaA: " + dto.getAsignadaA());

			Tarea plantilla = plantillas.stream().filter(p -> p.getId().equals(dto.getId())).findFirst()
					.orElseThrow(() -> new RuntimeException("Plantilla no encontrada: " + dto.getId()));

			System.out.println("🔎 Plantillas disponibles:");
			for (Tarea p : plantillas) {
				System.out.println(" - plantilla.id = " + p.getId());
			}

			float periodicidad = dto.getPeriodicidad() > 0 ? (float) dto.getPeriodicidad() : 1f;
			float intensidad = (float) dto.getIntensidad();
			float cargaMental = (float) dto.getCargaMental();

			float diaActual = 0f;
			while (diaActual < cicloDias) {
				LocalDate fecha = startDate.plusDays((long) diaActual);
				Tarea t = new Tarea();
				t.setId(UUID.randomUUID().toString());
				t.setNombre(plantilla.getNombre());
				t.setDefinicion(plantilla.getDefinicion());
				t.setModulo(plantilla.getModulo());
				t.setTiempoEstimado(plantilla.getTiempoEstimado());
				t.setUnidadId(unidadId);
				t.setAsignadaA(dto.getAsignadaA());
				t.setPeriodicidad(periodicidad);
				t.setIntensidad(intensidad);
				t.setCargaMental(cargaMental);
				t.setFechaProgramada(fecha);
				t.setEsPlantilla(false);
				System.out.println("📅 Instancia creada para fecha: " + fecha + " con periodicidad: " + periodicidad);
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
		List<Tarea> instanciadas = new ArrayList<>();
		for (Tarea t : unidad.getTareasUnidad()) {
			if (!t.getEsPlantilla()) {
				instanciadas.add(t);
			}
		}
		return instanciadas;
	}

	@Override
	public List<TareaInstanciaDTO> mapearDesdeConsenso(String unidadId, List<ConsensoUmbralLimpiezaUnidad> consenso) {
		Unidad unidad = unidadRepository.findById(unidadId)
				.orElseThrow(() -> new RuntimeException("Unidad no encontrada"));

		unidad.setConsensoUnidad(consenso);
		unidad.setEstadoFase1("momento4");
		unidadRepository.save(unidad);

		for (ConsensoUmbralLimpiezaUnidad c : consenso) {
			System.out.println(" - tareaId: " + c.getTareaId() + ", asignadaA: " + c.getAsignadaA() + ", periodicidad: "
					+ c.getPeriodicidad() + ", intensidad: " + c.getIntensidad() + ", cargaMental: "
					+ c.getCargaMental());
		}

		return consenso.stream().map(c -> {
			TareaInstanciaDTO dto = new TareaInstanciaDTO();
			dto.setId(c.getTareaId());
			dto.setPeriodicidad(c.getPeriodicidad());
			dto.setIntensidad(c.getIntensidad());
			dto.setCargaMental(c.getCargaMental());
			dto.setAsignadaA(c.getAsignadaA());
			return dto;
		}).toList();
	}
}
