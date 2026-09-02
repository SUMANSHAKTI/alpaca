from typing import Dict, Any, List
from app.alpaca.portfolio import portfolio_service
from app.alpaca.market_data import market_data_service
from app.alpaca.trading import trading_service
from app.agents.orchestrator import agent_orchestrator

class AgentTools:
    def get_account((self) -> Dict[str, Any]:
        return portfolio_service.get_account()

    def get_positions(self) -> List[Dict[str, Any]]:
        return agent_orchestrator.positions

    def get_quote(self, symbol: str) -> Dict[str, Any]:
        return market_data_service.get_latest_quote(symbol)

    def get_bars(self, symbol: str, limit: int = 100) -> List[Dict[str, Any]]:
        df = market_data_service.get_historical_bars(symbol, limit=limit)
        return df.to_dict(orient="records")

    def get_portfolio(self) -> Dict[str, Any]:
        acc = portfolio_service.get_account()
        return {
            "account": acc,
            "positions": agent_orchestrator.positions,
            "total_positions_value": sum(p.get("market_value", 0.0) for p in agent_orchestrator.positions)
        }

    def get_orders(self) -> List[Dict[str, Any]]:
        return agent_orchestrator.trades

    def submit_paper_order(self, symbol: str, qty: float, side: str, strategy_id: str) -> Dict[str, Any]:
        return agent_orchestrator.execute_paper_trade(symbol, qty, side, strategy_id)

    def run_discovery_cycle(self) -> Dict[str, Any]:
        return agent_orchestrator.run_discovery_cycle()

agent_tools = AgentTools()
