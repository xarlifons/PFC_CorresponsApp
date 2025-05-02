package com.corresponsapp.backend.service;

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
        public double ajusteFrecuencia;
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
