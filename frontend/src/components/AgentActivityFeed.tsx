import React from 'react';
import { Activity, Cpu, Sparkles, Shield, Compass, BarChart2, CheckCircle2 } from 'lucide-react';
import { AgentEvent } from '../types';

interface AgentActivityFeedProps {
  events: AgentEvent[];
}

export const AgentActivityFeed: React.FC<AgentActivityFeedProps> = ({ events }) => {
  const getAgentIcon = (agent: string) => {
    if (agent.includes('Market Intelligence')) return <Compass className="w-3.5 h-3.5 text-emerald-300" />;
    if (agent.includes('Discovery')) return <Sparkles className="w-3.5 h-3.5 text-emerald-400" />;
    if (agent.includes('Backtest')) return <BarChart2 className="w-3.5 h-3.5 text-emerald-300" />;
    if (agent.includes('Adversary')) return <Shield className="w-3.5 h-3.5 text-rose-400" />;
    if (agent.includes('Risk')) return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
    return <Cpu className="w-3.5 h-3.5 text-amber-300" />;
  };

  return (
    <div className="glass-card p-5 rounded-xl border border-emerald-500/30 space-y-4 flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Autonomous Agent Activity Stream
          </h3>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
          LIVE FEED
        </span>
      </div>

      <div className="overflow-y-auto space-y-3 pr-1 max-h-[380px] no-scrollbar">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="p-3 rounded-lg bg-black/70 border border-emerald-500/25 hover:border-emerald-500/50 transition-all font-mono text-xs space-y-1"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getAgentIcon(evt.agent_name)}
                <span className="font-bold text-white">{evt.agent_name}</span>
              </div>
              <span className="text-[10px] text-slate-300 font-medium">{evt.timestamp}</span>
            </div>

            <div className="text-emerald-400 text-[11px] font-bold">
              Action: {evt.action}
            </div>

            <p className="text-slate-200 text-[11px] leading-relaxed font-medium">
              {evt.details}
            </p>

            {evt.strategy_id && (
              <span className="inline-block text-[10px] text-slate-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded mt-1 font-semibold">
                Ref: {evt.strategy_id}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
