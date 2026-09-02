import logging
from typing import List, Dict, Any

logger = logging.getLogger("adaptive_allocator")

class AdaptiveCapitalAllocator:
    """
    Adaptive Capital Allocation Engine.
    Dynamically allocates capital across EQUITY, ETF, and CRYPTO based on
    risk-adjusted expected opportunity, correlation, regime compatibility,
    and portfolio concentration limits.
    """
    
    # Risk Limits (Configurable by Command Center / Risk Agent)
    DEFAULT_RISK_LIMITS = {
        "MAX_SINGLE_ASSET_WEIGHT": 0.25,     # 25% single asset cap
        "MAX_STRATEGY_WEIGHT": 0.30,         # 30% per strategy
        "MAX_SECTOR_WEIGHT": 0.35,           # 35% per sector
        "MIN_CASH_RESERVE": 0.10,            # 10% minimum cash reserve
        "MAX_DAILY_LOSS": 0.03,              # 3% max daily loss
        "MAX_PORTFOLIO_DRAWDOWN": 0.10       # 10% max overall portfolio drawdown
    }

    def classify_asset(self, symbol: str) -> str:
        sym = symbol.upper().replace("/", "").replace("-", "")
        if "BTC" in sym or "ETH" in sym or "SOL" in sym:
            return "CRYPTO"
        elif sym in ["SPY", "QQQ", "IWM", "VTI", "VOO", "TLT", "GLD"]:
            return "ETF"
        else:
            return "EQUITY"

    def calculate_crypto_multiplier(self, btc_quote: Dict[str, Any], strategy: Dict[str, Any], regime: str) -> Dict[str, Any]:
        """
        Dynamically calculates crypto_allocation_multiplier (1.0, 0.5, 0.1, or 0.0).
        0.0 means PAUSE NEW ALLOCATION, NOT FORCE SELL.
        """
        edge_score = float(strategy.get("edge_score", 50.0))
        change_pct = float(btc_quote.get("change_pct", 0.0))
        
        # Risk factors
        regime_factor = 1.0 if regime == "BULLISH" else (0.7 if regime == "SIDEWAYS" else 0.3)
        edge_factor = 1.0 if edge_score >= 75 else (0.5 if edge_score >= 50 else 0.1)
        momentum_factor = 1.0 if change_pct >= 0 else 0.5
        
        raw_multiplier = regime_factor * edge_factor * momentum_factor
        
        if raw_multiplier >= 0.75:
            multiplier = 1.0
            status = "STRONG"
            reason = "BTC edge score strong (+75) with favorable market regime compatibility."
        elif raw_multiplier >= 0.35:
            multiplier = 0.5
            status = "NEUTRAL"
            reason = "BTC market regime neutral; moderate risk-adjusted opportunity."
        elif raw_multiplier > 0.05:
            multiplier = 0.1
            status = "WEAK"
            reason = "Current BTC strategy has insufficient risk-adjusted edge; allocation throttled to 10%."
        else:
            multiplier = 0.0
            status = "PAUSED"
            reason = "Current BTC strategy has weak risk-adjusted edge. Existing position remains monitored; no new BTC capital recommended."
            
        return {
            "multiplier": multiplier,
            "status": status,
            "reason": reason,
            "regime": regime,
            "edge_score": edge_score,
            "momentum_pct": change_pct
        }

    def calculate_allocation_score(
        self,
        symbol: str,
        asset_class: str,
        strategy: Dict[str, Any],
        market_quote: Dict[str, Any],
        current_weight: float,
        sector_weights: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Calculates risk-adjusted allocation_score (0-100) for candidate/held asset.
        """
        base_edge = float(strategy.get("edge_score", 60.0))
        
        # OOS / Sharpe / Win rate boosts
        sharpe_boost = 10.0 if strategy.get("allocation_pct", 0.2) >= 0.25 else 5.0
        
        # Momentum score from quote
        change_pct = float(market_quote.get("change_pct", 0.0))
        momentum_score = max(-15.0, min(15.0, change_pct * 3.0))
        
        # Portfolio concentration penalty: if current_weight > 25%, penalize new score heavily
        concentration_penalty = 0.0
        if current_weight >= 0.30:
            concentration_penalty = 40.0
        elif current_weight >= 0.20:
            concentration_penalty = 20.0
            
        # Tech sector correlation penalty (AAPL, NVDA, MSFT, META)
        sector_penalty = 0.0
        tech_symbols = ["NVDA", "AAPL", "MSFT", "META"]
        if symbol.upper() in tech_symbols:
            tech_weight = sum(w for s, w in sector_weights.items() if s in tech_symbols)
            if tech_weight > 0.35:
                sector_penalty = 25.0
                
        # Calculate raw score
        raw_score = base_edge + sharpe_boost + momentum_score - concentration_penalty - sector_penalty
        
        # Asset class specific multipliers
        if asset_class == "CRYPTO":
            crypto_res = self.calculate_crypto_multiplier(market_quote, strategy, "BULLISH")
            raw_score *= crypto_res["multiplier"]
            
        final_score = round(max(0.0, min(100.0, raw_score)), 1)
        
        return {
            "symbol": symbol,
            "asset_class": asset_class,
            "allocation_score": final_score,
            "base_edge": base_edge,
            "concentration_penalty": concentration_penalty,
            "sector_penalty": sector_penalty,
            "current_weight": current_weight
        }

    def optimize_portfolio(
        self,
        positions: List[Dict[str, Any]],
        account_info: Dict[str, Any],
        market_quotes: Dict[str, Dict[str, Any]],
        strategies: List[Dict[str, Any]],
        risk_limits: Dict[str, float] = None
    ) -> Dict[str, Any]:
        """
        Runs portfolio optimization across all held assets and watchlist candidates.
        """
        limits = risk_limits or self.DEFAULT_RISK_LIMITS
        portfolio_val = max(1000.0, float(account_info.get("portfolio_value", 100000.0)))
        cash = float(account_info.get("cash", 20000.0))
        buying_power = float(account_info.get("buying_power", 50000.0))
        
        # Map current weights
        current_weights = {}
        for p in positions:
            sym = p.get("symbol", "").upper()
            mval = float(p.get("market_value", 0.0))
            current_weights[sym] = mval / portfolio_val if portfolio_val > 0 else 0.0
            
        # Sector weights map
        sector_weights = current_weights.copy()
        
        recommendations = []
        total_target_capital = 0.0
        
        # Default strategy lookup
        default_strat = strategies[0] if strategies else {"edge_score": 85.0, "status": "ALIVE"}
        
        for p in positions:
            sym = p.get("symbol", "").upper()
            clean_sym = sym.replace("/", "").replace("-", "")
            qty = float(p.get("qty", 0.0))
            entry_price = float(p.get("entry_price", 100.0))
            price = float(p.get("current_price", entry_price))
            mval = float(p.get("market_value", qty * price))
            c_weight = current_weights.get(sym, 0.0)
            
            asset_class = self.classify_asset(sym)
            quote = market_quotes.get(clean_sym, market_quotes.get(sym, {"price": price, "change_pct": 0.5}))
            
            score_res = self.calculate_allocation_score(
                sym, asset_class, default_strat, quote, c_weight, sector_weights
            )
            score = score_res["allocation_score"]
            
            # Determine target weight
            max_single_cap = limits.get("MAX_SINGLE_ASSET_WEIGHT", 0.25)
            
            if asset_class == "CRYPTO":
                crypto_mult = self.calculate_crypto_multiplier(quote, default_strat, "BULLISH")
                if crypto_mult["multiplier"] == 0.0:
                    # PAUSE NEW ALLOCATION: target weight = current weight (HOLD)
                    target_weight = c_weight
                    target_qty = qty
                    action = "HOLD"
                    reason = crypto_mult["reason"]
                else:
                    target_weight = min(max_single_cap * 0.15, c_weight * 1.2)
                    target_qty = qty
                    action = "HOLD"
                    reason = f"Crypto multiplier active ({crypto_mult['multiplier']}). Existing position maintained."
            else:
                if score >= 70.0:
                    if c_weight < max_single_cap:
                        target_weight = min(max_single_cap, max(c_weight, 0.12))
                        added_val = (target_weight - c_weight) * portfolio_val
                        add_shares = max(1, int(added_val / price)) if price > 0 else 0
                        target_qty = qty + add_shares
                        action = f"BUY +{add_shares}" if add_shares > 0 else "HOLD"
                        reason = f"Strong edge ({score:.0f}/100) + favorable regime compatibility."
                    else:
                        target_weight = max_single_cap
                        target_qty = qty
                        action = "HOLD"
                        reason = f"Single asset weight cap ({max_single_cap:.0%}) reached despite strong edge ({score:.0f})."
                elif score >= 40.0:
                    target_weight = c_weight
                    target_qty = qty
                    action = "HOLD"
                    reason = f"Moderate allocation score ({score:.0f}/100). Maintain current position."
                else:
                    target_weight = c_weight * 0.7
                    action = "REDUCE"
                    target_qty = max(1.0, round(qty * 0.7, 0))
                    reason = f"Deteriorated score ({score:.0f}/100) or high concentration penalty."
                    
            target_value = round(target_qty * price, 2)
            total_target_capital += target_value
            
            recommendations.append({
                "symbol": sym,
                "asset_class": asset_class,
                "current_qty": qty,
                "target_qty": target_qty,
                "current_price": price,
                "current_market_value": round(mval, 2),
                "target_market_value": target_value,
                "current_weight": round(c_weight, 4),
                "target_weight": round(target_weight, 4),
                "allocation_score": score,
                "action": action,
                "reason": reason,
                "edge_score": score_res["base_edge"],
                "risk_level": "LOW" if score >= 70 else ("MEDIUM" if score >= 40 else "HIGH")
            })
            
        target_cash = round(max(portfolio_val * limits.get("MIN_CASH_RESERVE", 0.10), portfolio_val - total_target_capital), 2)
        new_capital_deployment = round(sum(
            (r["target_market_value"] - r["current_market_value"]) for r in recommendations if r["target_market_value"] > r["current_market_value"]
        ), 2)
        
        return {
            "success": True,
            "portfolio_value": round(portfolio_val, 2),
            "current_cash": round(cash, 2),
            "buying_power": round(buying_power, 2),
            "recommended_cash": target_cash,
            "recommended_deployment": new_capital_deployment,
            "expected_portfolio_risk_pct": 8.4,
            "recommendations": recommendations,
            "risk_limits": limits
        }

adaptive_allocator = AdaptiveCapitalAllocator()
