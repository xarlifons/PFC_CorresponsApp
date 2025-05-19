package com.corresponsapp.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.corresponsapp.backend.dto.ConsensoUmbralLimpiezaUnidad;

import java.util.List;

@Document(collection = "unidades")
public class Unidad {

    @Id
    private String id;
    private String nombre;
    private String codigoAcceso;
    private String creadorId;
    private List<String> miembros;
    private List<String> modulosActivados; 
	private int cicloCorresponsabilidad = 30;
	private String estadoFase1 = "momento0";
	private List<Tarea> tareasUnidad;
	private List<ConsensoUmbralLimpiezaUnidad> consensoUnidad;
	private List<ConsensoUmbralLimpiezaUnidad> consensoInicial;
  

	public Unidad() {
		super();
	}
    
    public Unidad(String nombre) {
		super();
		this.nombre = nombre;
	}

	public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public List<Tarea> getTareasUnidad() {
		return tareasUnidad;
	}

	public void setTareasUnidad(List<Tarea> tareasUnidad) {
		this.tareasUnidad = tareasUnidad;
	}

	public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getCodigoAcceso() {
        return codigoAcceso;
    }

    public void setCodigoAcceso(String codigoAcceso) {
        this.codigoAcceso = codigoAcceso;
    }

    public String getCreadorId() {
        return creadorId;
    }

    public void setCreadorId(String creadorId) {
        this.creadorId = creadorId;
    }

    public List<String> getMiembros() {
        return miembros;
    }

    public void setMiembros(List<String> miembros) {
        this.miembros = miembros;
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
    
    public String getEstadoFase1() {
        return estadoFase1;
    }

    public void setEstadoFase1(String estadoFase1) {
        this.estadoFase1 = estadoFase1;
    }
    
    public List<ConsensoUmbralLimpiezaUnidad> getConsensoInicial() {
		return consensoInicial;
	}

	public void setConsensoInicial(List<ConsensoUmbralLimpiezaUnidad> consensoInicial) {
		this.consensoInicial = consensoInicial;
	}
	
	public List<ConsensoUmbralLimpiezaUnidad> getConsensoUnidad() {
		return consensoUnidad;
	}

	public void setConsensoUnidad(List<ConsensoUmbralLimpiezaUnidad> consensoUnidad) {
		this.consensoUnidad = consensoUnidad;
	}
    
    @Override
	public String toString() {
		return "Unidad [id=" + id + ", nombre=" + nombre + ", codigoAcceso=" + codigoAcceso + ", creadorId=" + creadorId
				+ ", miembros=" + miembros + ", modulosActivados=" + modulosActivados + ", cicloCorresponsabilidad="
				+ cicloCorresponsabilidad + ", estadoFase1=" + estadoFase1 + ", tareasUnidad=" + tareasUnidad
				+ ", consensoUnidad=" + consensoUnidad + "]";
	}
}
