package com.corresponsapp.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Document(collection = "tareas")
public class Tarea {

    @Id
    private String id;

    private String nombre;
    private String definicion;
    private int periodicidad; // Días entre repeticiones
    private float cargaMental; // Escala de 1.0 a 10.0
    private String intensidad; // baja / media / alta
    private double tiempoEstimado; 

    private String asignadoA; // id del usuario
    private boolean completada = false;
    private LocalDate fechaProgramada;

    private String unidadId; // La unidad a la que pertenece
    private String modulo;   // Nombre del módulo (Limpieza, Cocina, etc.)
    private boolean esPlantilla; // Si es una tarea base común para todas las unidades

    // Constructores
    public Tarea() {}

    public Tarea(String nombre, String definicion, int periodicidad, float cargaMental, String intensidad, String asignadoA, LocalDate fechaProgramada, double tiempoEstimado ,String unidadId, String modulo, boolean esPlantilla) {
        this.nombre = nombre;
        this.definicion = definicion;
        this.periodicidad = periodicidad;
        this.cargaMental = cargaMental;
        this.intensidad = intensidad;
        this.asignadoA = asignadoA;
        this.fechaProgramada = fechaProgramada;
        this.unidadId = unidadId;
        this.modulo = modulo;
        this.esPlantilla = esPlantilla;
        this.tiempoEstimado = tiempoEstimado;
    }

	// Getters y Setters
    public String getId() {
        return id;
    }
    // Solo para gestionar actualizarTarea() en TareaController
    public void setId(String id) {
        this.id = id;
    }
    
    public double getTiempoEstimado() {
		return tiempoEstimado;
	}

	public void setTiempoEstimado(double tiempoEstimado) {
		this.tiempoEstimado = tiempoEstimado;
	}

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDefinicion() {
        return definicion;
    }

    public void setDefinicion(String definicion) {
        this.definicion = definicion;
    }

    public int getPeriodicidad() {
        return periodicidad;
    }

    public void setPeriodicidad(int periodicidad) {
        this.periodicidad = periodicidad;
    }

    public float getCargaMental() {
        return cargaMental;
    }

    public void setCargaMental(float cargaMental) {
        this.cargaMental = cargaMental;
    }

    public String getIntensidad() {
        return intensidad;
    }

    public void setIntensidad(String intensidad) {
        this.intensidad = intensidad;
    }

    public String getAsignadoA() {
        return asignadoA;
    }

    public void setAsignadoA(String asignadoA) {
        this.asignadoA = asignadoA;
    }

    public boolean isCompletada() {
        return completada;
    }

    public void setCompletada(boolean completada) {
        this.completada = completada;
    }

    public LocalDate getFechaProgramada() {
        return fechaProgramada;
    }

    public void setFechaProgramada(LocalDate fechaProgramada) {
        this.fechaProgramada = fechaProgramada;
    }

    public String getUnidadId() {
        return unidadId;
    }

    public void setUnidadId(String unidadId) {
        this.unidadId = unidadId;
    }

    public String getModulo() {
        return modulo;
    }

    public void setModulo(String modulo) {
        this.modulo = modulo;
    }

    public boolean isEsPlantilla() {
        return esPlantilla;
    }

    public void setEsPlantilla(boolean esPlantilla) {
        this.esPlantilla = esPlantilla;
    }
}
