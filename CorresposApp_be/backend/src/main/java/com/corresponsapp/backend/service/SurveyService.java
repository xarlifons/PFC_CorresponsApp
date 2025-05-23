package com.corresponsapp.backend.service;

import com.corresponsapp.backend.dto.SurveyParametersDTO;
import java.util.List;
import java.util.Map;

public interface SurveyService {
    float guardarYDevolverParametrosUsuario(List<SurveyParametersDTO> respuesta, String unidadId);
    Map<String, SurveyParametersDTO> calcularPromediosPorGrupo(String unidadId);
}
