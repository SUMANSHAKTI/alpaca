import React from 'react';
import { Activity, ShieldCheck, Zap, Layers, Cpu, AlertTriangle, ArrowUpRight } from 'lucide-react';

interface AICouncilPanelProps {
  symbol: string;
  regime: {
    regime: string;
    confidence: number;
  };
  strategy: {
    name: string;
    edge_score: number;
    status: string;
  };
  backtest: {
    passed: boolean;
    sharpe: number;
    drawdown: number;
  };
  adversary: {
    verdict: string;
    robustness: number;
  };
  riskApproved: boolean;
  position?: {
    symbol: string;
    qty: number;
    entry_price?: number;
    current_price?: number;
    market_value?: number;
    unrealized_pnl?: number;
    unrealized_pnl_pct?: number;
    stop_loss_price?: number;
  } | null;
}

const matchSymbol = (symA?: string, symB?: string): boolean => {
  if (!symA || !symB) return false;
  return symA.toUpperCase().replace(/[\/\-]/g, '') === symB.toUpperCase().replace(/[\/\-]/g, '');
};

export const AICouncilPanel: React.FC<AICouncilPanelProps> = ({
  symbol,
  regime,
  strategy,
  backtest,
  adversary,
  riskApproved,
  position
}) => {
  const getRegimeBadge = (r: string) => {
    switch (r.toUpperCase()) {
      case 'BULLISH':
        return { color: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40', icon: '🟢' };
      case 'BEARISH':
        return { color: 'text-rose-300 bg-rose-500/20 border-rose-500/40', icon: '🔴' };
      default:
        return { color: 'text-amber-300 bg-amber-500/20 border-amber-500/40', icon: '🟡' };
    }
  };

  const regBadge = getRegimeBadge(regime.regime);
  const isPosMatch = position && matchSymbol(position.symbol, symbol);

  return (
    <div className="w-full lg:w-80 glass-card bg-black/85 border border-emerald-500/30 rounded-2xl p-4 flex flex-col justify-between space-y-4 text-slate-100 shadow-xl backdrop-blur-md font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
        <div className="flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-emerald-400 animate-pulse" />
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">AI Council</h3>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
          7-Agent Guard
        </span>
      </div>

      {/* Council Members Stack */}
      <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1">
        
        {/* 1. Market Intelligence */}
        <div className="p-3 rounded-xl bg-black/70 border border-emerald-500/25 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              MARKET INTEL
            </span>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${regBadge.color}`}>
              {regBadge.icon} {regime.regime}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-200 mt-1">
            Confidence: <span className="text-emerald-400 font-bold">{Math.round(regime.confidence * 100)}%</span>
          </p>
        </div>

        {/* 2. Discovery Engine */}
        <div className="p-3 rounded-xl bg-black/70 border border-emerald-500/25 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              DISCOVERY
            </span>
            <span className="text-xs font-extrabold text-amber-300">
              Edge {strategy.edge_score}/100
            </span>
          </div>
          <p className="text-xs font-bold text-white truncate mt-1">
            {strategy.name}
          </p>
        </div>

        {/* 3. Backtest Engine */}
        <div className="p-3 rounded-xl bg-black/70 border border-emerald-500/25 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              BACKTEST
            </span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
              backtest.passed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            }`}>
              {backtest.passed ? 'PASS' : 'FAIL'}
            </span>
          </div>
          <div className="flex justify-between text-xs text-slate-200 mt-1 font-medium">
            <span>OOS Sharpe: <strong className="text-white font-bold">{backtest.sharpe}</strong></span>
            <span>Max DD: <strong className="text-rose-400 font-bold">{(backtest.drawdown * 100).toFixed(1)}%</strong></span>
          </div>
        </div>

        {/* 4. Adversary Agent */}
        <div className="p-3 rounded-xl bg-black/70 border border-emerald-500/25 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              ADVERSARY
            </span>
            <span className="text-xs font-extrabold text-emerald-300">
              Score {adversary.robustness}/100
            </span>
          </div>
          <p className="text-xs font-bold text-slate-200 mt-1">
            Verdict: <span className="text-emerald-400 font-extrabold">{adversary.verdict}</span>
          </p>
        </div>

        {/* 5. Deterministic Risk Agent */}
        <div className="p-3 rounded-xl bg-black/70 border border-emerald-500/25 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-emerald-400" />
              RISK GATE
            </span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
              riskApproved ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            }`}>
              {riskApproved ? 'APPROVED' : 'REJECTED'}
            </span>
          </div>
          <p className="text-xs text-slate-300 font-medium mt-1">
            10/10 Hard Safety Rules Verified
          </p>
        </div>

      </div>

      {/* 6. Active Position Card */}
      <div className="pt-3 border-t border-emerald-500/20">
        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2">
          Active Position ({symbol})
        </span>

        {isPosMatch ? (
          <div className="p-3 rounded-xl bg-black/90 border border-emerald-500/40 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-white flex items-center gap-1">
                {position.symbol} <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              </span>
              <span className="text-emerald-400 font-extrabold">
                ${(position.market_value || (position.qty * (position.current_price || position.entry_price || 0))).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-200 pt-1 border-t border-emerald-500/20 font-medium">
              <div>
                <span className="text-slate-400 block text-[10px]">Shares</span>
                <span className="font-bold text-white">{position.qty}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Unrealized P&L</span>
                <span className={`font-bold ${(position.unrealized_pnl || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {(position.unrealized_pnl || 0) >= 0 ? '+' : ''}${(position.unrealized_pnl || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {position.stop_loss_price && (
              <div className="text-[10px] text-slate-300 flex justify-between items-center pt-1 border-t border-emerald-500/20 font-medium">
                <span>Stop Loss:</span>
                <span className="text-amber-300 font-bold">${position.stop_loss_price.toFixed(2)}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-black/60 border border-emerald-500/20 text-center text-xs text-slate-300 font-mono font-medium py-4">
            NO ACTIVE POSITION
          </div>
        )}
      </div>
    </div>
  );
};
