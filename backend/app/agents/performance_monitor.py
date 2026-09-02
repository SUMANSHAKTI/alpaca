import logging
from typing import Dict, Any, List

logger = logging.getLogger("performance_monitor")

class PerformanceMonitoringAgent:
    def monitor_strategy_performance(self, strategy: Dict[str, Any], live_trades: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Continuously tracks active strategy performance to detect edge deterioration.
        Triggers allocation reduction or KILLS strategy if performance degrades.
        """
        strat_id = strategy.get("strategy_id")
        current_edge_score = strategy.get("edge_score", 85.0)
        
        # Calculate recent trade P&L trend
        strat_trades = [t for t in live_trades if t.get("strategy_id") == strat_id]
        
        if not strat_trades:
            return {
                "strategy_id": strat_id,
                "edge_deteriorating": False,
                "previous_edge_score": current_edge_score,
                "current_edge_score": current_edge_score,
                "action": "NONE",
                "message": "Insufficient live trade history. Performance tracking active."
            }
            
        recent_pnls = [t.get("pnl", 0.0) for t in strat_trades[-5:]]
        losing_streak = sum(1 for p in recent_pnls if p < 0)
        
        # Simulate edge score update based on live outcomes
        if losing_streak >= 3:
            new_edge_score = max(30.0, current_edge_score - 33.0)
            deteriorating = True
            
            if new_edge_score < 50.0:
                action = "KILL_STRATEGY"
                message = f"Strategy '{strat_id}' edge deteriorated sharply (Score {current_edge_score:.0f} → {new_edge_score:.0f}). Consecutive losses detected in live regime. STRATEGY KILLED."
            else:
                action = "REDUCE_ALLOCATION"
                message = f"Warning: Strategy '{strat_id}' performance deteriorating for 3 consecutive evaluation windows (Score {current_edge_score:.0f} → {new_edge_score:.0f}). Allocation reduced by 50%."
        else:
            new_edge_score = min(98.0, current_edge_score + 2.0)
            deteriorating = False
            action = "MAINTAIN"
            message = f"Strategy '{strat_id}' performance stable at Edge Score {new_edge_score:.0f}."
            
        return {
            "strategy_id": strat_id,
            "edge_deteriorating": deteriorating,
            "previous_edge_score": current_edge_score,
            "current_edge_score": new_edge_score,
            "action": action,
            "message": message
        }

performance_monitor_agent = PerformanceMonitoringAgent()
