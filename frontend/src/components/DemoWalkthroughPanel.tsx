import React, { useState } from 'react';
import { Play, RotateCcw, FastForward, CheckCircle2, Sparkles, ChevronRight, Cpu } from 'lucide-react';

interface DemoWalkthroughPanelProps {
  onStepExecute?: (step: number) => void;
  currentStep?: number;
}

export const DemoWalkthroughPanel: React.FC<DemoWalkthroughPanelProps> = ({ onStepExecute, currentStep = 1 }) => {
  const [activeStep, setActiveStep] = useState(currentStep);

  const steps = [
    { id: 1, title: 'Market Regime Detection', desc: 'Scan live feeds & identify market regime' },
    { id: 2, title: 'Hypothesis Generation', desc: 'Generate & evaluate trading strategies' },
    { id: 3, title: 'OOS Walk-Forward Backtest', desc: 'Run backtest validation against historical data' },
    { id: 4, title: 'Adversarial Stress Test', desc: 'Subject strategy to adversarial shock tests' },
    { id: 5, title: 'Risk Compliance Check', desc: 'Validate position sizing & stop loss bounds' },
    { id: 6, title: 'Alpaca Execution', desc: 'Route paper order to Alpaca API' }
  ];

  return (
    <div className="glass-card p-6 rounded-2xl border border-emerald-500/30 text-white space-y-4 font-mono">
      <div className="flex items-center space-x-3">
        <Sparkles className="w-6 h-6 text-emerald-400" />
        <div>
          <h2 className="text-lg font-bold">Autonomous Cycle Walkthrough</h2>
          <p className="text-xs text-slate-300 font-medium font-sans">Step-by-step trace of the AI Quantitative Scientific Loop</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {steps.map((s) => (
          <div
            key={s.id}
            onClick={() => {
              setActiveStep(s.id);
              if (onStepExecute) onStepExecute(s.id);
            }}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              activeStep === s.id
                ? 'bg-emerald-500/25 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                : 'bg-black/70 border-emerald-500/20 text-slate-300 hover:border-emerald-500/40 hover:bg-emerald-950/40'
            }`}
          >
            <div className="flex items-center space-x-2 text-xs font-bold">
              <span className="w-5 h-5 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center text-[10px] border border-emerald-500/40 font-extrabold">
                {s.id}
              </span>
              <span className="text-white font-extrabold">{s.title}</span>
            </div>
            <p className="text-[11px] text-slate-200 mt-1.5 font-sans font-medium">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
