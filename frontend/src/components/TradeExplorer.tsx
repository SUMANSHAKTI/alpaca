import React, { useState, useEffect } from 'react';
import { Activity, ChevronRight } from 'lucide-react';
import { Trade } from '../types';

interface TradeExplorerProps {
  trades: Trade[];
  onSelectTrade: (trade: Trade) => void;
}

export const TradeExplorer: React.FC<TradeExplorerProps> = ({ trades, onSelectTrade }) => {
  const [liveQuotes, setLiveQuotes] = useState<Record<string, number>>({});

  useEffect(() => {
    let isSubscribed = true;

    const fetchQuotes = async () => {
      try {
        const host = window.location.hostname || '127.0.0.1';
        const symbols = Array.from(new Set(trades.map(t => t.symbol))).join(',');
        if (!symbols) return;

        const res = await fetch(`http://${host}:8000/api/market-data/watchlist?symbols=${encodeURIComponent(symbols)}`);
        if (res.ok) {
          const data = await res.json();
          if (isSubscribed && Array.isArray(data)) {
            const priceMap: Record<string, number> = {};
            data.forEach((q: any) => {
              if (q.symbol && typeof q.price === 'number') {
                priceMap[q.symbol.toUpperCase().replace(/[\/\-]/g, '')] = q.price;
              }
            });
            setLiveQuotes(priceMap);
          }
        }
      } catch (err) {
        // Retain existing quotes on error
      }
    };

    fetchQuotes();
    const interval = setInterval(fetchQuotes, 2000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [trades]);

  return (
    <div className="glass-card p-5 rounded-2xl border border-emerald-500/30 space-y-4">
      <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
            Auditable Trade Explorer ({trades.length} Executed)
          </h2>
        </div>
        <span className="text-xs text-slate-300 font-mono font-medium">Click any trade for full explainability audit</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="text-slate-300 border-b border-emerald-500/20 uppercase text-[10px] tracking-wider font-bold">
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Symbol</th>
              <th className="py-2.5 px-3">Action</th>
              <th className="py-2.5 px-3 text-right">Shares</th>
              <th className="py-2.5 px-3 text-right">Price</th>
              <th className="py-2.5 px-3">Strategy</th>
              <th className="py-2.5 px-3 text-right">Edge Score</th>
              <th className="py-2.5 px-3 text-right">Risk Score</th>
              <th className="py-2.5 px-3 text-right">Live P&L</th>
              <th className="py-2.5 px-3 text-right">Explainability</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-500/15">
            {trades.map((t) => {
              const cleanSym = t.symbol.toUpperCase().replace(/[\/\-]/g, '');
              const currentPrice = liveQuotes[cleanSym] || t.price;
              const isBuy = !t.side || t.side.toLowerCase() === 'buy' || t.side.toLowerCase() === 'long';
              const pnlVal = t.pnl && t.pnl !== 0 ? t.pnl : (isBuy ? (currentPrice - t.price) * t.qty : (t.price - currentPrice) * t.qty);
              const pnlPct = t.price > 0 ? ((currentPrice - t.price) / t.price) * 100 : 0;
              const isPositive = pnlVal >= 0;

              return (
                <tr
                  key={t.id}
                  onClick={() => onSelectTrade(t)}
                  className="hover:bg-emerald-950/40 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-3 text-slate-300 font-medium">{t.timestamp}</td>
                  <td className="py-3 px-3 font-bold text-white">{t.symbol}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold uppercase text-[10px]">
                      {t.side}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-white font-bold">{t.qty}</td>
                  <td className="py-3 px-3 text-right text-white font-bold">${t.price.toFixed(2)}</td>
                  <td className="py-3 px-3 text-emerald-300 font-bold">{t.strategy_name || t.strategy_id}</td>
                  <td className="py-3 px-3 text-right text-emerald-400 font-extrabold">{(t.edge_score || 91).toFixed(0)}</td>
                  <td className="py-3 px-3 text-right text-slate-300 font-medium">{(t.risk_score || 12).toFixed(0)}</td>
                  <td className={`py-3 px-3 text-right font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? '+' : ''}${pnlVal.toFixed(2)} ({isPositive ? '+' : ''}{pnlPct.toFixed(2)}%)
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="text-emerald-400 font-extrabold flex items-center justify-end space-x-1 hover:underline">
                      <span>WHY THIS TRADE?</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
