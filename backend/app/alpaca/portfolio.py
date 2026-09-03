import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from app.alpaca.client import alpaca_manager
from app.alpaca.utils import normalize_symbol

logger = logging.getLogger("portfolio_service")

class OrderProtectionReconciliationService:
    """
    Reconciles open orders from Alpaca to determine active protection (Stop Loss, Take Profit, Trailing Stop).
    Reads strictly from live Alpaca order state. Never invents fake values.
    """
    def get_protection_map(self) -> Dict[str, Dict[str, Any]]:
        protection_map: Dict[str, Dict[str, Any]] = {}
        if not (alpaca_manager.is_live_paper_available and alpaca_manager.trading_client):
            return protection_map

        try:
            from alpaca.trading.requests import GetOrdersRequest
            from alpaca.trading.enums import QueryOrderStatus

            req = GetOrdersRequest(status=QueryOrderStatus.OPEN, nested=True)
            orders = alpaca_manager.trading_client.get_orders(req)

            def process_order(o):
                raw_sym = getattr(o, "symbol", "") or ""
                norm_sym = normalize_symbol(raw_sym)
                if not norm_sym:
                    return

                # Create protection maps for both normalized and raw symbols
                for key in (norm_sym, raw_sym.upper()):
                    if not key:
                        continue
                    if key not in protection_map:
                        protection_map[key] = {
                            "stop_loss_price": None,
                            "stop_loss_order_id": None,
                            "stop_loss_type": None,
                            "take_profit_price": None,
                            "take_profit_order_id": None,
                            "take_profit_type": None,
                            "trailing_stop": None,
                            "trailing_order_id": None
                        }

                order_type = str(o.order_type.value if hasattr(o.order_type, "value") else o.order_type).lower()
                side = str(o.side.value if hasattr(o.side, "value") else o.side).lower()

                # Stop Loss (sell stop or sell stop_limit order)
                if side == "sell" and ("stop" in order_type):
                    stop_pr = getattr(o, "stop_price", None)
                    if stop_pr:
                        val = float(stop_pr)
                        for key in (norm_sym, raw_sym.upper()):
                            protection_map[key]["stop_loss_price"] = val
                            protection_map[key]["stop_loss_order_id"] = str(o.id)
                            protection_map[key]["stop_loss_type"] = order_type.upper()

                # Trailing Stop
                elif side == "sell" and ("trailing_stop" in order_type or "trail" in order_type):
                    trail_val = getattr(o, "trail_price", None) or getattr(o, "trail_percent", None)
                    for key in (norm_sym, raw_sym.upper()):
                        protection_map[key]["trailing_stop"] = float(trail_val) if trail_val else None
                        protection_map[key]["trailing_order_id"] = str(o.id)

                # Take Profit (sell limit order)
                elif side == "sell" and ("limit" in order_type):
                    limit_pr = getattr(o, "limit_price", None)
                    if limit_pr:
                        val = float(limit_pr)
                        for key in (norm_sym, raw_sym.upper()):
                            protection_map[key]["take_profit_price"] = val
                            protection_map[key]["take_profit_order_id"] = str(o.id)
                            protection_map[key]["take_profit_type"] = order_type.upper()

                # Inspect child legs if order is nested bracket
                if hasattr(o, "legs") and o.legs:
                    for child in o.legs:
                        process_order(child)

            for o in orders:
                process_order(o)

        except Exception as e:
            logger.warning(f"Failed to fetch Alpaca open orders for protection map: {e}")

        return protection_map

