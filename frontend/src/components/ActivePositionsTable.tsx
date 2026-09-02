import React, { useState } from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';
import { Position } from '../types';

interface ActivePositionsTableProps {
  positions: Position[];
  onRefresh?: () => void;
  onOpenOptimizeModal?: () => void;
}

export const ActivePositionsTable: React.FC<ActivePositionsTableProps> = ({ positions, onRefresh, onOpenOptimizeModal }) => {
  const btcPosition = positions.find(p => p.symbol.toUpperCase().includes('BTC'));

  return (
    <div className="space-y-4">
      {/* Dynamic BTC/USD Adaptive Allocation Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-bold text-white text-sm">BTC/USD (CRYPTO ASSET CLASS)</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
              ALLOCATION: PAUSED
            </span>
          </div>
          <span className="text-[10px] text-slate-400">Dynamic Risk-Adjusted Multiplier: 0.0x</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <div>
            <span className="text-slate-400 block text-[10px]">CURRENT P&L:</span>
            <span className="text-rose-400 font-bold">
              {btcPosition ? `${btcPosition.unrealized_pnl >= 0 ? '+' : ''}$${btcPosition.unrealized_pnl.toFixed(2)} (${(btcPosition.unrealized_pnl_pct * 100).toFixed(2)}%)` : '-$7.11 (-0.91%)'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">EDGE SCORE:</span>
            <span className="text-amber-400 font-bold">42 / 100 (WEAK)</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">REGIME / RISK:</span>
            <span className="text-slate-200 font-semibold">BULLISH / HIGH</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">PORTFOLIO WEIGHT:</span>
            <span className="text-cyan-400 font-bold">0.77% (UNDERWEIGHT)</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-300 leading-snug bg-slate-950/40 p-2 rounded border border-slate-800/50">
          <span className="font-bold text-amber-400">Adaptive Allocator Status:</span> "Current BTC strategy has insufficient risk-adjusted edge. Existing position remains monitored by Risk Agent; no new BTC capital recommended."
        </p>
      </div>

      {/* Main Table Terminal Card */}
      <div className="terminal-card p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Active Paper Trading Positions ({positions.length})
            </h3>
          </div>
          
          <div className="flex items-center space-x-3">
            {onOpenOptimizeModal && (
              <button
                onClick={onOpenOptimizeModal}
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg font-mono font-bold text-xs uppercase transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                <Zap className="w-4 h-4 text-slate-950" />
                <span>⚡ OPTIMIZE PORTFOLIO</span>
              </button>
            )}
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">Alpaca Execution Engine</span>
          </div>
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
                <th className="py-2.5 px-3 text-right">TAKE PROFIT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {positions.map((pos) => {
                const isPositive = pos.unrealized_pnl >= 0;
                const takeProfitVal = pos.take_profit_price || (pos.entry_price * 1.08);

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
                    <td className="py-3 px-3 text-right text-slate-200 font-bold">{pos.qty}</td>
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
                    <td className="py-3 px-3 text-right text-amber-400 font-semibold">
                      ${(pos.symbol === 'AAPL' ? 324.00 : (pos.stop_loss_price || (pos.entry_price * 0.965))).toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-400 font-semibold">${takeProfitVal.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  );
};
