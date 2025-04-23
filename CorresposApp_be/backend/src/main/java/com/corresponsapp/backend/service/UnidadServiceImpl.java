package com.corresponsapp.backend.service;

import com.corresponsapp.backend.model.Unidad;
import com.corresponsapp.backend.repository.UnidadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class UnidadServiceImpl implements UnidadService {

    @Autowired
    private UnidadRepository unidadRepository;

    @Override
    public Unidad crearUnidad(Unidad unidad, String creadorId) {
        // Asignar creador
        unidad.setCreadorId(creadorId);

        // Generar código de acceso único
        unidad.setCodigoAcceso(generarCodigoAleatorio());

        // Inicializar la lista de miembros con el creador
        unidad.setMiembros(new ArrayList<>(List.of(creadorId)));

        // Inicializar lista vacía de módulos
        unidad.setModulosActivados(new ArrayList<>());

        // Guardar y devolver la unidad
        return unidadRepository.save(unidad);
    }

    @Override
    public Optional<Unidad> unirseUnidad(String codigoAcceso, String userId) {
        return unidadRepository.findByCodigoAcceso(codigoAcceso).map(unidad -> {
            // Añadir al usuario si no está ya en la unidad
            if (!unidad.getMiembros().contains(userId)) {
                unidad.getMiembros().add(userId);
                unidadRepository.save(unidad);
            }
            return unidad;
        });
    }

    @Override
    public Optional<Unidad> obtenerUnidadPorId(String id) {
        return unidadRepository.findById(id);
    }
    
    @Override
	    public Unidad actualizarEstadoFase1(String unidadId, String nuevoEstado) {
	        Optional<Unidad> unidadOpt = unidadRepository.findById(unidadId);
	        if (unidadOpt.isEmpty()) {
	            throw new RuntimeException("Unidad no encontrada");
	        }
	
	        Unidad unidad = unidadOpt.get();
	        unidad.setEstadoFase1(nuevoEstado);
	        return unidadRepository.save(unidad);
	    }

    // Método privado para generar un código aleatorio de 6 caracteres en mayúsculas
    private String generarCodigoAleatorio() {
        return UUID.randomUUID().toString().replaceAll("-", "")
                   .substring(0, 6).toUpperCase();
    }
    
    @Override
    public String obtenerEstadoFase1(String unidadId) {
        Optional<Unidad> unidadOpt = unidadRepository.findById(unidadId);
        if (unidadOpt.isEmpty()) {
            throw new RuntimeException("Unidad no encontrada");
        }

        return unidadOpt.get().getEstadoFase1();
    }

}
