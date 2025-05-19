package com.corresponsapp.backend.service;

import com.corresponsapp.backend.model.User;

import java.util.Optional;

import com.corresponsapp.backend.dto.LoginResponse;

public interface AuthService {

	LoginResponse register(User user);

    LoginResponse login(String email, String password);
  
    public Optional<User> getByEmail(String email);
}
