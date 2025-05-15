package com.corresponsapp.backend.dto;

public class ConsensoUmbralLimpiezaUnidad {
	private String tareaId;
	private String grupoId;
	private float periodicidad;
	private float intensidad;
	private float cargaMental;
	private String asignadoA;


	public ConsensoUmbralLimpiezaUnidad() {
	}

	public ConsensoUmbralLimpiezaUnidad(String tareaId, String grupoId, float periodicidad, float intensidad,
			float cargaMental, String asignadoA) {
		this.tareaId = tareaId;
		this.grupoId = grupoId;
		this.periodicidad = periodicidad;
		this.intensidad = intensidad;
		this.cargaMental = cargaMental;
		this.asignadoA = asignadoA;
	}

	// Getters y Setters
	public String getTareaId() {
		return tareaId;
	}

	public void setTareaId(String tareaId) {
		this.tareaId = tareaId;
	}

	public String getGrupoId() {
		return grupoId;
	}

	public void setGrupoId(String grupoId) {
		this.grupoId = grupoId;
	}

	public float getPeriodicidad() {
		return periodicidad;
	}

	public void setPeriodicidad(float periodicidad) {
		this.periodicidad = periodicidad;
	}

	public float getIntensidad() {
		return intensidad;
	}

	public void setIntensidad(float intensidad) {
		this.intensidad = intensidad;
	}

	public float getCargaMental() {
		return cargaMental;
	}

	public void setCargaMental(float cargaMental) {
		this.cargaMental = cargaMental;
	}
	
	public String getAsignadoA() {
		return asignadoA;
	}

	public void setAsignadoA(String asignadoA) {
		this.asignadoA = asignadoA;
	}
}
