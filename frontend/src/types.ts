export interface MarketRegime {
  regime: 'BULLISH' | 'BEARISH' | 'SIDEWAYS' | 'HIGH_VOLATILITY' | 'LOW_VOLATILITY';
  confidence: number;
  volatility: string;
  momentum: string;
  observations: string[];
  timestamp?: string;
}

export interface Strategy {
  strategy_id: string;
  name: string;
  hypothesis: string;
  entry_rules: string[];
  exit_rules: string[];
  stop_loss_rules: string[];
  sizing_rules: Record<string, any>;
  preferred_regime: string;
  risk_assumptions?: string;
  expected_edge?: string;
  invalidation_conditions?: string;
  edge_score: number;
  status: 'ALIVE' | 'WATCH' | 'KILLED' | 'REJECTED';
  status_reason?: string;
  allocation_pct: number;
  parent_strategy_id?: string;
}

export interface BacktestResult {
  backtest_id: string;
  strategy_id: string;
  train_period: string;
  oos_period: string;
  total_return: number;
  annualized_return: number;
  win_rate: number;
  profit_factor: number;
  sharpe_ratio: number;
  sortino_ratio: number;
  max_drawdown: number;
  num_trades: number;
  avg_trade_return: number;
  avg_holding_period: string;
  volatility: number;
  exposure: number;
  oos_return: number;
  oos_sharpe: number;
  oos_drawdown: number;
  oos_win_rate: number;
  oos_passed: boolean;
  equity_curve: number[];
}

export interface AdversaryReport {
  report_id: string;
  strategy_id: string;
  robustness_score: number;
  verdict: 'PASS' | 'WATCH' | 'REJECT';
  weaknesses: string[];
  evidence: string[];
}

export interface TradeMarkerData {
  id: string | number;
  symbol: string;
  timestamp: number | string;
  side: 'BUY' | 'SELL';
  qty: number;
  price: number;
  strategy: string;
  edge_score: number;
  robustness_score: number;
  regime: string;
  regime_confidence: number;
  reason: string;
}

export interface Trade {
  id: string | number;
  symbol: string;
  side: 'BUY' | 'SELL' | 'LONG' | 'SHORT' | 'buy' | 'sell';
  qty: number;
  price: number;
  timestamp: string;
  strategy?: string;
  strategy_name?: string;
  strategy_id?: string;
  edge_score?: number;
  robustness_score?: number;
  risk_score?: number;
  regime?: string;
  regime_confidence?: number;
  reason?: string;
  explainability?: any;
  pnl?: number;
}

export interface AgentEvent {
  id: string | number;
  timestamp: string;
  agent?: string;
  agent_name?: string;
  action: string;
  details: string;
  status?: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  strategy_id?: string;
  symbol?: string;
}

export interface AccountInfo {
  cash: number;
  buying_power: number;
  portfolio_value: number;
  equity: number;
  daily_pnl: number;
  total_pnl: number;
  daily_return_pct: number;
  total_return_pct: number;
}

export interface PortfolioSummaryData {
  portfolio_value: number;
  daily_pnl: number;
  daily_pnl_pct: number;
  total_pnl: number;
  total_pnl_pct: number;
  buying_power: number;
  cash_reserve?: number;
  cash?: number;
  positions_count?: number;
  positions_value?: number;
  paper_trading?: boolean;
  mode?: string;
  max_drawdown: number;
}

export interface Position {
  id?: string | number;
  symbol: string;
  raw_symbol?: string;
  asset_id?: string;
  asset_class?: string;
  side: 'BUY' | 'SELL' | 'LONG' | 'SHORT' | 'long' | 'short' | 'buy' | 'sell';
  qty: number;
  qty_available?: number;
  entry_price: number;
  current_price: number;
  market_value: number;
  cost_basis?: number;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
  strategy_id: string;
  risk_score?: number;
  stop_loss_price?: number | null;
  stop_loss_order_id?: string | null;
  stop_loss_type?: string | null;
  take_profit_price?: number | null;
  take_profit_order_id?: string | null;
  take_profit_type?: string | null;
  trailing_stop?: number | null;
  trailing_order_id?: string | null;
  broker?: string;
  environment?: string;
  data_source?: string;
  status?: string;
  last_synced_at?: string;
}

export interface SystemStatus {
  market: 'LIVE' | 'CLOSED';
  alpaca: 'CONNECTED' | 'DISCONNECTED';
  paper: 'CONNECTED' | 'DISCONNECTED';
  aiEngine: 'RUNNING' | 'STOPPED';
}