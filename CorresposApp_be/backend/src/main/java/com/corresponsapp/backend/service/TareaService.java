package com.corresponsapp.backend.service;

import com.corresponsapp.backend.model.Tarea;

import java.util.List;
import java.util.Optional;

public interface TareaService {

    Tarea crearTarea(Tarea tarea);

    Optional<Tarea> obtenerTareaPorId(String id);

    List<Tarea> obtenerTareasPorUnidad(String unidadId);

    List<Tarea> obtenerTareasPorUnidadYModulo(String unidadId, String modulo);

    Tarea actualizarTarea(String id, Tarea tarea);

    void eliminarTarea(String id);
}
