import React, { useState } from 'react';
import { X, ShieldAlert, Zap, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';

export interface AllocationItem {
  symbol: string;
  asset_class: 'EQUITY' | 'ETF' | 'CRYPTO';
  current_qty: number;
  target_qty: number;
  current_price: number;
  current_market_value: number;
  target_market_value: number;
  current_weight: number;
  target_weight: number;
  allocation_score: number;
  action: string;
  reason: string;
  edge_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface AllocationPreviewData {
  portfolio_value: number;
  current_cash: number;
  buying_power: number;
  recommended_cash: number;
  recommended_deployment: number;
  expected_portfolio_risk_pct: number;
  recommendations: AllocationItem[];
}

interface AllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  previewData: AllocationPreviewData | null;
  onConfirmExecute: (recommendations: AllocationItem[]) => Promise<void>;
}

export const AllocationModal: React.FC<AllocationModalProps> = ({
  isOpen,
  onClose,
  previewData,
  onConfirmExecute
}) => {
  const [stage, setStage] = useState<'PREVIEW' | 'CONFIRM'>('PREVIEW');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executedSuccess, setExecutedSuccess] = useState<boolean>(false);

  if (!isOpen || !previewData) return null;

  const buyItems = previewData.recommendations.filter(r => r.action.startsWith('BUY'));
  const holdItems = previewData.recommendations.filter(r => r.action === 'HOLD');
  const reduceItems = previewData.recommendations.filter(r => r.action === 'REDUCE' || r.action === 'EXIT');

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      await onConfirmExecute(previewData.recommendations);
      setExecutedSuccess(true);
    } catch (e) {
      console.error('Execution error:', e);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden font-mono">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-emerald-400 animate-pulse" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {stage === 'PREVIEW' ? '⚡ Adaptive Capital Allocation Engine' : '⚡ Alpha Hunter Allocation Confirmation'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {executedSuccess ? (
          <div className="p-8 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-white">Orders Executed on Alpaca Paper Trading API!</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Real paper trading orders have been submitted. Allocation state updated in portfolio and recorded in audit log.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs uppercase"
            >
              Close Window
            </button>
          </div>
        ) : stage === 'PREVIEW' ? (
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Portfolio Summary Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Portfolio Value</span>
                <span className="text-white font-bold">${previewData.portfolio_value.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Buying Power</span>
                <span className="text-emerald-400 font-bold">${previewData.buying_power.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">New Deployment</span>
                <span className="text-cyan-400 font-bold">+${previewData.recommended_deployment.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Expected Risk</span>
                <span className="text-amber-400 font-bold">{previewData.expected_portfolio_risk_pct}%</span>
              </div>
            </div>

            {/* Asset Allocation Table */}
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[10px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Asset</th>
                    <th className="py-2.5 px-3">Class</th>
                    <th className="py-2.5 px-3 text-center">Score</th>
                    <th className="py-2.5 px-3 text-right">Current → Target</th>
                    <th className="py-2.5 px-3 text-right">Weight Gap</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                    <th className="py-2.5 px-3">Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {previewData.recommendations.map((item) => {
                    const isCrypto = item.asset_class === 'CRYPTO';
                    return (
                      <tr key={item.symbol} className="hover:bg-slate-900/50">
                        <td className="py-3 px-3 font-bold text-white">{item.symbol}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isCrypto ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            item.asset_class === 'ETF' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                            'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          }`}>
                            {item.asset_class}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-white">
                          <span className={item.allocation_score >= 70 ? 'text-emerald-400' : item.allocation_score >= 40 ? 'text-amber-400' : 'text-rose-400'}>
                            {item.allocation_score}/100
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono">
                          <span className="text-slate-400">{item.current_qty}</span>
                          <ArrowRight className="w-3 h-3 inline mx-1 text-slate-500" />
                          <span className="text-white font-bold">{item.target_qty}</span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-300">
                          {(item.current_weight * 100).toFixed(1)}% → <span className="font-bold text-emerald-400">{(item.target_weight * 100).toFixed(1)}%</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            item.action.startsWith('BUY') ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                            item.action === 'HOLD' ? 'bg-slate-800 text-slate-400 border border-slate-700' :
                            'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}>
                            {item.action}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[11px] text-slate-300 leading-tight max-w-xs">
                          {item.reason}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold uppercase"
              >
                Cancel
              </button>
              <button
                onClick={() => setStage('CONFIRM')}
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs uppercase flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20"
              >
                <span>Next: Confirm & Execute</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Confirmation Stage */
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                Recommended Capital Deployment Summary
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block">Recommended Capital Deployment:</span>
                  <span className="text-emerald-400 font-bold text-sm">${previewData.recommended_deployment.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Expected Portfolio Risk:</span>
                  <span className="text-amber-400 font-bold text-sm">{previewData.expected_portfolio_risk_pct}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Current Cash:</span>
                  <span className="text-slate-200 font-mono">${previewData.current_cash.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Recommended Cash Reserve:</span>
                  <span className="text-cyan-400 font-mono">${previewData.recommended_cash.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Order Action Breakdown */}
            <div className="space-y-3 text-xs">
              {buyItems.length > 0 && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1">
                  <span className="font-bold text-emerald-400 block uppercase text-[10px]">BUY ORDERS TO SUBMIT (ALPACA PAPER API):</span>
                  {buyItems.map(item => (
                    <div key={item.symbol} className="text-slate-200 flex justify-between">
                      <span>• {item.symbol}: {item.action}</span>
                      <span className="text-slate-400">${item.target_market_value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {holdItems.length > 0 && (
                <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl space-y-1">
                  <span className="font-bold text-slate-400 block uppercase text-[10px]">HOLDING (NO NEW CAPITAL DEPLOYED):</span>
                  {holdItems.map(item => (
                    <div key={item.symbol} className="text-slate-300 flex justify-between">
                      <span>• {item.symbol}: HOLD ({item.current_qty} shares)</span>
                      <span className="text-slate-500 max-w-xs truncate">{item.reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              <button
                onClick={() => setStage('PREVIEW')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold uppercase"
              >
                Back to Preview
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-xs font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecute}
                  disabled={isExecuting}
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs uppercase flex items-center space-x-2 shadow-lg shadow-emerald-500/20"
                >
                  {isExecuting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Submitting to Alpaca...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-slate-950" />
                      <span>CONFIRM & EXECUTE</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
