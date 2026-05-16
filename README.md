# CRYPTEX — Real-Time Cryptocurrency Tracker

A full-stack web app that tracks live crypto prices using Python, Flask, and the CoinGecko API.

## Project Structure

```
crypto-tracker/
├── app.py                  # Flask backend + API routes
├── requirements.txt        # Python dependencies
├── templates/
│   └── index.html          # Jinja2 HTML template
└── static/
    ├── css/
    │   └── style.css       # Dark terminal UI styles
    └── js/
        └── main.js         # Async fetch, render, sort, search
```

## Quick Start

### 1. Create & activate a virtual environment
```bash
python -m venv venv
source venv/bin/activate        # macOS/Linux
venv\Scripts\activate           # Windows
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the app
```bash
python app.py
```

### 4. Open in browser
```
http://127.0.0.1:5000
```

## Features

| Feature | Details |
|---|---|
| Live prices | Top 20 coins by market cap via CoinGecko |
| Auto-refresh | Every 60 seconds with countdown timer |
| Search | Filter coins by name or symbol |
| Sort | By rank, price, 24h change, or market cap |
| Price flash | Green/red row flash on price movement |
| Ticker bar | Scrolling live price feed |
| Responsive | Works on mobile & desktop |

## API Endpoints

| Route | Description |
|---|---|
| `GET /` | Main dashboard |
| `GET /api/prices` | Top 20 coins JSON |
| `GET /api/coin/<id>` | Single coin detail |

## Tech Stack

- **Backend**: Python 3.x, Flask 3.x
- **Frontend**: Vanilla JS (Fetch API), HTML5, CSS3
- **Data**: CoinGecko REST API (free tier, no key needed)
- **Fonts**: Google Fonts (Share Tech Mono, Rajdhani)

## Notes

- CoinGecko free tier has rate limits (~10–30 req/min). If you see errors, wait a moment and refresh.
- No API key required for free tier usage.
- For production, consider adding caching (Flask-Caching or Redis) to reduce API calls.
