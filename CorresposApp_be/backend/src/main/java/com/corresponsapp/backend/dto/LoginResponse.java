package com.corresponsapp.backend.dto;

public class LoginResponse {
    private String token;
    private String id;
    private String nombre;
    private String email;
    private String role;    
    private String unidadAsignada;

	public LoginResponse() {}

    public LoginResponse(String token, String id, String nombre, String email, String role,  String unidadAsignada) {
		super();
		this.token = token;
		this.id = id;
		this.nombre = nombre;
		this.email = email;
		this.role = role;
		this.unidadAsignada = unidadAsignada;
	}

	public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
    
    public String getNombre() {
		return nombre;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre;
	}
	
	public String getUnidadAsignada() {
		return unidadAsignada;
	}

	public void setUnidadAsignada(String unidadAsignada) {
		this.unidadAsignada = unidadAsignada;
	}

	@Override
	public String toString() {
		return "LoginResponse [token=" + token + ", id=" + id + ", email=" + email + ", role=" + role + ", nombre="
				+ nombre + ", unidadAsignada=" + unidadAsignada + "]";
	}

}
