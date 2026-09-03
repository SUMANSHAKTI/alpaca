import logging
import numpy as np
import pandas as pd
import urllib.request
import json
from datetime import datetime, timedelta
from app.alpaca.client import alpaca_manager

logger = logging.getLogger("market_data")

class MarketDataService:
    def get_historical_bars(self, symbol: str, timeframe: str = "1D", limit: int = 100) -> pd.DataFrame:
        symbol = symbol.upper()
        
        # Timeframe mappings for Yahoo Finance
        yahoo_map = {
            "1m": ("1m", "1d"),
            "5m": ("5m", "5d"),
            "15m": ("15m", "5d"),
            "30m": ("30m", "1mo"),
            "1h": ("60m", "1mo"),
            "4h": ("60m", "3mo"),
            "1D": ("1d", "3mo")
        }
        interval, y_range = yahoo_map.get(timeframe, ("1d", "3mo"))

        # 1. Try Alpaca Data API
        if alpaca_manager.is_live_paper_available and alpaca_manager.data_client:
            try:
                from alpaca.data.requests import StockBarsRequest
                from alpaca.data.timeframe import TimeFrame, TimeFrameUnit
                from alpaca.data.enums import DataFeed
                
                tf_obj = TimeFrame.Day
                if timeframe == "1m":
                    tf_obj = TimeFrame.Minute
                elif timeframe == "5m":
                    tf_obj = TimeFrame(5, TimeFrameUnit.Minute)
                elif timeframe == "15m":
                    tf_obj = TimeFrame(15, TimeFrameUnit.Minute)
                elif timeframe == "30m":
                    tf_obj = TimeFrame(30, TimeFrameUnit.Minute)
                elif timeframe == "1h":
                    tf_obj = TimeFrame.Hour
                elif timeframe == "4h":
                    tf_obj = TimeFrame(4, TimeFrameUnit.Hour)
                
                request_params = StockBarsRequest(
                    symbol_or_symbols=symbol,
                    timeframe=tf_obj,
                    limit=limit,
                    feed=DataFeed.IEX
                )
                bars = alpaca_manager.data_client.get_stock_bars(request_params)
                df = bars.df
                if not df.empty:
                    df = df.reset_index()
                    return df
            except Exception as e:
                logger.debug(f"Alpaca historical data fetch failed for {symbol}: {e}. Trying Yahoo Finance live API...")

        # 2. Try Real-Time Yahoo Finance Chart API
        try:
            url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?range={y_range}&interval={interval}"
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = json.loads(resp.read().decode())
                res = data["chart"]["result"][0]
                timestamps = res["timestamp"]
                quotes = res["indicators"]["quote"][0]
                
                df = pd.DataFrame({
                    "timestamp": pd.to_datetime(timestamps, unit="s"),
                    "open": quotes.get("open", []),
                    "high": quotes.get("high", []),
                    "low": quotes.get("low", []),
                    "close": quotes.get("close", []),
                    "volume": quotes.get("volume", [])
                }).dropna()
                
                if not df.empty:
                    return df.tail(limit)
        except Exception as e:
            logger.warning(f"Live market API fetch failed for {symbol}: {e}. Falling back to synthetic model.")

        # 3. Fallback Synthetic Bar Generator
        base_price = 150.0
        delta_map = {
            "1m": timedelta(minutes=1),
            "5m": timedelta(minutes=5),
            "15m": timedelta(minutes=15),
            "30m": timedelta(minutes=30),
            "1h": timedelta(hours=1),
            "4h": timedelta(hours=4),
            "1D": timedelta(days=1)
        }
        step_delta = delta_map.get(timeframe, timedelta(days=1))
        now = datetime.utcnow()
        dates = [now - (limit - i) * step_delta for i in range(limit)]
        
        np.random.seed(hash(symbol + timeframe) % 10000)
        returns = np.random.normal(0.0008, 0.015, limit)
        prices = base_price * np.exp(np.cumsum(returns))
        
        df = pd.DataFrame({
            "timestamp": dates,
            "open": prices * (1 + np.random.normal(0, 0.004, limit)),
            "high": prices * (1 + np.abs(np.random.normal(0, 0.008, limit))),
            "low": prices * (1 - np.abs(np.random.normal(0, 0.008, limit))),
            "close": prices,
            "volume": np.random.randint(5000000, 45000000, size=limit)
        })
        return df

    def get_latest_quote(self, symbol: str) -> dict:
        symbol = symbol.upper()
        
        # 1. Try Alpaca Data API
        if alpaca_manager.is_live_paper_available and alpaca_manager.data_client:
            try:
                from alpaca.data.requests import StockLatestQuoteRequest
                from alpaca.data.enums import DataFeed
                
                req = StockLatestQuoteRequest(symbol_or_symbols=symbol, feed=DataFeed.IEX)
                quote = alpaca_manager.data_client.get_stock_latest_quote(req)
                if symbol in quote:
                    q = quote[symbol]
                    bid = float(q.bid_price or 0.0)
                    ask = float(q.ask_price or 0.0)
                    last = (bid + ask) / 2.0 if (bid and ask) else bid or ask
                    if last > 0:
                        return {"symbol": symbol, "bid": bid, "ask": ask, "last_price": round(last, 2)}
            except Exception as e:
                logger.debug(f"Alpaca latest quote failed for {symbol}: {e}")

        # 2. Try Real-Time Yahoo Finance API
        try:
            url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1m&range=1d"
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = json.loads(resp.read().decode())
                meta = data["chart"]["result"][0]["meta"]
                price = round(float(meta["regularMarketPrice"]), 2)
                return {
                    "symbol": symbol,
                    "bid": round(price - 0.05, 2),
                    "ask": round(price + 0.05, 2),
                    "last_price": price
                }
        except Exception as e:
            logger.warning(f"Real-time market quote failed for {symbol}: {e}")

        # 3. Fallback Jitter Price
        base_price = 150.0
        last_price = max(1.0, round(base_price + np.random.normal(0, 0.5), 2))
        return {
            "symbol": symbol,
            "bid": round(last_price - 0.05, 2),
            "ask": round(last_price + 0.05, 2),
            "last_price": last_price
        }

    def get_watchlist_quotes(self, symbols: list) -> dict:
        results = {}
        for sym in symbols:
            q = self.get_latest_quote(sym)
            quote_data = {
                "symbol": sym,
                "price": q.get("last_price", 150.0),
                "last_price": q.get("last_price", 150.0),
                "bid": q.get("bid", 149.95),
                "ask": q.get("ask", 150.05),
                "change_pct": 0.5,
                "volume": 15000000
            }
            results[sym] = quote_data
            clean_key = sym.upper().replace("/", "").replace("-", "")
            if clean_key not in results:
                results[clean_key] = quote_data
        return results

market_data_service = MarketDataService()
