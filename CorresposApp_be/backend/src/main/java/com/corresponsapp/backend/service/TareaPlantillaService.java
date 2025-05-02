package com.corresponsapp.backend.service;

import com.corresponsapp.backend.dto.TareaUnidadDTO;
import com.corresponsapp.backend.model.Tarea;

public interface TareaPlantillaService {
    Tarea completarDatosDesdePlantilla(TareaUnidadDTO tareaUnidadDTO);
}