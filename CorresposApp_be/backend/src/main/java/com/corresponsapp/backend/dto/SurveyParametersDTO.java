package com.corresponsapp.backend.dto;

import java.io.Serializable;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class SurveyParametersDTO implements Serializable {

	private static final long serialVersionUID = 1L;

	@JsonProperty("unidadId")
	private String unidadId;

	@JsonProperty("grupo")
	private String grupo;

	@JsonProperty("tarea")
	private String tarea;

	@JsonProperty("periodicidad")
	private float periodicidad;

	@JsonProperty("cargaMental")
	private float cargaMental;

	@JsonProperty("intensidad")
	private float intensidad;

	public SurveyParametersDTO() {
	}

	public SurveyParametersDTO(String grupo, float periodicidad, float cargaMental, float intensidad) {
		this.grupo = grupo;
		this.periodicidad = periodicidad;
		this.cargaMental = cargaMental;
		this.intensidad = intensidad;
	}

	@JsonCreator
	public SurveyParametersDTO(@JsonProperty("grupo") String grupo, @JsonProperty("tarea") String tarea,
			@JsonProperty("periodicidad") float periodicidad, @JsonProperty("cargaMental") float cargaMental,
			@JsonProperty("intensidad") float intensidad) {
		this.grupo = grupo;
		this.tarea = tarea;
		this.periodicidad = periodicidad;
		this.cargaMental = cargaMental;
		this.intensidad = intensidad;
	}

	public String getGrupo() {
		return grupo;
	}

	public void setGrupo(String grupo) {
		this.grupo = grupo;
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

	public String getUnidadId() {
		return unidadId;
	}

	public void setUnidadId(String unidadId) {
		this.unidadId = unidadId;
	}

	public void setIntensidad(float intensidad) {
		this.intensidad = intensidad;
	}

	public String getTarea() {
		return tarea;
	}

	public void setTarea(String tarea) {
		this.tarea = tarea;
	}
}
