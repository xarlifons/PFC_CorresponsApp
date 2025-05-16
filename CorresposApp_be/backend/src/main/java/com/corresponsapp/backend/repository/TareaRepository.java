package com.corresponsapp.backend.repository;

import com.corresponsapp.backend.model.Tarea;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TareaRepository extends MongoRepository<Tarea, String> {

    List<Tarea> findByUnidadIdAndEsPlantillaFalse(String unidadId);

    List<Tarea> findByUnidadIdAndModuloAndEsPlantillaFalse(String unidadId, String modulo);

    List<Tarea> findByAsignadaAAndEsPlantillaFalse(String userId);

    List<Tarea> findByUnidadIdAndAsignadaAAndEsPlantillaFalse(String unidadId, String userId);

    List<Tarea> findByEsPlantillaTrue();

    List<Tarea> findByEsPlantillaTrueAndModulo(String modulo);
}
