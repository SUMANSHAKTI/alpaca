import logging
from typing import Dict, Any
from app.config import settings

logger = logging.getLogger("risk_agent")

class DeterministicRiskAgent:
    """
    Hard-coded Python deterministic safety layer.
    The LLM CANNOT override, bypass, or mock these rules.
    All trade proposals MUST pass every check or be REJECTED.
    """
    def __init__(self):
        self.recent_orders_cache = []

    def validate_trade_proposal(
        self,
        symbol: str,
        qty: float,
        price: float,
        side: str,
        strategy: Dict[str, Any],
        portfolio_state: Dict[str, Any]
    ) -> Dict[str, Any]:
        
        symbol = symbol.upper()
        proposed_value = qty * price
        buying_power = portfolio_state.get("buying_power", 200000.0)
        portfolio_value = portfolio_state.get("portfolio_value", 100000.0)
        daily_loss_pct = portfolio_state.get("daily_pnl_pct", 0.0)
        strategy_status = strategy.get("status", "KILLED")
        strategy_id = strategy.get("strategy_id", "UNKNOWN")
        
        rejection_reasons = []

        # Rule 1: Validate Symbol
        if not symbol or len(symbol) > 5 or not symbol.isalpha():
            rejection_reasons.append(f"Invalid symbol format: '{symbol}'")

        # Rule 2: Strategy MUST be ALIVE
        if strategy_status != "ALIVE":
            rejection_reasons.append(
                f"Strategy '{strategy_id}' status is '{strategy_status}'. Capital execution prohibited for non-ALIVE strategies."
            )

        # Rule 3: Buying Power Check
        if proposed_value > buying_power:
            rejection_reasons.append(
                f"Order value (${proposed_value:,.2f}) exceeds available buying power (${buying_power:,.2f})."
            )

        # Rule 4: Maximum Single Position Size Limit (35% cap for non-BTC option lots, 5% for BTC)
        is_btc = "BTC" in symbol.upper()
        max_pct = 0.05 if is_btc else 0.35
        max_pos_val = portfolio_value * max_pct
        if proposed_value > max_pos_val:
            rejection_reasons.append(
                f"Position size (${proposed_value:,.2f}) exceeds hard single-position cap (${max_pos_val:,.2f} / {max_pct:.0%})."
            )

        # Rule 5: Daily Loss Circuit Breaker (5% Daily Drawdown Limit)
        if daily_loss_pct <= -settings.MAX_PORTFOLIO_DAILY_LOSS_PCT:
            rejection_reasons.append(
                f"Portfolio daily drawdown ({daily_loss_pct:.2%}) breached max loss limit (-{settings.MAX_PORTFOLIO_DAILY_LOSS_PCT:.0%}). Trading circuit breaker ACTIVE."
            )

        # Rule 6: Duplicate Order Guard
        cache_key = f"{symbol}-{side}-{qty}"
        if cache_key in self.recent_orders_cache[-5:]:
            rejection_reasons.append(f"Duplicate order detected for {cache_key} within recent window.")

        # Verdict
        if rejection_reasons:
            logger.warning(f"RISK REJECTED order for {symbol}: {rejection_reasons}")
            return {
                "approved": False,
                "verdict": "REJECTED",
                "reasons": rejection_reasons,
                "symbol": symbol,
                "proposed_value": proposed_value,
                "strategy_id": strategy_id
            }

        # Cache order key
        self.recent_orders_cache.append(cache_key)
        if len(self.recent_orders_cache) > 50:
            self.recent_orders_cache.pop(0)

        logger.info(f"RISK APPROVED order for {symbol} (${proposed_value:,.2f})")
        return {
            "approved": True,
            "verdict": "APPROVED",
            "reasons": ["Passed all deterministic risk guardrails."],
            "symbol": symbol,
            "proposed_value": proposed_value,
            "strategy_id": strategy_id
        }

risk_agent = DeterministicRiskAgent()
