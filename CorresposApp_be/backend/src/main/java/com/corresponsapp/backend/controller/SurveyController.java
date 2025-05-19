package com.corresponsapp.backend.controller;

import com.corresponsapp.backend.dto.SurveyParametersDTO;
import com.corresponsapp.backend.service.SurveyService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/encuesta")
public class SurveyController {

	private final SurveyService surveyService;
	
	public SurveyController(SurveyService surveyService) {
		this.surveyService = surveyService;
	}

	@PostMapping("/parametros/devolver/{unidadId}")
	public ResponseEntity<Map<String, Float>> procesarParametros(@PathVariable String unidadId,
			@RequestBody List<SurveyParametersDTO> respuestas) {
		try {
			float umbral = surveyService.guardarYDevolverParametrosUsuario(respuestas, unidadId);			
			
			System.out.println("[SURVEY-CONTROLLER] Encuesta persistida en BD y umbral de limpieza individual calculado");

			return ResponseEntity.ok(Map.of("umbralLimpieza", umbral));
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", -1.0f));
		}
	}

}