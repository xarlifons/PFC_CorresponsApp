package com.corresponsapp.backend.service;

import com.corresponsapp.backend.dto.SurveyParametersDTO;
import com.corresponsapp.backend.model.Unidad;
import com.corresponsapp.backend.model.User;
import com.corresponsapp.backend.repository.UnidadRepository;
import com.corresponsapp.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.CrudRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class SurveyServiceImpl implements SurveyService {

	private final UserRepository userRepository;
	private final GrupoTareasLoader grupoTareasLoader;
	private UnidadRepository unidadRepository;

	public SurveyServiceImpl(UserRepository userRepository, GrupoTareasLoader grupoTareasLoader,
			UnidadRepository unidadRepository) {
		super();
		this.userRepository = userRepository;
		this.grupoTareasLoader = grupoTareasLoader;
		this.unidadRepository = unidadRepository;
	}

	@Override
	public float guardarYDevolverParametrosUsuario(List<SurveyParametersDTO> respuestas, String unidadId) {
		// reutiliza tu save + cálculo
		Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		if (!(principal instanceof User usuario)) {
			throw new RuntimeException("Principal no es del tipo esperado User");
		}
		usuario.setSurveyParameters(respuestas);
		float umbral = calcularUmbralLimpieza(respuestas, unidadId);
		usuario.setUmbralLimpieza(umbral);
		userRepository.save(usuario);
		return umbral;
	}

	private float calcularUmbralLimpieza(List<SurveyParametersDTO> respuestas, String unidadId) {
		float sumaIntensidad = 0f;
		float sumaCargaMental = 0f;
		float sumaPeriodicidad = 0f;

		for (SurveyParametersDTO r : respuestas) {
			sumaIntensidad += r.getIntensidad();
			sumaCargaMental += r.getCargaMental();
			sumaPeriodicidad += r.getPeriodicidad();
		}

		int total = respuestas.size();
		float promedioIntensidad = total > 0 ? sumaIntensidad / total : 0f;
		float promedioCargaMental = total > 0 ? sumaCargaMental / total : 0f;
		float promedioPeriodicidad = total > 0 ? sumaPeriodicidad / total : 0f;

		Optional<Unidad> unidadOpt = unidadRepository.findById(unidadId);

		if (unidadOpt.isPresent()) {
			float ciclo = (float) unidadOpt.get().getCicloCorresponsabilidad();

			// Normaliza la periodicidad: 0.5 días = 10, ciclo días = 0
			float periodicidadNormalizada = (1f - ((promedioPeriodicidad - 0.5f) / (ciclo - 0.5f))) * 10f;

			// Calcula el umbral ponderado
			float umbral = 0.5f * periodicidadNormalizada + 0.25f * (10f - promedioIntensidad)
					+ 0.25f * (10f - promedioCargaMental);

			return Math.round(umbral * 10f) / 10f;
		} else {
			System.out
					.println("⚠️ No se encontró la unidad con id " + unidadId + ". El umbral enviado no es correcto.");
			return 0f;
		}
	}

	@Override
	public Map<String, SurveyParametersDTO> calcularPromediosPorGrupo(String unidadId) {
		List<User> usuarios = userRepository.findByUnidadAsignada(unidadId);
		System.out.println("✅ Usuarios encontrados en la unidad: " + usuarios);

		Map<String, List<SurveyParametersDTO>> respuestasPorGrupo = new HashMap<>();

		for (User usuario : usuarios) {
			System.out.println("🧪 Usuario: " + usuario.getEmail());

			if (usuario.getSurveyParameters() != null) {
				System.out.println("✅ SurveyParameters encontrados: " + usuario.getSurveyParameters().size());
				for (SurveyParametersDTO respuesta : usuario.getSurveyParameters()) {
					respuestasPorGrupo.computeIfAbsent(respuesta.getGrupo(), k -> new ArrayList<>()).add(respuesta);
				}
			}
		}

		Map<String, SurveyParametersDTO> promedios = new HashMap<>();

		for (Map.Entry<String, List<SurveyParametersDTO>> entry : respuestasPorGrupo.entrySet()) {
			String grupo = entry.getKey();
			List<SurveyParametersDTO> respuestas = entry.getValue();

			float sumaPeriodicidad = 0f;
			float sumaCargaMental = 0f;
			float sumaIntensidad = 0f;

			for (SurveyParametersDTO r : respuestas) {
				sumaPeriodicidad += r.getPeriodicidad();
				sumaCargaMental += r.getCargaMental();
				sumaIntensidad += r.getIntensidad();
			}

			int total = respuestas.size();

			SurveyParametersDTO promedio = new SurveyParametersDTO(grupo,
					Math.round(sumaPeriodicidad / total * 100f) / 100f,
					Math.round(sumaCargaMental / total * 100f) / 100f,
					Math.round(sumaIntensidad / total * 100f) / 100f);

			System.out.println("📊 Promedio grupo " + grupo + ": " + promedio);
			promedios.put(grupo, promedio);
		}

		System.out.println("🎯 Grupos con respuestas:");
		for (String grupo : promedios.keySet()) {
			System.out.println(" - " + grupo);
		}

		return promedios;
	}

	public Map<String, SurveyParametersDTO> calcularPromediosPorTarea(String unidadId) {
		System.out.println("🧮 [BACKEND] Iniciando cálculo de promedios por tarea para unidad: " + unidadId);

		List<User> usuarios = userRepository.findByUnidadAsignada(unidadId);
		Map<String, List<SurveyParametersDTO>> respuestasPorTarea = new HashMap<>();

		for (User usuario : usuarios) {
			System.out.println("👤 Usuario: " + usuario.getEmail());
			List<SurveyParametersDTO> respuestas = usuario.getSurveyParameters();

			if (respuestas == null) {
				System.out.println("⚠️ Este usuario no ha respondido la encuesta");
				continue;
			}

			System.out.println("📥 Respuestas representativas: " + respuestas);

			Map<String, SurveyParametersDTO> respuestasPropagadas = grupoTareasLoader
					.propagarParametrosDesdeRepresentativas(respuestas);

			System.out.println("📤 Tareas propagadas para " + usuario.getEmail() + ":");
			respuestasPropagadas.forEach(
					(tareaId, dto) -> System.out.println("   ↪ " + tareaId + " → periodicidad=" + dto.getPeriodicidad()
							+ ", carga=" + dto.getCargaMental() + ", intensidad=" + dto.getIntensidad()));

			for (Map.Entry<String, SurveyParametersDTO> entry : respuestasPropagadas.entrySet()) {
				respuestasPorTarea.computeIfAbsent(entry.getKey(), k -> new ArrayList<>()).add(entry.getValue());
			}
		}

		// Calcular promedio por tarea
		Map<String, SurveyParametersDTO> promedios = new HashMap<>();
		for (Map.Entry<String, List<SurveyParametersDTO>> entry : respuestasPorTarea.entrySet()) {
			String tareaId = entry.getKey();
			List<SurveyParametersDTO> respuestas = entry.getValue();

			float sumaP = 0f, sumaI = 0f, sumaC = 0f;
			for (SurveyParametersDTO r : respuestas) {
				sumaP += r.getPeriodicidad();
				sumaI += r.getIntensidad();
				sumaC += r.getCargaMental();
			}
			int total = respuestas.size();

			float promedioP = Math.round((sumaP / total) * 100f) / 100f;
			float promedioI = Math.round((sumaI / total) * 100f) / 100f;
			float promedioC = Math.round((sumaC / total) * 100f) / 100f;

			System.out.println(
					"✅ Promedio tarea " + tareaId + " → P=" + promedioP + ", I=" + promedioI + ", C=" + promedioC);

			promedios.put(tareaId, new SurveyParametersDTO(tareaId, promedioP, promedioC, promedioI));
		}

		System.out.println("🎯 Total tareas con promedio: " + promedios.size());
		return promedios;
	}

}
