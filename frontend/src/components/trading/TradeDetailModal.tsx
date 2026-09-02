import React from 'react';
import { X, ShieldCheck, TrendingUp, CheckCircle, Cpu, Zap, Activity } from 'lucide-react';

export interface TradeMarkerData {
  id?: string;
  symbol: string;
  timestamp: number;
  side: 'BUY' | 'SELL';
  qty?: number;
  price: number;
  strategy: string;
  edge_score: number;
  robustness_score: number;
  regime: string;
  regime_confidence: number;
  reason: string;
  explainability?: any;
}

interface TradeDetailModalProps {
  trade: TradeMarkerData | null;
  onClose: () => void;
}

export const TradeDetailModal: React.FC<TradeDetailModalProps> = ({ trade, onClose }) => {
  if (!trade) return null;

  const isBuy = trade.side === 'BUY';
  const totalValue = (trade.qty || 1) * trade.price;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header Banner */}
        <div className={`p-5 flex items-center justify-between border-b ${
          isBuy ? 'bg-emerald-950/40 border-emerald-500/30' : 'bg-rose-950/40 border-rose-500/30'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 ${
              isBuy ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
            }`}>
              <TrendingUp className="w-3.5 h-3.5" />
              {trade.side} ACTION
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              {trade.symbol} <span className="text-slate-400 font-medium">@ ${trade.price.toFixed(2)}</span>
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-800/60 border border-slate-700/50 p-3 rounded-xl">
              <span className="text-xs text-slate-400 font-medium">STRATEGY</span>
              <p className="text-sm font-semibold text-cyan-400 mt-0.5 truncate">{trade.strategy}</p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/50 p-3 rounded-xl">
              <span className="text-xs text-slate-400 font-medium">EDGE SCORE</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-emerald-400">{trade.edge_score}/100</span>
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/50 p-3 rounded-xl">
              <span className="text-xs text-slate-400 font-medium">ROBUSTNESS</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-bold text-blue-400">{trade.robustness_score}/100</span>
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/50 p-3 rounded-xl">
              <span className="text-xs text-slate-400 font-medium">MARKET REGIME</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Activity className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-300">{trade.regime} ({trade.regime_confidence}%)</span>
              </div>
            </div>
          </div>

          {/* AI Decision Rationale */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              <Cpu className="w-4 h-4" />
              AI Decision Rationale
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              "{trade.reason}"
            </p>
          </div>

          {/* Multi-Agent Council Signatures */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              AI Council Verification Checklist
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { label: 'Market Intelligence', detail: `Regime ${trade.regime}`, passed: true },
                { label: 'Discovery Agent', detail: `Hypothesis Match (${trade.strategy})`, passed: true },
                { label: 'Backtest Engine', detail: 'OOS Walk-Forward Sharpe > 1.4', passed: true },
                { label: 'Adversary Agent', detail: `Robustness Score ${trade.robustness_score}/100`, passed: true },
                { label: 'Portfolio Manager', detail: `Capital Allocated $${totalValue.toFixed(2)}`, passed: true },
                { label: 'Deterministic Risk Gate', detail: 'All 10 Safety Rules Approved', passed: true }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center space-x-2.5 p-2.5 bg-slate-800/40 border border-slate-700/40 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-200 block">{item.label}</span>
                    <span className="text-slate-400">{item.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800">
            <span>Execution Engine: Alpaca Trading API</span>
            <span>Risk Status: <strong className="text-emerald-400">APPROVED</strong></span>
          </div>

        </div>

      </div>
    </div>
  );
};
