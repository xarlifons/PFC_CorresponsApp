package com.corresponsapp.backend.service;

import com.corresponsapp.backend.dto.TareaUnidadDTO;
import com.corresponsapp.backend.model.Tarea;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

@Service
public class TareaPlantillaServiceImpl implements TareaPlantillaService {

    private final Map<String, PlantillaTarea> tareasPorId = new HashMap<>();

    public static class PlantillaTarea {
        public String nombre;
        public String definicion = "Definición pendiente"; // por si faltara
        public int tiempoEstimado = 30;
    }

    @PostConstruct
    public void cargarTareas() {
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("tareas.json")) {
            ObjectMapper mapper = new ObjectMapper();

            // ← tu JSON es un mapa tipo { "1": { nombre: ... }, ... }
            Map<String, PlantillaTarea> cargadas = mapper.readValue(is, new TypeReference<>() {});
            tareasPorId.putAll(cargadas);

            System.out.println("✅ tareas.json cargado con " + tareasPorId.size() + " tareas.");
        } catch (IOException e) {
            System.err.println("❌ Error al cargar tareas.json: " + e.getMessage());
            throw new RuntimeException("Error cargando tareas.json", e);
        }
    }

    @Override
    public Tarea completarDatosDesdePlantilla(TareaUnidadDTO dto) {
        PlantillaTarea plantilla = tareasPorId.get(dto.getId());

        String nombre = plantilla != null ? plantilla.nombre : dto.getNombre();
        String definicion = dto.getDefinicion() != null ? dto.getDefinicion()
                          : (plantilla != null ? plantilla.definicion : "Definición pendiente");
        int tiempo = dto.getTiempoEstimado() > 0 ? dto.getTiempoEstimado()
                      : (plantilla != null ? plantilla.tiempoEstimado : 30);

        Tarea tarea = new Tarea();
        tarea.setId(dto.getId());
        tarea.setNombre(nombre);
        tarea.setDefinicion(definicion);
        tarea.setTiempoEstimado(tiempo);
        tarea.setModulo(dto.getModulo());
        tarea.setCompletada(false);

        return tarea;
    }
}
