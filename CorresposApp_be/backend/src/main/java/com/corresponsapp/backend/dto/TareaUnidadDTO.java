package com.corresponsapp.backend.dto;

public class TareaUnidadDTO {

    private String id;            // ID único de la tarea (obligatorio para localizar la plantilla)
    private String nombre;        // Nombre de la tarea
    private String modulo;      // Módulo al que pertenece la tarea
    private int tiempoEstimado;
    private String definicion;
	
    

	public TareaUnidadDTO() {
        super();
    }

	public TareaUnidadDTO(String id, String nombre, String modulo, int tiempoEstimado, String definicion) {
        this.id = id;
        this.nombre = nombre;
        this.modulo = modulo;
        this.tiempoEstimado = tiempoEstimado;
        this.definicion = definicion;
    }

    // Getters y Setters
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

    public String getModulo() {
        return modulo;
    }

    public void setModulo(String modulo) {
        this.modulo = modulo;
    }

    public int getTiempoEstimado() {
		return tiempoEstimado;
	}

	public void setTiempoEstimado(int tiempoEstimado) {
		this.tiempoEstimado = tiempoEstimado;
	}
    
    public String getDefinicion() {
		return definicion;
	}

	public void setDefinicion(String definicion) {
		this.definicion = definicion;
	}
	
    @Override
    public String toString() {
        return "TareaUnidadDTO{" +
                "id='" + id + '\'' +
                ", nombre='" + nombre + '\'' +
                ", modulo='" + modulo + '\'' +
                '}';
    }
}
