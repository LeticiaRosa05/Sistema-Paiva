package com.paiva.model;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.Data;

@Table(name = "analises")
@Data
@NoArgsConstructor
@AllArgsConstructor

@Entity
public class Analise {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "analise_ia", columnDefinition = "TEXT")
    private String analise_IA;

    LocalDateTime horaEnvio = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;
    public Analise(Usuario usuario) {
        this.usuario = usuario;
    }
}
