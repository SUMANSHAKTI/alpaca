import pytest
from app.agents.backtest import backtest_engine
from app.agents.adversary import adversary_agent
from app.agents.evolution import evolution_engine
from app.agents.performance_monitor import performance_monitor_agent

def test_backtest_oos_separation():
    strategy = {
        "strategy_id": "TEST-001",
        "name": "Test Strategy",
        "entry_rules": ["RSI > 50"]
    }
    result = backtest_engine.run_backtest(strategy, "NVDA")
    assert "train_period" in result
    assert "oos_period" in result
    assert "oos_sharpe" in result
    assert "oos_passed" in result

def test_adversary_flawed_strategy_rejection():
    flawed_strategy = {
        "strategy_id": "FLAW-001",
        "name": "RSI Extreme Reversal (Flawed)"
    }
    bt = backtest_engine.run_backtest(flawed_strategy, "NVDA")
    adv = adversary_agent.stress_test_strategy(flawed_strategy, bt)
    
    assert adv["verdict"] == "REJECT"
    assert adv["robustness_score"] < 40.0
    assert len(adv["weaknesses"]) > 0

def test_evolution_edge_score_and_deterioration():
    healthy_strat = {
        "strategy_id": "STRAT-001",
        "edge_score": 88.0,
        "status": "ALIVE"
    }
    # Simulate consecutive losing live trades
    live_trades = [
        {"strategy_id": "STRAT-001", "pnl": -150.0},
        {"strategy_id": "STRAT-001", "pnl": -220.0},
        {"strategy_id": "STRAT-001", "pnl": -180.0}
    ]
    mon = performance_monitor_agent.monitor_strategy_performance(healthy_strat, live_trades)
    assert mon["edge_deteriorating"] is True
    assert mon["current_edge_score"] < mon["previous_edge_score"]
