package com.corresponsapp.backend.service;

import com.corresponsapp.backend.model.User;

import java.util.Optional;

import com.corresponsapp.backend.dto.LoginResponse;

public interface AuthService {

	LoginResponse register(User user);// Registro de usuarios

    LoginResponse login(String email, String password); // Login de usuarios con respuesta JWT    
  
    public Optional<User> getByEmail(String email);
}
