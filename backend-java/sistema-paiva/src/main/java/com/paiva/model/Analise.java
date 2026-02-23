package com.paiva.model;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Table(name = "analises")
@Data
@NoArgsConstructor
@AllArgsConstructor

@Entity
public class Analise {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    @Column(name = "analise_IA")
    private String analise_IA;

    LocalDateTime horaEnvio = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;
    public Analise(Usuario usuario) {
        this.usuario = usuario;
    }
}
