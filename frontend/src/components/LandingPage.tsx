import React from 'react';
import { Sparkles, ShieldAlert, TrendingUp, Cpu, ArrowRight, Play, Terminal } from 'lucide-react';

interface LandingPageProps {
  onEnterLab: () => void;
  onViewStrategies: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterLab, onViewStrategies }) => {
  return (
    <div className="min-h-[85vh] flex flex-col justify-center space-y-12 py-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Autonomous AI Trading Scientist</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-mono tracking-tight">
          ALPHA HUNTER
        </h1>

        <p className="text-xl font-medium text-cyan-300 font-mono italic">
          "The AI that hunts for market edges."
        </p>

        <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Autonomously discover, challenge, validate, and deploy quantitative trading strategies. Other AI trading agents choose trades. Alpha Hunter discovers which strategies deserve to trade.
        </p>

        <div className="flex items-center justify-center space-x-4 pt-4">
          <button
            onClick={onEnterLab}
            className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold font-mono px-6 py-3 rounded-xl text-sm transition-all shadow-xl shadow-cyan-500/20"
          >
            <span>ENTER TRADING LAB</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onViewStrategies}
            className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-mono px-6 py-3 rounded-xl text-sm transition-all"
          >
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>VIEW STRATEGIES</span>
          </button>
        </div>
      </div>

      {/* 3 Core Differentiators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div className="terminal-card p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 w-fit">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white font-mono uppercase">1. DISCOVER</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            AI generates precise quantitative trading hypotheses combining technical indicators, volume profiles, and market regimes.
          </p>
        </div>

        <div className="terminal-card p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 w-fit">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white font-mono uppercase">2. CHALLENGE</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            An independent Adversary Agent stress-tests every strategy for curve-fitting, concentration risk, and regime reliance.
          </p>
        </div>

        <div className="terminal-card p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 w-fit">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white font-mono uppercase">3. ADAPT</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            Only strategies with surviving edge receive paper-trading capital. Failing strategies are killed automatically.
          </p>
        </div>
      </div>
    </div>
  );
};
