package com.corresponsapp.backend.dto;

import java.util.List;

public class MiembroDTO {
    private String id;
    private String nombre;
    private String email;
    private List<SurveyParametersDTO> surveyParameters;
    private Double umbralLimpieza;

    public MiembroDTO(String id, String nombre, String email, List<SurveyParametersDTO> surveyParameters, Double umbralLimpieza) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.surveyParameters = surveyParameters ;
        this.umbralLimpieza = umbralLimpieza ;
    }

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getNombre() {
		return nombre;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public List<SurveyParametersDTO> getSurveyParameters() {
		return surveyParameters;
	}

	public void setSurveyParameters(List<SurveyParametersDTO> surveyParameters) {
		this.surveyParameters = surveyParameters;
	}
	
	public Double getUmbralLimpieza() {
		return umbralLimpieza;
	}

	public void setUmbralLimpieza(Double umbralLimpieza) {
		this.umbralLimpieza = umbralLimpieza;
	}

}
