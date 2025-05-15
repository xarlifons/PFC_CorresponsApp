package com.corresponsapp.backend.dto;

public class TareaParametroDTO {
    private String id;
    private String nombre;
    private float periodicidad;
    private float intensidad;
    private float cargaMental;

    public TareaParametroDTO() {}

    public TareaParametroDTO(String id, String nombre, float periodicidad, float cargaMental, float intensidad) {
        this.id = id;
        this.nombre = nombre;
        this.periodicidad = periodicidad;
        this.intensidad = intensidad;
        this.cargaMental = cargaMental;
    }

    public String getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public float getPeriodicidad() {
        return periodicidad;
    }

    public float getIntensidad() {
        return intensidad;
    }

    public float getCargaMental() {
        return cargaMental;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setPeriodicidad(float periodicidad) {
        this.periodicidad = periodicidad;
    }

    public void setIntensidad(float intensidad) {
        this.intensidad = intensidad;
    }

    public void setCargaMental(float cargaMental) {
        this.cargaMental = cargaMental;
    }
}
