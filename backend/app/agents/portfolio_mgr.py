from typing import List, Dict, Any

class PortfolioManagerAgent:
    def allocate_capital(self, strategies: List[Dict[str, Any]], total_portfolio_value: float = 100000.0) -> Dict[str, Any]:
        """
        Allocates capital across surviving ALIVE strategies based on Edge Score and risk limits.
        Ensures cash buffer is maintained and rejected/killed strategies receive $0.
        """
        alive_strategies = [s for s in strategies if s.get("status") == "ALIVE"]
        
        if not alive_strategies:
            return {
                "allocations": {s["strategy_id"]: 0.0 for s in strategies},
                "cash_reserve_pct": 1.0,
                "cash_reserve_amount": total_portfolio_value,
                "summary": "No ALIVE strategies currently available. 100% capital held in cash safety buffer."
            }
            
        # Total edge points
        total_edge_points = sum(s.get("edge_score", 50.0) for s in alive_strategies)
        
        # Max deployment budget = 80% of portfolio (20% mandatory cash buffer)
        max_deployable_pct = 0.80
        allocations = {}
        
        for s in strategies:
            strat_id = s.get("strategy_id")
            status = s.get("status")
            edge_score = s.get("edge_score", 50.0)
            
            if status != "ALIVE":
                allocations[strat_id] = 0.0
            else:
                raw_pct = (edge_score / total_edge_points) * max_deployable_pct
                # Cap max strategy allocation at 45%
                final_pct = round(min(0.45, raw_pct), 3)
                allocations[strat_id] = final_pct
                
        deployed_pct = sum(allocations.values())
        cash_pct = round(1.0 - deployed_pct, 3)
        
        return {
            "allocations": allocations,
            "cash_reserve_pct": cash_pct,
            "cash_reserve_amount": round(total_portfolio_value * cash_pct, 2),
            "deployed_pct": deployed_pct,
            "deployed_amount": round(total_portfolio_value * deployed_pct, 2),
            "summary": f"Allocated capital across {len(alive_strategies)} ALIVE strategies. Cash safety buffer at {cash_pct:.1%}."
        }

portfolio_mgr_agent = PortfolioManagerAgent()
