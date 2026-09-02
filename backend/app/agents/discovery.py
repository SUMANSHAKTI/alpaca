import uuid
import random
from typing import List, Dict, Any

PREDEFINED_HYPOTHESES = [
    {
        "name": "Regime Momentum v3",
        "hypothesis": "Momentum signals exhibit higher persistence and lower false breakout rates when the broader market regime is explicitly BULLISH.",
        "entry_rules": [
            "Price > 50-day simple moving average",
            "Short-term momentum (14-day RSI) > 55",
            "20-day relative volume > 1.25x rolling average",
            "Market Intelligence regime is BULLISH"
        ],
        "exit_rules": [
            "14-day RSI drops below 48",
            "Price crosses below 20-day SMA",
            "Take-profit target of +8.5% reached"
        ],
        "stop_loss_rules": ["Fixed 3.5% trailing stop loss"],
        "sizing_rules": {"type": "risk_factor_weighted", "max_position_pct": 0.15},
        "preferred_regime": "BULLISH",
        "risk_assumptions": "Underperforms sharply during chop or rapid V-bottom market shifts.",
        "expected_edge": "12.4% annualized excess return over SPY benchmark with 1.6+ Sharpe ratio.",
        "invalidation_conditions": "Max drawdown exceeding 8.0% or 3 consecutive losing trades in BULLISH regime."
    },
    {
        "name": "Volatility Breakout Alpha",
        "hypothesis": "Low volatility compression periods precede powerful directional expansion; buying initial volume-backed breakouts yields asymmetrical risk-reward.",
        "entry_rules": [
            "Bollinger Band width at 20-day historical low (< 0.04)",
            "Price breaks 20-day high on 2.0x average daily volume",
            "ATR (14) slope turning upward"
        ],
        "exit_rules": [
            "Price closes inside middle Bollinger Band",
            "Target profit +12.0% achieved"
        ],
        "stop_loss_rules": ["ATR(14) x 1.8 trailing stop"],
        "sizing_rules": {"type": "volatility_parity", "max_position_pct": 0.12},
        "preferred_regime": "LOW_VOLATILITY",
        "risk_assumptions": "High false breakout rate if volume confirmation is inadequate.",
        "expected_edge": "Asymmetric profit factor (> 2.1) driven by large winning trade outliers.",
        "invalidation_conditions": "Win rate dropping below 42% over 20 trades."
    },
    {
        "name": "Mean Reversion RSI-MACD",
        "hypothesis": "Oversold blue-chip assets in SIDEWAYS markets rapidly revert to 20-day mean when MACD histogram shows bullish convergence.",
        "entry_rules": [
            "RSI(14) < 32",
            "MACD Histogram turning positive",
            "Market Intelligence regime is SIDEWAYS or LOW_VOLATILITY"
        ],
        "exit_rules": [
            "Price touches 20-day SMA mean",
            "RSI(14) > 55"
        ],
        "stop_loss_rules": ["2.5% fixed hard stop"],
        "sizing_rules": {"type": "mean_reversion_scaled", "max_position_pct": 0.10},
        "preferred_regime": "SIDEWAYS",
        "risk_assumptions": "Catastrophic loss risk if asset enters fundamental breakdown trend.",
        "expected_edge": "High win rate (65-70%) with short average holding period (< 4 days).",
        "invalidation_conditions": "Average loss per trade exceeding 1.5x average gain."
    },
    {
        "name": "Institutional Earnings Momentum",
        "hypothesis": "Post-earnings announcement drift (PEAD) creates multi-week trending runs when institutional volume spikes post-release.",
        "entry_rules": [
            "Earnings release beat estimates > 5%",
            "Gap up > 3% on 3x average daily volume",
            "Price holding above opening print"
        ],
        "exit_rules": [
            "Trailing 20-day EMA breach",
            "Holding period exceeds 15 trading days"
        ],
        "stop_loss_rules": ["Low of earnings gap day"],
        "sizing_rules": {"type": "conviction_weighted", "max_position_pct": 0.18},
        "preferred_regime": "BULLISH",
        "risk_assumptions": "Subject to market-wide selloffs overriding individual stock catalyst.",
        "expected_edge": "Sharpe ratio > 1.8 with low correlation to passive broad index returns.",
        "invalidation_conditions": "Post-earnings gap fill within 48 hours."
    },
    {
        "name": "RSI Extreme Reversal (Flawed Baseline)",
        "hypothesis": "Buying extreme RSI oversold condition (<20) unconditionally always generates profitable bounce trade.",
        "entry_rules": [
            "RSI(14) < 20",
            "Any market regime"
        ],
        "exit_rules": [
            "RSI(14) > 40"
        ],
        "stop_loss_rules": ["None (Hold until profit)"],
        "sizing_rules": {"type": "fixed_allocation", "max_position_pct": 0.25},
        "preferred_regime": "ANY",
        "risk_assumptions": "Ignores trend momentum; prone to catching falling knives.",
        "expected_edge": "Unsubstantiated high win rate hypothesis.",
        "invalidation_conditions": "Drawdown > 15%."
    }
]

class DiscoveryAgent:
    def generate_strategy(self, current_regime: str = "BULLISH", variant_from_failed_id: str = None) -> Dict[str, Any]:
        """
        Proposes a new quantitative strategy hypothesis.
        NEVER claims a strategy is profitable without backtesting.
        """
        # Select base hypothesis template or create variant
        base = random.choice(PREDEFINED_HYPOTHESES)
        strat_num = random.randint(100, 999)
        strat_id = f"STRAT-{strat_num}"
        
        if variant_from_failed_id:
            name = f"{base['name']} (Gen-2 Variant of {variant_from_failed_id})"
            hypothesis = f"Modified variant addressing weaknesses of {variant_from_failed_id}. {base['hypothesis']}"
        else:
            name = f"{base['name']} #{strat_num}"
            hypothesis = base['hypothesis']
            
        return {
            "strategy_id": strat_id,
            "name": name,
            "hypothesis": hypothesis,
            "entry_rules": base["entry_rules"],
            "exit_rules": base["exit_rules"],
            "stop_loss_rules": base["stop_loss_rules"],
            "sizing_rules": base["sizing_rules"],
            "preferred_regime": current_regime if current_regime != "HIGH_VOLATILITY" else base["preferred_regime"],
            "risk_assumptions": base["risk_assumptions"],
            "expected_edge": base["expected_edge"],
            "invalidation_conditions": base["invalidation_conditions"],
            "edge_score": 50.0,
            "status": "WATCH",
            "parent_strategy_id": variant_from_failed_id
        }

discovery_agent = DiscoveryAgent()
