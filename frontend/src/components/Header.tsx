import React from 'react';
import { Terminal, Activity, Layers, BarChart3, HelpCircle, Cpu, CandlestickChart, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRunDiscovery: () => void;
  isDiscovering: boolean;
  autonomousActive?: boolean;
  onToggleAutonomous?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onRunDiscovery,
  isDiscovering,
  autonomousActive = true,
  onToggleAutonomous
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
    <header className="border-b border-emerald-500/30 bg-[#030805]/95 backdrop-blur-md sticky top-0 z-40 shadow-lg shadow-black/50">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Brand Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-950 to-black border border-emerald-500/50 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Cpu className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#030805] shadow-sm animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-lg font-extrabold tracking-wide text-emerald-400 font-mono">ALPHA HUNTER</h1>
                <span className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/50 shadow-sm">
                  REAL-TIME QUANT LAB
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">Autonomous AI Trading Scientist • Alpaca Paper API</p>
            </div>
          </div>

          {/* Real-Time System Status Badges */}
          <div className="flex items-center space-x-2.5 flex-wrap text-[11px] font-mono">
            
            {/* 1. Market Data Status */}
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/80 border border-emerald-500/40 text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400">MARKET DATA:</span>
              <span className="text-emerald-400 font-bold">● LIVE</span>
            </div>

            {/* 2. Alpaca Account Status */}
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/80 border border-emerald-500/40 text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-slate-400">ALPACA ACCOUNT:</span>
              <span className="text-emerald-400 font-bold">● CONNECTED</span>
            </div>

            {/* 3. Paper Trading Status */}
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/80 border border-emerald-500/40 text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-slate-400">PAPER TRADING:</span>
              <span className="text-emerald-400 font-bold">● CONNECTED</span>
            </div>

            {/* 4. AI Engine / Autonomous Trading Status & Toggle */}
            <button
              onClick={onToggleAutonomous}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border font-bold transition-all cursor-pointer shadow-md ${
                autonomousActive
                  ? 'bg-black/80 border-emerald-500/60 text-emerald-300 hover:border-emerald-400 shadow-emerald-500/15'
                  : 'bg-black/80 border-amber-500/50 text-amber-400 hover:border-amber-400 shadow-amber-500/15'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${autonomousActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <span className="text-slate-400">AI ENGINE:</span>
              <span>{autonomousActive ? '● RUNNING' : 'PAUSED'}</span>
            </button>

            {/* Strategy Discovery Action Button */}
            <button
              onClick={onRunDiscovery}
              disabled={isDiscovering}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-black font-bold px-4 py-1.5 rounded-full transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 text-xs ml-1"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isDiscovering ? 'animate-spin' : ''}`} />
              <span>{isDiscovering ? 'Discovering...' : 'Run Discovery'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto mt-3 pt-2 border-t border-emerald-500/20 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-bold shadow-md shadow-emerald-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-emerald-950/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
