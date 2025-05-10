package com.corresponsapp.backend.repository;

import com.corresponsapp.backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {

    // Buscar usuario por email (para login, recuperación, etc.)
    Optional<User> findByEmail(String email);

    // Saber si un email ya está registrado (para validación en el registro)
    boolean existsByEmail(String email);
    
    List<User> findByUnidadAsignada(String unidadId);
}
