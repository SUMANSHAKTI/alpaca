import logging
import random
from typing import Dict, Any, List
from app.agents.market_intel import market_intel_agent
from app.agents.discovery import discovery_agent
from app.agents.backtest import backtest_engine
from app.agents.adversary import adversary_agent
from app.agents.evolution import evolution_engine
from app.agents.portfolio_mgr import portfolio_mgr_agent
from app.agents.risk_agent import risk_agent
from app.agents.performance_monitor import performance_monitor_agent
from app.agents.explainability import explainability_engine
from app.agents.adaptive_allocator import adaptive_allocator
from app.alpaca.trading import trading_service
from app.alpaca.portfolio import portfolio_service
from app.alpaca.market_data import market_data_service

logger = logging.getLogger("orchestrator")

class AgentOrchestrator:
    def __init__(self):
        self.agent_events: List[Dict[str, Any]] = []
        self.audit_log: List[Dict[str, Any]] = []
        self.demo_step: int = 1
        self.autonomous_active: bool = True
        
        # Initialize default seed data
        self.current_regime = market_intel_agent.analyze_market_regime("SPY")
        
        # Seed strategies
        self.strategies = [
            {
                "strategy_id": "STRAT-REG-001",
                "name": "Regime Momentum v3",
                "hypothesis": "Momentum signals perform best when price trend agrees with BULLISH market regime.",
                "entry_rules": ["Price > 50-day SMA", "14-day RSI > 55", "Market regime is BULLISH"],
                "exit_rules": ["RSI < 48", "Price < 20-day SMA"],
                "stop_loss_rules": ["Fixed 3.5% trailing stop"],
                "sizing_rules": {"max_position_pct": 0.15},
                "preferred_regime": "BULLISH",
                "edge_score": 91.0,
                "status": "ALIVE",
                "status_reason": "Outperformed out-of-sample tests with 86/100 adversarial robustness.",
                "allocation_pct": 0.30
            },
            {
                "strategy_id": "STRAT-ERN-002",
                "name": "Institutional Earnings Momentum",
                "hypothesis": "Post-earnings gap ups with 3x volume drift higher over 15 trading days.",
                "entry_rules": ["Earnings beat > 5%", "Gap up > 3% on 3x volume"],
                "exit_rules": ["15 trading days hold"],
                "stop_loss_rules": ["Low of earnings gap day"],
                "sizing_rules": {"max_position_pct": 0.18},
                "preferred_regime": "BULLISH",
                "edge_score": 87.0,
                "status": "ALIVE",
                "status_reason": "Strong out-of-sample Sharpe (1.52) and low broad market correlation.",
                "allocation_pct": 0.25
            },
            {
                "strategy_id": "STRAT-REV-003",
                "name": "Mean Reversion RSI-MACD",
                "hypothesis": "Oversold RSI < 32 in sideways regime rapidly reverts to 20-day mean.",
                "entry_rules": ["RSI(14) < 32", "Market regime SIDEWAYS"],
                "exit_rules": ["Price touches 20-day SMA"],
                "stop_loss_rules": ["2.5% hard stop"],
                "sizing_rules": {"max_position_pct": 0.10},
                "preferred_regime": "SIDEWAYS",
                "edge_score": 68.0,
                "status": "WATCH",
                "status_reason": "Moderate edge score. On watch list for market regime confirmation.",
                "allocation_pct": 0.15
            },
            {
                "strategy_id": "STRAT-FLW-004",
                "name": "RSI Extreme Reversal (Flawed)",
                "hypothesis": "Buying RSI < 20 unconditionally generates bounce profits.",
                "entry_rules": ["RSI < 20"],
                "exit_rules": ["RSI > 40"],
                "stop_loss_rules": ["None"],
                "sizing_rules": {"max_position_pct": 0.25},
                "preferred_regime": "ANY",
                "edge_score": 31.0,
                "status": "KILLED",
                "status_reason": "Adversary identified severe curve-fitting and 82% return concentration in 4 trades.",
                "allocation_pct": 0.0
            }
        ]
        
        self.positions = [
            {
                "id": "POS-NVDA",
                "symbol": "NVDA",
                "qty": 250,
                "entry_price": 122.40,
                "current_price": 128.50,
                "market_value": 32125.00,
                "unrealized_pnl": 1525.00,
                "unrealized_pnl_pct": 0.0498,
                "side": "long",
                "strategy_id": "STRAT-REG-001",
                "stop_loss_price": 118.10,
                "risk_score": 12.0
            },
            {
                "id": "POS-AAPL",
                "symbol": "AAPL",
                "qty": 76,
                "entry_price": 316.03,
                "current_price": 326.19,
                "market_value": 24790.44,
                "unrealized_pnl": 772.16,
                "unrealized_pnl_pct": 0.0321,
                "side": "long",
                "strategy_id": "STRAT-ERN-002",
                "stop_loss_price": 324.00,
                "take_profit_price": 339.73,
                "risk_score": 10.0
            }
        ]
        
        self.trades = [
            {
                "id": "TRD-1092",
                "timestamp": "2026-09-01T14:37:00",
                "symbol": "NVDA",
                "side": "buy",
                "qty": 250,
                "price": 122.40,
                "strategy_id": "STRAT-REG-001",
                "strategy_name": "Regime Momentum v3",
                "edge_score": 91.0,
                "risk_score": 12.0,
                "pnl": 1525.00,
                "explainability": explainability_engine.explain_trade_decision(
                    {"symbol": "NVDA", "side": "buy", "qty": 250, "price": 122.40},
                    self.strategies[0],
                    self.current_regime,
                    {"robustness_score": 86.0},
                    {"approved": True, "verdict": "APPROVED"}
                )
            }
        ]
        
        self._add_event("Market Intelligence Agent", "ANALYZE_REGIME", f"Market regime identified as {self.current_regime['regime']} ({self.current_regime['confidence']:.0%} confidence)")

    def _add_event(self, agent: str, action: str, details: str, strategy_id: str = None, symbol: str = None):
        event = {
            "id": len(self.agent_events) + 1,
            "timestamp": "15:36:20",
            "agent_name": agent,
            "action": action,
            "details": details,
            "strategy_id": strategy_id,
            "symbol": symbol
        }
        self.agent_events.insert(0, event)

    def run_discovery_cycle(self) -> Dict[str, Any]:
        """
        Runs complete discovery, backtest, adversary, evolution, and risk flow.
        """
        regime = market_intel_agent.analyze_market_regime("SPY")
        self._add_event("Market Intelligence Agent", "ANALYZE_REGIME", f"Market regime active: {regime['regime']}")
        
        new_strat = discovery_agent.generate_strategy(regime["regime"])
        self._add_event("Discovery Agent", "PROPOSE_HYPOTHESIS", f"Generated hypothesis for strategy '{new_strat['name']}' ({new_strat['strategy_id']})", new_strat['strategy_id'])
        
        bt = backtest_engine.run_backtest(new_strat, "NVDA")
        self._add_event("Backtest Agent", "WALK_FORWARD_VALIDATE", f"OOS Sharpe {bt['oos_sharpe']}, Max DD {bt['oos_drawdown']:.1%}. Status: {'PASSED' if bt['oos_passed'] else 'FAILED'}", new_strat['strategy_id'])
        
        adv = adversary_agent.stress_test_strategy(new_strat, bt)
        self._add_event("Adversary Agent", "STRESS_TEST", f"Robustness Score {adv['robustness_score']}/100. Verdict: {adv['verdict']}", new_strat['strategy_id'])
        
        edge = evolution_engine.calculate_edge_score(bt, adv)
        status, reason = evolution_engine.determine_lifecycle_state(edge, adv["verdict"])
        new_strat["edge_score"] = edge
        new_strat["status"] = status
        new_strat["status_reason"] = reason
        
        self.strategies.insert(0, new_strat)
        self._add_event("Strategy Darwinism Engine", "UPDATE_LIFECYCLE", f"Strategy '{new_strat['name']}' Edge Score {edge}/100. State set to {status}.", new_strat['strategy_id'])
        
        acc = portfolio_service.get_account()
        alloc = portfolio_mgr_agent.allocate_capital(self.strategies, acc["portfolio_value"])
        self._add_event("Portfolio Manager Agent", "REBALANCE_PORTFOLIO", alloc["summary"])
        
        return {
            "strategy": new_strat,
            "backtest": bt,
            "adversary_report": adv,
            "portfolio_allocation": alloc
        }

    def execute_paper_trade(self, symbol: str, qty: float, side: str, strategy_id: str) -> Dict[str, Any]:
        """
        Executes paper trade through Risk Gate -> Alpaca Paper Adapter -> Portfolio updates.
        Auto-boosts lot size if existing trade for symbol is profitable.
        """
        symbol = symbol.upper()
        clean_target = symbol.replace("/", "").replace("-", "")
        
        # Check if an existing trade/position for this symbol is profitable and boost lot size
        existing_pos = next((p for p in self.positions if p.get("symbol", "").upper().replace("/", "").replace("-", "") == clean_target), None)
        if existing_pos and existing_pos.get("unrealized_pnl", 0) > 0:
            qty = max(qty, round(qty * 1.5, 4 if "BTC" in symbol else 0))
            self._add_event("Profitable Lot Booster", "SCALE_IN_BOOST", f"Winning trade detected for {symbol}. Auto-boosting trade lot size to {qty}.", strategy_id, symbol)

        strat = next((s for s in self.strategies if s["strategy_id"] == strategy_id), self.strategies[0])
        acc = portfolio_service.get_account()
        quote = market_data_service.get_latest_quote(symbol)
        price = quote["last_price"]
        
        risk_result = risk_agent.validate_trade_proposal(
            symbol=symbol,
            qty=qty,
            price=price,
            side=side,
            strategy=strat,
            portfolio_state={"buying_power": acc["buying_power"], "portfolio_value": acc["portfolio_value"], "daily_pnl_pct": 0.012}
        )
        
        self._add_event("Deterministic Risk Agent", "VALIDATE_RULES", f"Risk check {risk_result['verdict']} for {side.upper()} {qty} shares of {symbol}.", strategy_id, symbol)
        
        if not risk_result["approved"]:
            return {
                "executed": False,
                "risk_result": risk_result,
                "message": f"Trade rejected by Risk Agent: {risk_result['reasons'][0]}"
            }
            
        order = trading_service.submit_order(symbol, qty, side, "market", strategy_id)
        self._add_event("Alpaca Paper Trading", "SUBMIT_ORDER", f"Paper order submitted: {side.upper()} {qty} {symbol} @ ${order['filled_price']:.2f}", strategy_id, symbol)
        
        pos = {
            "id": f"POS-{symbol}",
            "symbol": symbol,
            "qty": qty,
            "entry_price": order["filled_price"],
            "current_price": order["filled_price"],
            "market_value": round(qty * order["filled_price"], 2),
            "unrealized_pnl": 0.0,
            "unrealized_pnl_pct": 0.0,
            "side": side.lower(),
            "strategy_id": strategy_id,
            "stop_loss_price": round(order["filled_price"] * 0.965, 2),
            "risk_score": 14.0
        }
        self.positions.insert(0, pos)
        
        trade = {
            "id": f"TRD-{len(self.trades)+1093}",
            "timestamp": "15:37:12",
            "symbol": symbol,
            "side": side.lower(),
            "qty": qty,
            "price": order["filled_price"],
            "strategy_id": strategy_id,
            "strategy_name": strat.get("name"),
            "edge_score": strat.get("edge_score", 91.0),
            "risk_score": 14.0,
            "pnl": 0.0,
            "explainability": explainability_engine.explain_trade_decision(
                {"symbol": symbol, "side": side, "qty": qty, "price": order["filled_price"]},
                strat,
                self.current_regime,
                {"robustness_score": 86.0},
                risk_result
            )
        }
        self.trades.insert(0, trade)
        
        return {
            "executed": True,
            "order": order,
            "position": pos,
            "trade": trade,
            "risk_result": risk_result
        }

    def run_autonomous_scan(self) -> Dict[str, Any]:
        """
        Scans real-time market data, evaluates quantitative hypotheses, and
        AUTOMATICALLY executes live trades on Alpaca API when high-conviction profit edge is found.
        """
        if not self.autonomous_active:
            return {"auto_executed": False, "reason": "Autonomous trading disabled."}

        symbols_to_scan = ["NVDA", "AAPL", "MSFT", "SPY", "TSLA", "AMD", "QQQ"]
        symbol = random.choice(symbols_to_scan)
        
        regime = market_intel_agent.analyze_market_regime("SPY")
        self.current_regime = regime
        
        # Select best active strategy
        alive_strats = [s for s in self.strategies if s.get("status") == "ALIVE"]
        strat = alive_strats[0] if alive_strats else self.strategies[0]
        
        quote = market_data_service.get_latest_quote(symbol)
        price = quote["last_price"]
        
        acc = portfolio_service.get_account()
        buying_power = acc.get("buying_power", 100000.0)
        
        # Auto position sizing: Increase lot size for all option/stock symbols EXCEPT BTC
        is_btc = "BTC" in symbol.upper()
        if is_btc:
            target_val = min(buying_power * 0.02, 2000.0)
            qty = max(0.01, round(target_val / price, 4))
        else:
            # High Risk-Reward Sizing: 12% allocation per trade (Option standard 100-contract multiplier)
            target_val = min(buying_power * 0.12, 12000.0)
            raw_qty = max(100.0, round(target_val / price, -1))
            qty = float(raw_qty)
        
        risk_result = risk_agent.validate_trade_proposal(
            symbol=symbol,
            qty=qty,
            price=price,
            side="buy",
            strategy=strat,
            portfolio_state={"buying_power": buying_power, "portfolio_value": acc.get("portfolio_value", 100000.0), "daily_pnl_pct": 0.01}
        )
        
        if risk_result["approved"] and strat.get("edge_score", 0) >= 80.0:
            trade_res = self.execute_paper_trade(
                symbol=symbol,
                qty=qty,
                side="buy",
                strategy_id=strat["strategy_id"]
            )
            
            self._add_event(
                "Autonomous AI Trader",
                "AUTO_EXECUTE_TRADE",
                f"HIGH PROFIT EDGE DETECTED ({strat['name']}, Edge Score {strat['edge_score']:.0f}/100). Auto-executed BUY {qty} {symbol} @ ${price:.2f} on Alpaca API.",
                strat["strategy_id"],
                symbol
            )
            
            return {
                "auto_executed": True,
                "symbol": symbol,
                "qty": qty,
                "price": price,
                "regime": regime["regime"],
                "edge_score": strat["edge_score"],
                "trade_res": trade_res
            }
            
        return {
            "auto_executed": False,
            "reason": f"Scanned {symbol}. Risk or Edge score threshold not met."
        }

    def scale_in_profitable_position(self, symbol: str) -> Dict[str, Any]:
        """
        Increases lot size for any active position if it is profitable (unrealized_pnl > 0).
        """
        clean_target = symbol.upper().replace("/", "").replace("-", "")
        pos = next((p for p in self.positions if p.get("symbol", "").upper().replace("/", "").replace("-", "") == clean_target), None)
        
        if not pos:
            return {"success": False, "message": f"No active position found for {symbol}."}
            
        unrealized = pos.get("unrealized_pnl", 0.0)
        current = pos.get("current_price", pos.get("entry_price", 0.0))
        entry = pos.get("entry_price", 0.0)
        
        is_profitable = unrealized > 0 or (current > entry if pos.get("side") == "long" else current < entry)
        
        if not is_profitable:
            return {"success": False, "message": f"Position {symbol} is not currently profitable. Scale-in skipped."}
            
        # Increase lot size by +50%
        old_qty = pos["qty"]
        is_btc = "BTC" in symbol.upper()
        add_qty = max(0.01 if is_btc else 1.0, round(old_qty * 0.5, 4 if is_btc else 0))
        new_qty = round(old_qty + add_qty, 4 if is_btc else 0)
        pos["qty"] = new_qty
        pos["market_value"] = round(new_qty * current, 2)
        
        # Submit lot increase order to Alpaca
        order = trading_service.submit_order(symbol, add_qty, pos.get("side", "buy"), "market", pos.get("strategy_id", ""))
        
        self._add_event(
            "Profitable Lot Booster",
            "INCREASE_LOT_SIZE",
            f"PROFITABLE TRADE DETECTED ({symbol} P&L +${unrealized:.2f}). Scaled in position lot size {old_qty} → {new_qty} (+{add_qty}).",
            pos.get("strategy_id", ""),
            symbol
        )
        
        return {
            "success": True,
            "symbol": symbol,
            "old_qty": old_qty,
            "new_qty": new_qty,
            "add_qty": add_qty,
            "unrealized_pnl": unrealized,
            "order": order
        }

    def increase_all_lots_except_btc(self) -> Dict[str, Any]:
        """
        Increases position lot size (SHARES) for ALL active positions EXCEPT BTCUSD / BTC/USD.
        """
        updated = []
        for pos in self.positions:
            sym = pos.get("symbol", "").upper()
            if "BTC" in sym:
                continue
                
            old_qty = pos["qty"]
            # Increase lot size by +50 shares or +50%
            add_qty = 50.0 if old_qty <= 10 else round(old_qty * 0.5, 0)
            new_qty = round(old_qty + add_qty, 0)
            pos["qty"] = new_qty
            pos["market_value"] = round(new_qty * pos.get("current_price", pos.get("entry_price", 100.0)), 2)
            
            order = trading_service.submit_order(sym, add_qty, pos.get("side", "buy"), "market", pos.get("strategy_id", ""))
            updated.append({"symbol": sym, "old_qty": old_qty, "new_qty": new_qty, "order": order})
            
            self._add_event(
                "Trade Lot Increaser",
                "BOOST_POSITION_LOT",
                f"Increased trade lot size for {sym} ({old_qty} → {new_qty} shares). BTCUSD preserved.",
                pos.get("strategy_id", ""),
                sym
            )
            
        return {"success": True, "updated_count": len(updated), "updated_positions": updated}

    def get_crypto_status(self) -> Dict[str, Any]:
        """
        Returns dynamic live status for BTC/USD asset class.
        """
        quotes = market_data_service.get_watchlist_quotes(["BTCUSD"])
        btc_quote = quotes.get("BTCUSD", {"price": 77245.44, "change_pct": -0.55})
        
        target_strat = self.strategies[0] if self.strategies else {"edge_score": 42.0}
        crypto_mult = adaptive_allocator.calculate_crypto_multiplier(btc_quote, target_strat, self.current_regime.get("regime", "BULLISH"))
        
        # Calculate current weight
        portfolio_val = float(portfolio_service.get_account().get("portfolio_value", 100000.0))
        positions = portfolio_service.get_positions() or self.positions
        btc_pos = next((p for p in positions if "BTC" in p.get("symbol", "").upper()), None)
        
        current_mval = float(btc_pos.get("market_value", 771.18)) if btc_pos else 0.0
        current_weight = round(current_mval / portfolio_val, 4) if portfolio_val > 0 else 0.0
        
        return {
            "symbol": "BTC/USD",
            "asset_class": "CRYPTO",
            "pnl": float(btc_pos.get("unrealized_pnl", -7.29)) if btc_pos else 0.0,
            "pnl_pct": float(btc_pos.get("unrealized_pnl_pct", -0.0094)) if btc_pos else 0.0,
            "edge_score": crypto_mult["edge_score"],
            "regime": crypto_mult["regime"],
            "momentum_pct": crypto_mult["momentum_pct"],
            "volatility": "MEDIUM",
            "risk_score": 14.0 if crypto_mult["multiplier"] == 0.0 else 10.0,
            "allocation_multiplier": crypto_mult["multiplier"],
            "allocation_status": crypto_mult["status"],
            "current_weight": current_weight,
            "target_weight": current_weight,
            "reason": crypto_mult["reason"]
        }

    def get_optimization_preview(self) -> Dict[str, Any]:
        """
        Fetches live Alpaca state, quotes, and positions, then runs AdaptiveCapitalAllocator.
        """
        account = portfolio_service.get_account()
        positions = portfolio_service.get_positions()
        if not positions:
            positions = self.positions
            
        symbols = [p.get("symbol", "") for p in positions]
        quotes = market_data_service.get_watchlist_quotes(symbols)
        
        return adaptive_allocator.optimize_portfolio(positions, account, quotes, self.strategies)

    def execute_allocation_plan(self, confirmed_recommendations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Executes approved orders on Alpaca Paper API and records entries in audit log.
        """
        account = portfolio_service.get_account()
        buying_power = float(account.get("buying_power", 50000.0))
        executed_orders = []
        
        for item in confirmed_recommendations:
            action = item.get("action", "HOLD")
            if action.startswith("BUY"):
                symbol = item.get("symbol", "")
                add_shares = item.get("target_qty", 0.0) - item.get("current_qty", 0.0)
                if add_shares > 0:
                    price = float(item.get("current_price", 100.0))
                    proposed_val = add_shares * price
                    
                    # Risk Check
                    risk_verdict = risk_agent.validate_trade_proposal(
                        symbol, add_shares, price, "buy", self.strategies[0], account
                    )
                    
                    if risk_verdict["approved"]:
                        order_res = trading_service.submit_order(symbol, add_shares, "buy", "market", self.strategies[0]["strategy_id"])
                        executed_orders.append({
                            "symbol": symbol,
                            "qty": add_shares,
                            "order": order_res,
                            "status": "SUBMITTED"
                        })
                        
                        # Add audit log
                        import datetime
                        self.audit_log.append({
                            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                            "symbol": symbol,
                            "asset_class": item.get("asset_class", "EQUITY"),
                            "current_qty": item.get("current_qty", 0),
                            "target_qty": item.get("target_qty", 0),
                            "current_weight": item.get("current_weight", 0),
                            "target_weight": item.get("target_weight", 0),
                            "allocation_score": item.get("allocation_score", 0),
                            "action": action,
                            "reason": item.get("reason", ""),
                            "order_id": order_res.get("id", "SIM-ORD"),
                            "execution_status": "FILLED" if order_res.get("status") in ["filled", "accepted"] else "PENDING"
                        })
                        
                        self._add_event(
                            "Adaptive Allocator",
                            "EXECUTE_ALLOCATION",
                            f"Submitted order for {symbol}: {action} ({add_shares} shares @ ${price:.2f}). Reason: {item.get('reason')}",
                            self.strategies[0]["strategy_id"],
                            symbol
                        )
                        
        return {"success": True, "executed_orders": executed_orders, "audit_count": len(self.audit_log)}

    def get_audit_log(self) -> List[Dict[str, Any]]:
        return self.audit_log

    def execute_demo_step(self, step: int) -> Dict[str, Any]:
        self.demo_step = step
        if step == 1:
            return {"step": 1, "description": "Dashboard overview initialized.", "regime": self.current_regime}
        elif step == 2:
            self._add_event("Discovery Agent", "PROPOSE_HYPOTHESIS", "Generating new strategy hypothesis 'Regime Momentum v3'...")
            return {"step": 2, "description": "Discovery Agent proposed strategy STRAT-REG-001."}
        elif step == 3:
            self._add_event("Backtest Agent", "WALK_FORWARD_VALIDATE", "Chronological train (70%) vs OOS (30%) completed. OOS Sharpe: 1.42. PASSED.")
            return {"step": 3, "description": "Backtest Agent completed OOS walk-forward validation."}
        elif step == 4:
            self._add_event("Adversary Agent", "STRESS_TEST", "Flawed strategy RSI Extreme Reversal REJECTED (Score: 31). Regime Momentum v3 PASSED (Score: 86).")
            return {"step": 4, "description": "Adversary Agent stress-tested strategies."}
        elif step == 5:
            self._add_event("Strategy Darwinism Engine", "UPDATE_LIFECYCLE", "Regime Momentum v3 Edge Score: 91/100. State set to ALIVE 🟢.")
            return {"step": 5, "description": "Strategy Darwinism Engine updated Edge Score."}
        elif step == 6:
            self._add_event("Portfolio Manager Agent", "ALLOCATE_CAPITAL", "Allocated 30% capital ($30,000) to Regime Momentum v3.")
            return {"step": 6, "description": "Portfolio Manager allocated capital."}
        elif step == 7:
            self._add_event("Deterministic Risk Agent", "VALIDATE_RULES", "Risk check APPROVED for BUY 70 NVDA @ $122.40.")
            return {"step": 7, "description": "Deterministic Risk Agent approved trade."}
        elif step == 8:
            order_res = self.execute_paper_trade("NVDA", 70, "buy", "STRAT-REG-001")
            return {"step": 8, "description": "Submitted paper order to Alpaca.", "order": order_res}
        elif step == 9:
            return {"step": 9, "description": "Paper order filled. Active position updated in portfolio."}
        elif step == 10:
            target_strat = next((s for s in self.strategies if s["strategy_id"] == "STRAT-REG-001"), self.strategies[0])
            target_strat["edge_score"] = 58.0
            target_strat["allocation_pct"] = 0.12
            self._add_event("Performance Monitoring Agent", "EDGE_DETERIORATING", "Strategy 'Regime Momentum v3' Edge Score dropped 91 → 58. Consecutive losses detected in live regime. Allocation auto-reduced to 12%.")
            return {"step": 10, "description": "Market regime shift simulated. Edge deterioration detected."}
        elif step == 11:
            exp = explainability_engine.explain_strategy_kill(self.strategies[3])
            self._add_event("Explainability Engine", "EXPLAIN_KILL", "Generated complete evidence breakdown for killed strategy.")
            return {"step": 11, "description": "Explainability Engine delivered full evidence breakdown.", "explainability": exp}
        else:
            return {"step": step, "description": "Demo sequence complete."}

agent_orchestrator = AgentOrchestrator()
