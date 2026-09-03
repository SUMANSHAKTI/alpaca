import logging
import numpy as np
import pandas as pd
import urllib.request
import json
from datetime import datetime, timedelta

from app.alpaca.client import alpaca_manager

logger = logging.getLogger("market_data")


class MarketDataService:

    # ---------------------------------------------------------
    # Helpers
    # ---------------------------------------------------------

    def _is_crypto(self, symbol: str) -> bool:
        """Return True for crypto symbols such as BTC/USD."""
        return "/" in symbol

    def _yahoo_symbol(self, symbol: str) -> str:
        """
        Convert application symbols to Yahoo Finance symbols.

        BTC/USD -> BTC-USD
        ETH/USD -> ETH-USD
        AAPL    -> AAPL
        """
        return symbol.upper().replace("/", "-")

    def _crypto_fallback_price(self, symbol: str) -> float:
        """
        Reasonable fallback prices for demo purposes.
        These are only used if all live market-data sources fail.
        """
        fallback_prices = {
            "BTC/USD": 110000.0,
            "ETH/USD": 4500.0,
            "SOL/USD": 200.0,
            "AVAX/USD": 25.0,
            "DOGE/USD": 0.20,
            "LINK/USD": 25.0,
            "ADA/USD": 0.80,
            "XRP/USD": 2.50,
        }

        return fallback_prices.get(symbol.upper(), 150.0)

    def _stock_fallback_price(self, symbol: str) -> float:
        """Fallback prices for stocks if live data is unavailable."""
        fallback_prices = {
            "AAPL": 230.0,
            "MSFT": 500.0,
            "GOOGL": 200.0,
            "AMZN": 230.0,
            "NVDA": 180.0,
            "TSLA": 350.0,
            "META": 750.0,
            "NFLX": 1200.0,
            "AMD": 160.0,
        }

        return fallback_prices.get(symbol.upper(), 150.0)

    # ---------------------------------------------------------
    # Yahoo Finance
    # ---------------------------------------------------------

    def _get_yahoo_chart(
        self,
        symbol: str,
        interval: str = "1d",
        y_range: str = "3mo"
    ):
        """
        Fetch chart data from Yahoo Finance.

        Supports:
            BTC/USD -> BTC-USD
            ETH/USD -> ETH-USD
            AAPL    -> AAPL
        """

        yahoo_symbol = self._yahoo_symbol(symbol)

        urls = [
            f"https://query1.finance.yahoo.com/v8/finance/chart/"
            f"{yahoo_symbol}?range={y_range}&interval={interval}",

            f"https://query2.finance.yahoo.com/v8/finance/chart/"
            f"{yahoo_symbol}?range={y_range}&interval={interval}"
        ]

        last_error = None

        for url in urls:
            try:
                req = urllib.request.Request(
                    url,
                    headers={
                        "User-Agent": "Mozilla/5.0",
                        "Accept": "application/json",
                    }
                )

                with urllib.request.urlopen(req, timeout=8) as resp:
                    raw_data = resp.read().decode("utf-8")
                    data = json.loads(raw_data)

                chart = data.get("chart", {})
                results = chart.get("result")

                if not results:
                    continue

                return results[0]

            except Exception as e:
                last_error = e
                continue

        if last_error:
            raise last_error

        raise RuntimeError(f"No Yahoo Finance data returned for {symbol}")

    # ---------------------------------------------------------
    # Historical Bars
    # ---------------------------------------------------------

    def get_historical_bars(
        self,
        symbol: str,
        timeframe: str = "1D",
        limit: int = 100
    ) -> pd.DataFrame:

        symbol = symbol.upper()

        # Yahoo Finance timeframe mappings
        yahoo_map = {
            "1m": ("1m", "1d"),
            "5m": ("5m", "5d"),
            "15m": ("15m", "5d"),
            "30m": ("30m", "1mo"),
            "1h": ("60m", "1mo"),
            "4h": ("60m", "3mo"),
            "1D": ("1d", "3mo"),
        }

        interval, y_range = yahoo_map.get(
            timeframe,
            ("1d", "3mo")
        )

        # -----------------------------------------------------
        # 1. Alpaca Stock Data
        # -----------------------------------------------------

        # Do not send crypto symbols to StockBarsRequest.
        if (
            not self._is_crypto(symbol)
            and alpaca_manager.is_live_paper_available
            and alpaca_manager.data_client
        ):
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
                    # Alpaca may not support this directly,
                    # so use hourly data and let Yahoo handle it.
                    tf_obj = TimeFrame.Hour

                request_params = StockBarsRequest(
                    symbol_or_symbols=symbol,
                    timeframe=tf_obj,
                    limit=limit,
                    feed=DataFeed.IEX
                )

                bars = alpaca_manager.data_client.get_stock_bars(
                    request_params
                )

                df = bars.df

                if not df.empty:
                    df = df.reset_index()
                    return df.tail(limit)

            except Exception as e:
                logger.debug(
                    f"Alpaca historical data failed for "
                    f"{symbol}: {e}. Trying Yahoo Finance..."
                )

        # -----------------------------------------------------
        # 2. Yahoo Finance Historical Data
        # -----------------------------------------------------

        try:
            result = self._get_yahoo_chart(
                symbol,
                interval=interval,
                y_range=y_range
            )

            timestamps = result.get("timestamp", [])

            indicators = result.get("indicators", {})
            quotes = indicators.get("quote", [])

            if not timestamps or not quotes:
                raise RuntimeError(
                    f"Yahoo returned no historical data for {symbol}"
                )

            quote = quotes[0]

            df = pd.DataFrame({
                "timestamp": pd.to_datetime(
                    timestamps,
                    unit="s"
                ),
                "open": quote.get("open", []),
                "high": quote.get("high", []),
                "low": quote.get("low", []),
                "close": quote.get("close", []),
                "volume": quote.get("volume", []),
            })

            df = df.dropna(
                subset=[
                    "open",
                    "high",
                    "low",
                    "close"
                ]
            )

            if not df.empty:
                return df.tail(limit)

        except Exception as e:
            logger.warning(
                f"Yahoo historical data failed for "
                f"{symbol}: {e}. Using fallback data."
            )

        # -----------------------------------------------------
        # 3. Synthetic Fallback
        # -----------------------------------------------------

        if self._is_crypto(symbol):
            base_price = self._crypto_fallback_price(symbol)
        else:
            base_price = self._stock_fallback_price(symbol)

        delta_map = {
            "1m": timedelta(minutes=1),
            "5m": timedelta(minutes=5),
            "15m": timedelta(minutes=15),
            "30m": timedelta(minutes=30),
            "1h": timedelta(hours=1),
            "4h": timedelta(hours=4),
            "1D": timedelta(days=1),
        }

        step_delta = delta_map.get(
            timeframe,
            timedelta(days=1)
        )

        now = datetime.utcnow()

        dates = [
            now - (limit - i) * step_delta
            for i in range(limit)
        ]

        # Stable seed for each symbol/timeframe
        seed = abs(hash(symbol + timeframe)) % 10000
        rng = np.random.default_rng(seed)

        returns = rng.normal(
            0.0008,
            0.015,
            limit
        )

        prices = base_price * np.exp(
            np.cumsum(returns)
        )

        opens = prices * (
            1 + rng.normal(0, 0.004, limit)
        )

        highs = np.maximum(
            opens,
            prices
        ) * (
            1 + np.abs(
                rng.normal(0, 0.008, limit)
            )
        )

        lows = np.minimum(
            opens,
            prices
        ) * (
            1 - np.abs(
                rng.normal(0, 0.008, limit)
            )
        )

        if self._is_crypto(symbol):
            volumes = rng.randint(
                5_000_000,
                45_000_000,
                size=limit
            )
        else:
            volumes = rng.randint(
                1_000_000,
                10_000_000,
                size=limit
            )

        df = pd.DataFrame({
            "timestamp": dates,
            "open": opens,
            "high": highs,
            "low": lows,
            "close": prices,
            "volume": volumes,
        })

        return df

    # ---------------------------------------------------------
    # Latest Quote
    # ---------------------------------------------------------

    def get_latest_quote(self, symbol: str) -> dict:

        symbol = symbol.upper()

        # -----------------------------------------------------
        # 1. Alpaca Stock Latest Quote
        # -----------------------------------------------------

        # IMPORTANT:
        # StockLatestQuoteRequest should not be used for BTC/USD.
        if (
            not self._is_crypto(symbol)
            and alpaca_manager.is_live_paper_available
            and alpaca_manager.data_client
        ):
            try:
                from alpaca.data.requests import StockLatestQuoteRequest
                from alpaca.data.enums import DataFeed

                req = StockLatestQuoteRequest(
                    symbol_or_symbols=symbol,
                    feed=DataFeed.IEX
                )

                quote = alpaca_manager.data_client.get_stock_latest_quote(
                    req
                )

                if symbol in quote:
                    q = quote[symbol]

                    bid = float(q.bid_price or 0.0)
                    ask = float(q.ask_price or 0.0)

                    if bid > 0 and ask > 0:
                        last = (bid + ask) / 2.0
                    else:
                        last = bid or ask

                    if last > 0:
                        return {
                            "symbol": symbol,
                            "bid": round(bid, 2),
                            "ask": round(ask, 2),
                            "last_price": round(last, 2)
                        }

            except Exception as e:
                logger.debug(
                    f"Alpaca latest quote failed for "
                    f"{symbol}: {e}"
                )

        # -----------------------------------------------------
        # 2. Yahoo Finance Latest Quote
        # -----------------------------------------------------

        try:
            result = self._get_yahoo_chart(
                symbol,
                interval="1m",
                y_range="1d"
            )

            meta = result.get("meta", {})

            price = (
                meta.get("regularMarketPrice")
                or meta.get("currentPrice")
                or meta.get("previousClose")
            )

            if price is not None:
                price = float(price)

                if price > 0:
                    # Small demo spread.
                    # Yahoo does not provide a real bid/ask
                    # through this endpoint.
                    spread = max(
                        0.01,
                        price * 0.0002
                    )

                    return {
                        "symbol": symbol,
                        "bid": round(
                            price - spread,
                            2
                        ),
                        "ask": round(
                            price + spread,
                            2
                        ),
                        "last_price": round(
                            price,
                            2
                        )
                    }

        except Exception as e:
            logger.warning(
                f"Real-time market quote failed for "
                f"{symbol}: {e}"
            )

        # -----------------------------------------------------
        # 3. Fallback Price
        # -----------------------------------------------------

        if self._is_crypto(symbol):
            base_price = self._crypto_fallback_price(symbol)
        else:
            base_price = self._stock_fallback_price(symbol)

        # Tiny random movement for demo UI
        rng = np.random.default_rng()

        volatility = (
            base_price * 0.0005
            if self._is_crypto(symbol)
            else base_price * 0.001
        )

        last_price = max(
            0.01,
            base_price + rng.normal(0, volatility)
        )

        spread = max(
            0.01,
            last_price * 0.0002
        )

        logger.warning(
            f"Using fallback market price for {symbol}: "
            f"{round(last_price, 2)}"
        )

        return {
            "symbol": symbol,
            "bid": round(
                last_price - spread,
                2
            ),
            "ask": round(
                last_price + spread,
                2
            ),
            "last_price": round(
                last_price,
                2
            )
        }

    # ---------------------------------------------------------
    # Watchlist
    # ---------------------------------------------------------

    def get_watchlist_quotes(self, symbols: list) -> dict:

        results = {}

        for sym in symbols:

            sym = sym.upper()

            q = self.get_latest_quote(sym)

            price = q.get(
                "last_price",
                self._crypto_fallback_price(sym)
                if self._is_crypto(sym)
                else self._stock_fallback_price(sym)
            )

            quote_data = {
                "symbol": sym,
                "price": price,
                "last_price": price,
                "bid": q.get(
                    "bid",
                    price - 0.05
                ),
                "ask": q.get(
                    "ask",
                    price + 0.05
                ),
                "change_pct": 0.5,
                "volume": 15000000
            }

            results[sym] = quote_data

            # Also support normalized keys.
            #
            # BTC/USD -> BTCUSD
            # BTC-USD -> BTCUSD
            # AAPL -> AAPL
            clean_key = (
                sym.upper()
                .replace("/", "")
                .replace("-", "")
            )

            if clean_key not in results:
                results[clean_key] = quote_data

        return results


# -------------------------------------------------------------
# Global service instance
# -------------------------------------------------------------

market_data_service = MarketDataService()
