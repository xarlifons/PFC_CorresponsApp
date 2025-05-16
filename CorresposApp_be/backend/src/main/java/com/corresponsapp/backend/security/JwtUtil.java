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
    private long expirationTime; // ms

    // Generar token JWT
    public String generateToken(User user) {
        return Jwts.builder()
            .setSubject(user.getEmail())
            .claim("id", user.getId())
            .claim("nombre", user.getNombre())
            .claim("role", user.getRole())
            .claim("unidadAsignada", user.getUnidadAsignada())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
            .signWith(getSigningKey(), SignatureAlgorithm.HS512)
            .compact();
    }
    
    // Obtener clave de firma en base64
    private Key getSigningKey() {
        byte[] keyBytes = Base64.getDecoder().decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
    
    
 
    // Extraer un claim específico del token
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
    
    // Obtener todos los claims
    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    
    

    // Validar el token
    public boolean validateToken(String token, String email) {
        final String username = extractUsername(token);
        return (username.equals(email) && !isTokenExpired(token));
    }
    
    // Extraer el email del token
    public String extractUsername(String token) {
        return extractClaim(token,  claims -> claims.getSubject());
    }

    // Verificar si el token ha expirado
    private boolean isTokenExpired(String token) {
        final Date expiration = extractClaim(token, claims -> claims.getExpiration());
        return expiration.before(new Date());
    }

 




}
