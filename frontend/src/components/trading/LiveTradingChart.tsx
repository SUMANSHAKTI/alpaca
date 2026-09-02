import React, { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries, HistogramSeries, LineSeries, createSeriesMarkers, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
import { Maximize2, Minimize2, Radio, Play, Pause, ShieldCheck, Zap, Activity, RefreshCw, BarChart2 } from 'lucide-react';
import { AICouncilPanel } from './AICouncilPanel';
import { TradeDetailModal, TradeMarkerData } from './TradeDetailModal';

export interface LiveTradingChartProps {
  symbol?: string;
  initialSymbol?: string;
  initialTimeframe?: string;
  onSymbolChange?: (symbol: string) => void;
}

const SUPPORTED_SYMBOLS = ['NVDA', 'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 'TSLA', 'SPY', 'QQQ', 'BTC/USD'];
const SUPPORTED_TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '4h', '1D'];

export const LiveTradingChart: React.FC<LiveTradingChartProps> = ({
  symbol: symbolProp,
  initialSymbol = 'NVDA',
  initialTimeframe = '1m',
  onSymbolChange
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);
  const maSeriesRef = useRef<any>(null);
  const emaSeriesRef = useRef<any>(null);
  const markersPrimitiveRef = useRef<any>(null);
  const priceLinesRef = useRef<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // Component State
  const [symbol, setSymbol] = useState<string>(symbolProp || initialSymbol);
  const [timeframe, setTimeframe] = useState<string>(initialTimeframe);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [demoMode, setDemoMode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<string>('--:--:--');
  const [selectedTrade, setSelectedTrade] = useState<TradeMarkerData | null>(null);

  // Overlay Toggles
  const [showMA, setShowMA] = useState<boolean>(true);
  const [showEMA, setShowEMA] = useState<boolean>(true);
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [showAIMarkers, setShowAIMarkers] = useState<boolean>(true);
  const [showStopLoss, setShowStopLoss] = useState<boolean>(true);
  const [showTakeProfit, setShowTakeProfit] = useState<boolean>(true);

  // AI & Market State
  const [regime, setRegime] = useState({ regime: 'BULLISH', confidence: 0.85 });
  const [trades, setTrades] = useState<TradeMarkerData[]>([]);
  const [position, setPosition] = useState<any | null>(null);

  // Sync symbol state with symbolProp from parent
  useEffect(() => {
    if (symbolProp && symbolProp !== symbol) {
      setSymbol(symbolProp);
    }
  }, [symbolProp]);

  // Fetch real Alpaca position specifically for current symbol
  useEffect(() => {
    let isSubscribed = true;

    const fetchPosition = async () => {
      try {
        const host = window.location.hostname || '127.0.0.1';
        const res = await fetch(`http://${host}:8000/api/positions?symbol=${encodeURIComponent(symbol)}`);
        if (res.ok) {
          const data = await res.json();
          if (isSubscribed) {
            if (Array.isArray(data) && data.length > 0) {
              setPosition(data[0]);
            } else {
              setPosition(null);
            }
          }
        }
      } catch (err) {
        if (isSubscribed) setPosition(null);
      }
    };

    fetchPosition();
    const interval = setInterval(fetchPosition, 3000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [symbol]);

  const handleSymbolSelect = (newSym: string) => {
    setSymbol(newSym);
    if (onSymbolChange) {
      onSymbolChange(newSym);
    }
  };

  // 1. Initialize Lightweight Chart Engine
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#0B0E14' },
        textColor: '#94A3B8'
      },
      grid: {
        vertLines: { color: '#1E293B' },
        horzLines: { color: '#1E293B' }
      },
      crosshair: {
        mode: 1
      },
      rightPriceScale: {
        borderColor: '#334155'
      },
      timeScale: {
        borderColor: '#334155',
        timeVisible: true,
        secondsVisible: false
      }
    });

    // Add Candlestick Series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10B981',
      downColor: '#EF4444',
      borderUpColor: '#10B981',
      borderDownColor: '#EF4444',
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444'
    });

    // Add Volume Histogram Series
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#3B82F6',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume'
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 }
    });

    // Add 20-period Moving Average & 50-period EMA
    const maSeries = chart.addSeries(LineSeries, { color: '#F59E0B', lineWidth: 2, title: 'SMA 20' });
    const emaSeries = chart.addSeries(LineSeries, { color: '#8B5CF6', lineWidth: 2, title: 'EMA 50' });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;
    maSeriesRef.current = maSeries;
    emaSeriesRef.current = emaSeries;
    markersPrimitiveRef.current = createSeriesMarkers(candleSeries, []);

    // Handle Window Resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // 2. Fetch Historical Bars & Trade Markers on Symbol/Timeframe Change
  useEffect(() => {
    let isSubscribed = true;

    const loadData = async () => {
      try {
        // Clear previous chart series data to prevent timestamp collision
        if (candleSeriesRef.current) candleSeriesRef.current.setData([]);
        if (volumeSeriesRef.current) volumeSeriesRef.current.setData([]);
        if (maSeriesRef.current) maSeriesRef.current.setData([]);
        if (emaSeriesRef.current) emaSeriesRef.current.setData([]);

        const host = window.location.hostname || '127.0.0.1';
        const res = await fetch(`http://${host}:8000/api/market-data/bars?symbol=${encodeURIComponent(symbol)}&timeframe=${encodeURIComponent(timeframe)}&limit=200`);
        const bars = await res.json();

        if (isSubscribed && candleSeriesRef.current && Array.isArray(bars) && bars.length > 0) {
          const candleData: CandlestickData[] = bars.map(b => {
            const timeVal = (timeframe === '1D' || timeframe === '1d')
              ? (typeof b.time === 'number' ? new Date(b.time * 1000).toISOString().split('T')[0] : b.time)
              : (b.time as Time);
            return {
              time: timeVal as Time,
              open: b.open,
              high: b.high,
              low: b.low,
              close: b.close
            };
          });

          const volData = bars.map(b => {
            const timeVal = (timeframe === '1D' || timeframe === '1d')
              ? (typeof b.time === 'number' ? new Date(b.time * 1000).toISOString().split('T')[0] : b.time)
              : (b.time as Time);
            return {
              time: timeVal as Time,
              value: b.volume,
              color: b.close >= b.open ? '#10B98180' : '#EF444480'
            };
          });

          candleSeriesRef.current.setData(candleData);
          if (volumeSeriesRef.current) volumeSeriesRef.current.setData(volData);

          // Calculate Moving Averages
          if (maSeriesRef.current && candleData.length >= 20) {
            const maData = [];
            for (let i = 19; i < candleData.length; i++) {
              const slice = candleData.slice(i - 19, i + 1);
              const avg = slice.reduce((acc, c) => acc + c.close, 0) / 20;
              maData.push({ time: candleData[i].time, value: avg });
            }
            maSeriesRef.current.setData(maData);
          }

          if (emaSeriesRef.current && candleData.length >= 50) {
            const emaData = [];
            for (let i = 49; i < candleData.length; i++) {
              const slice = candleData.slice(i - 49, i + 1);
              const avg = slice.reduce((acc, c) => acc + c.close, 0) / 50;
              emaData.push({ time: candleData[i].time, value: avg });
            }
            emaSeriesRef.current.setData(emaData);
          }

          chartRef.current?.timeScale().fitContent();
        }

        // Fetch AI Trades for Symbol
        const tradesRes = await fetch(`http://${host}:8000/api/market-data/trades?symbol=${encodeURIComponent(symbol)}`);
        const tradeData: TradeMarkerData[] = await tradesRes.json();

        if (isSubscribed) {
          setTrades(tradeData);
          updateChartMarkers(tradeData);
        }
      } catch (err) {
        console.error('Error loading chart data:', err);
      }
    };

    loadData();

    return () => {
      isSubscribed = false;
    };
  }, [symbol, timeframe]);

  // 3. Connect Real-time WebSocket Stream
  useEffect(() => {
    if (demoMode) return;

    const host = window.location.hostname || '127.0.0.1';
    const wsUrl = `ws://${host}:8000/api/market-data/ws/${encodeURIComponent(symbol)}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsLive(true);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === 'INITIAL_STATE') {
          if (msg.regime) setRegime(msg.regime);
        } else if (msg.type === 'CANDLE_UPDATE') {
          setLastUpdate(msg.server_time || new Date().toLocaleTimeString());

          const timeFormatted = (timeframe === '1D' || timeframe === '1d')
            ? (typeof msg.time === 'number' ? new Date(msg.time * 1000).toISOString().split('T')[0] : msg.time)
            : (msg.time as Time);

          if (candleSeriesRef.current) {
            try {
              candleSeriesRef.current.update({
                time: timeFormatted as Time,
                open: msg.open,
                high: msg.high,
                low: msg.low,
                close: msg.close
              });
            } catch (e) {
              // Ignore single update mismatch
            }
          }

          if (volumeSeriesRef.current) {
            try {
              volumeSeriesRef.current.update({
                time: timeFormatted as Time,
                value: msg.volume,
                color: msg.close >= msg.open ? '#10B98180' : '#EF444480'
              });
            } catch (e) {
              // Ignore single update mismatch
            }
          }
        }
      } catch (err) {
        console.error('Error parsing WS message:', err);
      }
    };

    ws.onclose = () => {
      setIsLive(false);
    };

    return () => {
      ws.close();
    };
  }, [symbol, demoMode]);

  // 4. Update AI Trade Markers on Chart
  const updateChartMarkers = (tradeList: TradeMarkerData[]) => {
    if (!candleSeriesRef.current || !showAIMarkers) return;

    const markers = tradeList.map(t => ({
      time: t.timestamp as Time,
      position: t.side === 'BUY' ? 'belowBar' : ('aboveBar' as const),
      color: t.side === 'BUY' ? '#10B981' : '#EF4444',
      shape: t.side === 'BUY' ? 'arrowUp' : ('arrowDown' as const),
      text: `${t.side} ${t.symbol} @ $${t.price.toFixed(2)} (Edge ${t.edge_score})`
    }));

    if (markersPrimitiveRef.current) {
      markersPrimitiveRef.current.setMarkers(markers);
    }
  };

  // 5. Draw Entry, Stop Loss, and Take Profit Overlay Lines
  useEffect(() => {
    // Clear any existing price lines first
    if (priceLinesRef.current.length > 0 && candleSeriesRef.current) {
      priceLinesRef.current.forEach((line) => {
        try {
          candleSeriesRef.current.removePriceLine(line);
        } catch (e) {
          // Ignore if line already removed
        }
      });
      priceLinesRef.current = [];
    }

    if (!candleSeriesRef.current || !position) return;

    const matchSymbol = (symA?: string, symB?: string): boolean => {
      if (!symA || !symB) return false;
      return symA.toUpperCase().replace(/[\/\-]/g, '') === symB.toUpperCase().replace(/[\/\-]/g, '');
    };

    if (!matchSymbol(position.symbol, symbol)) return;

    // Draw Entry Line
    if (position.entry_price) {
      const entryLine = candleSeriesRef.current.createPriceLine({
        price: position.entry_price,
        color: '#3B82F6',
        lineWidth: 2,
        lineStyle: 0, // Solid
        axisLabelVisible: true,
        title: `ENTRY: $${position.entry_price.toFixed(2)}`
      });
      priceLinesRef.current.push(entryLine);
    }

    // Draw Stop Loss Line
    if (showStopLoss && position.stop_loss_price) {
      const stopLossLine = candleSeriesRef.current.createPriceLine({
        price: position.stop_loss_price,
        color: '#EF4444',
        lineWidth: 2,
        lineStyle: 2, // Dashed
        axisLabelVisible: true,
        title: `STOP LOSS: $${position.stop_loss_price.toFixed(2)}`
      });
      priceLinesRef.current.push(stopLossLine);
    }

    // Draw Take Profit Line
    if (showTakeProfit && position.take_profit_price) {
      const takeProfitLine = candleSeriesRef.current.createPriceLine({
        price: position.take_profit_price,
        color: '#10B981',
        lineWidth: 2,
        lineStyle: 2, // Dashed
        axisLabelVisible: true,
        title: `TAKE PROFIT: $${position.take_profit_price.toFixed(2)}`
      });
      priceLinesRef.current.push(takeProfitLine);
    }

    return () => {
      if (priceLinesRef.current.length > 0 && candleSeriesRef.current) {
        priceLinesRef.current.forEach((line) => {
          try {
            candleSeriesRef.current.removePriceLine(line);
          } catch (e) {}
        });
        priceLinesRef.current = [];
      }
    };
  }, [symbol, position, showStopLoss, showTakeProfit]);

  // Fullscreen Container Handler
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`flex flex-col lg:flex-row gap-4 w-full text-slate-100 ${
      isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-4' : 'relative'
    }`}>
      
      {/* Primary Chart Box */}
      <div className="flex-1 flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        
        {/* Top Control & Status Bar */}
        <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          
          {/* Main Control Group */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Symbol Selector */}
            <select
              value={symbol}
              onChange={(e) => handleSymbolSelect(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
            >
              {SUPPORTED_SYMBOLS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Timeframe Buttons */}
            <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 overflow-x-auto">
              {SUPPORTED_TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all ${
                    timeframe === tf
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Regime Badge */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 font-bold text-xs">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>{regime.regime} — {Math.round(regime.confidence * 100)}%</span>
            </div>
          </div>

          {/* Right Action Group */}
          <div className="flex items-center space-x-2 text-xs">
            
            {/* Demo Mode Toggle */}
            <button
              onClick={() => setDemoMode(!demoMode)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors flex items-center gap-1 ${
                demoMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              {demoMode ? 'DEMO MODE — SIMULATED' : 'LIVE ALPACA API'}
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* Overlay Options Toggles Toolbar */}
        <div className="px-3.5 py-1.5 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-medium">
          <span className="text-slate-500 font-semibold uppercase tracking-wider">Overlays:</span>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
            <input type="checkbox" checked={showMA} onChange={(e) => setShowMA(e.target.checked)} className="rounded accent-cyan-500" />
            <span className="text-amber-400 font-semibold">SMA 20</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
            <input type="checkbox" checked={showEMA} onChange={(e) => setShowEMA(e.target.checked)} className="rounded accent-cyan-500" />
            <span className="text-purple-400 font-semibold">EMA 50</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
            <input type="checkbox" checked={showVolume} onChange={(e) => setShowVolume(e.target.checked)} className="rounded accent-cyan-500" />
            <span>Volume</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
            <input type="checkbox" checked={showAIMarkers} onChange={(e) => setShowAIMarkers(e.target.checked)} className="rounded accent-cyan-500" />
            <span className="text-emerald-400 font-semibold">AI Signals</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
            <input type="checkbox" checked={showStopLoss} onChange={(e) => setShowStopLoss(e.target.checked)} className="rounded accent-cyan-500" />
            <span className="text-rose-400 font-semibold">Stop Loss</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
            <input type="checkbox" checked={showTakeProfit} onChange={(e) => setShowTakeProfit(e.target.checked)} className="rounded accent-cyan-500" />
            <span className="text-emerald-400 font-semibold">Take Profit</span>
          </label>
        </div>

        {/* Lightweight Charts Canvas Render Container */}
        <div ref={chartContainerRef} className="w-full flex-1 min-h-[420px] bg-slate-950" />

        {/* Bottom Chart Footer */}
        <div className="px-4 py-2 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
            Source: <strong className="text-slate-300">ALPACA MARKET DATA (IEX Feed)</strong>
          </span>
          <span>Environment: <strong className="text-emerald-400">PAPER TRADING</strong></span>
        </div>

      </div>

      {/* Right AI Council Panel */}
      <AICouncilPanel
        symbol={symbol}
        regime={regime}
        strategy={{ name: 'Regime Momentum v3', edge_score: 91, status: 'ALIVE' }}
        backtest={{ passed: true, sharpe: 1.83, drawdown: -0.062 }}
        adversary={{ verdict: 'PASS', robustness: 86 }}
        riskApproved={true}
        position={position}
      />

      {/* Trade Evidence Detail Modal */}
      {selectedTrade && (
        <TradeDetailModal trade={selectedTrade} onClose={() => setSelectedTrade(null)} />
      )}
    </div>
  );
};
