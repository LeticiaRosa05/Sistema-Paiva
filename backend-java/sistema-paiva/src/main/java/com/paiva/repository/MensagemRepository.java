package com.paiva.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.paiva.model.Mensagem;

public interface MensagemRepository extends JpaRepository<Mensagem, Long> {
    
}
