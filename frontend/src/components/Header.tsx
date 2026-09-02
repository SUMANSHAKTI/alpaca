import React from 'react';
import { Terminal, Activity, Layers, BarChart3, HelpCircle, Cpu, CandlestickChart, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRunDiscovery: () => void;
  isDiscovering: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onRunDiscovery,
  isDiscovering
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Terminal },
    { id: 'chart', label: 'Live Trading Chart', icon: CandlestickChart },
    { id: 'strategies', label: 'Strategy Lab', icon: Layers },
    { id: 'trades', label: 'Trade Explorer', icon: Activity },
    { id: 'analytics', label: 'P&L Analytics', icon: BarChart3 },
    { id: 'council', label: 'AI Council', icon: Cpu },
    { id: 'command', label: 'Command Center', icon: HelpCircle }
  ];

  return (
    <header className="border-b border-slate-800 bg-[#0C0F17]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Brand Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono text-xl font-bold shadow-lg shadow-cyan-500/10">
              AH
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-white font-mono">ALPHA HUNTER</h1>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  REAL-TIME QUANT LAB
                </span>
              </div>
              <p className="text-xs text-slate-400">Autonomous AI Trading Scientist • Alpaca Paper API</p>
            </div>
          </div>

          {/* Real-Time System Status Badges */}
          <div className="flex items-center space-x-2.5 flex-wrap text-[11px] font-mono">
            
            {/* 1. Market Data Status */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400">MARKET DATA:</span>
              <span className="text-emerald-400 font-bold">● LIVE</span>
            </div>

            {/* 2. Alpaca Account Status */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-slate-400">ALPACA ACCOUNT:</span>
              <span className="text-emerald-400 font-bold">● CONNECTED</span>
            </div>

            {/* 3. Paper Trading Status */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-slate-400">PAPER TRADING:</span>
              <span className="text-emerald-400 font-bold">● CONNECTED</span>
            </div>

            {/* 4. AI Engine Status */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-slate-400">AI ENGINE:</span>
              <span className="text-cyan-400 font-bold">● RUNNING</span>
            </div>

            {/* Strategy Discovery Action Button */}
            <button
              onClick={onRunDiscovery}
              disabled={isDiscovering}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-3.5 py-1 rounded-lg transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isDiscovering ? 'animate-spin' : ''}`} />
              <span>{isDiscovering ? 'Discovering Strategy...' : 'Run Discovery'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto mt-3 pt-2 border-t border-slate-800/60 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
