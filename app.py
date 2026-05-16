from flask import Flask, render_template, jsonify
import urllib.request
import json

app = Flask(__name__)

COINGECKO_URL = (
    "https://api.coingecko.com/api/v3/coins/markets"
    "?vs_currency=usd"
    "&order=market_cap_desc"
    "&per_page=20"
    "&page=1"
    "&sparkline=false"
    "&price_change_percentage=24h"
)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/prices")
def prices():
    try:
        req = urllib.request.Request(
            COINGECKO_URL,
            headers={"User-Agent": "CryptoTracker/1.0"}
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
        return jsonify({"status": "ok", "data": data})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/coin/<coin_id>")
def coin_detail(coin_id):
    url = f"https://api.coingecko.com/api/v3/coins/{coin_id}?localization=false&tickers=false&community_data=false&developer_data=false"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "CryptoTracker/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
        return jsonify({"status": "ok", "data": data})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
