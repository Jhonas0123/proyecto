from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Permite peticiones desde cualquier origen

@app.route('/api/ejercicio')
def ejercicio():
    return jsonify({
        "pregunta": "¿Cuánto es 3 + 3?",
        "opciones": [4, 5, 6],
        "respuesta": 6
    })

if __name__ == '__main__':
    app.run(debug=True)