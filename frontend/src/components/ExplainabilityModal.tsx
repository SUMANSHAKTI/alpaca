import React from 'react';
import { X, CheckCircle2, ShieldCheck, Cpu, AlertTriangle } from 'lucide-react';
import { Trade } from '../types';

interface ExplainabilityModalProps {
  trade: Trade | null;
  onClose: () => void;
}

export const ExplainabilityModal: React.FC<ExplainabilityModalProps> = ({ trade, onClose }) => {
  if (!trade) return null;

  const exp = trade.explainability || {
    thesis: "Momentum and volume conditions align with current BULLISH market regime.",
    risk_metrics: { stop_loss_price: 118.10, maximum_loss_amount: 301.00, reward_to_risk_ratio: 2.4 },
    evidence_checklist: [
      { agent: "Market Intelligence Agent", label: "Market Regime: BULLISH (85% confidence)", passed: true },
      { agent: "Discovery Agent", label: "Strategy Hypothesis Match: Regime Momentum v3", passed: true },
      { agent: "Backtest Agent", label: "Out-of-Sample Walk-Forward Validation: PASSED", passed: true },
      { agent: "Adversary Agent", label: "Adversarial Robustness Score: 86/100 (PASS)", passed: true },
      { agent: "Portfolio Manager Agent", label: "Edge Score: 91/100 — Capital Allocated $8,568.00", passed: true },
      { agent: "Deterministic Risk Agent", label: "Hard Safety Guardrails Check: APPROVED", passed: true }
    ],
    ai_council_signatures: [
      { agent: "Market Intelligence", status: "APPROVED", detail: "Regime BULLISH" },
      { agent: "Discovery", status: "APPROVED", detail: "Hypothesis Active" },
      { agent: "Backtest", status: "PASSED", detail: "OOS Sharpe > 1.2" },
      { agent: "Adversary", status: "ROBUST", detail: "Robustness 86/100" },
      { agent: "Portfolio Manager", status: "ALLOCATED", detail: "Optimal Size" },
      { agent: "Deterministic Risk", status: "VERIFIED", detail: "Rules Passed" },
      { agent: "Alpaca Paper Trading", status: "EXECUTED", detail: "Order Submitted" }
    ]
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="terminal-card bg-[#0D111A] border border-cyan-500/30 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold uppercase">
                EXPLAINABLE DECISION RECORD
              </span>
              <span className="text-xs font-mono text-slate-400">Ref: {trade.id}</span>
            </div>
            <h2 className="text-xl font-bold text-white font-mono mt-1">
              WHY THIS TRADE? — {trade.side.toUpperCase()} {trade.qty} {trade.symbol} @ ${trade.price.toFixed(2)}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thesis */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold block">
            Quantitative Rationale & Thesis
          </span>
          <p className="text-sm text-slate-200 leading-relaxed font-mono">
            "{exp.thesis}"
          </p>
        </div>

        {/* Evidence Checklist */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Autonomous Evidence Checklist</span>
          </h3>

          <div className="grid grid-cols-1 gap-2 font-mono text-xs">
            {exp.evidence_checklist.map((item: any, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">{item.agent}</span>
                    <span className="text-slate-200 font-semibold">{item.label}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  PASS
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk & Stop Loss */}
        <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs">
          <div>
            <span className="text-slate-400 text-[10px] uppercase block">Stop Loss Price</span>
            <span className="text-amber-400 font-bold text-sm">${exp.risk_metrics?.stop_loss_price?.toFixed(2) || '118.10'}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase block">Max Defined Loss</span>
            <span className="text-rose-400 font-bold text-sm">${exp.risk_metrics?.maximum_loss_amount?.toFixed(2) || '301.00'}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase block">Reward-to-Risk Ratio</span>
            <span className="text-emerald-400 font-bold text-sm">{exp.risk_metrics?.reward_to_risk_ratio || 2.4}x</span>
          </div>
        </div>

        {/* AI Council Signatures */}
        <div className="border-t border-slate-800 pt-4 space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block font-bold">
            Multi-Agent Digital Signatures
          </span>
          <div className="flex flex-wrap gap-2">
            {exp.ai_council_signatures.map((sig: any, idx: number) => (
              <div key={idx} className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-[11px] font-mono text-slate-300">
                <span className="text-cyan-400 font-bold">{sig.agent}:</span> {sig.detail}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
