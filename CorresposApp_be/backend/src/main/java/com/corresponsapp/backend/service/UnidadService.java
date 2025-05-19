package com.corresponsapp.backend.service;

import com.corresponsapp.backend.dto.ConsensoUmbralLimpiezaUnidad;
import com.corresponsapp.backend.dto.TareaInstanciaDTO;
import com.corresponsapp.backend.dto.TareaParametroDTO;
import com.corresponsapp.backend.dto.UnidadConfiguracionDTO;
import com.corresponsapp.backend.model.Tarea;
import com.corresponsapp.backend.model.Unidad;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface UnidadService {
	Unidad crearUnidad(Unidad unidad, String creadorId);

	Optional<Unidad> unirseUnidad(String codigoAcceso, String userId);

	Optional<Unidad> obtenerUnidadPorId(String id);

	Unidad actualizarEstadoFase1(String unidadId, String nuevoEstado);

	String obtenerEstadoFase1(String unidadId);

	Unidad configurarUnidad(String unidadId, UnidadConfiguracionDTO configuracionDTO);

	void guardarConsensoInicial(String unidadId, List<ConsensoUmbralLimpiezaUnidad> consenso);

	Map<String, TareaParametroDTO> obtenerConsensoInicial(String unidadId);

	void guardarConsensoFinal(String unidadId, List<ConsensoUmbralLimpiezaUnidad> consensoFinal);

	List<Tarea> generarInstancias(String unidadId, List<TareaInstanciaDTO> dtos, int cicloDias, LocalDate startDate);

	List<Tarea> obtenerTareasInstanciadas(String unidadId);

	List<TareaInstanciaDTO> mapearDesdeConsenso(String unidadId, List<ConsensoUmbralLimpiezaUnidad> consenso);

}
