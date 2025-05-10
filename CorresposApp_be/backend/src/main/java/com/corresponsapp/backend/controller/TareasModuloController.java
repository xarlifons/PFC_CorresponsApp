package com.corresponsapp.backend.controller;

import com.corresponsapp.backend.service.GrupoTareasLoader;
import com.corresponsapp.backend.service.GruposInicialesLoader;
import com.corresponsapp.backend.service.ModulosTareasLoader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/modulos-tareas")
public class TareasModuloController {

    @Autowired
    private ModulosTareasLoader modulosTareasLoader;
    @Autowired
    private GruposInicialesLoader gruposInicialesLoader;
    @Autowired
    private GrupoTareasLoader grupoTareasLoader;

    @GetMapping
    public ResponseEntity<?> obtenerModulosYTareas() {
        try {
            return ResponseEntity.ok(modulosTareasLoader.getModulos());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("❌ Error al leer modulos_tareas.json: " + e.getMessage());
        }
    }
    
    @GetMapping("/grupos-iniciales")
    public ResponseEntity<?> obtenerGruposIniciales() {
        try {
        	System.out.println("📄 Grupos iniciales cargados: " + gruposInicialesLoader.getGruposIniciales().size());
            return ResponseEntity.ok(gruposInicialesLoader.getGruposIniciales());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("❌ Error al obtener grupos iniciales: " + e.getMessage());
        }
    }
    
    @GetMapping("/grupos-tareas")
    public ResponseEntity<?> obtenerGruposTareas() {
        try {
            return ResponseEntity.ok(grupoTareasLoader.getGrupos().values()); // Devolver como lista
        } catch (Exception e) {
            return ResponseEntity.status(500).body("❌ Error al obtener grupos de tareas: " + e.getMessage());
        }
    }
}
