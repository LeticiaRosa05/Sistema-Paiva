package com.paiva.service;

import com.paiva.repository.AnaliseRepository;
import org.springframework.stereotype.Service;
import com.paiva.model.Analise;

@Service
public class MensagemService {
    private AnaliseRepository repository;

    public MensagemService(AnaliseRepository repository) {
        this.repository = repository;
    }

    public Analise buscarPorId(Long id) {
        return repository.findById(id).orElse(null);
    }
}
