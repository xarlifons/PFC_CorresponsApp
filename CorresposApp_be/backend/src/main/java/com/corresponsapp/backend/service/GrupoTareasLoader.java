package com.corresponsapp.backend.service;

import com.corresponsapp.backend.dto.SurveyParametersDTO;
import com.corresponsapp.backend.dto.TareaParametroDTO;
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
        public String nombre;
        public float ajustePeriodicidad;
        public float ajusteIntensidad;
        public float ajusteCargaMental;
    }

    private final Map<String, String> tareaToGrupo = new HashMap<>();
    private final Map<String, TareaDelGrupo> tareaToAjustes = new HashMap<>();
    private final Map<String, GrupoTareas> gruposById = new HashMap<>();

    @PostConstruct
    public void cargarDatos() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            InputStream is = getClass().getClassLoader().getResourceAsStream("ajustes_tareas_grupos.json");

            List<GrupoTareas> grupos = mapper.readValue(is, new TypeReference<>() {});

            for (GrupoTareas grupo : grupos) {
                gruposById.put(grupo.id, grupo);
                for (TareaDelGrupo tarea : grupo.tareas) {
                    tareaToGrupo.put(tarea.id, grupo.id);
                    tareaToAjustes.put(tarea.id, tarea);
                }
                tareaToGrupo.put(grupo.tareaRepresentativa, grupo.id);
            }
            
            System.out.println("[GRUPOTAREASLOADER] Tareas cargadas en el sistema.");

        } catch (Exception e) {
            throw new RuntimeException("[GRUPOTAREASLOADER] Error al cargar las tareas en el sistema: ", e);
        }
    }

    public Map<String, SurveyParametersDTO> propagarParametrosDesdeRepresentativas(List<SurveyParametersDTO> respuestasUsuario) {
        Map<String, SurveyParametersDTO> resultado = new HashMap<>();

        for (SurveyParametersDTO respuesta : respuestasUsuario) {
            GrupoTareas grupo = gruposById.get(respuesta.getGrupo());
            if (grupo == null) continue;

            for (TareaDelGrupo tarea : grupo.tareas) {
                float periodicidad = (float) Math.max(0.5, respuesta.getPeriodicidad() * tarea.ajustePeriodicidad);
                float intensidad = (float) Math.min(10, Math.max(0, respuesta.getIntensidad() + tarea.ajusteIntensidad));
                float cargaMental = (float) Math.min(10, Math.max(0, respuesta.getCargaMental() + tarea.ajusteCargaMental));

                resultado.put(tarea.id, new SurveyParametersDTO(
                    tarea.id, periodicidad, cargaMental, intensidad
                ));
            }
        }
        System.out.println("[GRUPOTAREASLOADER] Parametros de la encuesta propagados: tarea representativa --> a tareas de su grupo.");
        return resultado;
    }

    public Map<String, TareaParametroDTO> propagarParametrosConNombres(List<SurveyParametersDTO> respuestasUsuario) {
        Map<String, TareaParametroDTO> resultado = new HashMap<>();

        for (SurveyParametersDTO respuesta : respuestasUsuario) {
            System.out.println("🧪 Grupo recibido en respuesta: " + respuesta.getGrupo());
            GrupoTareas grupo = gruposById.get(respuesta.getGrupo());
            if (grupo == null) {
                System.out.println("⚠️ Grupo no encontrado: " + respuesta.getGrupo());
                continue;
            }

            for (TareaDelGrupo tarea : grupo.tareas) {
                float periodicidad = (float) Math.max(0.5, respuesta.getPeriodicidad() * tarea.ajustePeriodicidad);
                float intensidad = (float) Math.min(10, Math.max(0, respuesta.getIntensidad() + tarea.ajusteIntensidad));
                float cargaMental = (float) Math.min(10, Math.max(0, respuesta.getCargaMental() + tarea.ajusteCargaMental));

                resultado.put(tarea.id, new TareaParametroDTO(
                    tarea.id, tarea.nombre, periodicidad, cargaMental, intensidad
                ));
            }
        }

        return resultado;
    }

    public String obtenerGrupoDeTarea(String tareaId) {
        return tareaToGrupo.get(tareaId);
    }

    public TareaDelGrupo obtenerAjustesDeTarea(String tareaId) {
        TareaDelGrupo tarea = tareaToAjustes.get(tareaId);
        if (tarea == null) {
            System.out.println("⚠️ Tarea ID no encontrada en tareaToAjustes: " + tareaId);
        }
        return tarea;
    }
    

    public Map<String, GrupoTareas> getGrupos() {
        return gruposById;
    }
}
