package com.paiva.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.paiva.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
}
