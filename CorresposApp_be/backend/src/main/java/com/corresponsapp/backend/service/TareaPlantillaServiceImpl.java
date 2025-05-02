package com.corresponsapp.backend.service;

import com.corresponsapp.backend.dto.TareaUnidadDTO;
import com.corresponsapp.backend.model.Tarea;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

@Service
public class TareaPlantillaServiceImpl implements TareaPlantillaService {

    private Map<String, Map<String, Object>> plantillas = new HashMap<>();

    @PostConstruct
    public void cargarPlantillas() {
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("plantillas_tareas.json")) {
            ObjectMapper mapper = new ObjectMapper();
            plantillas = mapper.readValue(is, Map.class);

            // 🔍 LOG DE VERIFICACIÓN
            System.out.println("✅ Plantillas cargadas correctamente. Total: " + plantillas.size());
            plantillas.keySet().stream().limit(5).forEach(k ->
                System.out.println("🔸 Plantilla encontrada: " + k)
            );
        } catch (IOException e) {
            System.err.println("❌ Error al cargar plantillas_tareas.json: " + e.getMessage());
        }
    }

    @Override
    public Tarea completarDatosDesdePlantilla(TareaUnidadDTO dto) {
        Map<String, Object> plantilla = plantillas.get(dto.getModulo() + "_" + dto.getNombre().replace(" ", "_").toLowerCase());

        String definicion = plantilla != null ? (String) plantilla.get("definicion") : "Definición pendiente";
        Integer tiempoEstimadoPlantilla = plantilla != null ? (Integer) plantilla.get("tiempoEstimado") : 30;

        // 👇 Usamos el del DTO si está definido (mayor que 0), si no el de plantilla
        int tiempoFinal = (dto.getTiempoEstimado() > 0) ? dto.getTiempoEstimado() : tiempoEstimadoPlantilla;
        String definicionFinal = dto.getDefinicion() != null ? dto.getDefinicion() : definicion;

        Tarea tarea = new Tarea();
        tarea.setId(dto.getModulo() + "_" + dto.getNombre().replace(" ", "_").toLowerCase());
        tarea.setNombre(dto.getNombre());
        tarea.setDefinicion(definicionFinal);
        tarea.setTiempoEstimado(tiempoFinal);
        tarea.setModulo(dto.getModulo());
        tarea.setCompletada(false);
        return tarea;
    }
}
