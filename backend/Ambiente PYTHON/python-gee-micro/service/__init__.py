import ee
from config import Config


def inicializar_gee():

    print("Inicializando Google Earth Engine...")

    # ee.ServiceAccountCredentials = equivalente ao GoogleCredentials do Java
    credentials = ee.ServiceAccountCredentials(
        email=Config.GEE_SERVICE_ACCOUNT_EMAIL,
        key_file=Config.GEE_KEY_FILE
    )

    ee.Initialize(credentials)



def get_poligono_jutaiteua():

    return ee.Geometry.Polygon(Config.POLIGONO_JUTAITEUA)