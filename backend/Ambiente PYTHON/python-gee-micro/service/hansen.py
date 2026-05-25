# services/hansen_service.py
"""
Serviço para análise Hansen Global Forest Change.
"""

import ee
from service import get_poligono_jutaiteua


def calcular_dados_hansen():
    associacao = get_poligono_jutaiteua()

    hansen = ee.Image('UMD/hansen/global_forest_change_2023_v1_11')

    loss_year    = hansen.select('lossyear').clip(associacao)
    tree_2000    = hansen.select('treecover2000').clip(associacao)
    perda_recente = loss_year.gte(19).And(loss_year.lte(23))

    cobertura = tree_2000.reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=associacao,
        scale=30,
        maxPixels=1e9
    ).getInfo()

    ano_perda = loss_year.reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=associacao,
        scale=30,
        maxPixels=1e9
    ).getInfo()

    pixels_perda = perda_recente.reduceRegion(
        reducer=ee.Reducer.sum(),
        geometry=associacao,
        scale=30,
        maxPixels=1e9
    ).getInfo()

    return {
        'cobertura2000':         round(cobertura.get('treecover2000', 0), 2),
        'anoMedioPerda':         round(ano_perda.get('lossyear', 0), 2),
        'pixelsPerda2019_2023':  int(pixels_perda.get('lossyear', 0))
    }