package com.corresponsapp.backend.dto;

public class TareaInstanciaDTO {
	private String id;
	private String asignadaA;
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

	public String getAsignadaA() {
		return asignadaA;
	}

	public void setAsignadaA(String asignadaA) {
		this.asignadaA = asignadaA;
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

	@Override
	public String toString() {
		return "TareaInstanciaDTO [id=" + id + ", asignadaA=" + asignadaA + ", periodicidad=" + periodicidad
				+ ", intensidad=" + intensidad + ", cargaMental=" + cargaMental + "]";
	}
}
