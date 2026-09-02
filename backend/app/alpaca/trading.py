import uuid
import logging
from datetime import datetime
from typing import Optional, Dict, Any
from app.alpaca.client import alpaca_manager
from app.alpaca.market_data import market_data_service

logger = logging.getLogger("trading_service")

class TradingService:
    def submit_order(
        self,
        symbol: str,
        qty: float,
        side: str = "buy",
        order_type: str = "market",
        limit_price: Optional[float] = None,
        strategy_id: str = ""
    ) -> Dict[str, Any]:
        symbol = symbol.upper()
        
        # Check if live Alpaca API client is connected
        if alpaca_manager.is_live_paper_available and alpaca_manager.trading_client:
            try:
                from alpaca.trading.requests import MarketOrderRequest, LimitOrderRequest
                from alpaca.trading.enums import OrderSide, TimeInForce
                
                side_enum = OrderSide.BUY if side.lower() == "buy" else OrderSide.SELL
                
                # Support Limit vs Market orders across Equities, ETFs, and Crypto
                if order_type.lower() == "limit" and limit_price and limit_price > 0:
                    req = LimitOrderRequest(
                        symbol=symbol,
                        qty=qty,
                        side=side_enum,
                        limit_price=limit_price,
                        time_in_force=TimeInForce.GTC
                    )
                else:
                    req = MarketOrderRequest(
                        symbol=symbol,
                        qty=qty,
                        side=side_enum,
                        time_in_force=TimeInForce.GTC
                    )
                
                order = alpaca_manager.trading_client.submit_order(req)
                
                quote = market_data_service.get_latest_quote(symbol)
                filled_price = float(order.filled_avg_price) if order.filled_avg_price else quote["last_price"]
                
                status_val = order.status.value if hasattr(order.status, "value") else str(order.status)
                side_val = order.side.value if hasattr(order.side, "value") else str(order.side)
                
                logger.info(f"Live Alpaca Order Submitted: {side_val.upper()} {qty} {symbol} (Order ID: {order.id})")
                
                return {
                    "id": str(order.id),
                    "alpaca_order_id": str(order.id),
                    "symbol": order.symbol,
                    "qty": float(order.qty),
                    "side": side_val.lower(),
                    "status": status_val,
                    "filled_price": filled_price,
                    "strategy_id": strategy_id,
                    "created_at": datetime.utcnow().isoformat()
                }
            except Exception as e:
                logger.error(f"Alpaca live order execution error for {symbol}: {e}. Falling back to paper execution mock.")

        # Fallback Simulation Execution
        quote = market_data_service.get_latest_quote(symbol)
        filled_price = limit_price if (order_type.lower() == "limit" and limit_price) else quote["last_price"]
        order_id = f"alpaca-paper-{uuid.uuid4().hex[:8]}"
        
        return {
            "id": order_id,
            "alpaca_order_id": order_id,
            "symbol": symbol,
            "qty": qty,
            "side": side.lower(),
            "status": "filled",
            "filled_price": filled_price,
            "strategy_id": strategy_id,
            "created_at": datetime.utcnow().isoformat()
        }

trading_service = TradingService()
