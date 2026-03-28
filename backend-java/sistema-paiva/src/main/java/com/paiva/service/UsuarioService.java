package com.paiva.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.paiva.repository.UsuarioRepository;
import com.paiva.model.Usuario;

@Service
public class UsuarioService {
    @Autowired
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

    @Transactional // garante que ou tudo é deletado ou nada é deletado
    public void excluirUsuario(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
        }
    }

    public Usuario buscarPorId(Long id) {
        return repository.findById(id).orElse(null);
    }

    public UserDetails findByEmail(String email) {
        return repository.findByEmail(email);
    }
}
