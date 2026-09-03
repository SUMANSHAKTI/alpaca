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
import { AllocationModal, AllocationPreviewData, AllocationItem } from './components/AllocationModal';
import { getApiUrl } from './config';

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

  // Real-Time Backend Data States
  const [portfolio, setPortfolio] = useState<PortfolioSummaryData | null>(null);
  const [marketRegime, setMarketRegime] = useState<MarketRegime | null>(null);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [agentEvents, setAgentEvents] = useState<AgentEvent[]>([]);

  const [isOptimizeModalOpen, setIsOptimizeModalOpen] = useState<boolean>(false);
  const [allocationPreviewData, setAllocationPreviewData] = useState<AllocationPreviewData | null>(null);

  const fetchPositions = async () => {
    try {
      const res = await fetch(getApiUrl('/positions'));
      if (res.ok) setPositions(await res.json());
    } catch (e) {
      console.error('Error fetching positions:', e);
    }
  };

  const handleOpenOptimizeModal = async () => {
    try {
      let res = await fetch(getApiUrl('/portfolio/optimize-preview'), { method: 'POST' });
      if (!res.ok) {
        res = await fetch('/api/portfolio/optimize-preview', { method: 'POST' });
      }
      if (res.ok) {
        const data = await res.json();
        setAllocationPreviewData(data);
        setIsOptimizeModalOpen(true);
      }
    } catch (e) {
      console.error('Error fetching optimization preview:', e);
    }
  };

  const handleExecuteAllocation = async (recommendations: AllocationItem[]) => {
    try {
      let res = await fetch(getApiUrl('/portfolio/execute-allocation'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendations })
      });
      if (!res.ok) {
        res = await fetch('/api/portfolio/execute-allocation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recommendations })
        });
      }
      if (res.ok) {
        await fetchPositions();
      }
    } catch (e) {
      console.error('Error executing allocation:', e);
    }
  };

  // Fetch real backend data continuously from Alpaca Backend API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [portRes, regRes, stratRes, posRes, ordRes, evtRes] = await Promise.all([
          fetch(getApiUrl('/portfolio')).catch(() => fetch('/api/portfolio')),
          fetch(getApiUrl('/market-regime')).catch(() => fetch('/api/market-regime')),
          fetch(getApiUrl('/strategies')).catch(() => fetch('/api/strategies')),
          fetch(getApiUrl('/positions')).catch(() => fetch('/api/positions')),
          fetch(getApiUrl('/orders')).catch(() => fetch('/api/orders')),
          fetch(getApiUrl('/agent-events')).catch(() => fetch('/api/agent-events'))
        ]);

        if (portRes && portRes.ok) setPortfolio(await portRes.json());
        if (regRes && regRes.ok) setMarketRegime(await regRes.json());
        if (stratRes && stratRes.ok) setStrategies(await stratRes.json());
        if (posRes && posRes.ok) setPositions(await posRes.json());
        if (ordRes && ordRes.ok) setTrades(await ordRes.json());
        if (evtRes && evtRes.ok) setAgentEvents(await evtRes.json());
      } catch (e) {
        console.error('Error fetching real-time data from backend:', e);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRunDiscovery = async () => {
    setIsDiscovering(true);
    try {
      const res = await fetch(getApiUrl('/discovery/run'), { method: 'POST' });
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

  const [autonomousActive, setAutonomousActive] = useState(true);

  const handleToggleAutonomous = async () => {
    const nextState = !autonomousActive;
    setAutonomousActive(nextState);
    try {
      await fetch(getApiUrl('/autonomous/toggle'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: nextState })
      });
    } catch (e) {
      // Retain optimistic UI state
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
        autonomousActive={autonomousActive}
        onToggleAutonomous={handleToggleAutonomous}
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
                <ActivePositionsTable
                  positions={positions}
                  onRefresh={fetchPositions}
                  onOpenOptimizeModal={handleOpenOptimizeModal}
                />
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

      <AllocationModal
        isOpen={isOptimizeModalOpen}
        onClose={() => setIsOptimizeModalOpen(false)}
        previewData={allocationPreviewData}
        onConfirmExecute={handleExecuteAllocation}
      />
    </div>
  );
}
export default App;
