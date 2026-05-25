package com.projeto.amazonhacking.dto.agroscore;

import java.util.List;

/**
 * Distribuição de uso do solo (MapBiomas) exibida no gráfico de pizza.
 */
public record MapabiomasDTO(
        List<ClasseDTO> classes
) {

    /**
     * Uma classe de uso do solo (ex.: Formação Florestal, 38%).
     */
    public record ClasseDTO(
            String nome,
            double percentual,
            String cor
    ) {
    }
}
