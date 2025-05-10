package com.corresponsapp.backend.dto;

import java.io.Serializable;

public class SurveyParametersDTO implements Serializable {
	
	private static final long serialVersionUID = 1L;
	
    private String grupo;
    private double periodicidad; // en días
    private double cargaMental;  // 0.0 - 10.0
    private double intensidad;   // 0.0 - 10.0

    public SurveyParametersDTO() {
    }

    public SurveyParametersDTO(String grupo, double periodicidad, double cargaMental, double intensidad) {
        this.grupo = grupo;
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

    public double getPeriodicidad() {
        return periodicidad;
    }

    public void setPeriodicidad(double periodicidad) {
        this.periodicidad = periodicidad;
    }

    public double getCargaMental() {
        return cargaMental;
    }

    public void setCargaMental(double cargaMental) {
        this.cargaMental = cargaMental;
    }

    public double getIntensidad() {
        return intensidad;
    }

    public void setIntensidad(double intensidad) {
        this.intensidad = intensidad;
    }
}
