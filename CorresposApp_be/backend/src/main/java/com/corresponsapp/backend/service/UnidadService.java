package com.corresponsapp.backend.service;

import com.corresponsapp.backend.dto.ConsensoUmbralLimpiezaUnidad;
import com.corresponsapp.backend.dto.SurveyParametersDTO;
import com.corresponsapp.backend.dto.UnidadConfiguracionDTO;
import com.corresponsapp.backend.model.Unidad;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface UnidadService {
    Unidad crearUnidad(Unidad unidad, String creadorId);
    Optional<Unidad> unirseUnidad(String codigoAcceso, String userId);
    Optional<Unidad> obtenerUnidadPorId(String id);
    Unidad actualizarEstadoFase1(String unidadId, String nuevoEstado);
    String obtenerEstadoFase1(String unidadId);
    Unidad configurarUnidad(String unidadId, UnidadConfiguracionDTO configuracionDTO);
    void guardarConsensoInicial(String unidadId, List<ConsensoUmbralLimpiezaUnidad> consenso);
    Map<String, SurveyParametersDTO> obtenerConsensoFase1(String unidadId);
    void guardarConsensoFinal(String unidadId, List<ConsensoUmbralLimpiezaUnidad> consensoFinal);


}
