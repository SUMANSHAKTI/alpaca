import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_trades_symbol_filtering():
    """
    Verifies that querying trades for BTC/USD returns ONLY BTC/USD trades
    and never leaks NVDA or other symbols.
    """
    res_btc = client.get("/api/market-data/trades?symbol=BTC/USD")
    assert res_btc.status_code == 200
    data_btc = res_btc.json()
    for trade in data_btc:
        assert trade["symbol"] == "BTC/USD", f"Symbol contamination found: {trade}"

    res_nvda = client.get("/api/market-data/trades?symbol=NVDA")
    assert res_nvda.status_code == 200
    data_nvda = res_nvda.json()
    for trade in data_nvda:
        assert trade["symbol"] == "NVDA", f"Symbol contamination found: {trade}"

def test_positions_symbol_filtering():
    """
    Verifies that querying positions for a specific symbol returns ONLY matching position or empty list.
    """
    res = client.get("/api/positions?symbol=BTC/USD")
    assert res.status_code == 200
    positions = res.json()
    for pos in positions:
        assert pos["symbol"] in ["BTC/USD", "BTCUSD"], f"Symbol contamination found in positions: {pos}"

def test_bars_symbol_scoping():
    """
    Verifies that historical bars returned for a symbol have matching symbol metadata.
    """
    res_btc = client.get("/api/market-data/bars?symbol=BTC/USD&timeframe=1D&limit=10")
    assert res_btc.status_code == 200
    bars_btc = res_btc.json()
    for bar in bars_btc:
        assert bar["symbol"] == "BTC/USD", f"Contaminated bar symbol found: {bar}"

    res_nvda = client.get("/api/market-data/bars?symbol=NVDA&timeframe=1D&limit=10")
    assert res_nvda.status_code == 200
    bars_nvda = res_nvda.json()
    for bar in bars_nvda:
        assert bar["symbol"] == "NVDA", f"Contaminated bar symbol found: {bar}"
