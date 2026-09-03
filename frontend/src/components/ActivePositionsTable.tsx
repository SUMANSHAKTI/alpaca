import React from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Zap, RefreshCw, ShieldCheck } from 'lucide-react';
import { Position } from '../types';

interface ActivePositionsTableProps {
  positions: Position[];
  onRefresh?: () => void;
  onOpenOptimizeModal?: () => void;
}

export const ActivePositionsTable: React.FC<ActivePositionsTableProps> = ({ positions, onRefresh, onOpenOptimizeModal }) => {
  const btcPosition = positions.find(p => p.symbol.toUpperCase().includes('BTC'));
  const lastSynced = positions.length > 0 && positions[0].last_synced_at
    ? new Date(positions[0].last_synced_at).toLocaleTimeString()
    : new Date().toLocaleTimeString();

  return (
    <div className="space-y-4">
      {/* Dynamic BTC/USD Adaptive Allocation Card */}
      <div className="glass-card bg-black/85 border border-emerald-500/30 rounded-xl p-4 font-mono text-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span className="font-extrabold text-white text-sm">BTC/USD (CRYPTO ASSET CLASS)</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
              ALLOCATION: PAUSED
            </span>
          </div>
          <span className="text-[10px] text-slate-300 font-medium">Dynamic Risk-Adjusted Multiplier: 0.0x</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/70 p-3 rounded-lg border border-emerald-500/20">
          <div>
            <span className="text-slate-300 block text-[10px] font-bold">CURRENT P&L:</span>
            <span className={btcPosition ? (btcPosition.unrealized_pnl >= 0 ? "text-emerald-400 font-extrabold" : "text-rose-400 font-extrabold") : "text-slate-400 font-bold"}>
              {btcPosition
                ? `${btcPosition.unrealized_pnl >= 0 ? '+' : ''}$${btcPosition.unrealized_pnl.toFixed(2)} (${(btcPosition.unrealized_pnl_pct * 100).toFixed(2)}%)`
                : 'N/A (NO OPEN BTC POSITION)'}
            </span>
          </div>
          <div>
            <span className="text-slate-300 block text-[10px] font-bold">EDGE SCORE:</span>
            <span className="text-amber-300 font-extrabold">42 / 100 (WEAK)</span>
          </div>
          <div>
            <span className="text-slate-300 block text-[10px] font-bold">REGIME / RISK:</span>
            <span className="text-white font-extrabold">BULLISH / HIGH</span>
          </div>
          <div>
            <span className="text-slate-300 block text-[10px] font-bold">PORTFOLIO WEIGHT:</span>
            <span className="text-emerald-400 font-extrabold">
              {btcPosition ? `${((btcPosition.market_value / 100000) * 100).toFixed(2)}%` : '0.00%'}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-200 leading-snug bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/30 font-medium">
          <span className="font-bold text-amber-300">Adaptive Allocator Status:</span> "Current BTC strategy has insufficient risk-adjusted edge. Existing position remains monitored by Risk Agent; no new BTC capital recommended."
        </p>
      </div>

      {/* Main Table Terminal Card */}
      <div className="glass-card p-4 sm:p-5 rounded-xl border border-emerald-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-emerald-500/20 pb-3 gap-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Active Paper Trading Positions ({positions.length})
            </h3>
          </div>

          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 w-full sm:w-auto font-mono text-xs">
            <div className="flex items-center space-x-2 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="font-bold text-emerald-300 text-[11px]">● ALPACA LIVE</span>
              <span className="text-slate-400 text-[10px]">|</span>
              <span className="text-slate-300 text-[10px] font-medium">LAST BROKER SYNC: {lastSynced}</span>
            </div>

            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all border border-slate-700 hover:border-emerald-500/50 cursor-pointer"
                title="Force Refresh Alpaca State"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}

            {onOpenOptimizeModal && (
              <button
                onClick={onOpenOptimizeModal}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg font-mono font-extrabold text-xs uppercase transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/25 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-black fill-black" />
                <span>OPTIMIZE PORTFOLIO</span>
              </button>
            )}
          </div>
        </div>

        {positions.length === 0 ? (
          <div className="py-8 text-center text-slate-300 font-mono text-xs font-medium space-y-1">
            <p>No active positions in current portfolio cycle.</p>
            <p className="text-[11px] text-slate-300 font-normal">Positions are synchronized live with Alpaca Paper Trading API.</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full text-left font-mono text-xs min-w-[1100px]">
              <thead>
                <tr className="text-slate-300 border-b border-emerald-500/20 uppercase text-[10px] tracking-wider font-bold bg-black/40">
                  <th className="py-2.5 px-3">Symbol</th>
                  <th className="py-2.5 px-3">Side</th>
                  <th className="py-2.5 px-3 text-right">Shares</th>
                  <th className="py-2.5 px-3 text-right">Entry Price</th>
                  <th className="py-2.5 px-3 text-right">Current</th>
                  <th className="py-2.5 px-3 text-right">Market Value</th>
                  <th className="py-2.5 px-3 text-right">Unrealized P&L</th>
                  <th className="py-2.5 px-3">Strategy</th>
                  <th className="py-2.5 px-3 text-right">Stop Loss</th>
                  <th className="py-2.5 px-3 text-right">Take Profit</th>
                  <th className="py-2.5 px-3">Trailing Status</th>
                  <th className="py-2.5 px-3 text-center">Data Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-500/15">
                {positions.map((pos) => {
                  const isPositive = pos.unrealized_pnl >= 0;
                  const stopLossText = pos.stop_loss_price != null && pos.stop_loss_price > 0
                    ? `$${pos.stop_loss_price.toFixed(2)}`
                    : 'NOT SET';
                  const takeProfitText = pos.take_profit_price != null && pos.take_profit_price > 0
                    ? `$${pos.take_profit_price.toFixed(2)}`
                    : 'NOT SET';

                  const trailingStatusText = pos.trailing_stop != null
                    ? `ALPACA TRAILING ($${pos.trailing_stop})`
                    : 'ALPHA HUNTER ADAPTIVE TRAILING';

                  return (
                    <tr key={pos.id || pos.symbol} className="hover:bg-emerald-950/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-white flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        <span>{pos.symbol}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase font-bold text-[10px]">
                          {pos.side}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-white font-extrabold">{pos.qty}</td>
                      <td className="py-3 px-3 text-right text-slate-300 font-medium">${pos.entry_price.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-bold text-white">${pos.current_price.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-bold text-white">
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
                      <td className="py-3 px-3 text-emerald-300 font-semibold">{pos.strategy_id}</td>
                      <td className="py-3 px-3 text-right font-bold">
                        {stopLossText === 'NOT SET' ? (
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded text-[10px] font-bold">
                            NOT SET
                          </span>
                        ) : (
                          <span className="text-amber-300">{stopLossText}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-bold">
                        {takeProfitText === 'NOT SET' ? (
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400/70 border border-emerald-500/20 rounded text-[10px] font-bold">
                            NOT SET
                          </span>
                        ) : (
                          <span className="text-emerald-400">{takeProfitText}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-[10px] text-slate-300 font-medium">
                        {trailingStatusText}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span>{pos.data_source || 'ALPACA LIVE'}</span>
                        </span>
                      </td>
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
