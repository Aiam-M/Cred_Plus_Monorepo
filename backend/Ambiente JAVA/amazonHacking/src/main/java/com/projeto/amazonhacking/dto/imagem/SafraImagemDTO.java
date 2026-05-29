package com.projeto.amazonhacking.dto.imagem;

import java.time.LocalDateTime;

/**
 * Imagem de uma safra exibida no dashboard das empresas.
 * Expõe só o necessário (id, URL e data) — nunca a entidade.
 */
public record SafraImagemDTO(
        Integer id,
        String url,
        LocalDateTime createdAt
) {
}