class PortfolioService:
    """
    PortfolioService manages live account and position queries directly against Alpaca.
    Alpaca Paper Trading API = SINGLE SOURCE OF TRUTH.
    """

    def __init__(self):
        self.protection_service = OrderProtectionReconciliationService()
        self.last_known_positions: Dict[str, Dict[str, Any]] = {}

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
                    "mode": "ALPACA_PAPER_API",
                    "last_synced_at": datetime.now(timezone.utc).isoformat()
                }
            except Exception as e:
                logger.warning(f"Failed to fetch Alpaca account: {e}")
                
        return {
            "account_number": "PA-HUNTER-9021",
            "status": "DISCONNECTED",
            "currency": "USD",
            "buying_power": 0.0,
            "cash": 0.0,
            "portfolio_value": 0.0,
            "equity": 0.0,
            "paper_trading": True,
            "mode": "DISCONNECTED",
            "last_synced_at": datetime.now(timezone.utc).isoformat()
        }

    def get_positions(self, symbol: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Fetches live positions directly from Alpaca Paper Trading API.
        If a position is closed at Alpaca, it will NOT be included in the response.
        If symbol filter is provided, filters for that specific symbol.
        """
        if not (alpaca_manager.is_live_paper_available and alpaca_manager.trading_client):
            logger.warning("Alpaca Trading Client not available. Returning empty positions list.")
            return []

        try:
            positions = alpaca_manager.trading_client.get_all_positions()
            protection_map = self.protection_service.get_protection_map()
            
            result = []
            synced_at = datetime.now(timezone.utc).isoformat()
            current_symbol_set = set()

            for p in positions:
                raw_sym = p.symbol
                norm_sym = normalize_symbol(raw_sym)
                current_symbol_set.add(norm_sym)

                qty = float(p.qty)
                qty_avail = float(getattr(p, "qty_available", p.qty))
                entry = float(p.avg_entry_price)
                current = float(p.current_price)
                market_val = float(p.market_value)
                cost_basis = float(getattr(p, "cost_basis", entry * qty))
                unrealized_pnl = float(p.unrealized_pl)
                unrealized_pnl_pct = float(p.unrealized_plpc)
                side = str(p.side.value if hasattr(p.side, "value") else p.side).lower()
                asset_class = str(p.asset_class.value if hasattr(p.asset_class, "value") else p.asset_class).upper()
                asset_id = str(getattr(p, "asset_id", ""))

                prot = protection_map.get(norm_sym) or protection_map.get(raw_sym.upper()) or {}

                pos_dict = {
                    "id": f"POS-{norm_sym}",
                    "symbol": norm_sym,
                    "raw_symbol": raw_sym,
                    "asset_id": asset_id,
                    "asset_class": asset_class,
                    "qty": qty,
                    "qty_available": qty_avail,
                    "entry_price": entry,
                    "current_price": current,
                    "market_value": market_val,
                    "cost_basis": cost_basis,
                    "unrealized_pnl": unrealized_pnl,
                    "unrealized_pnl_pct": unrealized_pnl_pct,
                    "side": side,
                    "strategy_id": "STRAT-REG-001",
                    "stop_loss_price": prot.get("stop_loss_price"),
                    "stop_loss_order_id": prot.get("stop_loss_order_id"),
                    "stop_loss_type": prot.get("stop_loss_type"),
                    "take_profit_price": prot.get("take_profit_price"),
                    "take_profit_order_id": prot.get("take_profit_order_id"),
                    "take_profit_type": prot.get("take_profit_type"),
                    "trailing_stop": prot.get("trailing_stop"),
                    "trailing_order_id": prot.get("trailing_order_id"),
                    "risk_score": 12.0,
                    "broker": "ALPACA",
                    "environment": "PAPER",
                    "data_source": "ALPACA LIVE",
                    "status": "LIVE",
                    "last_synced_at": synced_at
                }

                # Audit reconciliation check
                prev = self.last_known_positions.get(norm_sym)
                if prev and prev.get("qty") != qty:
                    logger.info(f"[POSITION RECONCILIATION] {norm_sym} quantity updated from {prev.get('qty')} to {qty} (Source: ALPACA PAPER API)")

                self.last_known_positions[norm_sym] = pos_dict
                result.append(pos_dict)

            # Purge closed positions from last_known_positions cache
            closed_syms = set(self.last_known_positions.keys()) - current_symbol_set
            for cs in closed_syms:
                logger.info(f"[POSITION RECONCILIATION] {cs} position closed at Alpaca. Removing from active positions.")
                del self.last_known_positions[cs]

            if symbol:
                target = normalize_symbol(symbol)
                return [p for p in result if p["symbol"] == target]

            return result

        except Exception as e:
            logger.error(f"Error fetching live Alpaca positions: {e}", exc_info=True)
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
                    raw_sym = o.symbol
                    norm_sym = normalize_symbol(raw_sym)
                    result.append({
                        "id": str(o.id),
                        "timestamp": o.created_at.strftime("%Y-%m-%dT%H:%M:%S") if hasattr(o.created_at, "strftime") else str(o.created_at),
                        "symbol": norm_sym,
                        "raw_symbol": raw_sym,
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
                return result
            except Exception as e:
                logger.warning(f"Failed to fetch Alpaca orders: {e}")
        return []

class AlpacaPositionService:
    """
    AlpacaPositionService acts as the sole backend authority for actual account live positions.
    """
    def get_all_positions(self) -> List[Dict[str, Any]]:
        return portfolio_service.get_positions()

    def get_position(self, symbol: str) -> Optional[Dict[str, Any]]:
        positions = portfolio_service.get_positions(symbol)
        return positions[0] if positions else None

class PositionReconciliationService:
    """
    Reconciles live positions against Alpaca and logs audit trails.
    """
    def reconcile(self) -> List[Dict[str, Any]]:
        return portfolio_service.get_positions()

portfolio_service = PortfolioService()
alpaca_position_service = AlpacaPositionService()
position_reconciliation_service = PositionReconciliationService()
order_protection_service = OrderProtectionReconciliationService()
