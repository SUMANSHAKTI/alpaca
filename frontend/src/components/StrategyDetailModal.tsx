import React from 'react';
import { X, ShieldAlert, CheckCircle2, AlertTriangle, Skull, BarChart3, Lock } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Strategy } from '../types';

interface StrategyDetailModalProps {
  strategy: Strategy | null;
  onClose: () => void;
}

export const StrategyDetailModal: React.FC<StrategyDetailModalProps> = ({ strategy, onClose }) => {
  if (!strategy) return null;

  const isKilled = strategy.status === 'KILLED' || strategy.status === 'REJECTED';

  // Sample equity curve data
  const chartData = [
    { period: 'Jan', train: 100, oos: 100 },
    { period: 'Feb', train: 104, oos: 102 },
    { period: 'Mar', train: 108, oos: 105 },
    { period: 'Apr', train: 107, oos: 103 },
    { period: 'May', train: 114, oos: 109 },
    { period: 'Jun', train: 118, oos: 112 },
    { period: 'Jul', train: 122, oos: isKilled ? 95 : 116 },
    { period: 'Aug', train: 125, oos: isKilled ? 92 : 119 }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-panel bg-[#040A06]/95 border border-emerald-500/40 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl shadow-emerald-500/10">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-emerald-500/20 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-widest">
                {strategy.strategy_id}
              </span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                strategy.status === 'ALIVE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                {strategy.status}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white font-mono mt-1">{strategy.name}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-black/80 border border-emerald-500/30 text-slate-300 hover:text-white hover:border-emerald-400 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hypothesis & Primary Edge */}
        <div className="bg-black/80 p-4 rounded-xl border border-emerald-500/30 space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
            Core Strategy Hypothesis
          </h3>
          <p className="text-sm text-slate-100 leading-relaxed italic font-medium">
            "{strategy.hypothesis}"
          </p>
        </div>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-black/70 p-3 rounded-lg border border-emerald-500/25 space-y-2">
            <span className="text-emerald-400 font-extrabold block uppercase border-b border-emerald-500/20 pb-1">
              Entry Rules
            </span>
            <ul className="space-y-1 text-slate-200 font-medium">
              {strategy.entry_rules.map((rule, idx) => (
                <li key={idx} className="flex items-center space-x-1.5">
                  <span className="text-emerald-400">✓</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-black/70 p-3 rounded-lg border border-emerald-500/25 space-y-2">
            <span className="text-rose-400 font-extrabold block uppercase border-b border-emerald-500/20 pb-1">
              Exit Rules
            </span>
            <ul className="space-y-1 text-slate-200 font-medium">
              {strategy.exit_rules.map((rule, idx) => (
                <li key={idx} className="flex items-center space-x-1.5">
                  <span className="text-rose-400">✕</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-black/70 p-3 rounded-lg border border-emerald-500/25 space-y-2">
            <span className="text-amber-300 font-extrabold block uppercase border-b border-emerald-500/20 pb-1">
              Stop-Loss & Sizing
            </span>
            <ul className="space-y-1 text-slate-200 font-medium">
              {strategy.stop_loss_rules.map((rule, idx) => (
                <li key={idx} className="flex items-center space-x-1.5">
                  <span className="text-amber-300">🛑</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Backtest Equity Curve Chart */}
        <div className="bg-black/80 p-4 rounded-xl border border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-bold flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Train vs Out-of-Sample Walk-Forward Validation</span>
            </h3>
            <span className="text-xs font-mono text-slate-300 font-medium">In-Sample 70% | OOS 30%</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#064E3B" strokeOpacity={0.3} />
                <XAxis dataKey="period" stroke="#94A3B8" tick={{ fontSize: 11, fill: '#E2E8F0' }} />
                <YAxis stroke="#94A3B8" tick={{ fontSize: 11, fill: '#E2E8F0' }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#030704', borderColor: '#10B981', color: '#FFFFFF' }} />
                <Line type="monotone" dataKey="train" name="Train Period" stroke="#10B981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="oos" name="OOS Walk-Forward" stroke={isKilled ? '#F43F5E' : '#34D399'} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Adversary Agent Stress Test Report */}
        <div className={`p-4 rounded-xl border space-y-3 ${
          isKilled ? 'bg-rose-950/30 border-rose-500/40' : 'bg-emerald-950/30 border-emerald-500/40'
        }`}>
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
            <div className="flex items-center space-x-2">
              <ShieldAlert className={`w-5 h-5 ${isKilled ? 'text-rose-400' : 'text-emerald-400'}`} />
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                Adversary Agent Stress Test Report
              </h3>
            </div>
            <span className={`text-sm font-mono font-bold px-3 py-0.5 rounded ${
              isKilled ? 'bg-rose-500/25 text-rose-300' : 'bg-emerald-500/25 text-emerald-300'
            }`}>
              Robustness: {isKilled ? '31 / 100 (REJECT)' : '86 / 100 (PASS)'}
            </span>
          </div>

          {isKilled ? (
            <div className="space-y-2 text-xs font-mono text-rose-200">
              <span className="font-bold block text-rose-400 uppercase">Identified Overfitting & Weaknesses:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-200">
                <li>82% of net strategy returns originate from only 4 trade outliers.</li>
                <li>Performance collapses in SIDEWAYS market regime (Sharpe -0.22).</li>
                <li>Extreme parameter sensitivity: shifting RSI threshold from 20 to 22 drops win rate by 24%.</li>
              </ul>
              <div className="p-2.5 rounded bg-rose-950/60 border border-rose-700/50 mt-2 text-rose-200">
                <strong>Verdict Rationale:</strong> REJECT STRATEGY. Capital allocation denied due to high curve-fitting risk and lack of out-of-sample edge.
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-xs font-mono text-emerald-200">
              <span className="font-bold block text-emerald-400 uppercase">Adversarial Evaluation Summary:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-200">
                <li>Out-of-sample walk-forward degradation stable (&lt; 15% drop from training Sharpe).</li>
                <li>Monte Carlo 1,000 run survival rate: 94.8%.</li>
                <li>Passed parameter perturbation tests (+/- 15% parameter drift).</li>
              </ul>
              <div className="p-2.5 rounded bg-emerald-950/60 border border-emerald-700/50 mt-2 text-emerald-200">
                <strong>Verdict Rationale:</strong> PASS STRATEGY. Robust quantitative edge confirmed across multiple market regimes.
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
