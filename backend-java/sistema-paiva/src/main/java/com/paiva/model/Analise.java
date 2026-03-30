package com.paiva.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import java.util.List;
import lombok.Data;

@Entity
@Table(name = "analises")
@Data
@AllArgsConstructor
@NoArgsConstructor

public class Analise {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "titulo")
    private String titulo;

    @Column(name = "analise_ia", columnDefinition = "TEXT")
    private String analise_IA;

    LocalDateTime horaEnvio = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    @JsonIgnore
    private Usuario usuario;
    public Analise(Usuario usuario) {
        this.usuario = usuario;
    }

    // vincula a análise às mensagens que foram geradas a partir dela para que sejam excluídas as mensagens junto com a análise
    @OneToMany(mappedBy = "analise", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Mensagem> mensagens;
}
