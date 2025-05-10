package com.corresponsapp.backend.service;

import com.corresponsapp.backend.dto.ConsensoUmbralLimpiezaUnidad;
import com.corresponsapp.backend.dto.SurveyParametersDTO;
import com.corresponsapp.backend.dto.TareaUnidadDTO;
import com.corresponsapp.backend.dto.UnidadConfiguracionDTO;
import com.corresponsapp.backend.model.Tarea;
import com.corresponsapp.backend.model.Unidad;
import com.corresponsapp.backend.repository.UnidadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class UnidadServiceImpl implements UnidadService {

    private final UnidadRepository unidadRepository;
    private final TareaPlantillaService tareaPlantillaService;

    @Autowired
    private SurveyService surveyService;

    @Autowired
    public UnidadServiceImpl(UnidadRepository unidadRepository, TareaPlantillaService tareaPlantillaService, SurveyService surveyService) {
        this.unidadRepository = unidadRepository;
        this.tareaPlantillaService = tareaPlantillaService;
        this.surveyService = surveyService;
    }

    @Override
    public Unidad crearUnidad(Unidad unidad, String creadorId) {
        unidad.setCreadorId(creadorId);
        unidad.setCodigoAcceso(generarCodigoAleatorio());
        unidad.setMiembros(new ArrayList<>(List.of(creadorId)));
        unidad.setModulosActivados(new ArrayList<>());
        return unidadRepository.save(unidad);
    }

    @Override
    public Optional<Unidad> unirseUnidad(String codigoAcceso, String userId) {
        return unidadRepository.findByCodigoAcceso(codigoAcceso).map(unidad -> {
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

    @Override
    public String obtenerEstadoFase1(String unidadId) {
        Optional<Unidad> unidadOpt = unidadRepository.findById(unidadId);
        if (unidadOpt.isEmpty()) {
            throw new RuntimeException("Unidad no encontrada");
        }
        return unidadOpt.get().getEstadoFase1();
    }

    @Override
    public Unidad configurarUnidad(String unidadId, UnidadConfiguracionDTO configuracionDTO) {
        Unidad unidad = unidadRepository.findById(unidadId)
                .orElseThrow(() -> new IllegalArgumentException("Unidad no encontrada"));

        // Actualizar configuración básica
        unidad.setModulosActivados(configuracionDTO.getModulosActivados());
        unidad.setCicloCorresponsabilidad(configuracionDTO.getCicloCorresponsabilidad());

        // Si hay tareas definidas, completar desde plantilla
        if (configuracionDTO.getTareasUnidad() != null && !configuracionDTO.getTareasUnidad().isEmpty()) {
            List<Tarea> tareasCompletadas = configuracionDTO.getTareasUnidad().stream()
                    .map(tareaPlantillaService::completarDatosDesdePlantilla)
                    .collect(Collectors.toList());
            unidad.setTareasUnidad(tareasCompletadas);
        }
        
        unidad.setEstadoFase1("momento2");
        
        System.out.println("📥 Modulos recibidos: " + configuracionDTO.getModulosActivados());
        System.out.println("📥 Ciclo recibido: " + configuracionDTO.getCicloCorresponsabilidad());

        for (TareaUnidadDTO t : configuracionDTO.getTareasUnidad()) {
            System.out.println("📥 Tarea recibida -> " + t);
        }

        // Guardar cambios
        return unidadRepository.save(unidad);
    }
    
 // Método privado para generar un código aleatorio de 6 caracteres en mayúsculas
    private String generarCodigoAleatorio() {
        return UUID.randomUUID().toString().replaceAll("-", "")
                   .substring(0, 6).toUpperCase();
    }
    
    @Override
    public void guardarConsensoInicial(String unidadId, List<ConsensoUmbralLimpiezaUnidad> consenso) {
        Unidad unidad = unidadRepository.findById(unidadId)
            .orElseThrow(() -> new RuntimeException("Unidad no encontrada"));

        unidad.setConsensoInicial(consenso);
        unidadRepository.save(unidad);

        System.out.println("✅ Consenso de umbral de limpieza guardado para unidad: " + unidadId);
    }
    
    @Override
    public Map<String, SurveyParametersDTO> obtenerConsensoFase1(String unidadId) {
    	
        return surveyService.calcularPromediosPorTarea(unidadId);
    }
    
    public void guardarConsensoFinal(String unidadId, List<ConsensoUmbralLimpiezaUnidad> consensoFinal) {
        Unidad unidad = unidadRepository.findById(unidadId)
            .orElseThrow(() -> new RuntimeException("Unidad no encontrada con ID: " + unidadId));

        // Asigna la lista de consenso a la unidad
        unidad.setConsensoUnidad(consensoFinal);

        // Avanza el estado de fase 1 a momento4
        unidad.setEstadoFase1("momento4");

        unidadRepository.save(unidad);
    }
}
