package com.corresponsapp.backend.controller;

import com.corresponsapp.backend.model.User;
import com.corresponsapp.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @PutMapping("/asignar-unidad/{unidadId}")
    public Optional<User> asignarUnidad(@PathVariable String unidadId) {
        String email = getEmailDesdeToken();
        Optional<User> userOpt = userRepository.findByEmail(email);

        return userOpt.map(user -> {
            user.setUnidadAsignada(unidadId);
            return userRepository.save(user);
        });
    }

    private String getEmailDesdeToken() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName(); // el subject del JWT, normalmente el email
    }
}
