package com.corresponsapp.backend.controller;

import com.corresponsapp.backend.dto.SurveyParametersDTO;
import com.corresponsapp.backend.model.Unidad;
import com.corresponsapp.backend.repository.UnidadRepository;
import com.corresponsapp.backend.service.SurveyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/encuesta")
public class SurveyController {

    private final SurveyService surveyService;
    private UnidadRepository unidadRepository;

    @Autowired
    public SurveyController(SurveyService surveyService) {
        this.surveyService = surveyService;
    }

    @PostMapping("/parametros")
    public ResponseEntity<String> guardarParametros(@RequestBody List<SurveyParametersDTO> respuestas) {
        surveyService.guardarParametrosUsuario(respuestas);
        return ResponseEntity.ok("Encuesta guardada correctamente");
    }
    
    @PostMapping("/parametros/devolver/{unidadId}")
    public ResponseEntity<Map<String, Double>> procesarParametros(@PathVariable String unidadId, 
    		@RequestBody List<SurveyParametersDTO> respuestas) {
        try {
        	       	
            double umbral = surveyService.guardarYDevolverParametrosUsuario(respuestas, unidadId);
            return ResponseEntity.ok(Map.of("umbralLimpieza", umbral));
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", -1.0));
        }
    }
    
    @GetMapping("/promedios/{unidadId}")
    public ResponseEntity<Map<String, SurveyParametersDTO>> obtenerPromedios(@PathVariable String unidadId) {
        return ResponseEntity.ok(surveyService.calcularPromediosPorGrupo(unidadId));
    }
    
    @GetMapping("/tareas/promedios/{unidadId}")
    public ResponseEntity<Map<String, SurveyParametersDTO>> obtenerPromediosPorTarea(@PathVariable String unidadId) {
        return ResponseEntity.ok(surveyService.calcularPromediosPorTarea(unidadId));
    }    
    
}