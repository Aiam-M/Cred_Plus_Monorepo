
from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from service import inicializar_gee
from service.indices_veg import calcular_serie_temporal
from service.hansen import calcular_dados_hansen



app = Flask(__name__)

CORS(app)

with app.app_context():
    inicializar_gee()



@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'service': 'gee-service',
        'version': '1.0.0'
    })


@app.route('/gee/jutaiteua/indices', methods=['GET'])
def endpoint_indices():
    try:
        dados = calcular_serie_temporal(2019, 2025)
        return jsonify(dados)
    except Exception as e:
        return jsonify({
            'erro': 'Erro ao calcular índices',
            'detalhes': str(e)
        }), 500


@app.route('/gee/jutaiteua/hansen', methods=['GET'])
def endpoint_hansen():

    try:
        dados = calcular_dados_hansen()
        return jsonify(dados)
    except Exception as e:
        return jsonify({
            'erro': 'Erro ao calcular Hansen',
            'detalhes': str(e)
        }), 500


@app.route('/gee/jutaiteua/completo', methods=['GET'])
def endpoint_completo():

    try:
        return jsonify({
            'serieTemporalIndices':  calcular_serie_temporal(2019, 2025),
            'hansen':        calcular_dados_hansen()
        })
    except Exception as e:
        return jsonify({
            'erro': 'Erro ao calcular dados',
            'detalhes': str(e)
        }), 500



if __name__ == '__main__':
    print(f"Iniciando GEE Service na porta {Config.PORT}")

    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=Config.DEBUG
    )