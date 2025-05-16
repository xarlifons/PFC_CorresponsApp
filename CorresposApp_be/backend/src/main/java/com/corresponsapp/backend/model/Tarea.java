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
    private float periodicidad;
    private float cargaMental; 
    private float intensidad; 
    private int tiempoEstimado; 

    private String asignadaA;
    private boolean completada = false;
    private LocalDate fechaProgramada;

    private String unidadId; // La unidad a la que pertenece
    private String modulo;   // Nombre del módulo (Limpieza, Cocina, etc.)
    private boolean esPlantilla; // Si es una tarea base común para todas las unidades

    // Constructores
    public Tarea() {}

    public Tarea(String nombre, String definicion, float periodicidad, float cargaMental, float intensidad, String asignadaA, LocalDate fechaProgramada, int tiempoEstimado ,String unidadId, String modulo, boolean esPlantilla) {
        this.nombre = nombre;
        this.definicion = definicion;
        this.periodicidad = periodicidad;
        this.cargaMental = cargaMental;
        this.intensidad = intensidad;
        this.asignadaA = asignadaA;
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
    
    public int getTiempoEstimado() {
		return tiempoEstimado;
	}

	public void setTiempoEstimado(int tiempoEstimado) {
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

    public float getPeriodicidad() {
        return periodicidad;
    }

    public void setPeriodicidad(float periodicidad) {
        this.periodicidad = periodicidad;
    }

    public float getCargaMental() {
        return cargaMental;
    }

    public void setCargaMental(float cargaMental) {
        this.cargaMental = cargaMental;
    }

    public float getIntensidad() {
        return intensidad;
    }

    public void setIntensidad(float intensidad) {
        this.intensidad = intensidad;
    }

    public String getAsignadaA() {
        return asignadaA;
    }

    public void setAsignadaA(String asignadaA) {
        this.asignadaA = asignadaA;
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

    public boolean getEsPlantilla() {
        return esPlantilla;
    }

    public void setEsPlantilla(boolean esPlantilla) {
        this.esPlantilla = esPlantilla;
    }

	@Override
	public String toString() {
		return "Tarea [id=" + id + ", nombre=" + nombre + ", definicion=" + definicion + ", periodicidad="
				+ periodicidad + ", cargaMental=" + cargaMental + ", intensidad=" + intensidad + ", tiempoEstimado="
				+ tiempoEstimado + ", asignadaA=" + asignadaA + ", completada=" + completada + ", fechaProgramada="
				+ fechaProgramada + ", unidadId=" + unidadId + ", modulo=" + modulo + ", esPlantilla=" + esPlantilla
				+ "]";
	}
}
