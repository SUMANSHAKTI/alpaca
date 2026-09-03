import React, { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, RefreshCw } from 'lucide-react';
import { getApiUrl } from '../config';

type Timeframe = '1D' | '1W' | '1M';

interface EquityPoint {
  date?: string;
  timestamp?: string | number;
  equity: number;
}

export const PortfolioPerformance: React.FC = () => {
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [equityData, setEquityData] = useState<EquityPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchHistory = async () => {
    try {
      const res = await fetch(
        getApiUrl(`/portfolio/history?timeframe=${timeframe}`)
      );

      if (!res.ok) return;

      const data = await res.json();

      if (Array.isArray(data.equity_curve) && data.equity_curve.length > 0) {
        setEquityData(data.equity_curve);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading portfolio performance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchHistory();

    const interval = setInterval(fetchHistory, 5000);

    return () => clearInterval(interval);
  }, [timeframe]);

  const performance = useMemo(() => {
    if (equityData.length === 0) {
      return {
        current: 0,
        starting: 0,
        pnl: 0,
        percent: 0,
      };
    }

    const starting = Number(equityData[0]?.equity || 0);
    const current = Number(equityData[equityData.length - 1]?.equity || 0);

    const pnl = current - starting;
    const percent = starting > 0 ? (pnl / starting) * 100 : 0;

    return {
      current,
      starting,
      pnl,
      percent,
    };
  }, [equityData]);

  const isPositive = performance.pnl >= 0;

  const chartData = equityData.map((point, index) => ({
    ...point,
    label:
      point.date ||
      (point.timestamp
        ? new Date(point.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        : `Point ${index + 1}`),
  }));

  return (
    <div className="glass-card rounded-2xl border border-emerald-500/30 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-emerald-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                AI Portfolio Performance
              </h2>

              <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-1">
              Autonomous portfolio equity & P&L
            </p>
          </div>

          {/* Timeframe */}
          <div className="flex items-center gap-1 bg-black/70 p-1 rounded-lg border border-emerald-500/20">
            {(['1D', '1W', '1M'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded text-[11px] font-mono font-bold transition-all ${
                  timeframe === tf
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-emerald-950/40'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5">

          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">
              Portfolio Equity
            </p>
            <p className="text-xl font-bold text-white font-mono mt-1">
              $
              {performance.current.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">
              Net P&L
            </p>

            <div
              className={`flex items-center gap-1 text-xl font-bold font-mono mt-1 ${
                isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}

              {isPositive ? '+' : '-'}$
              {Math.abs(performance.pnl).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">
              Return
            </p>

            <p
              className={`text-xl font-bold font-mono mt-1 ${
                isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isPositive ? '+' : ''}
              {performance.percent.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px] w-full p-4">

        {loading && equityData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mb-3" />
            <span className="text-xs font-mono">
              LOADING PORTFOLIO PERFORMANCE...
            </span>
          </div>
        ) : equityData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs font-mono">
            NO PORTFOLIO HISTORY AVAILABLE
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="portfolioEquityGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#34D399"
                    stopOpacity={0.30}
                  />
                  <stop
                    offset="95%"
                    stopColor="#34D399"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#064E3B"
                strokeOpacity={0.25}
              />

              <XAxis
                dataKey="label"
                stroke="#64748B"
                tick={{
                  fontSize: 10,
                  fill: '#94A3B8',
                }}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                stroke="#64748B"
                tick={{
                  fontSize: 10,
                  fill: '#94A3B8',
                }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  `$${Number(value).toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}`
                }
                domain={['auto', 'auto']}
                width={72}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: '#030704',
                  borderColor: '#10B981',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                }}
                labelStyle={{
                  color: '#94A3B8',
                  fontFamily: 'monospace',
                }}
                formatter={(value: any) => [
                  `$${Number(value).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`,
                  'Portfolio Equity',
                ]}
              />

              <Area
                type="monotone"
                dataKey="equity"
                stroke="#34D399"
                strokeWidth={2.5}
                fill="url(#portfolioEquityGradient)"
                fillOpacity={1}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-emerald-500/10 flex items-center justify-between">
        <span className="text-[10px] font-mono text-slate-500">
          ALPACA PAPER ACCOUNT • {timeframe}
        </span>

        <span className="text-[10px] font-mono text-slate-500">
          {lastUpdated
            ? `UPDATED ${lastUpdated.toLocaleTimeString()}`
            : 'CONNECTING...'}
        </span>
      </div>
    </div>
  );
};
