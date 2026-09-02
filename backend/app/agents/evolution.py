import math
from typing import Dict, Any

class StrategyEvolutionEngine:
    def calculate_edge_score(self, backtest: Dict[str, Any], adversary_report: Dict[str, Any]) -> float:
        """
        Calculates holistic Edge Score (0-100) combining OOS performance, Sharpe,
        max drawdown, profit factor, and adversarial robustness.
        """
        oos_sharpe = max(0.0, backtest.get("oos_sharpe", 0.0))
        robustness = adversary_report.get("robustness_score", 50.0)
        win_rate = backtest.get("win_rate", 0.5)
        profit_factor = backtest.get("profit_factor", 1.0)
        max_dd = backtest.get("max_drawdown", 0.10)
        
        # Component scores (0-100 scaled)
        sharpe_score = min(100.0, (oos_sharpe / 2.5) * 100.0)
        robustness_score = robustness
        pf_score = min(100.0, (profit_factor / 2.2) * 100.0)
        dd_penalty = max(0.0, 100.0 - (max_dd / 0.15) * 100.0)
        
        edge_score = (0.35 * sharpe_score) + (0.30 * robustness_score) + (0.20 * pf_score) + (0.15 * dd_penalty)
        return round(float(max(0.0, min(100.0, edge_score))), 1)

    def determine_lifecycle_state(self, edge_score: float, adversary_verdict: str) -> tuple[str, str]:
        """
        Returns (status, status_reason)
        Status: ALIVE, WATCH, KILLED, REJECTED
        """
        if adversary_verdict == "REJECT":
            return "REJECTED", "Adversary Agent identified severe structural flaws and overfitting."
        elif edge_score >= 75.0 and adversary_verdict == "PASS":
            return "ALIVE", "Strong out-of-sample edge and high adversarial robustness."
        elif edge_score >= 50.0:
            return "WATCH", "Moderate edge score. On watch list for market regime confirmation."
        else:
            return "KILLED", "Edge score below minimum viable capital threshold (< 50.0)."

evolution_engine = StrategyEvolutionEngine()
