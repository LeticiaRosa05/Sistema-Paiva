package com.paiva.service;

import org.springframework.stereotype.Service;
import com.paiva.repository.UsuarioRepository;
import com.paiva.model.Usuario;

@Service
public class UsuarioService {
    private UsuarioRepository repository;

    public UsuarioService (UsuarioRepository repository) {
        this.repository = repository;
    }

    public Usuario salvarUsuario(Usuario usuario) {
        if (usuario == null) {
            throw new IllegalArgumentException("O usuário não pode ser nulo!"); // o throw interrompe a execução do método, não sendo necessário um else para evitar que o save seja executado caso o usuário não exista
        }
        return repository.save(usuario);
    }
}
