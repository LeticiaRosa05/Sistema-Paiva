package com.paiva.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.paiva.model.Analise;

public interface AnaliseRepository extends JpaRepository<Analise, Long> {
    
}
