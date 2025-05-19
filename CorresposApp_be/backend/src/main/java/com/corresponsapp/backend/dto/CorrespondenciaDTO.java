package com.corresponsapp.backend.dto;

public class CorrespondenciaDTO {
	
	private String grupo_id;
	private String modulo_id;

	public CorrespondenciaDTO() {}

	public String getGrupo_id() {
		return grupo_id;
	}

	public void setGrupo_id(String grupo_id) {
		this.grupo_id = grupo_id;
	}

	public String getModulo_id() {
		return modulo_id;
	}

	public void setModulo_id(String modulo_id) {
		this.modulo_id = modulo_id;
	}
}
