import json
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Text, Boolean
from app.db.session import Base

class MarketRegimeModel(Base):
    __tablename__ = "market_regimes"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    regime = Column(String, index=True) # BULLISH, BEARISH, SIDEWAYS, HIGH_VOLATILITY, LOW_VOLATILITY
    confidence = Column(Float)
    volatility = Column(String) # LOW, MEDIUM, HIGH
    momentum = Column(String) # POSITIVE, NEGATIVE, NEUTRAL
    observations_json = Column(Text, default="[]")

class StrategyModel(Base):
    __tablename__ = "strategies"
    
    strategy_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    hypothesis = Column(Text, nullable=False)
    entry_rules_json = Column(Text, default="[]")
    exit_rules_json = Column(Text, default="[]")
    stop_loss_rules_json = Column(Text, default="[]")
    sizing_rules_json = Column(Text, default="{}")
    preferred_regime = Column(String, default="BULLISH")
    risk_assumptions = Column(Text, default="")
    expected_edge = Column(Text, default="")
    invalidation_conditions = Column(Text, default="")
    
    edge_score = Column(Float, default=50.0)
    status = Column(String, default="WATCH", index=True) # ALIVE, WATCH, KILLED, REJECTED
    status_reason = Column(Text, default="")
    allocation_pct = Column(Float, default=0.0)
    parent_strategy_id = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class BacktestModel(Base):
    __tablename__ = "backtests"
    
    backtest_id = Column(String, primary_key=True, index=True)
    strategy_id = Column(String, index=True)
    train_period = Column(String, default="2023-01 to 2024-06")
    oos_period = Column(String, default="2024-07 to 2026-02")
    
    # Train metrics
    total_return = Column(Float, default=0.0)
    annualized_return = Column(Float, default=0.0)
    win_rate = Column(Float, default=0.0)
    profit_factor = Column(Float, default=0.0)
    sharpe_ratio = Column(Float, default=0.0)
    sortino_ratio = Column(Float, default=0.0)
    max_drawdown = Column(Float, default=0.0)
    num_trades = Column(Integer, default=0)
    avg_trade_return = Column(Float, default=0.0)
    avg_holding_period = Column(String, default="3.2 days")
    volatility = Column(Float, default=0.0)
    exposure = Column(Float, default=0.8)
    
    # OOS metrics
    oos_return = Column(Float, default=0.0)
    oos_sharpe = Column(Float, default=0.0)
    oos_drawdown = Column(Float, default=0.0)
    oos_win_rate = Column(Float, default=0.0)
    oos_passed = Column(Boolean, default=False)
    equity_curve_json = Column(Text, default="[]")
    
    created_at = Column(DateTime, default=datetime.utcnow)

class AdversaryReportModel(Base):
    __tablename__ = "adversary_reports"
    
    report_id = Column(String, primary_key=True, index=True)
    strategy_id = Column(String, index=True)
    robustness_score = Column(Float, default=50.0)
    verdict = Column(String, default="WATCH") # PASS, WATCH, REJECT
    weaknesses_json = Column(Text, default="[]")
    evidence_json = Column(Text, default="[]")
    failure_scenarios_json = Column(Text, default="[]")
    recommendation = Column(Text, default="")
    
    created_at = Column(DateTime, default=datetime.utcnow)

class PortfolioSnapshotModel(Base):
    __tablename__ = "portfolio_snapshots"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    total_value = Column(Float, default=100000.0)
    cash = Column(Float, default=100000.0)
    buying_power = Column(Float, default=200000.0)
    daily_pnl = Column(Float, default=0.0)
    daily_pnl_pct = Column(Float, default=0.0)
    total_pnl = Column(Float, default=0.0)
    max_drawdown = Column(Float, default=0.0)

class PositionModel(Base):
    __tablename__ = "positions"
    
    id = Column(String, primary_key=True, index=True)
    symbol = Column(String, index=True)
    qty = Column(Float, default=0.0)
    entry_price = Column(Float, default=0.0)
    current_price = Column(Float, default=0.0)
    market_value = Column(Float, default=0.0)
    unrealized_pnl = Column(Float, default=0.0)
    unrealized_pnl_pct = Column(Float, default=0.0)
    side = Column(String, default="long")
    strategy_id = Column(String, index=True)
    stop_loss_price = Column(Float, default=0.0)
    risk_score = Column(Float, default=10.0)
    created_at = Column(DateTime, default=datetime.utcnow)

class OrderModel(Base):
    __tablename__ = "orders"
    
    id = Column(String, primary_key=True, index=True)
    alpaca_order_id = Column(String, default="")
    symbol = Column(String, index=True)
    qty = Column(Float, default=0.0)
    side = Column(String, default="buy")
    order_type = Column(String, default="market")
    time_in_force = Column(String, default="gtc")
    status = Column(String, default="submitted") # submitted, filled, cancelled, rejected
    filled_price = Column(Float, default=0.0)
    strategy_id = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class TradeModel(Base):
    __tablename__ = "trades"
    
    id = Column(String, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    symbol = Column(String, index=True)
    side = Column(String, default="buy")
    qty = Column(Float, default=0.0)
    price = Column(Float, default=0.0)
    strategy_id = Column(String, index=True)
    strategy_name = Column(String, default="")
    edge_score = Column(Float, default=80.0)
    risk_score = Column(Float, default=15.0)
    pnl = Column(Float, default=0.0)
    explainability_json = Column(Text, default="{}")

class AgentEventModel(Base):
    __tablename__ = "agent_events"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    agent_name = Column(String, index=True)
    action = Column(String)
    details = Column(Text)
    strategy_id = Column(String, nullable=True)
    symbol = Column(String, nullable=True)

class AuditLogModel(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    agent = Column(String, index=True)
    action = Column(String)
    input_data = Column(Text, default="{}")
    output_data = Column(Text, default="{}")
    risk_result = Column(Text, default="APPROVED")
    execution_result = Column(Text, default="SUCCESS")
