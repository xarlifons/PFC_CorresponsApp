package com.corresponsapp.backend.service;

import com.corresponsapp.backend.dto.SurveyParametersDTO;
import com.corresponsapp.backend.model.Unidad;
import com.corresponsapp.backend.model.User;
import com.corresponsapp.backend.repository.UnidadRepository;
import com.corresponsapp.backend.repository.UserRepository;
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
	private UnidadRepository unidadRepository;

	public SurveyServiceImpl(UserRepository userRepository, GrupoTareasLoader grupoTareasLoader,
			UnidadRepository unidadRepository) {
		super();
		this.userRepository = userRepository;
		this.unidadRepository = unidadRepository;
	}

	@Override
	public float guardarYDevolverParametrosUsuario(List<SurveyParametersDTO> respuestas, String unidadId) {
		Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		if (!(principal instanceof User usuario)) {
			throw new RuntimeException("[SURVEYSERVICEIMPL] Principal no es del tipo esperado User");
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

			float periodicidadNormalizada = (1f - ((promedioPeriodicidad - 0.5f) / (ciclo - 0.5f))) * 10f;

			float umbral = 0.5f * periodicidadNormalizada + 0.25f * (10f - promedioIntensidad)
					+ 0.25f * (10f - promedioCargaMental);

			return Math.round(umbral * 10f) / 10f;
		} else {
			System.out
					.println("[SURVEYSERVICEIMPL] No se encontró la unidad con id " + unidadId + ". El umbral enviado no es correcto.");
			return 0f;
		}
	}

	@Override
	public Map<String, SurveyParametersDTO> calcularPromediosPorGrupo(String unidadId) {
		List<User> usuarios = userRepository.findByUnidadAsignada(unidadId);
		
		Map<String, List<SurveyParametersDTO>> respuestasPorGrupo = new HashMap<>();

		for (User usuario : usuarios) {
			if (usuario.getSurveyParameters() != null) {
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

			
			promedios.put(grupo, promedio);
		}
		return promedios;
	}


}
