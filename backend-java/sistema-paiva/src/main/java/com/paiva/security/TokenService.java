package com.paiva.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.JWT;
import com.paiva.model.Usuario;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.Instant;

@Service
public class TokenService {

    @Value("${api.security.token.secret}")
    private String secret;

    public String gerarToken(Usuario usuario) {
        try {
            Algorithm algoritmo = Algorithm.HMAC256(secret);
            return JWT.create()
                    .withIssuer("Sistema Paiva")
                    .withSubject(usuario.getEmail())
                    .withExpiresAt(dataExpiracao())
                    .sign(algoritmo);
        } catch (Exception exception) {
            throw new RuntimeException("Erro ao gerar token", exception);
        }
    }

    private Instant dataExpiracao() {
        return LocalDateTime.now().plusHours(2).toInstant(ZoneOffset.of("-03:00"));
    }

    public String getSubject(String tokenJWT) {
        try {
            var algoritmo = Algorithm.HMAC256(secret);
            return JWT.require(algoritmo)
                    .withIssuer("Sistema Paiva")
                    .build()
                    .verify(tokenJWT)
                    .getSubject();
        } catch (Exception exception) {
            throw new RuntimeException("Token JWT inválido ou expirado!");
        }
    }
}
