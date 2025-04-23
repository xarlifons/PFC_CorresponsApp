package com.corresponsapp.backend.dto;

import java.util.List;

public class UnidadConfiguracionDTO {
    private List<String> modulosActivados;
    private int cicloCorresponsabilidad;

    // Getters y Setters
    public List<String> getModulosActivados() {
        return modulosActivados;
    }

    public UnidadConfiguracionDTO() {
		super();
	}

	public void setModulosActivados(List<String> modulosActivados) {
        this.modulosActivados = modulosActivados;
    }

    public int getCicloCorresponsabilidad() {
        return cicloCorresponsabilidad;
    }

    public void setCicloCorresponsabilidad(int cicloCorresponsabilidad) {
        this.cicloCorresponsabilidad = cicloCorresponsabilidad;
    }
}
