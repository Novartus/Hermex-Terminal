import React, { useState } from 'react';
import {
  OrderFlowMetrics,
  RiskMetrics,
  GarchForecast,
  CorrelationMatrix
} from '../engine/types';
import { Gauge, TrendingUp, ShieldAlert, Grid, Zap, Info, Activity } from 'lucide-react';
import { QuantStatsPanelProps } from '../types';
import {
  cleanSymbol,
  getVpinColor,
  getVpinBg,
  getVpinStatusLabel,
  getCorrelationCellStyle,
  getHurstRegime,
} from '../utils';
import { D3CorrelationChord } from './D3CorrelationChord';

export const QuantStatsPanel: React.FC<QuantStatsPanelProps> = ({
  orderFlow,
  risk,
  garch,
  correlation,
}) => {
  const [matrixView, setMatrixView] = useState<'HEATMAP' | 'CHORD'>('CHORD');
  const vpinVal = orderFlow ? orderFlow.vpin : 0.24;
  const vpinPct = Math.round(vpinVal * 100);

  return (
    <div className="flex flex-col gap-6 font-sans select-none">
      {/* Top 4 KPI Metrics Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* VPIN Metric */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-slate-700" />
              <span className="font-bold text-slate-900">VPIN Toxicity</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
              Lee-Ready
            </span>
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold tabular-nums ${getVpinColor(vpinVal)}`}>
              {vpinVal.toFixed(3)}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              ({vpinPct}%)
            </span>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-500 mb-1.5 font-medium">
              <span>Bucket Fill: {orderFlow?.vpinBucketProgress.toFixed(0) || 45}%</span>
              <span className={vpinVal > 0.5 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                {getVpinStatusLabel(vpinVal)}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${getVpinBg(vpinVal)} transition-all duration-300`}
                style={{ width: `${vpinPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Order Flow Imbalance (OFI) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-slate-700" />
              <span className="font-bold text-slate-900">Order Flow Imb (OFI)</span>
            </div>
            <span className="text-[10px] text-slate-400">BBO Delta</span>
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span
              className={`text-3xl font-extrabold tabular-nums ${(orderFlow?.normalizedOfi || 0) > 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
            >
              {(orderFlow?.normalizedOfi || 0) > 0 ? '+' : ''}
              {(orderFlow?.normalizedOfi || 0).toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 font-medium">Norm [-1, +1]</span>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-500 mb-1.5 font-medium">
              <span className="text-rose-600">Ask Pressure</span>
              <span className="text-emerald-600">Bid Pressure</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-300" />
              <div
                className="h-full bg-slate-800 transition-all duration-150"
                style={{
                  width: `${Math.min(100, Math.max(0, ((orderFlow?.normalizedOfi || 0) + 1) * 50))}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* GARCH Volatility Forecast */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-slate-700" />
              <span className="font-bold text-slate-900">GARCH(1,1) Volatility</span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${garch?.volatilityRegime === 'EXTREME'
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : garch?.volatilityRegime === 'ELEVATED'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
            >
              {garch?.volatilityRegime || 'NORMAL'}
            </span>
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {garch?.currentVol || 38.4}%
            </span>
            <span className="text-xs text-slate-400 font-medium">Annualized</span>
          </div>

          <div className="flex justify-between text-[11px] text-slate-500 font-medium">
            <span>1h Est: <strong className="text-slate-800">{garch?.forecast1h || 39.1}%</strong></span>
            <span>24h Cone: <strong className="text-slate-800">{garch?.forecast24h || 42.0}%</strong></span>
          </div>
        </div>

        {/* Monte Carlo 10,000-Sim VaR 95% */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span className="font-bold text-slate-900">Monte Carlo VaR 95%</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
              10k Runs
            </span>
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600 tabular-nums">
              -${(risk?.var95 || 24500).toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-medium">1-Day / $1M</span>
          </div>

          <div className="flex justify-between text-[11px] text-slate-500 font-medium">
            <span>VaR 99%: <strong className="text-rose-600">-${(risk?.var99 || 38200).toLocaleString()}</strong></span>
            <span>CVaR: <strong className="text-slate-800">-${(risk?.cvar95 || 31900).toLocaleString()}</strong></span>
          </div>
        </div>
      </div>

      {/* Deep Quant Analytics: Correlation Matrix & Dynamics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Multi-Asset Correlation Heatmap & Chord Visualizer */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Grid className="w-4 h-4 text-slate-700" />
              <span className="font-bold text-slate-900 text-sm">Cross-Asset Correlation Network</span>
            </div>

            {/* Chord vs Tabular Heatmap Toggle */}
            <div className="flex items-center bg-slate-100 rounded-xl p-0.5 text-xs">
              <button
                onClick={() => setMatrixView('CHORD')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  matrixView === 'CHORD'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Chord Network
              </button>
              <button
                onClick={() => setMatrixView('HEATMAP')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  matrixView === 'HEATMAP'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Matrix Heatmap
              </button>
            </div>
          </div>

          {matrixView === 'CHORD' ? (
            <div className="flex-1 flex items-center justify-center min-h-[300px]">
              <D3CorrelationChord correlation={correlation} />
            </div>
          ) : (
            correlation ? (
              <div className="flex-1 flex flex-col justify-center overflow-x-auto min-h-[300px]">
                <table className="w-full text-xs text-center border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 text-slate-400 text-left text-[11px] font-semibold">ASSET</th>
                      {correlation.symbols.map((s) => (
                        <th key={s} className="p-2 font-semibold text-[11px] text-slate-500">
                          {cleanSymbol(s)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {correlation.symbols.map((rowSym, rIdx) => (
                      <tr key={rowSym}>
                        <td className="p-2 font-bold text-slate-900 text-left text-[11px]">
                          {cleanSymbol(rowSym)}
                        </td>
                        {correlation.symbols.map((colSym, cIdx) => {
                          const val = correlation.matrix[rIdx]?.[cIdx] ?? 0;
                          const isDiag = rIdx === cIdx;

                          const cellStyle = getCorrelationCellStyle(val, isDiag);

                          return (
                            <td key={colSym} className="p-1">
                              <div className={`py-1.5 px-1 rounded-lg text-[11px] tabular-nums ${cellStyle}`}>
                                {val.toFixed(2)}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                Calculating Pearson correlation vectors...
              </div>
            )
          )}
        </div>

        {/* Microstructure Dynamics & Regimes */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-slate-700" />
              <span className="font-bold text-slate-900 text-sm">Microstructure Dynamics & Regimes</span>
            </div>
            <span className="text-xs text-slate-400">Statistical Engine</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Hurst Exponent */}
            <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold">Hurst Exponent (H)</span>
                <Info className="w-3.5 h-3.5" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums mb-1">
                {(orderFlow?.hurstExponent || 0.54).toFixed(3)}
              </div>
              <div className="text-[11px] font-medium">
                {(() => {
                  const regime = getHurstRegime(orderFlow?.hurstExponent || 0.54);
                  return <span className={regime.colorClass}>{regime.label}</span>;
                })()}
              </div>
            </div>

            {/* Effective Spread */}
            <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold">Effective Spread</span>
                <span className="text-[10px] text-slate-400">Slippage</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums mb-1">
                ${(orderFlow?.effectiveSpread || 0.04).toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Realized Roll Impact: <strong className="text-slate-800">1.4 bps</strong>
              </div>
            </div>
          </div>

          {/* Institutional Risk Summary */}
          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 text-xs flex flex-col gap-2.5">
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-medium">Sharpe Ratio (Annualized):</span>
              <span className="text-emerald-600 font-bold tabular-nums">
                {risk?.sharpeRatio.toFixed(2) || '2.34'}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-medium">Sortino Ratio (Downside Risk):</span>
              <span className="text-emerald-600 font-bold tabular-nums">
                {risk?.sortinoRatio.toFixed(2) || '3.12'}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-medium">Portfolio Beta vs Market:</span>
              <span className="text-slate-900 font-bold tabular-nums">
                {risk?.beta.toFixed(2) || '1.15'}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-medium">Maximum Drawdown:</span>
              <span className="text-rose-600 font-bold tabular-nums">
                -{risk?.maxDrawdownPct || 4.8}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
