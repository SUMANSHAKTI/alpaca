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

/*
 * Dashboard now uses PortfolioPerformance instead of the
 * heavy historical TradingView market-data chart.
 *
 * The detailed LiveTradingChart is still available from
 * the dedicated Chart tab below.
 */
import { PortfolioPerformance } from './components/PortfolioPerformance';
import { LiveTradingChart } from './components/trading/LiveTradingChart';

import { Watchlist } from './components/Watchlist';
import {
  AllocationModal,
  AllocationPreviewData,
  AllocationItem
} from './components/AllocationModal';

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
  // ------------------------------------------------------------
  // Navigation
  // ------------------------------------------------------------

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // ------------------------------------------------------------
  // Strategy / Trade state
  // ------------------------------------------------------------

  const [isDiscovering, setIsDiscovering] = useState<boolean>(false);

  const [selectedStrategy, setSelectedStrategy] =
    useState<Strategy | null>(null);

  const [selectedTrade, setSelectedTrade] =
    useState<Trade | null>(null);

  // ------------------------------------------------------------
  // Market state
  // ------------------------------------------------------------

  const [activeSymbol, setActiveSymbol] =
    useState<string>('NVDA');

  // ------------------------------------------------------------
  // Real-time backend data
  // ------------------------------------------------------------

  const [portfolio, setPortfolio] =
    useState<PortfolioSummaryData | null>(null);

  const [marketRegime, setMarketRegime] =
    useState<MarketRegime | null>(null);

  const [strategies, setStrategies] =
    useState<Strategy[]>([]);

  const [positions, setPositions] =
    useState<Position[]>([]);

  const [trades, setTrades] =
    useState<Trade[]>([]);

  const [agentEvents, setAgentEvents] =
    useState<AgentEvent[]>([]);

  // ------------------------------------------------------------
  // Allocation modal
  // ------------------------------------------------------------

  const [isOptimizeModalOpen, setIsOptimizeModalOpen] =
    useState<boolean>(false);

  const [allocationPreviewData, setAllocationPreviewData] =
    useState<AllocationPreviewData | null>(null);

  // ------------------------------------------------------------
  // Fetch current positions
  // ------------------------------------------------------------

  const fetchPositions = async () => {
    try {
      const res = await fetch(getApiUrl('/positions'));

      if (res.ok) {
        const data = await res.json();

        if (Array.isArray(data)) {
          setPositions(data);
        }
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  };

  // ------------------------------------------------------------
  // Open portfolio optimization modal
  // ------------------------------------------------------------

  const handleOpenOptimizeModal = async () => {
    try {
      let res = await fetch(
        getApiUrl('/portfolio/optimize-preview'),
        {
          method: 'POST'
        }
      );

      /*
       * Keep local /api fallback for development environments.
       */
      if (!res.ok) {
        res = await fetch(
          '/api/portfolio/optimize-preview',
          {
            method: 'POST'
          }
        );
      }

      if (res.ok) {
        const data = await res.json();

        setAllocationPreviewData(data);
        setIsOptimizeModalOpen(true);
      }
    } catch (error) {
      console.error(
        'Error fetching optimization preview:',
        error
      );
    }
  };

  // ------------------------------------------------------------
  // Execute portfolio allocation
  // ------------------------------------------------------------

  const handleExecuteAllocation = async (
    recommendations: AllocationItem[]
  ) => {
    try {
      let res = await fetch(
        getApiUrl('/portfolio/execute-allocation'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            recommendations
          })
        }
      );

      /*
       * Keep local /api fallback for development environments.
       */
      if (!res.ok) {
        res = await fetch(
          '/api/portfolio/execute-allocation',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              recommendations
            })
          }
        );
      }

      if (res.ok) {
        await fetchPositions();
      }
    } catch (error) {
      console.error(
        'Error executing allocation:',
        error
      );
    }
  };

  // ------------------------------------------------------------
  // Fetch backend data
  // ------------------------------------------------------------

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        /*
         * Fetch the dashboard's main backend data in parallel.
         *
         * IMPORTANT:
         * Portfolio performance is NOT fetched here.
         * PortfolioPerformance handles its own history request.
         *
         * The heavy historical market-bars request is therefore
         * no longer part of the main dashboard load.
         */

        const [
          portRes,
          regRes,
          stratRes,
          posRes,
          ordRes,
          evtRes
        ] = await Promise.all([
          fetch(getApiUrl('/portfolio')).catch(() =>
            fetch('/api/portfolio')
          ),

          fetch(getApiUrl('/market-regime')).catch(() =>
            fetch('/api/market-regime')
          ),

          fetch(getApiUrl('/strategies')).catch(() =>
            fetch('/api/strategies')
          ),

          fetch(getApiUrl('/positions')).catch(() =>
            fetch('/api/positions')
          ),

          fetch(getApiUrl('/orders')).catch(() =>
            fetch('/api/orders')
          ),

          fetch(getApiUrl('/agent-events')).catch(() =>
            fetch('/api/agent-events')
          )
        ]);

        if (!isMounted) return;

        if (portRes.ok) {
          const data = await portRes.json();
          setPortfolio(data);
        }

        if (regRes.ok) {
          const data = await regRes.json();
          setMarketRegime(data);
        }

        if (stratRes.ok) {
          const data = await stratRes.json();

          if (Array.isArray(data)) {
            setStrategies(data);
          }
        }

        if (posRes.ok) {
          const data = await posRes.json();

          if (Array.isArray(data)) {
            setPositions(data);
          }
        }

        if (ordRes.ok) {
          const data = await ordRes.json();

          if (Array.isArray(data)) {
            setTrades(data);
          }
        }

        if (evtRes.ok) {
          const data = await evtRes.json();

          if (Array.isArray(data)) {
            setAgentEvents(data);
          }
        }
      } catch (error) {
        console.error(
          'Error fetching real-time data from backend:',
          error
        );
      }
    };

    /*
     * Initial load.
     */
    fetchData();

    /*
     * Keep dashboard data fresh.
     *
     * 5 seconds is sufficient for the dashboard and avoids
     * excessive requests compared with the previous 3-second
     * polling interval.
     */
    const interval = setInterval(fetchData, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // ------------------------------------------------------------
  // AI Strategy Discovery
  // ------------------------------------------------------------

  const handleRunDiscovery = async () => {
    setIsDiscovering(true);

    try {
      const res = await fetch(
        getApiUrl('/discovery/run'),
        {
          method: 'POST'
        }
      );

      if (res.ok) {
        const data = await res.json();

        if (data.result?.strategy) {
          setStrategies((previous) => [
            data.result.strategy,
            ...previous
          ]);
        }
      }
    } catch (error) {
      console.error(
        'Error running strategy discovery:',
        error
      );
    } finally {
      setIsDiscovering(false);
    }
  };

  // ------------------------------------------------------------
  // Autonomous trading state
  // ------------------------------------------------------------

  const [autonomousActive, setAutonomousActive] =
    useState<boolean>(true);

  // ------------------------------------------------------------
  // Toggle autonomous trading
  // ------------------------------------------------------------

  const handleToggleAutonomous = async () => {
    const nextState = !autonomousActive;

    /*
     * Optimistic UI update.
     */
    setAutonomousActive(nextState);

    try {
      await fetch(
        getApiUrl('/autonomous/toggle'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            enabled: nextState
          })
        }
      );
    } catch (error) {
      console.error(
        'Error toggling autonomous trading:',
        error
      );

      /*
       * Keep optimistic state as the existing application
       * behavior does.
       */
    }
  };

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#090B0E] text-slate-100 font-sans pb-12">

      {/* ======================================================
          HEADER
      ======================================================= */}

      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRunDiscovery={handleRunDiscovery}
        isDiscovering={isDiscovering}
        autonomousActive={autonomousActive}
        onToggleAutonomous={handleToggleAutonomous}
      />

      {/* ======================================================
          MAIN CONTAINER
      ======================================================= */}

      <main className="max-w-[1700px] mx-auto px-4 sm:px-6 pt-6 space-y-6">

        {/* ====================================================
            LANDING PAGE
        ===================================================== */}

        {activeTab === 'landing' ? (
          <LandingPage
            onEnterLab={() =>
              setActiveTab('dashboard')
            }
            onViewStrategies={() =>
              setActiveTab('strategies')
            }
          />
        ) : (
          <>
            {/* ==================================================
                TOP PORTFOLIO KPI STRIP
            =================================================== */}

            <PortfolioSummary data={portfolio} />

            {/* ==================================================
                TAB 1 — MAIN DASHBOARD
            =================================================== */}

            {activeTab === 'dashboard' && (
              <div className="space-y-6">

                {/* ------------------------------------------------
                    Main Dashboard Grid

                    Watchlist LEFT
                    Portfolio Performance CENTER/RIGHT

                    The old LiveTradingChart has intentionally
                    been removed from this initial dashboard view.
                ------------------------------------------------- */}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                  {/* LEFT — WATCHLIST */}

                  <div className="lg:col-span-3">
                    <Watchlist
                      selectedSymbol={activeSymbol}
                      onSelectSymbol={(symbol) =>
                        setActiveSymbol(symbol)
                      }
                    />
                  </div>

                  {/* CENTER / RIGHT — PORTFOLIO PERFORMANCE */}

                  <div className="lg:col-span-9">
                    <PortfolioPerformance />
                  </div>

                </div>

                {/* ------------------------------------------------
                    MARKET REGIME + AGENT ACTIVITY
                ------------------------------------------------- */}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  <div className="lg:col-span-1">
                    <MarketRegimeCard
                      regime={marketRegime}
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <AgentActivityFeed
                      events={agentEvents}
                    />
                  </div>

                </div>

                {/* ------------------------------------------------
                    STRATEGY LAB
                ------------------------------------------------- */}

                <StrategyLab
                  strategies={strategies}
                  onSelectStrategy={(strategy) =>
                    setSelectedStrategy(strategy)
                  }
                  onRunDiscovery={handleRunDiscovery}
                  isDiscovering={isDiscovering}
                />

                {/* ------------------------------------------------
                    ACTIVE POSITIONS
                ------------------------------------------------- */}

                <ActivePositionsTable
                  positions={positions}
                  onRefresh={fetchPositions}
                  onOpenOptimizeModal={
                    handleOpenOptimizeModal
                  }
                />

              </div>
            )}

            {/* ==================================================
                TAB 2 — DEDICATED LIVE TRADING CHART
            =================================================== */}

            {activeTab === 'chart' && (
              <div className="space-y-6">

                <LiveTradingChart
                  symbol={activeSymbol}
                  initialSymbol={activeSymbol}
                  initialTimeframe="1m"
                  onSymbolChange={(symbol) =>
                    setActiveSymbol(symbol)
                  }
                />

              </div>
            )}

            {/* ==================================================
                TAB 3 — STRATEGY LAB
            =================================================== */}

            {activeTab === 'strategies' && (
              <StrategyLab
                strategies={strategies}
                onSelectStrategy={(strategy) =>
                  setSelectedStrategy(strategy)
                }
                onRunDiscovery={handleRunDiscovery}
                isDiscovering={isDiscovering}
              />
            )}

            {/* ==================================================
                TAB 4 — TRADE EXPLORER
            =================================================== */}

            {activeTab === 'trades' && (
              <TradeExplorer
                trades={trades}
                onSelectTrade={(trade) =>
                  setSelectedTrade(trade)
                }
              />
            )}

            {/* ==================================================
                TAB 5 — P&L & ANALYTICS
            =================================================== */}

            {activeTab === 'analytics' && (
              <PnLAnalytics />
            )}

            {/* ==================================================
                TAB 6 — AI COUNCIL
            =================================================== */}

            {activeTab === 'council' && (
              <AICouncilView />
            )}

            {/* ==================================================
                TAB 7 — COMMAND CENTER
            =================================================== */}

            {activeTab === 'command' && (
              <CommandCenter
                onRunDiscovery={handleRunDiscovery}
              />
            )}

          </>
        )}

      </main>

      {/* ======================================================
          MODALS
      ======================================================= */}

      <StrategyDetailModal
        strategy={selectedStrategy}
        onClose={() =>
          setSelectedStrategy(null)
        }
      />

      <ExplainabilityModal
        trade={selectedTrade}
        onClose={() =>
          setSelectedTrade(null)
        }
      />

      <AllocationModal
        isOpen={isOptimizeModalOpen}
        onClose={() =>
          setIsOptimizeModalOpen(false)
        }
        previewData={allocationPreviewData}
        onConfirmExecute={
          handleExecuteAllocation
        }
      />

    </div>
  );
}

export default App;
