package com.corresponsapp.backend.service;

import com.corresponsapp.backend.model.Tarea;
import com.corresponsapp.backend.repository.TareaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TareaServiceImpl implements TareaService {

    private final TareaRepository tareaRepository;

    public TareaServiceImpl(TareaRepository tareaRepository) {
        this.tareaRepository = tareaRepository;
    }

    @Override
    public Tarea crearTarea(Tarea tarea) {
        return tareaRepository.save(tarea);
    }

    @Override
    public Optional<Tarea> obtenerTareaPorId(String id) {
        return tareaRepository.findById(id);
    }

    @Override
    public List<Tarea> obtenerTareasPorUnidad(String unidadId) {
        return tareaRepository.findByUnidadIdAndEsPlantillaFalse(unidadId);
    }

    @Override
    public List<Tarea> obtenerTareasPorUnidadYModulo(String unidadId, String modulo) {
        return tareaRepository.findByUnidadIdAndModuloAndEsPlantillaFalse(unidadId, modulo);
    }

    @Override
    public Tarea actualizarTarea(String id, Tarea tarea) {
        tarea.setId(id); 
        return tareaRepository.save(tarea);
    }

    @Override
    public void eliminarTarea(String id) {
        tareaRepository.deleteById(id);
    }
}
