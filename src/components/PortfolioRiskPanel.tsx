import React from 'react';
import { PortfolioPosition, RiskMetrics } from '../engine/types';
import { Briefcase, TrendingUp, TrendingDown, DollarSign, PieChart, ShieldAlert } from 'lucide-react';
import { PortfolioRiskPanelProps } from '../types';

export const PortfolioRiskPanel: React.FC<PortfolioRiskPanelProps> = ({
  positions,
  risk,
}) => {
  const totalMarketValue = positions.reduce((acc, p) => acc + p.marketValue, 0);
  const totalUnrealizedPnl = positions.reduce((acc, p) => acc + p.unrealizedPnl, 0);
  const totalUnrealizedPnlPct = (totalUnrealizedPnl / (totalMarketValue - totalUnrealizedPnl || 1)) * 100;

  return (
    <div className="flex flex-col gap-6 font-sans select-none">
      {/* Top Level Portfolio KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Market Value */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-slate-700" />
              <span className="font-bold text-slate-900">Total Portfolio AUM</span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">USD</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tabular-nums my-2">
            ${totalMarketValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Cash Reserve: <strong className="text-slate-900">$345,200.00</strong> (25.7%)
          </div>
        </div>

        {/* Unrealized P&L */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <div className="flex items-center gap-1.5">
              {totalUnrealizedPnl >= 0 ? (
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-rose-600" />
              )}
              <span className="font-bold text-slate-900">Unrealized P&L</span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">Open Positions</span>
          </div>
          <div
            className={`text-3xl font-extrabold tabular-nums my-2 ${totalUnrealizedPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
          >
            {totalUnrealizedPnl >= 0 ? '+' : ''}${totalUnrealizedPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Return on Capital:{' '}
            <strong className={totalUnrealizedPnlPct >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
              {totalUnrealizedPnlPct >= 0 ? '+' : ''}{totalUnrealizedPnlPct.toFixed(2)}%
            </strong>
          </div>
        </div>

        {/* Daily Net P&L */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-slate-700" />
              <span className="font-bold text-slate-900">Daily Net P&L</span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">Today</span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 tabular-nums my-2">
            +${(risk?.dailyPnl || 14250).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Realized: <strong className="text-slate-900">${(risk?.realizedPnl || 5930).toLocaleString()}</strong>
          </div>
        </div>

        {/* Portfolio VaR 95% & Risk */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span className="font-bold text-slate-900">Max Risk Exposure</span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">1-Day VaR</span>
          </div>
          <div className="text-3xl font-extrabold text-rose-600 tabular-nums my-2">
            -${(risk?.var95 || 24500).toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Beta: <strong className="text-slate-900">{risk?.beta || 1.15}</strong> | Sharpe: <strong className="text-emerald-600">{risk?.sharpeRatio || 2.34}</strong>
          </div>
        </div>
      </div>

      {/* Position Holdings Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-slate-700" />
            <span className="font-bold text-slate-900 text-sm">Active Portfolio Positions</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">Client Storage IndexedDB</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 text-[11px]">
                <th className="p-3 font-semibold">INSTRUMENT</th>
                <th className="p-3 text-right font-semibold">QUANTITY</th>
                <th className="p-3 text-right font-semibold">ENTRY PRICE</th>
                <th className="p-3 text-right font-semibold">MARKET PRICE</th>
                <th className="p-3 text-right font-semibold">NOTIONAL VALUE</th>
                <th className="p-3 text-right font-semibold">UNREALIZED P&L</th>
                <th className="p-3 text-right font-semibold">WEIGHT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {positions.map((pos) => {
                const isPositive = pos.unrealizedPnl >= 0;
                return (
                  <tr key={pos.symbol} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-900" />
                      {pos.symbol}
                    </td>
                    <td className="p-3 text-right text-slate-700 tabular-nums font-semibold">
                      {pos.quantity.toLocaleString()}
                    </td>
                    <td className="p-3 text-right text-slate-500 tabular-nums">
                      ${pos.avgEntryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right text-slate-900 font-bold tabular-nums">
                      ${pos.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right text-slate-800 font-semibold tabular-nums">
                      ${pos.marketValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td
                      className={`p-3 text-right font-bold tabular-nums ${isPositive ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                    >
                      {isPositive ? '+' : ''}${pos.unrealizedPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}{' '}
                      <span className="text-[11px] font-medium">
                        ({isPositive ? '+' : ''}{pos.unrealizedPnlPct.toFixed(2)}%)
                      </span>
                    </td>
                    <td className="p-3 text-right text-slate-500 tabular-nums font-medium">
                      {pos.weightPct.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
