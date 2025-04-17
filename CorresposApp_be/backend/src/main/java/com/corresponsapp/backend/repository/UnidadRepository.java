package com.corresponsapp.backend.repository;

import com.corresponsapp.backend.model.Unidad;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UnidadRepository extends MongoRepository<Unidad, String> {
    Optional<Unidad> findByCodigoAcceso(String codigoAcceso);
}