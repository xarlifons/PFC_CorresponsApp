package com.corresponsapp.backend.dto;

import java.util.List;

public class UnidadInfoResponse {

	private String id;

	private String nombre;
    private List<String> modulosActivados;
    private int cicloCorresponsabilidad;
    private List<MiembroDTO> miembros;

    public UnidadInfoResponse(String nombre, List<String> modulosActivados, int duracionCicloDias, List<MiembroDTO> miembros) {
        this.nombre = nombre;
        this.modulosActivados = modulosActivados;
        this.cicloCorresponsabilidad = duracionCicloDias;
        this.miembros = miembros;
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

	public List<String> getModulosActivados() {
		return modulosActivados;
	}

	public void setModulosActivados(List<String> modulosActivados) {
		this.modulosActivados = modulosActivados;
	}

	public int getCicloCorresponsabilidad() {
		return cicloCorresponsabilidad;
	}

	public void setCicloCorresponsabilidad(int duracionCicloDias) {
		this.cicloCorresponsabilidad = duracionCicloDias;
	}

	public List<MiembroDTO> getMiembros() {
		return miembros;
	}

	public void setMiembros(List<MiembroDTO> miembros) {
		this.miembros = miembros;
	}
   
}