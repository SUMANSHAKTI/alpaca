import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, ShieldAlert, Wallet, PieChart } from 'lucide-react';
import { PortfolioSummaryData } from '../types';

interface PortfolioSummaryProps {
  data: PortfolioSummaryData | null;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ data }) => {
  if (!data) return null;

  const isDailyPos = data.daily_pnl >= 0;
  const isTotalPos = data.total_pnl >= 0;

  const cards = [
    {
      title: 'Portfolio Value',
      value: `$${data.portfolio_value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: 'Alpaca Account Value',
      icon: DollarSign,
      color: 'text-emerald-400',
      border: 'border-emerald-500/30'
    },
    {
      title: 'Daily P&L',
      value: `${isDailyPos ? '+' : ''}$${data.daily_pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: `${isDailyPos ? '+' : ''}${(data.daily_pnl_pct * 100).toFixed(2)}% Today`,
      icon: isDailyPos ? TrendingUp : TrendingDown,
      color: isDailyPos ? 'text-emerald-400' : 'text-rose-400',
      border: isDailyPos ? 'border-emerald-500/30' : 'border-rose-500/30'
    },
    {
      title: 'Total Cumulative P&L',
      value: `${isTotalPos ? '+' : ''}$${data.total_pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: `${isTotalPos ? '+' : ''}${(data.total_pnl_pct * 100).toFixed(2)}% Return`,
      icon: PieChart,
      color: isTotalPos ? 'text-emerald-400' : 'text-rose-400',
      border: isTotalPos ? 'border-emerald-500/30' : 'border-rose-500/30'
    },
    {
      title: 'Cash Reserve / Buying Power',
      value: `$${data.cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: `$${data.buying_power.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Available`,
      icon: Wallet,
      color: 'text-slate-100',
      border: 'border-emerald-500/25'
    },
    {
      title: 'Max Historical Drawdown',
      value: `${(data.max_drawdown * 100).toFixed(2)}%`,
      subtitle: 'Risk Boundary: < 15.0%',
      icon: ShieldAlert,
      color: data.max_drawdown > 0.15 ? 'text-rose-400' : 'text-amber-400',
      border: data.max_drawdown > 0.15 ? 'border-rose-500/30' : 'border-amber-500/30'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`glass-card p-4 rounded-xl border ${card.border} transition-all duration-200 hover:translate-y-[-2px]`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{card.title}</span>
              <Icon className={`w-4 h-4 ${card.color} shrink-0`} />
            </div>
            <div className={`text-xl sm:text-2xl font-bold font-mono mt-2 tracking-tight ${card.color} truncate`}>
              {card.value}
            </div>
            <div className="text-[11px] text-slate-300 mt-1 font-mono font-medium truncate">{card.subtitle}</div>
          </div>
        );
      })}
    </div>
  );
};
