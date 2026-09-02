import logging
from typing import List, Dict, Any
from app.alpaca.client import alpaca_manager
from app.config import settings

logger = logging.getLogger("portfolio_service")

class PortfolioService:
    def get_account(self) -> dict:
        if alpaca_manager.is_live_paper_available and alpaca_manager.trading_client:
            try:
                acc = alpaca_manager.trading_client.get_account()
                return {
                    "account_number": acc.account_number,
                    "status": acc.status.value if hasattr(acc.status, "value") else str(acc.status),
                    "currency": acc.currency,
                    "buying_power": float(acc.buying_power),
                    "cash": float(acc.cash),
                    "portfolio_value": float(acc.portfolio_value),
                    "equity": float(acc.equity),
                    "paper_trading": True,
                    "mode": "ALPACA_PAPER_API"
                }
            except Exception as e:
                logger.warning(f"Failed to fetch Alpaca account: {e}")
                
        # Default Paper Trading Portfolio (Simulated)
        return {
            "account_number": "PA-HUNTER-9021",
            "status": "ACTIVE",
            "currency": "USD",
            "buying_power": 184500.00,
            "cash": 74500.00,
            "portfolio_value": 112450.00,
            "equity": 112450.00,
            "paper_trading": True,
            "mode": "PAPER_SIMULATION"
        }

    def get_positions(self) -> List[Dict[str, Any]]:
        if alpaca_manager.is_live_paper_available and alpaca_manager.trading_client:
            try:
                positions = alpaca_manager.trading_client.get_all_positions()
                result = []
                for p in positions:
                    qty = float(p.qty)
                    entry = float(p.avg_entry_price)
                    current = float(p.current_price)
                    market_val = float(p.market_value)
                    unrealized_pnl = float(p.unrealized_pl)
                    unrealized_pnl_pct = float(p.unrealized_plpc)
                    side = "long" if qty > 0 else "short"
                    result.append({
                        "id": f"POS-{p.symbol}",
                        "symbol": p.symbol,
                        "qty": abs(qty),
                        "entry_price": entry,
                        "current_price": current,
                        "market_value": market_val,
                        "unrealized_pnl": unrealized_pnl,
                        "unrealized_pnl_pct": unrealized_pnl_pct,
                        "side": side,
                        "strategy_id": "STRAT-REG-001",
                        "stop_loss_price": round(entry * 0.965, 2),
                        "risk_score": 12.0
                    })
                if result:
                    return result
            except Exception as e:
                logger.warning(f"Failed to fetch Alpaca positions: {e}")
        return []

    def get_orders(self) -> List[Dict[str, Any]]:
        if alpaca_manager.is_live_paper_available and alpaca_manager.trading_client:
            try:
                from alpaca.trading.requests import GetOrdersRequest
                from alpaca.trading.enums import QueryOrderStatus
                
                req = GetOrdersRequest(status=QueryOrderStatus.ALL, limit=50)
                orders = alpaca_manager.trading_client.get_orders(req)
                result = []
                for o in orders:
                    qty = float(o.qty or 0)
                    filled_price = float(o.filled_avg_price or 0)
                    side = o.side.value if hasattr(o.side, "value") else str(o.side)
                    status = o.status.value if hasattr(o.status, "value") else str(o.status)
                    result.append({
                        "id": str(o.id),
                        "timestamp": o.created_at.strftime("%Y-%m-%dT%H:%M:%S") if hasattr(o.created_at, "strftime") else str(o.created_at),
                        "symbol": o.symbol,
                        "side": side.lower(),
                        "qty": qty,
                        "price": filled_price,
                        "status": status,
                        "strategy_id": "STRAT-REG-001",
                        "strategy_name": "Alpaca API Trade",
                        "edge_score": 91.0,
                        "risk_score": 12.0,
                        "pnl": 0.0
                    })
                if result:
                    return result
            except Exception as e:
                logger.warning(f"Failed to fetch Alpaca orders: {e}")
        return []

portfolio_service = PortfolioService()
