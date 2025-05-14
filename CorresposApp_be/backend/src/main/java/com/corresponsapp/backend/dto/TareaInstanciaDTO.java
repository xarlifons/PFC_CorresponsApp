package com.corresponsapp.backend.dto;

public class TareaInstanciaDTO {
	private String id; // ID de la plantilla de tarea
	private String asignadoA; // userId del miembro asignado
	private float periodicidad;
	private float intensidad;
	private float cargaMental;

	public TareaInstanciaDTO() {
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getAsignadoA() {
		return asignadoA;
	}

	public void setAsignadoA(String asignadoA) {
		this.asignadoA = asignadoA;
	}

	public double getPeriodicidad() {
		return periodicidad;
	}

	public void setPeriodicidad(float periodicidad) {
		this.periodicidad = periodicidad;
	}

	public double getIntensidad() {
		return intensidad;
	}

	public void setIntensidad(float intensidad) {
		this.intensidad = intensidad;
	}

	public double getCargaMental() {
		return cargaMental;
	}

	public void setCargaMental(float cargaMental) {
		this.cargaMental = cargaMental;
	}
}
