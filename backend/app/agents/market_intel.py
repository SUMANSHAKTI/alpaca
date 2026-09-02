import json
import numpy as np
import pandas as pd
from datetime import datetime
from app.alpaca.market_data import market_data_service

class MarketIntelligenceAgent:
    def analyze_market_regime(self, benchmark_symbol: str = "SPY") -> dict:
        """
        Analyzes market data for trend, volatility, and volume to determine market regime.
        Output structured JSON: BULLISH, BEARISH, SIDEWAYS, HIGH_VOLATILITY, LOW_VOLATILITY.
        """
        df = market_data_service.get_historical_bars(benchmark_symbol, limit=60)
        
        if df.empty or len(df) < 20:
            return {
                "regime": "SIDEWAYS",
                "confidence": 0.60,
                "volatility": "MEDIUM",
                "momentum": "NEUTRAL",
                "observations": ["Market data default fallback", "Insufficient historical bars"]
            }
            
        closes = df["close"].values
        volumes = df["volume"].values
        
        # Calculate Technical Metrics
        sma20 = np.mean(closes[-20:])
        sma50 = np.mean(closes[-50:]) if len(closes) >= 50 else np.mean(closes)
        current_price = closes[-1]
        
        # Volatility (Annualized rolling std dev of log returns)
        log_returns = np.diff(np.log(closes))
        volatility_annualized = np.std(log_returns) * np.sqrt(252)
        
        # Momentum (20-day return)
        momentum_20d = (current_price - closes[-20]) / closes[-20]
        
        # Volume trend
        vol_avg20 = np.mean(volumes[-20:])
        recent_vol = np.mean(volumes[-5:])
        volume_spike = recent_vol > (vol_avg20 * 1.25)
        
        # Regime Determination Logic
        observations = []
        
        if volatility_annualized > 0.28:
            regime = "HIGH_VOLATILITY"
            vol_str = "HIGH"
            confidence = 0.88
            observations.append(f"Annualized volatility elevated at {volatility_annualized:.1%}")
        elif volatility_annualized < 0.11:
            regime = "LOW_VOLATILITY"
            vol_str = "LOW"
            confidence = 0.82
            observations.append(f"Annualized volatility compressed at {volatility_annualized:.1%}")
        elif current_price > sma20 and sma20 > sma50 and momentum_20d > 0.02:
            regime = "BULLISH"
            vol_str = "MEDIUM"
            confidence = 0.85
            observations.append(f"Price ({current_price:.2f}) above 20d SMA ({sma20:.2f}) and 50d SMA ({sma50:.2f})")
            observations.append(f"20-day momentum strong positive at +{momentum_20d:.1%}")
        elif current_price < sma20 and sma20 < sma50 and momentum_20d < -0.02:
            regime = "BEARISH"
            vol_str = "MEDIUM"
            confidence = 0.84
            observations.append(f"Price ({current_price:.2f}) below 20d SMA ({sma20:.2f}) and 50d SMA ({sma50:.2f})")
            observations.append(f"20-day momentum negative at {momentum_20d:.1%}")
        else:
            regime = "SIDEWAYS"
            vol_str = "MEDIUM"
            confidence = 0.75
            observations.append("Price consolidating within 20d and 50d SMA ranges")
            
        if volume_spike:
            observations.append(f"Institutional volume expansion confirmed (+{(recent_vol/vol_avg20 - 1):.1%})")
            
        momentum_str = "POSITIVE" if momentum_20d > 0.01 else ("NEGATIVE" if momentum_20d < -0.01 else "NEUTRAL")
        
        return {
            "regime": regime,
            "confidence": round(float(confidence), 2),
            "volatility": vol_str,
            "momentum": momentum_str,
            "observations": observations,
            "timestamp": datetime.utcnow().isoformat()
        }

market_intel_agent = MarketIntelligenceAgent()
