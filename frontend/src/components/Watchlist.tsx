import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Plus, Trash2, Search, Activity } from 'lucide-react';
import { getApiUrl } from '../config';

export interface WatchlistItem {
  symbol: string;
  price: number;
  change: number;
  change_pct: number;
  volume: number;
  data_source?: string;
  error?: string;
}

interface WatchlistProps {
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
}

export const Watchlist: React.FC<WatchlistProps> = ({ selectedSymbol, onSelectSymbol }) => {
  const [items, setItems] = useState<WatchlistItem[]>([
    { symbol: 'BTC/USD', price: 77245.44, change: -424.85, change_pct: -0.55, volume: 28000000 },
    { symbol: 'NVDA', price: 226.91, change: 3.63, change_pct: 1.60, volume: 48500000 },
    { symbol: 'AAPL', price: 325.38, change: 2.70, change_pct: 0.83, volume: 38200000 },
    { symbol: 'MSFT', price: 494.00, change: -2.37, change_pct: -0.48, volume: 22100000 },
    { symbol: 'AMZN', price: 254.99, change: 1.30, change_pct: 0.51, volume: 28400000 },
    { symbol: 'META', price: 593.01, change: 9.67, change_pct: 1.63, volume: 14800000 },
    { symbol: 'TSLA', price: 353.27, change: -4.13, change_pct: -1.17, volume: 65400000 },
    { symbol: 'SPY', price: 763.82, change: 2.90, change_pct: 0.38, volume: 55000000 },
    { symbol: 'QQQ', price: 482.15, change: 3.45, change_pct: 0.72, volume: 42000000 }
  ]);
  const [newSymbol, setNewSymbol] = useState('');

  const symbolsQuery = items.map(i => i.symbol).join(',');

  // Fetch real-time Watchlist quotes from backend API
  useEffect(() => {
    let isSubscribed = true;
    const fetchWatchlist = async () => {
      try {
        const res = await fetch(getApiUrl(`/market-data/watchlist?symbols=${encodeURIComponent(symbolsQuery)}`));
        if (res.ok) {
          const data = await res.json();
          if (isSubscribed && Array.isArray(data) && data.length > 0) {
            setItems(data);
          }
        }
      } catch (err) {
        // Retain active real-time state
      }
    };

    fetchWatchlist();
    const interval = setInterval(fetchWatchlist, 3000); // 3 sec refresh
    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [symbolsQuery]);

  const handleAddSymbol = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol.trim()) return;
    const cleanSym = newSymbol.trim().toUpperCase();
    if (!items.some(i => i.symbol === cleanSym)) {
      setItems(prev => [
        { symbol: cleanSym, price: 150.0, change: 0.0, change_pct: 0.0, volume: 500000 },
        ...prev
      ]);
    }
    setNewSymbol('');
  };

  const handleRemoveSymbol = (sym: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems(prev => prev.filter(i => i.symbol !== sym));
  };

  return (
    <div className="w-full glass-card bg-black/85 border border-emerald-500/30 rounded-2xl p-4 space-y-4 shadow-xl backdrop-blur-md text-slate-100">
      
      {/* Watchlist Header */}
      <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-sm uppercase tracking-wider text-white">Live Watchlist</h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
          ALPACA MARKET FEED
        </span>
      </div>

      {/* Add Symbol Form */}
      <form onSubmit={handleAddSymbol} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Add symbol (e.g. AMD)..."
            value={newSymbol}
            onChange={e => setNewSymbol(e.target.value)}
            className="w-full bg-black/80 border border-emerald-500/30 text-xs pl-8 pr-3 py-1.5 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
          />
        </div>
        <button
          type="submit"
          className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </form>

      {/* Watchlist Items Grid */}
      <div className="space-y-1.5 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
        {items.map(item => {
          const isSelected = item.symbol === selectedSymbol;
          const isPositive = item.change >= 0;

          return (
            <div
              key={item.symbol}
              onClick={() => onSelectSymbol(item.symbol)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                isSelected
                  ? 'bg-emerald-500/20 border-emerald-500/60 text-white shadow-md shadow-emerald-500/10'
                  : 'bg-black/60 border-emerald-500/20 hover:bg-emerald-950/40 hover:border-emerald-500/40'
              }`}
            >
              {/* Left: Symbol Name & Volume */}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-sm text-white tracking-tight font-mono">{item.symbol}</span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </div>
                <span className="text-[10px] text-slate-300 font-medium block">
                  Vol: {(item.volume / 1000000).toFixed(2)}M
                </span>
              </div>

              {/* Right: Price & Daily Change */}
              <div className="flex items-center space-x-3 font-mono">
                <div className="text-right">
                  <span className="font-bold text-xs block text-white">
                    ${item.price > 0 ? item.price.toFixed(2) : '--.--'}
                  </span>
                  <div className={`flex items-center justify-end gap-0.5 text-[10px] font-bold ${
                    isPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{isPositive ? '+' : ''}{item.change_pct.toFixed(2)}%</span>
                  </div>
                </div>

                <button
                  onClick={e => handleRemoveSymbol(item.symbol, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition-opacity"
                  title="Remove from watchlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
