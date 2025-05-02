package com.corresponsapp.backend.dto;

import java.util.List;

public class UnidadConfiguracionDTO {

    private List<String> modulosActivados;
    private int cicloCorresponsabilidad;
    private List<TareaUnidadDTO> tareasUnidad;  // Ahora lista de TareaUnidadDTO (no de Tarea completa)

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
}
