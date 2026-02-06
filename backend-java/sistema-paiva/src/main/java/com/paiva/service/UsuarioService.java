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
            throw new IllegalArgumentException("O usuário não pode ser nulo!");
        }
        return repository.save(usuario);
    }
}
