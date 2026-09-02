import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PortfolioSummary } from './components/PortfolioSummary';
import { MarketRegimeCard } from './components/MarketRegimeCard';
import { StrategyLab } from './components/StrategyLab';
import { StrategyDetailModal } from './components/StrategyDetailModal';
import { ActivePositionsTable } from './components/ActivePositionsTable';
import { AgentActivityFeed } from './components/AgentActivityFeed';
import { ExplainabilityModal } from './components/ExplainabilityModal';
import { AICouncilView } from './components/AICouncilView';
import { CommandCenter } from './components/CommandCenter';
import { PnLAnalytics } from './components/PnLAnalytics';
import { TradeExplorer } from './components/TradeExplorer';
import { LandingPage } from './components/LandingPage';
import { LiveTradingChart } from './components/trading/LiveTradingChart';
import { Watchlist } from './components/Watchlist';

import {
  PortfolioSummaryData,
  MarketRegime,
  Strategy,
  Position,
  Trade,
  AgentEvent
} from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDiscovering, setIsDiscovering] = useState<boolean>(false);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [activeSymbol, setActiveSymbol] = useState<string>('NVDA');

  // Real-Time Data States
  const [portfolio, setPortfolio] = useState<PortfolioSummaryData | null>({
    portfolio_value: 112450.00,
    cash: 74500.00,
    buying_power: 184500.00,
    daily_pnl: 1245.50,
    daily_pnl_pct: 0.0112,
    total_pnl: 12450.00,
    total_pnl_pct: 0.1245,
    max_drawdown: 0.058,
    positions_count: 2,
    positions_value: 16845.50,
    paper_trading: true,
    mode: 'REAL_TIME_PAPER'
  });

  const [marketRegime, setMarketRegime] = useState<MarketRegime | null>({
    regime: 'BULLISH',
    confidence: 0.85,
    volatility: 'MEDIUM',
    momentum: 'POSITIVE',
    observations: [
      'Price ($545.10) above 20d SMA ($538.20) and 50d SMA ($529.40)',
      '20-day momentum strong positive at +4.9%',
      'Institutional volume expansion confirmed (+28.4%)'
    ]
  });

  const [strategies, setStrategies] = useState<Strategy[]>([
    {
      strategy_id: 'STRAT-REG-001',
      name: 'Regime Momentum v3',
      hypothesis: 'Momentum signals exhibit higher persistence when broader market regime is BULLISH.',
      entry_rules: ['Price > 50-day SMA', '14-day RSI > 55', 'Market regime BULLISH'],
      exit_rules: ['RSI < 48', 'Price < 20-day SMA'],
      stop_loss_rules: ['Fixed 3.5% trailing stop loss'],
      sizing_rules: { max_position_pct: 0.15 },
      preferred_regime: 'BULLISH',
      edge_score: 91.0,
      status: 'ALIVE',
      status_reason: 'Outperformed out-of-sample tests with 86/100 adversarial robustness.',
      allocation_pct: 0.30
    },
    {
      strategy_id: 'STRAT-ERN-002',
      name: 'Institutional Earnings Momentum',
      hypothesis: 'Post-earnings gap ups with 3x volume drift higher over 15 trading days.',
      entry_rules: ['Earnings beat > 5%', 'Gap up > 3% on 3x volume'],
      exit_rules: ['15 trading days hold'],
      stop_loss_rules: ['Low of earnings gap day'],
      sizing_rules: { max_position_pct: 0.18 },
      preferred_regime: 'BULLISH',
      edge_score: 87.0,
      status: 'ALIVE',
      status_reason: 'Strong out-of-sample Sharpe (1.52) and low broad market correlation.',
      allocation_pct: 0.25
    },
    {
      strategy_id: 'STRAT-REV-003',
      name: 'Mean Reversion RSI-MACD',
      hypothesis: 'Oversold RSI < 32 in sideways regime rapidly reverts to 20-day mean.',
      entry_rules: ['RSI(14) < 32', 'Market regime SIDEWAYS'],
      exit_rules: ['Price touches 20-day SMA'],
      stop_loss_rules: ['2.5% hard stop'],
      sizing_rules: { max_position_pct: 0.10 },
      preferred_regime: 'SIDEWAYS',
      edge_score: 68.0,
      status: 'WATCH',
      status_reason: 'Moderate edge score. On watch list for market regime confirmation.',
      allocation_pct: 0.15
    },
    {
      strategy_id: 'STRAT-FLW-004',
      name: 'RSI Extreme Reversal (Flawed)',
      hypothesis: 'Buying RSI < 20 unconditionally generates bounce profits.',
      entry_rules: ['RSI < 20'],
      exit_rules: ['RSI > 40'],
      stop_loss_rules: ['None'],
      sizing_rules: { max_position_pct: 0.25 },
      preferred_regime: 'ANY',
      edge_score: 31.0,
      status: 'KILLED',
      status_reason: 'Adversary identified severe curve-fitting and 82% return concentration in 4 trades.',
      allocation_pct: 0.0
    }
  ]);

  const [positions, setPositions] = useState<Position[]>([
    {
      id: 'POS-NVDA',
      symbol: 'NVDA',
      qty: 70,
      entry_price: 122.40,
      current_price: 128.50,
      market_value: 8995.00,
      unrealized_pnl: 427.00,
      unrealized_pnl_pct: 0.0498,
      side: 'long',
      strategy_id: 'STRAT-REG-001',
      stop_loss_price: 118.10,
      risk_score: 12.0
    },
    {
      id: 'POS-AAPL',
      symbol: 'AAPL',
      qty: 35,
      entry_price: 218.10,
      current_price: 224.30,
      market_value: 7850.50,
      unrealized_pnl: 217.00,
      unrealized_pnl_pct: 0.0284,
      side: 'long',
      strategy_id: 'STRAT-ERN-002',
      stop_loss_price: 212.00,
      risk_score: 10.0
    }
  ]);

  const [trades, setTrades] = useState<Trade[]>([
    {
      id: 'TRD-1092',
      timestamp: '2026-09-01T14:37:00',
      symbol: 'NVDA',
      side: 'buy',
      qty: 70,
      price: 122.40,
      strategy_id: 'STRAT-REG-001',
      strategy_name: 'Regime Momentum v3',
      edge_score: 91.0,
      risk_score: 12.0,
      pnl: 427.00
    }
  ]);

  const [agentEvents, setAgentEvents] = useState<AgentEvent[]>([
    { id: 1, timestamp: '14:37', agent_name: 'Alpaca Paper Trading', action: 'SUBMIT_ORDER', details: 'Paper order submitted: BUY 70 NVDA @ $122.40', strategy_id: 'STRAT-REG-001', symbol: 'NVDA' },
    { id: 2, timestamp: '14:37', agent_name: 'Deterministic Risk Agent', action: 'VALIDATE_RULES', details: 'Risk check APPROVED for BUY 70 NVDA @ $122.40', strategy_id: 'STRAT-REG-001', symbol: 'NVDA' },
    { id: 3, timestamp: '14:36', agent_name: 'Portfolio Manager Agent', action: 'ALLOCATE_CAPITAL', details: 'Allocated 30% capital ($30,000) to Regime Momentum v3' },
    { id: 4, timestamp: '14:35', agent_name: 'Adversary Agent', action: 'STRESS_TEST', details: 'Robustness Score: 86/100. Verdict: PASS', strategy_id: 'STRAT-REG-001' },
    { id: 5, timestamp: '14:34', agent_name: 'Backtest Agent', action: 'WALK_FORWARD_VALIDATE', details: 'STRAT-REG-001 passed OOS walk-forward validation (Sharpe 1.42)', strategy_id: 'STRAT-REG-001' },
    { id: 6, timestamp: '14:32', agent_name: 'Discovery Agent', action: 'PROPOSE_HYPOTHESIS', details: 'Generated strategy hypothesis STRAT-REG-001' },
    { id: 7, timestamp: '14:31', agent_name: 'Market Intelligence Agent', action: 'ANALYZE_REGIME', details: 'Market regime identified as BULLISH (85% confidence)' }
  ]);

  const fetchPositions = async () => {
    try {
      const res = await fetch('/api/positions');
      if (res.ok) setPositions(await res.json());
    } catch (e) {}
  };

  // Fetch backend data continuously from Alpaca Backend API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [portRes, regRes, stratRes, posRes, ordRes, evtRes] = await Promise.all([
          fetch('/api/portfolio'),
          fetch('/api/market-regime'),
          fetch('/api/strategies'),
          fetch('/api/positions'),
          fetch('/api/orders'),
          fetch('/api/agent-events')
        ]);
        if (portRes.ok) setPortfolio(await portRes.json());
        if (regRes.ok) setMarketRegime(await regRes.json());
        if (stratRes.ok) setStrategies(await stratRes.json());
        if (posRes.ok) setPositions(await posRes.json());
        if (ordRes.ok) setTrades(await ordRes.json());
        if (evtRes.ok) setAgentEvents(await evtRes.json());
      } catch (e) {
        // Retain real-time state
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleRunDiscovery = async () => {
    setIsDiscovering(true);
    try {
      const res = await fetch('/api/discovery/run', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.result?.strategy) {
          setStrategies((prev) => [data.result.strategy, ...prev]);
        }
      }
    } catch (e) {
      // Error handling
    } finally {
      setIsDiscovering(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090B0E] text-slate-100 font-sans pb-12">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRunDiscovery={handleRunDiscovery}
        isDiscovering={isDiscovering}
      />

      {/* Main Container */}
      <main className="max-w-[1700px] mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* Landing Page View */}
        {activeTab === 'landing' ? (
          <LandingPage
            onEnterLab={() => setActiveTab('dashboard')}
            onViewStrategies={() => setActiveTab('strategies')}
          />
        ) : (
          <>
            {/* Top Portfolio KPI Strip */}
            <PortfolioSummary data={portfolio} />

            {/* Tab 1: Main Dashboard (Watchlist Left | Chart Center | AI Council Right) */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                
                {/* Main 3-Column Real-Time Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Watchlist (3 cols) */}
                  <div className="lg:col-span-3">
                    <Watchlist
                      selectedSymbol={activeSymbol}
                      onSelectSymbol={(sym) => setActiveSymbol(sym)}
                    />
                  </div>

                  {/* Center & Right Columns: TradingView Live Chart & AI Council (9 cols) */}
                  <div className="lg:col-span-9">
                    <LiveTradingChart
                      symbol={activeSymbol}
                      initialSymbol={activeSymbol}
                      initialTimeframe="1m"
                      onSymbolChange={(sym) => setActiveSymbol(sym)}
                    />
                  </div>

                </div>

                {/* Bottom Row: Market Regime, Activity Stream & Positions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <MarketRegimeCard regime={marketRegime} />
                  </div>
                  <div className="lg:col-span-2">
                    <AgentActivityFeed events={agentEvents} />
                  </div>
                </div>

                {/* Strategy Laboratory Section */}
                <StrategyLab
                  strategies={strategies}
                  onSelectStrategy={(strat) => setSelectedStrategy(strat)}
                  onRunDiscovery={handleRunDiscovery}
                  isDiscovering={isDiscovering}
                />

                {/* Active Positions Table */}
                <ActivePositionsTable positions={positions} onRefresh={fetchPositions} />
              </div>
            )}

            {/* Tab 2: Dedicated Live Trading Chart */}
            {activeTab === 'chart' && (
              <div className="space-y-6">
                <LiveTradingChart
                  symbol={activeSymbol}
                  initialSymbol={activeSymbol}
                  initialTimeframe="1m"
                  onSymbolChange={(sym) => setActiveSymbol(sym)}
                />
              </div>
            )}

            {/* Tab 3: Strategy Lab Dedicated */}
            {activeTab === 'strategies' && (
              <StrategyLab
                strategies={strategies}
                onSelectStrategy={(strat) => setSelectedStrategy(strat)}
                onRunDiscovery={handleRunDiscovery}
                isDiscovering={isDiscovering}
              />
            )}

            {/* Tab 4: Trade Explorer */}
            {activeTab === 'trades' && (
              <TradeExplorer
                trades={trades}
                onSelectTrade={(trade) => setSelectedTrade(trade)}
              />
            )}

            {/* Tab 5: P&L & Analytics */}
            {activeTab === 'analytics' && <PnLAnalytics />}

            {/* Tab 6: AI Council Visual View */}
            {activeTab === 'council' && <AICouncilView />}

            {/* Tab 7: Command Center */}
            {activeTab === 'command' && (
              <CommandCenter onRunDiscovery={handleRunDiscovery} />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <StrategyDetailModal
        strategy={selectedStrategy}
        onClose={() => setSelectedStrategy(null)}
      />

      <ExplainabilityModal
        trade={selectedTrade}
        onClose={() => setSelectedTrade(null)}
      />
    </div>
  );
}
export default App;
