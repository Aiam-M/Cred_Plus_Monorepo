package com.projeto.amazonhacking.models;

public record RegisterDTO (String nome, String email, String passwordHash, int associacaoId, UsuarioRole role){
}
