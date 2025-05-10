package com.corresponsapp.backend.model;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import com.corresponsapp.backend.dto.SurveyParametersDTO;

@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String nombre;
    private String email;
    private String password;
    private String role;
    private String unidadAsignada;
    
    @Field("surveyParameters")
    private List<SurveyParametersDTO> surveyParameters;
    private String unidadId;
    private Double umbralLimpieza;



	// Constructor vacío (necesario para Spring y MongoDB)
    public User() {}

    // Constructor con todos los campos
    public User(String id, String nombre, String email, String password, String role, String unidadAsignada) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.password = password;
        this.role = role;
        this.unidadAsignada = unidadAsignada;
    }

    // Constructor para /register sin unidad aún
    public User(String nombre, String email, String password, String role) {
        this.nombre = nombre;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    // Getters y Setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }   
    

    public List<SurveyParametersDTO> getSurveyParameters() {
		return surveyParameters;
	}

	public void setSurveyParameters(List<SurveyParametersDTO> surveyParameters) {
		this.surveyParameters = surveyParameters;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getUnidadAsignada() {
        return unidadAsignada;
    }

    public void setUnidadAsignada(String unidadAsignada) {
        this.unidadAsignada = unidadAsignada;
    }
    
    public String getUnidadId() {
		return unidadId;
	}

	public void setUnidadId(String unidadId) {
		this.unidadId = unidadId;
	}
	
	public Double getUmbralLimpieza() {
		return umbralLimpieza;
	}

	public void setUmbralLimpieza(Double umbralLimpieza) {
		this.umbralLimpieza = umbralLimpieza;
	}

    @Override
    public String toString() {
        return "User{" +
                "id='" + id + '\'' +
                ", nombre='" + nombre + '\'' +
                ", email='" + email + '\'' +
                ", password='" + password + '\'' +
                ", role='" + role + '\'' +
                ", unidadAsignada='" + unidadAsignada + '\'' +
                '}';
    }
}
