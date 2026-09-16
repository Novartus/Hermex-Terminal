import React from 'react';
import { CapitalizationCardProps } from '../types';
import { cleanSymbol, formatCompactUsd } from '../utils';

export const CapitalizationCard: React.FC<CapitalizationCardProps> = ({
  symbol,
  currentPrice,
  risk,
  liveTicker,
}) => {
  const cleanSym = cleanSymbol(symbol);
  
  // Dynamic market capitalization based on live price & ticker metadata
  let marketCapNum = 1.86e12; // default 1.86T
  let marketCapStr = '$1.86T';

  if (liveTicker && liveTicker.price > 0) {
    marketCapStr = liveTicker.marketCapApprox;
    if (symbol.includes('BTC')) marketCapNum = (currentPrice * 19.8) * 1e9;
    else if (symbol.includes('ETH')) marketCapNum = (currentPrice * 120.4) * 1e9;
    else if (symbol.includes('SOL')) marketCapNum = (currentPrice * 470) * 1e6;
    else if (symbol.includes('BNB')) marketCapNum = (currentPrice * 144) * 1e6;
    else marketCapNum = liveTicker.quoteVolume * 3;
  } else {
    if (symbol.includes('BTC')) {
      marketCapNum = (currentPrice * 19.8) * 1e9;
      marketCapStr = formatCompactUsd(marketCapNum);
    } else if (symbol.includes('ETH')) {
      marketCapNum = (currentPrice * 120.4) * 1e9;
      marketCapStr = formatCompactUsd(marketCapNum);
    } else {
      marketCapNum = currentPrice * 15.2e9;
      marketCapStr = formatCompactUsd(marketCapNum);
    }
  }

  // Realistic corporate/crypto balance sheet ratios derived dynamically
  const netLiabilityNum = marketCapNum * -0.015;
  const enterpriseValNum = marketCapNum + Math.abs(netLiabilityNum);
  const commonEquityNum = marketCapNum * 0.12;
  const totalLiabilityNum = Math.abs(netLiabilityNum);
  const totalCapitalNum = commonEquityNum + totalLiabilityNum;

  const netLiabilityStr = formatCompactUsd(netLiabilityNum);
  const enterpriseValStr = formatCompactUsd(enterpriseValNum).replace('$', '');
  const commonEquityStr = formatCompactUsd(commonEquityNum).replace('$', '');
  const totalLiabilityStr = formatCompactUsd(totalLiabilityNum).replace('$', '');
  const totalCapitalStr = formatCompactUsd(totalCapitalNum).replace('$', '');

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full font-sans transition-colors">
      <div>
        {/* Header */}
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              {cleanSym} Capitalization
            </h3>
            <span className="text-xs text-slate-400">
              Currency in USD • Live valuation
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
            ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: currentPrice >= 100 ? 2 : 4 })}
          </span>
        </div>

        {/* Metrics List */}
        <div className="pt-3 flex flex-col gap-2.5 text-xs">
          {/* Net Liability */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-slate-600">Net Liability</span>
            </div>
            <span className="font-bold text-slate-900 tabular-nums">
              {netLiabilityStr}
            </span>
          </div>

          {/* Market Cap */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-slate-600">Market Cap</span>
            </div>
            <span className="font-bold text-slate-900 tabular-nums">
              {marketCapStr}
            </span>
          </div>

          {/* TEV Divider Row */}
          <div className="flex items-center justify-between py-1.5 border-t border-b border-slate-100 my-0.5">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono font-bold">=</span>
              <span className="font-bold text-slate-900">
                Total Enterprise Value (TEV)
              </span>
            </div>
            <span className="font-extrabold text-slate-900 tabular-nums">
              {enterpriseValStr}
            </span>
          </div>

          {/* Common Equity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-600">Common Equity</span>
            </div>
            <span className="font-bold text-slate-900 tabular-nums">
              {commonEquityStr}
            </span>
          </div>

          {/* Total Liability */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-slate-600">Total Liability</span>
            </div>
            <span className="font-bold text-slate-900 tabular-nums">
              {totalLiabilityStr}
            </span>
          </div>

          {/* Total Capital Divider Row */}
          <div className="flex items-center justify-between py-1.5 border-t border-slate-100 mt-0.5">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono font-bold">=</span>
              <span className="font-bold text-slate-900">Total Capital</span>
            </div>
            <span className="font-extrabold text-slate-900 tabular-nums">
              {totalCapitalStr}
            </span>
          </div>
        </div>
      </div>

      {/* Quant Risk Badge Footnote */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>
          VaR 95%: <strong className="text-rose-600">-${(risk?.var95 || 24500).toLocaleString()}</strong>
        </span>
        <span>
          Sharpe: <strong className="text-emerald-600">{risk?.sharpeRatio.toFixed(2) || '2.34'}</strong>
        </span>
      </div>
    </div>
  );
};
