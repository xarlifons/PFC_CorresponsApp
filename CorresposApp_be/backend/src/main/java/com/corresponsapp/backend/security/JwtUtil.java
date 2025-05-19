package com.corresponsapp.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.corresponsapp.backend.model.User;

import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {

	@Value("${jwt.secret}")
	private String secret;

	@Value("${jwt.expiration}")
	private long expirationTime;

	public String generateToken(User user) {
		return Jwts.builder()
				.setSubject(user.getEmail())
				.claim("id", user.getId())
				.claim("nombre", user.getNombre())
				.claim("role", user.getRole())
				.claim("unidadAsignada", user.getUnidadAsignada())
				.setIssuedAt(new Date())
				.setExpiration(new Date(System.currentTimeMillis() + expirationTime))
				.signWith(getSigningKey(), SignatureAlgorithm.HS512).compact();
	}

	private Key getSigningKey() {
		byte[] keyBytes = Base64.getDecoder().decode(secret);
		return Keys.hmacShaKeyFor(keyBytes);
	}

	public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
		final Claims claims = extractAllClaims(token);
		return claimsResolver.apply(claims);
	}

	private Claims extractAllClaims(String token) {
		return Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token).getBody();
	}

	public boolean validateToken(String token, String email) {
		final String username = extractEmail(token);
		return (username.equals(email) && !isTokenExpired(token));
	}

	public String extractEmail(String token) {
		return extractClaim(token, claims -> claims.getSubject());
	}

	private boolean isTokenExpired(String token) {
		final Date expiration = extractClaim(token, claims -> claims.getExpiration());
		return expiration.before(new Date());
	}
}
