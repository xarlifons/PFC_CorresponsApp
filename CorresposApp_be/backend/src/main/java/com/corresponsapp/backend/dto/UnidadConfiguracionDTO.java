package com.corresponsapp.backend.dto;

import java.util.List;

public class UnidadConfiguracionDTO {

    private List<String> modulosActivados;
    private int cicloCorresponsabilidad;
    private List<TareaUnidadDTO> tareasUnidad;  // Ahora lista de TareaUnidadDTO (no de Tarea completa)
    private String estadoFase1;

    public UnidadConfiguracionDTO() {
        super();
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

    public void setCicloCorresponsabilidad(int cicloCorresponsabilidad) {
        this.cicloCorresponsabilidad = cicloCorresponsabilidad;
    }

    public List<TareaUnidadDTO> getTareasUnidad() {
        return tareasUnidad;
    }

    public void setTareasUnidad(List<TareaUnidadDTO> tareasUnidad) {
        this.tareasUnidad = tareasUnidad;
    }
    public String getEstadoFase1() {
		return estadoFase1;
	}

	public void setEstadoFase1(String estadoFase1) {
		this.estadoFase1 = estadoFase1;
	}

	@Override
	public String toString() {
		return "UnidadConfiguracionDTO [modulosActivados=" + modulosActivados + ", cicloCorresponsabilidad="
				+ cicloCorresponsabilidad + ", tareasUnidad=" + tareasUnidad + ", estadoFase1=" + estadoFase1 + "]";
	}
	
}
