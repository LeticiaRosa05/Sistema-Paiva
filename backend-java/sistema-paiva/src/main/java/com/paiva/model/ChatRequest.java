package com.paiva.model;

// DTO (Data Transfer Object) para receber respostas do usuário pelo Postman
public record ChatRequest(String mensagemUsuario) {}
// Usamos o public record por ser mais simples e imutável para dados transitórios
