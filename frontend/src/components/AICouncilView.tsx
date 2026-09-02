import React from 'react';
import { Compass, Sparkles, BarChart2, ShieldAlert, Wallet, CheckCircle2, ArrowRight, Cpu, Layers } from 'lucide-react';

export const AICouncilView: React.FC = () => {
  const nodes = [
    {
      id: 1,
      title: 'MARKET INTELLIGENCE',
      subtitle: 'Regime Detector',
      badge: 'BULLISH (85% Conf)',
      detail: 'Price above 20d & 50d SMA. Momentum positive. Volume spike confirmed.',
      icon: Compass,
      status: 'APPROVED',
      color: 'border-purple-500/40 text-purple-400 bg-purple-500/10'
    },
    {
      id: 2,
      title: 'DISCOVERY AGENT',
      subtitle: 'Hypothesis Engine',
      badge: 'Regime Momentum v3',
      detail: 'Formulated quantitative entry/exit rules aligned with Bullish regime.',
      icon: Sparkles,
      color: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10'
    },
    {
      id: 3,
      title: 'BACKTEST ENGINE',
      subtitle: 'Walk-Forward OOS',
      badge: 'OOS Sharpe: 1.42',
      detail: 'Completed 70/30 chronological split. Zero lookahead bias. Passed OOS threshold.',
      icon: BarChart2,
      color: 'border-blue-500/40 text-blue-400 bg-blue-500/10'
    },
    {
      id: 4,
      title: 'ADVERSARY AGENT',
      subtitle: 'Stress Tester',
      badge: 'Robustness: 86 / 100',
      detail: 'Attacked strategy with parameter shift & Monte Carlo 1,000 runs. Verdict: PASS.',
      icon: ShieldAlert,
      color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
    },
    {
      id: 5,
      title: 'PORTFOLIO MANAGER',
      subtitle: 'Capital Allocator',
      badge: '30% Capital ($30,000)',
      detail: 'Edge Score 91/100. Allocated optimal size while keeping 20% cash safety buffer.',
      icon: Wallet,
      color: 'border-amber-500/40 text-amber-400 bg-amber-500/10'
    },
    {
      id: 6,
      title: 'DETERMINISTIC RISK AGENT',
      subtitle: 'Hard Safety Layer',
      badge: 'VERDICT: APPROVED',
      detail: 'Evaluated 10 hard-coded Python rules. Symbol, size, buying power & status verified.',
      icon: CheckCircle2,
      color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
    },
    {
      id: 7,
      title: 'ALPACA EXECUTION',
      subtitle: 'Paper Trading API',
      badge: 'ORDER EXECUTED',
      detail: 'Submitted paper order: BUY 70 NVDA @ $122.40. Audit trail saved.',
      icon: Cpu,
      color: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-lg font-bold text-white font-mono flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <span>AI Autonomous Council — Visual Decision Pipeline</span>
        </h2>
        <p className="text-xs text-slate-400">
          How Alpha Hunter's multi-agent system independently discovers, stress-tests, and executes trades
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {nodes.map((node, index) => {
          const Icon = node.icon;
          return (
            <div
              key={node.id}
              className={`terminal-card p-5 rounded-2xl border ${node.color} flex flex-col justify-between space-y-4 relative overflow-hidden transition-all duration-300 hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-xl bg-slate-900 border border-slate-800 ${node.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Step 0{node.id}</span>
                    <h3 className="text-sm font-bold text-white font-mono tracking-tight">{node.title}</h3>
                  </div>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${node.color}`}>
                  {node.subtitle}
                </span>
              </div>

              <div className="space-y-2">
                <div className="inline-block px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs font-bold text-cyan-300">
                  {node.badge}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  {node.detail}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Agent Signature Verified</span>
                </span>
                {index < nodes.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-cyan-400 animate-pulse" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
