# services/indices_service.py
"""
Serviço para calcular índices vegetativos.

Equivale a uma classe @Service do Spring Boot:

@Service
public class IndicesService {
    public List<IndicesAnuaisDTO> calcularSerieTemporal() { ... }
}
"""

import ee
from service import get_poligono_jutaiteua


def calcular_indices_ano(ano):
    associacao = get_poligono_jutaiteua()

    imagem = (ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
              .filterBounds(associacao)
              .filterDate(f'{ano}-01-01', f'{ano}-12-31')
              .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
              .median()
              .clip(associacao))

    ndvi = imagem.normalizedDifference(['B8', 'B4']).rename('NDVI')

    evi = imagem.expression(
        '2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))',
        {
            'NIR':  imagem.select('B8'),
            'RED':  imagem.select('B4'),
            'BLUE': imagem.select('B2')
        }
    ).rename('EVI')

    savi = imagem.expression(
        '1.5 * ((NIR - RED) / (NIR + RED + 0.5))',
        {
            'NIR': imagem.select('B8'),
            'RED': imagem.select('B4')
        }
    ).rename('SAVI')

    nbr = imagem.normalizedDifference(['B8', 'B12']).rename('NBR')

    ndwi = imagem.normalizedDifference(['B8', 'B11']).rename('NDWI')

    indices = ndvi.addBands(evi).addBands(savi).addBands(nbr).addBands(ndwi)

    medias = indices.reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=associacao,
        scale=10,
        maxPixels=1e9
    ).getInfo()

    return {
        'ano':  ano,
        'ndvi': round(medias.get('NDVI', 0), 3),
        'evi':  round(medias.get('EVI',  0), 3),
        'savi': round(medias.get('SAVI', 0), 3),
        'nbr':  round(medias.get('NBR',  0), 3),
        'ndwi': round(medias.get('NDWI', 0), 3)
    }


def calcular_serie_temporal(ano_inicio=2019, ano_fim=2025):
    resultados = []

    # for em Python = for-each do Java
    for ano in range(ano_inicio, ano_fim + 1):
        try:
            print(f" Calculando índices para {ano}...")
            indices = calcular_indices_ano(ano)
            resultados.append(indices)
        except Exception as e:
            # try/except em Python = try/catch em Java
            print(f" Erro ao calcular {ano}: {e}")
            resultados.append({
                'ano': ano,
                'erro': str(e)
            })

    return resultados