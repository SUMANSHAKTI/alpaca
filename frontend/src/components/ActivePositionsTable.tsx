import React, { useState } from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';
import { Position } from '../types';

interface ActivePositionsTableProps {
  positions: Position[];
  onRefresh?: () => void;
}

export const ActivePositionsTable: React.FC<ActivePositionsTableProps> = ({ positions, onRefresh }) => {
  const [scalingSymbol, setScalingSymbol] = useState<string | null>(null);

  const handleScaleIn = async (symbol: string) => {
    setScalingSymbol(symbol);
    try {
      const host = window.location.hostname || '127.0.0.1';
      const res = await fetch(`http://${host}:8000/api/positions/${encodeURIComponent(symbol)}/scale-in`, {
        method: 'POST'
      });
      if (res.ok && onRefresh) {
        onRefresh();
      }
    } catch (e) {
      console.error('Error scaling in position:', e);
    } finally {
      setScalingSymbol(null);
    }
  };

  return (
    <div className="terminal-card p-5 rounded-xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Active Paper Trading Positions ({positions.length})
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">Alpaca Execution Engine</span>
      </div>

      {positions.length === 0 ? (
        <div className="py-8 text-center text-slate-500 font-mono text-xs">
          No active positions in current portfolio cycle.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Symbol</th>
                <th className="py-2.5 px-3">Side</th>
                <th className="py-2.5 px-3 text-right">Shares</th>
                <th className="py-2.5 px-3 text-right">Entry Price</th>
                <th className="py-2.5 px-3 text-right">Current</th>
                <th className="py-2.5 px-3 text-right">Market Value</th>
                <th className="py-2.5 px-3 text-right">Unrealized P&L</th>
                <th className="py-2.5 px-3">Strategy</th>
                <th className="py-2.5 px-3 text-right">Stop Loss</th>
                <th className="py-2.5 px-3 text-center">Lot Scale-In</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {positions.map((pos) => {
                const isPositive = pos.unrealized_pnl >= 0;
                const isScaling = scalingSymbol === pos.symbol;

                return (
                  <tr key={pos.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-3 font-bold text-white flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span>{pos.symbol}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase font-semibold">
                        {pos.side}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-200">{pos.qty}</td>
                    <td className="py-3 px-3 text-right text-slate-400">${pos.entry_price.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-200">${pos.current_price.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-200">
                      ${pos.market_value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`py-3 px-3 text-right font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      <div className="flex items-center justify-end space-x-1">
                        {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        <span>
                          {isPositive ? '+' : ''}${pos.unrealized_pnl.toFixed(2)} ({(pos.unrealized_pnl_pct * 100).toFixed(2)}%)
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-semibold">{pos.strategy_id}</td>
                    <td className="py-3 px-3 text-right text-amber-400 font-semibold">${pos.stop_loss_price.toFixed(2)}</td>
                    <td className="py-3 px-3 text-center">
                      {isPositive ? (
                        <button
                          onClick={() => handleScaleIn(pos.symbol)}
                          disabled={isScaling}
                          className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded font-bold text-[10px] uppercase transition-all flex items-center gap-1 mx-auto"
                        >
                          <Zap className="w-3 h-3 text-emerald-400" />
                          {isScaling ? 'Scaling...' : '+ Increase Lot'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-600 font-mono">Hold</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
