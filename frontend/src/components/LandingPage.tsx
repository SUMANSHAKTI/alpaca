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
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-500/10">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Autonomous AI Trading Scientist</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-mono tracking-tight">
          ALPHA <span className="text-emerald-400">HUNTER</span>
        </h1>

        <p className="text-xl font-medium text-emerald-300 font-mono italic">
          "The AI that hunts for market edges."
        </p>

        <p className="text-sm text-slate-200 max-w-xl mx-auto leading-relaxed">
          Autonomously discover, challenge, validate, and deploy quantitative trading strategies. Other AI trading agents choose trades. Alpha Hunter discovers which strategies deserve to trade.
        </p>

        <div className="flex items-center justify-center space-x-4 pt-4">
          <button
            onClick={onEnterLab}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-black font-extrabold font-mono px-6 py-3 rounded-xl text-sm transition-all shadow-xl shadow-emerald-500/30 cursor-pointer"
          >
            <span>ENTER TRADING LAB</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onViewStrategies}
            className="flex items-center space-x-2 bg-black/80 hover:bg-emerald-950/60 text-slate-100 border border-emerald-500/40 font-mono px-6 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-md"
          >
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>VIEW STRATEGIES</span>
          </button>
        </div>
      </div>

      {/* 3 Core Differentiators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div className="glass-card p-6 rounded-2xl border border-emerald-500/30 space-y-3">
          <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 w-fit">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide">1. DISCOVER</h3>
          <p className="text-xs text-slate-200 leading-relaxed font-mono">
            AI generates precise quantitative trading hypotheses combining technical indicators, volume profiles, and market regimes.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-emerald-500/30 space-y-3">
          <div className="p-3 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/40 w-fit">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide">2. CHALLENGE</h3>
          <p className="text-xs text-slate-200 leading-relaxed font-mono">
            An independent Adversary Agent stress-tests every strategy for curve-fitting, concentration risk, and regime reliance.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-emerald-500/30 space-y-3">
          <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 w-fit">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide">3. ADAPT</h3>
          <p className="text-xs text-slate-200 leading-relaxed font-mono">
            Only strategies with surviving edge receive paper-trading capital. Failing strategies are killed automatically.
          </p>
        </div>
      </div>
    </div>
  );
};
