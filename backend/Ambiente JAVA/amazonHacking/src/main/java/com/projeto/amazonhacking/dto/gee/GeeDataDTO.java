package com.projeto.amazonhacking.dto.gee;

import java.util.List;

public record GeeDataDTO(
        List<IndicesAnuaisDTO> serieTemporalIndices,

        HansenDTO hansen
) {
}
