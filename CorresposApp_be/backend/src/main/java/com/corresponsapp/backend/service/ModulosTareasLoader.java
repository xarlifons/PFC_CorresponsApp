package com.corresponsapp.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class ModulosTareasLoader {

    public static class Modulo {
        public String id;
        public String nombre;
        public List<String> tareas;
    }

    private final Map<String, Modulo> modulos = new HashMap<>();

    public Map<String, Modulo> getModulos() {
        return modulos;
    }

    public Modulo getModuloPorId(String id) {
        return modulos.get(id);
    }

    @PostConstruct
    public void cargarDesdeJson() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            InputStream input = new ClassPathResource("modulos_tareas.json").getInputStream();
            List<Modulo> lista = mapper.readValue(input, new TypeReference<>() {});
            for (Modulo modulo : lista) {
                modulos.put(modulo.id, modulo);
            }
            System.out.println("✅ Modulos cargados desde modulos_tareas.json: " + modulos.size());
        } catch (Exception e) {
            System.err.println("❌ Error al cargar modulos_tareas.json: " + e.getMessage());
        }
    }
}
