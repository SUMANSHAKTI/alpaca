import pytest
from app.agents.risk_agent import risk_agent

def test_risk_agent_blocks_killed_strategy():
    """Verify that Risk Agent rejects orders for non-ALIVE strategies regardless of inputs."""
    result = risk_agent.validate_trade_proposal(
        symbol="NVDA",
        qty=10,
        price=100.0,
        side="buy",
        strategy={"strategy_id": "STRAT-KILLED", "status": "KILLED"},
        portfolio_state={"buying_power": 100000.0, "portfolio_value": 100000.0, "daily_pnl_pct": 0.0}
    )
    assert result["approved"] is False
    assert result["verdict"] == "REJECTED"
    assert any("KILLED" in r or "prohibited" in r for r in result["reasons"])

def test_risk_agent_blocks_oversized_position():
    """Verify position size cap (25% max)."""
    result = risk_agent.validate_trade_proposal(
        symbol="AAPL",
        qty=300,
        price=200.0, # $60,000 order on $100,000 portfolio = 60% > 25% cap
        side="buy",
        strategy={"strategy_id": "STRAT-001", "status": "ALIVE"},
        portfolio_state={"buying_power": 200000.0, "portfolio_value": 100000.0, "daily_pnl_pct": 0.0}
    )
    assert result["approved"] is False
    assert any("single-position cap" in r for r in result["reasons"])

def test_risk_agent_blocks_insufficient_buying_power():
    """Verify buying power limit enforcement."""
    result = risk_agent.validate_trade_proposal(
        symbol="MSFT",
        qty=50,
        price=400.0, # $20,000 order on $10,000 buying power
        side="buy",
        strategy={"strategy_id": "STRAT-001", "status": "ALIVE"},
        portfolio_state={"buying_power": 10000.0, "portfolio_value": 100000.0, "daily_pnl_pct": 0.0}
    )
    assert result["approved"] is False
    assert any("buying power" in r for r in result["reasons"])

def test_risk_agent_approves_valid_trade():
    """Verify approval of valid trade meeting all safety rules."""
    result = risk_agent.validate_trade_proposal(
        symbol="TSLA",
        qty=20,
        price=200.0, # $4,000 order = 4% of $100k portfolio
        side="buy",
        strategy={"strategy_id": "STRAT-001", "status": "ALIVE"},
        portfolio_state={"buying_power": 100000.0, "portfolio_value": 100000.0, "daily_pnl_pct": 0.0}
    )
    assert result["approved"] is True
    assert result["verdict"] == "APPROVED"
