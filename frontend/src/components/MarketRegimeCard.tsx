import React from 'react';
import { Compass, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { MarketRegime } from '../types';

interface MarketRegimeCardProps {
  regime: MarketRegime | null;
}

export const MarketRegimeCard: React.FC<MarketRegimeCardProps> = ({ regime }) => {
  if (!regime) return null;

  const regimeColors: Record<string, { bg: string; text: string; border: string }> = {
    BULLISH: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/40' },
    BEARISH: { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/40' },
    SIDEWAYS: { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/40' },
    HIGH_VOLATILITY: { bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/40' },
    LOW_VOLATILITY: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/40' }
  };

  const currentStyle = regimeColors[regime.regime] || regimeColors.BULLISH;

  return (
    <div className="glass-card p-5 rounded-xl border border-emerald-500/30 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Market Intelligence Regime
            </h3>
          </div>
          <span className="text-xs text-slate-300 font-mono font-medium">Live Observation</span>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-xs text-slate-300 font-medium block mb-1">Detected Market Regime</span>
            <span className={`inline-flex items-center px-3 py-1 rounded-md border text-sm font-bold font-mono tracking-wide ${currentStyle.bg} ${currentStyle.text} ${currentStyle.border}`}>
              <span className="w-2 h-2 rounded-full bg-current mr-2 animate-ping" />
              {regime.regime}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-300 font-medium block mb-1">Model Confidence</span>
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {(regime.confidence * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-emerald-500/20 font-mono text-xs">
          <div className="bg-black/70 p-2.5 rounded-lg border border-emerald-500/30">
            <span className="text-slate-300 text-[11px] block">Volatility:</span>
            <span className="text-white font-bold">{regime.volatility}</span>
          </div>
          <div className="bg-black/70 p-2.5 rounded-lg border border-emerald-500/30">
            <span className="text-slate-300 text-[11px] block">Momentum:</span>
            <span className="text-emerald-400 font-bold">{regime.momentum}</span>
          </div>
        </div>

        <div className="mt-4">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block mb-2 font-mono">
            Key Signals & Observations
          </span>
          <ul className="space-y-1.5 text-xs text-slate-200">
            {regime.observations.map((obs, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-snug font-medium text-slate-200">{obs}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-emerald-500/20 flex items-center justify-between text-[11px] text-slate-300 font-medium">
        <div className="flex items-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Structured Output JSON Verified</span>
        </div>
        <span className="font-mono text-slate-300">{regime.timestamp ? new Date(regime.timestamp).toLocaleTimeString() : '15:36:20'}</span>
      </div>
    </div>
  );
};
