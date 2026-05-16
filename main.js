// ── State ──────────────────────────────────────────────────────────────────
let allCoins = [];
let sortKey = 'market_cap_rank';
let sortAsc = true;
let searchQuery = '';
let countdownVal = 60;
let countdownTimer = null;
let previousPrices = {};

// ── DOM refs ────────────────────────────────────────────────────────────────
const tableBody    = document.getElementById('tableBody');
const statusDot    = document.getElementById('statusDot');
const statusText   = document.getElementById('statusText');
const lastUpdated  = document.getElementById('lastUpdated');
const searchBox    = document.getElementById('searchBox');
const refreshBtn   = document.getElementById('refreshBtn');
const countdownEl  = document.getElementById('countdown');
const tickerInner  = document.getElementById('tickerInner');

// ── Helpers ─────────────────────────────────────────────────────────────────
const fmt = {
  price(n) {
    if (n === null || n === undefined) return '—';
    if (n >= 1) return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return '$' + n.toFixed(6);
  },
  large(n) {
    if (n === null || n === undefined) return '—';
    if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T';
    if (n >= 1e9)  return '$' + (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6)  return '$' + (n / 1e6).toFixed(2) + 'M';
    return '$' + n.toLocaleString();
  },
  supply(n, sym) {
    if (!n) return '—';
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B ' + sym;
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M ' + sym;
    return n.toLocaleString() + ' ' + sym;
  },
  pct(n) {
    if (n === null || n === undefined) return '—';
    const sign = n >= 0 ? '+' : '';
    return sign + n.toFixed(2) + '%';
  },
  time() {
    return new Date().toLocaleTimeString('en-US', { hour12: false });
  }
};

// ── Fetch data ───────────────────────────────────────────────────────────────
async function fetchPrices() {
  setStatus('loading');
  try {
    const res = await fetch('/api/prices');
    const json = await res.json();
    if (json.status !== 'ok') throw new Error(json.message);
    allCoins = json.data;
    renderTable();
    renderTicker();
    setStatus('live');
    lastUpdated.textContent = fmt.time();
    resetCountdown();
  } catch (err) {
    setStatus('error');
    console.error('Fetch error:', err);
  }
}

// ── Status helpers ───────────────────────────────────────────────────────────
function setStatus(state) {
  statusDot.className = 'status-dot';
  if (state === 'live') {
    statusDot.classList.add('live');
    statusText.textContent = 'LIVE';
  } else if (state === 'error') {
    statusDot.classList.add('error');
    statusText.textContent = 'ERROR';
  } else {
    statusText.textContent = 'SYNCING...';
  }
}

// ── Render table ─────────────────────────────────────────────────────────────
function renderTable() {
  let coins = [...allCoins];

  // Filter
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    coins = coins.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.symbol.toLowerCase().includes(q)
    );
  }

  // Sort
  coins.sort((a, b) => {
    let va = a[sortKey] ?? 0, vb = b[sortKey] ?? 0;
    return sortAsc ? va - vb : vb - va;
  });

  if (!coins.length) {
    tableBody.innerHTML = `<tr><td colspan="7" class="loading-row" style="color:var(--text-dim)">NO RESULTS FOUND</td></tr>`;
    return;
  }

  tableBody.innerHTML = '';
  coins.forEach((coin, i) => {
    const change = coin.price_change_percentage_24h;
    const cls = change >= 0 ? 'pos' : 'neg';
    const prevPrice = previousPrices[coin.id];
    const flashClass = prevPrice
      ? (coin.current_price > prevPrice ? 'flash-green' : coin.current_price < prevPrice ? 'flash-red' : '')
      : '';

    const tr = document.createElement('tr');
    if (flashClass) tr.classList.add(flashClass);

    tr.innerHTML = `
      <td class="rank">${coin.market_cap_rank ?? '—'}</td>
      <td>
        <div class="coin-cell">
          <img class="coin-icon" src="${coin.image}" alt="${coin.symbol}" loading="lazy"/>
          <div>
            <div class="coin-name">${coin.symbol.toUpperCase()}</div>
            <div class="coin-symbol">${coin.name}</div>
          </div>
        </div>
      </td>
      <td class="price">${fmt.price(coin.current_price)}</td>
      <td class="change ${cls}">${fmt.pct(change)}</td>
      <td class="market-cap">${fmt.large(coin.market_cap)}</td>
      <td class="volume">${fmt.large(coin.total_volume)}</td>
      <td class="supply">${fmt.supply(coin.circulating_supply, coin.symbol.toUpperCase())}</td>
    `;
    tableBody.appendChild(tr);
    previousPrices[coin.id] = coin.current_price;
  });
}

// ── Render ticker ─────────────────────────────────────────────────────────────
function renderTicker() {
  const html = allCoins.map(c => {
    const pct = c.price_change_percentage_24h;
    const cls = pct >= 0 ? 't-pos' : 't-neg';
    return `<span class="ticker-coin">
      <span class="t-sym">${c.symbol.toUpperCase()}</span>
      <span class="t-price"> ${fmt.price(c.current_price)}</span>
      <span class="${cls}"> ${fmt.pct(pct)}</span>
    </span>`;
  }).join('');
  tickerInner.innerHTML = html;
}

// ── Countdown ─────────────────────────────────────────────────────────────────
function resetCountdown() {
  clearInterval(countdownTimer);
  countdownVal = 60;
  countdownEl.textContent = countdownVal;
  countdownTimer = setInterval(() => {
    countdownVal--;
    countdownEl.textContent = countdownVal;
    if (countdownVal <= 0) {
      clearInterval(countdownTimer);
      fetchPrices();
    }
  }, 1000);
}

// ── Event listeners ───────────────────────────────────────────────────────────
searchBox.addEventListener('input', e => {
  searchQuery = e.target.value.trim();
  renderTable();
});

refreshBtn.addEventListener('click', fetchPrices);

document.querySelectorAll('.sort-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.sort;
    if (sortKey === key) {
      sortAsc = !sortAsc;
    } else {
      sortKey = key;
      sortAsc = key === 'market_cap_rank';
    }
    document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTable();
  });
});

// ── Init ──────────────────────────────────────────────────────────────────────
fetchPrices();
