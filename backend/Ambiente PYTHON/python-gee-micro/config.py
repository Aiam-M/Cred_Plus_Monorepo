# config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    GEE_SERVICE_ACCOUNT_EMAIL = os.getenv('GEE_SERVICE_ACCOUNT_EMAIL')
    # Em produção (Render) a chave vem como texto via GEE_KEY_DATA.
    # Localmente, continuamos usando o arquivo via GEE_KEY_FILE.
    GEE_KEY_FILE              = os.getenv('GEE_KEY_FILE')
    GEE_KEY_DATA              = os.getenv('GEE_KEY_DATA')
    GEE_PROJECT_ID            = os.getenv('GEE_PROJECT_ID')
    PORT                      = int(os.getenv('PORT', 5000))
    HOST                      = os.getenv('HOST', '0.0.0.0')
    DEBUG                     = os.getenv('DEBUG', 'False').lower() == 'true'

    POLIGONO_JUTAITEUA = [
        [-49.17932298208018, -2.4056474620953385],
        [-49.15966775441905, -2.4066765222553754],
        [-49.15963530893902, -2.425917918700715],
        [-49.1837108170567,  -2.4241170884212613],
        [-49.181822541910215,-2.405379736294885],
        [-49.17932298208018, -2.4056474620953385]
    ]