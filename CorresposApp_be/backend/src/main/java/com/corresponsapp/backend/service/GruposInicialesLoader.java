package com.corresponsapp.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.List;

@Service
public class GruposInicialesLoader {

    public static class GrupoInicial {
        public String grupo;
        public String tarea;
    }

    private List<GrupoInicial> gruposIniciales;

    @PostConstruct
    public void init() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            InputStream is = getClass().getClassLoader().getResourceAsStream("grupos_iniciales.json");
            gruposIniciales = mapper.readValue(is, new TypeReference<>() {});
        } catch (Exception e) {
            throw new RuntimeException("❌ Error al cargar grupos_iniciales.json", e);
        }
    }

    public List<GrupoInicial> getGruposIniciales() {
        return gruposIniciales;
    }
}
