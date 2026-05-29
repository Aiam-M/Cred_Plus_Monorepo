import ee
from config import Config


def inicializar_gee():

    print("Inicializando Google Earth Engine...")

    # ee.ServiceAccountCredentials = equivalente ao GoogleCredentials do Java.
    # Em produção (Render) a chave vem como texto na env var GEE_KEY_DATA.
    # Localmente, continua funcionando via arquivo (GEE_KEY_FILE).
    if Config.GEE_KEY_DATA:
        credentials = ee.ServiceAccountCredentials(
            email=Config.GEE_SERVICE_ACCOUNT_EMAIL,
            key_data=Config.GEE_KEY_DATA
        )
    else:
        credentials = ee.ServiceAccountCredentials(
            email=Config.GEE_SERVICE_ACCOUNT_EMAIL,
            key_file=Config.GEE_KEY_FILE
        )

    ee.Initialize(credentials)



def get_poligono_jutaiteua():

    return ee.Geometry.Polygon(Config.POLIGONO_JUTAITEUA)