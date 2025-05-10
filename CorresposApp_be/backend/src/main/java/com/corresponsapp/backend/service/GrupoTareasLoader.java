package com.corresponsapp.backend.service;

import com.corresponsapp.backend.dto.SurveyParametersDTO;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GrupoTareasLoader {

    public static class GrupoTareas {
        public String id;
        public String nombre;
        public String tareaRepresentativa;
        public List<TareaDelGrupo> tareas;
    }

    public static class TareaDelGrupo {
        public String id;
        public double ajustePeriodicidad;
        public double ajusteIntensidad;
        public double ajusteCargaMental;
    }

    private final Map<String, String> tareaToGrupo = new HashMap<>();
    private final Map<String, TareaDelGrupo> tareaToAjustes = new HashMap<>();
    private final Map<String, GrupoTareas> gruposById = new HashMap<>();

    @PostConstruct
    public void cargarDatos() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            InputStream is = getClass().getClassLoader().getResourceAsStream("grupos_tareas.json");

            List<GrupoTareas> grupos = mapper.readValue(is, new TypeReference<>() {});

            for (GrupoTareas grupo : grupos) {
                gruposById.put(grupo.id, grupo);
                for (TareaDelGrupo tarea : grupo.tareas) {
                    tareaToGrupo.put(tarea.id, grupo.id);
                    tareaToAjustes.put(tarea.id, tarea);
                }
                // Agrega también la tarea representativa
                tareaToGrupo.put(grupo.tareaRepresentativa, grupo.id);
            }

        } catch (Exception e) {
            throw new RuntimeException("❌ Error al cargar grupos_tareas.json", e);
        }
    }
    
    public Map<String, SurveyParametersDTO> propagarParametrosDesdeRepresentativas(List<SurveyParametersDTO> respuestasUsuario) {
        Map<String, SurveyParametersDTO> resultado = new HashMap<>();

        for (SurveyParametersDTO respuesta : respuestasUsuario) {
            GrupoTareas grupo = gruposById.get(respuesta.getGrupo());
            if (grupo == null) continue;

            for (TareaDelGrupo tarea : grupo.tareas) {
                double periodicidad = Math.max(0.5, respuesta.getPeriodicidad() * tarea.ajustePeriodicidad);
                double intensidad = Math.min(10, Math.max(0, respuesta.getIntensidad() + tarea.ajusteIntensidad));
                double cargaMental = Math.min(10, Math.max(0, respuesta.getCargaMental() + tarea.ajusteCargaMental));

                resultado.put(tarea.id, new SurveyParametersDTO(
                    tarea.id, periodicidad, cargaMental, intensidad
                ));
            }
        }
        return resultado;
    }


    public String obtenerGrupoDeTarea(String tareaId) {
        return tareaToGrupo.get(tareaId);
    }

    public TareaDelGrupo obtenerAjustesDeTarea(String tareaId) {
        return tareaToAjustes.get(tareaId);
    }

    public Map<String, GrupoTareas> getGrupos() {
        return gruposById;
    }
}
