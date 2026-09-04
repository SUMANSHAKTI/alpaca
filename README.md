# ALPHA HUNTER — Autonomous AI Trading Scientist

> **"Other AI trading agents choose trades. Alpha Hunter discovers which strategies deserve to trade."**

Alpha Hunter is an autonomous AI trading research system and miniature AI quantitative hedge fund. It continuously discovers trading strategies, formulates quantitative hypotheses, runs out-of-sample walk-forward backtests, subjects strategies to adversarial stress-testing, ranks surviving strategies by dynamic Edge Score, allocates paper capital, executes orders via Alpaca Paper Trading, and monitors live performance for edge deterioration.

---

## 1. Core Architecture & Multi-Agent Pipeline

```
[ Market Data / Alpaca API ]
           │
           ▼
 [ Market Intelligence Agent ] ──► Identifies Market Regime (BULLISH, BEARISH, SIDEWAYS, HIGH_VOL, LOW_VOL)
           │
           ▼
    [ Discovery Agent ] ─────────► Proposes precise Quantitative Strategy Hypotheses
           │
           ▼
    [ Backtest Agent ] ──────────► Chronological Train (70%) & Out-Of-Sample (30%) Walk-Forward Backtesting
           │
           ▼
    [ Adversary Agent ] ─────────► Adversarial Stress-Testing (Parameter sensitivity, concentration, lookahead)
           │                        Outputs ROBUSTNESS SCORE (0-100) & Verdict (PASS/WATCH/REJECT)
           ▼
  [ Strategy Darwinism Engine ] ──► Calculates EDGE SCORE (0-100) & Lifecycle (ALIVE / WATCH / KILLED)
           │
           ▼
   [ Portfolio Manager ] ────────► Allocates capital based on Edge Score, Volatility, Regime & Constraints
           │
           ▼
    [ Deterministic Risk Layer ] ─► Hard-coded Safety Rules (Symbol, Size, Daily Drawdown, Buying Power, ALIVE state)
           │                        * LLM CANNOT bypass risk checks *
           ▼
 [ Alpaca Paper Trading / Exec ] ─► Submits Paper Orders & Stores Complete Audit Trail
           │
           ▼
 [ Performance Monitor Agent ] ──► Tracks P&L, rolling Sharpe; auto-reduces allocation or KILLS deteriorating strategies
```

---

## 2. Agent Responsibilities

1. **Market Intelligence Agent**: Analyzes price, volume, and technical indicators to output structured market regimes (`BULLISH`, `BEARISH`, `SIDEWAYS`, `HIGH_VOLATILITY`, `LOW_VOLATILITY`).
2. **Discovery Agent**: Formulates quantitative trading hypotheses combining technical indicators, volume profiles, and market regimes without claiming profitability prior to testing.
3. **Strategy Backtest Engine**: Runs chronological train/test and out-of-sample (OOS) walk-forward validation (Sharpe, Sortino, Win Rate, Profit Factor, Max Drawdown, transaction costs). Prevents lookahead bias and data leakage.
4. **Adversary Agent — Critical Differentiator**: Assumes every promising strategy is overfit or fragile. Stress-tests parameter sensitivity, trade concentration, and regime reliance to produce a **ROBUSTNESS SCORE (0–100)** and `PASS`/`WATCH`/`REJECT` verdict.
5. **Strategy Evolution & Darwinism**: Computes dynamic **EDGE SCORE (0–100)**, manages lifecycle states (`ALIVE`, `WATCH`, `KILLED`), and breeds new variants from failed strategies.
6. **Portfolio Manager Agent**: Dynamic capital allocation across surviving `ALIVE` strategies while maintaining a mandatory cash safety buffer (minimum 15-20%).
7. **Deterministic Risk Agent**: Hard-coded Python safety guardrails (max 25% single position, 5% daily drawdown cap, buying power check, strategy `ALIVE` check). **The LLM cannot override or bypass risk limits**.
8. **Alpaca Integration**: Clean adapter layer for Alpaca Paper Trading API (`https://paper-api.alpaca.markets`) with graceful mock fallback when keys are omitted.
9. **Explainability Engine**: Generates human-readable decision evidence ("WHY THIS TRADE?", "Why was strategy killed?") and multi-agent digital signatures.

---

## 3. Environment Configuration (`.env`)

Copy `.env.example` to `.env`:

```bash
# Alpaca Paper Trading Credentials
ALPACA_API_KEY=your_alpaca_paper_api_key
ALPACA_SECRET_KEY=your_alpaca_paper_secret_key
ALPACA_BASE_URL=https://paper-api.alpaca.markets

# Mode & Intelligence Settings
DEMO_MODE=true
LLM_PROVIDER=mock # Options: mock, openai, gemini
OPENAI_API_KEY=
GEMINI_API_KEY=

# Database
DATABASE_URL=sqlite:///./alpha_hunter.db
```

> **IMPORTANT**: Only Alpaca Paper Trading endpoints are supported. Real-money API endpoints are strictly prohibited.

---

## 4. Quick Start / Running Locally

### Prerequisites
- Python 3.10+
- Node.js v18+

### Setup & Run
```bash
# 1. Install Backend Dependencies
pip install -r backend/requirements.txt

# 2. Install Frontend Dependencies
cd frontend && npm install && cd ..

# 3. Launch Both Servers
python run.py
```
- **Frontend Dashboard**: `http://localhost:3000`
- **FastAPI API Documentation**: `http://127.0.0.1:8000/docs`

---

## 5. Running Tests

Run the backend pytest suite verifying deterministic risk enforcement, backtest OOS walk-forward validation, and strategy edge deterioration:

```bash
cd backend
python -m pytest tests
```

---

## 6. Docker Deployment

```bash
docker-compose up --build
```
