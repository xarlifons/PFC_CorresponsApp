package com.corresponsapp.backend.dto;

public class ConsensoUmbralLimpiezaUnidad {
	private String tareaId;
	private String grupoId;
	private double periodicidad;
	private double intensidad;
	private double cargaMental;

	public ConsensoUmbralLimpiezaUnidad() {
	}

	public ConsensoUmbralLimpiezaUnidad(String tareaId, String grupoId, double periodicidad, double intensidad,
			double cargaMental) {
		this.tareaId = tareaId;
		this.grupoId = grupoId;
		this.periodicidad = periodicidad;
		this.intensidad = intensidad;
		this.cargaMental = cargaMental;
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

	public double getPeriodicidad() {
		return periodicidad;
	}

	public void setPeriodicidad(double periodicidad) {
		this.periodicidad = periodicidad;
	}

	public double getIntensidad() {
		return intensidad;
	}

	public void setIntensidad(double intensidad) {
		this.intensidad = intensidad;
	}

	public double getCargaMental() {
		return cargaMental;
	}

	public void setCargaMental(double cargaMental) {
		this.cargaMental = cargaMental;
	}
}
