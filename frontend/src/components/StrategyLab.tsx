import React, { useState } from 'react';
import { Shield, Skull, AlertCircle, CheckCircle2, ChevronRight, Sparkles, Filter } from 'lucide-react';
import { Strategy } from '../types';

interface StrategyLabProps {
  strategies: Strategy[];
  onSelectStrategy: (strat: Strategy) => void;
  onRunDiscovery: () => void;
  isDiscovering: boolean;
}

export const StrategyLab: React.FC<StrategyLabProps> = ({
  strategies,
  onSelectStrategy,
  onRunDiscovery,
  isDiscovering
}) => {
  const [filter, setFilter] = useState<'ALL' | 'ALIVE' | 'WATCH' | 'KILLED'>('ALL');

  const filteredStrategies = strategies.filter((s) => {
    if (filter === 'ALL') return true;
    if (filter === 'KILLED') return s.status === 'KILLED' || s.status === 'REJECTED';
    return s.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ALIVE':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
            🟢 ALIVE
          </span>
        );
      case 'WATCH':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5" />
            🟡 WATCH
          </span>
        );
      case 'KILLED':
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-semibold font-mono">
            <Skull className="w-3 h-3 mr-1" />
            🔴 {status}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-bold text-white font-mono flex items-center space-x-2">
            <span>Strategy Laboratory & Darwinism Engine</span>
            <span className="text-xs font-normal text-slate-400">({strategies.length} Discovered)</span>
          </h2>
          <p className="text-xs text-slate-400">Only strategies with surviving quantitative edge receive paper capital allocation</p>
        </div>

        <div className="flex items-center space-x-2 flex-wrap">
          {/* Filters */}
          <div className="flex items-center space-x-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
            {(['ALL', 'ALIVE', 'WATCH', 'KILLED'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all ${
                  filter === f
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={onRunDiscovery}
            disabled={isDiscovering}
            className="flex items-center space-x-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-3 py-1.5 rounded-lg text-xs transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover Strategy</span>
          </button>
        </div>
      </div>

      {/* Strategy Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStrategies.map((strat) => {
          const isKilled = strat.status === 'KILLED' || strat.status === 'REJECTED';
          return (
            <div
              key={strat.strategy_id}
              onClick={() => onSelectStrategy(strat)}
              className={`terminal-card p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between hover:border-cyan-500/40 ${
                isKilled ? 'opacity-85 border-rose-500/20 bg-slate-950/60' : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                      {strat.strategy_id}
                    </span>
                    <h3 className="text-sm font-bold text-white font-mono mt-0.5 line-clamp-1">
                      {strat.name}
                    </h3>
                  </div>
                  {getStatusBadge(strat.status)}
                </div>

                <p className="text-xs text-slate-400 mt-2 line-clamp-2 italic">
                  "{strat.hypothesis}"
                </p>

                {/* Edge Score & Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 font-mono text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Edge Score</span>
                    <span className={`text-base font-bold ${
                      strat.edge_score >= 75 ? 'text-emerald-400' : strat.edge_score >= 50 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {strat.edge_score.toFixed(0)} <span className="text-xs font-normal text-slate-400">/ 100</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Capital Allocation</span>
                    <span className="text-base font-bold text-cyan-400">
                      {(strat.allocation_pct * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Regime Target:</span>
                  <span className="text-slate-200 font-semibold">{strat.preferred_regime}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                {isKilled ? (
                  <span className="text-rose-400 font-mono flex items-center space-x-1">
                    <Skull className="w-3.5 h-3.5" />
                    <span>Why was this killed?</span>
                  </span>
                ) : (
                  <span className="text-slate-400">Out-of-sample backtest verified</span>
                )}

                <span className="text-cyan-400 flex items-center space-x-1 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Inspect</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
