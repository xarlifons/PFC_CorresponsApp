package com.corresponsapp.backend.controller;

import com.corresponsapp.backend.dto.SurveyParametersDTO;
import com.corresponsapp.backend.service.SurveyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/encuesta")
public class SurveyController {

    private final SurveyService surveyService;

    @Autowired
    public SurveyController(SurveyService surveyService) {
        this.surveyService = surveyService;
    }

    @PostMapping("/parametros")
    public ResponseEntity<String> guardarParametros(@RequestBody List<SurveyParametersDTO> respuestas) {
        surveyService.guardarParametrosUsuario(respuestas);
        return ResponseEntity.ok("Encuesta guardada correctamente");
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
