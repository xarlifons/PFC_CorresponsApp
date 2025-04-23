package com.corresponsapp.backend.service;

import com.corresponsapp.backend.model.Unidad;
import java.util.Optional;

public interface UnidadService {
    Unidad crearUnidad(Unidad unidad, String creadorId);
    Optional<Unidad> unirseUnidad(String codigoAcceso, String userId);
    Optional<Unidad> obtenerUnidadPorId(String id);
    Unidad actualizarEstadoFase1(String unidadId, String nuevoEstado);
    String obtenerEstadoFase1(String unidadId);
}
