package com.corresponsapp.backend.dto;


public class TareaUnidadDTO {

	
    private String id;            // ID único de la tarea (obligatorio para localizar la plantilla)
	
    private String nombre;        // Nombre de la tarea
    private String modulo;      // Módulo al que pertenece la tarea
    private int tiempoEstimado;
    private String definicion;
    private boolean esPlantilla;
    private String asignadoA; 
    
    private float periodicidad;
    private float intensidad;
    private float cargaMental;
	
    

	public TareaUnidadDTO() {
        super();
    }

	public TareaUnidadDTO(String id, String nombre, String modulo, int tiempoEstimado, String definicion,
			boolean esPlantilla, String asignadoA) {
		super();
		this.id = id;
		this.nombre = nombre;
		this.modulo = modulo;
		this.tiempoEstimado = tiempoEstimado;
		this.definicion = definicion;
		this.esPlantilla = esPlantilla;
		this.asignadoA = asignadoA;
	}


	public TareaUnidadDTO(String id, String nombre, String modulo, int tiempoEstimado, String definicion,
			boolean esPlantilla, String asignadoA, float periodicidad, float intensidad, float cargaMental) {
		super();
		this.id = id;
		this.nombre = nombre;
		this.modulo = modulo;
		this.tiempoEstimado = tiempoEstimado;
		this.definicion = definicion;
		this.esPlantilla = esPlantilla;
		this.asignadoA = asignadoA;
		this.periodicidad = periodicidad;
		this.intensidad = intensidad;
		this.cargaMental = cargaMental;
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
	
    public boolean getEsPlantilla() {
		return esPlantilla;
	}

	public void setEsPlantilla(boolean esPlantilla) {
		this.esPlantilla = esPlantilla;
	}

	public String getAsignadoA() {
		return asignadoA;
	}


	public void setAsignadoA(String asignadoA) {
		this.asignadoA = asignadoA;
	}

	public float getPeriodicidad() {
		return periodicidad;
	}

	public void setPeriodicidad(float periodicidad) {
		this.periodicidad = periodicidad;
	}

	public float getIntensidad() {
		return intensidad;
	}

	public void setIntensidad(float intensidad) {
		this.intensidad = intensidad;
	}

	public float getCargaMental() {
		return cargaMental;
	}

	public void setCargaMental(float cargaMental) {
		this.cargaMental = cargaMental;
	}

	@Override
	public String toString() {
		return "TareaUnidadDTO [id=" + id + ", nombre=" + nombre + ", modulo=" + modulo + ", tiempoEstimado="
				+ tiempoEstimado + ", definicion=" + definicion + ", esPlantilla=" + esPlantilla + ", asignadoA="
				+ asignadoA + "]";
	}
}
