package com.paiva.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.paiva.model.Analise;
import java.util.List;

public interface AnaliseRepository extends JpaRepository<Analise, Long> {
    List<Analise> findByUsuarioId(Long usuarioId);
}
