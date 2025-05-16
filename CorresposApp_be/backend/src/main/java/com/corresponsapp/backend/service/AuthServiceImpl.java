package com.corresponsapp.backend.service;

import com.corresponsapp.backend.dto.LoginResponse;
import com.corresponsapp.backend.model.User;
import com.corresponsapp.backend.repository.UserRepository;
import com.corresponsapp.backend.security.JwtUtil;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

	private final UserRepository userRepository;
	private final BCryptPasswordEncoder passwordEncoder;
	private final JwtUtil jwtUtil;

	@Autowired
	public AuthServiceImpl(UserRepository userRepository, JwtUtil jwtUtil) {
		this.userRepository = userRepository;
		this.passwordEncoder = new BCryptPasswordEncoder();
		this.jwtUtil = jwtUtil;
	}

	@Override
	public LoginResponse register(User user) {
		if (userRepository.existsByEmail(user.getEmail())) {
			throw new RuntimeException("El email ya está registrado");
		}

		String hashedPassword = passwordEncoder.encode(user.getPassword());
		user.setPassword(hashedPassword);

		User savedUser = userRepository.save(user);

		String token = jwtUtil.generateToken(user);

		return new LoginResponse(token, user.getId(), user.getNombre(), user.getEmail(), user.getRole(),
				user.getUnidadAsignada());
	}

	@Override
	public LoginResponse login(String email, String password) {
		User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

		if (!passwordEncoder.matches(password, user.getPassword())) {
			throw new RuntimeException("Contraseña incorrecta");
		}

		String token = jwtUtil.generateToken(user);

		return new LoginResponse(token, user.getId(), user.getNombre(), user.getEmail(), user.getRole(),
				user.getUnidadAsignada());

	}

	@Override
	public Optional<User> getByEmail(String email) {
		return userRepository.findByEmail(email);
	}

}