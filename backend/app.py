from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()
app = Flask(__name__)
CORS(app, resources={r"/api/*":{"origins": os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")}
})
@app.route('/health', methods=['GET'])
def health():
    return {"status": "ok", 'service': 'hotel-bot-api'}, 200
if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(debug=True, port=port)