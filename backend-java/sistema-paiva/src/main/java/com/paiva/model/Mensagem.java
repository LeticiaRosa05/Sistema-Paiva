package com.paiva.model;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "mensagens")
@Data
@AllArgsConstructor
@NoArgsConstructor

public class Mensagem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long Id;

    @Column(name = "texto_mensagem", columnDefinition = "TEXT")
    private String texto_mensagem;

    private String origemRemetente;

    LocalDateTime horaMensagem = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "analise_id")
    private Analise analise;
    public Mensagem(Analise analise) {
        this.analise = analise;
    }

    // Construtor manual para o ChatController
    public Mensagem(Analise analise, String texto, String origem) {
        this.horaMensagem = LocalDateTime.now();
        this.origemRemetente = origem;
        this.texto_mensagem = texto;
        this.analise = analise;
    }
}
