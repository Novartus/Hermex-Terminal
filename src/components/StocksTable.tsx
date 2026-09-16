import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { StocksTableProps } from '../types';
import { cleanSymbol } from '../utils';

export const StocksTable: React.FC<StocksTableProps> = ({
  currentSymbol,
  onSelectSymbol,
  activePrice,
  liveTickers,
}) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-medium bg-slate-50/50">
              <th className="py-3 px-4 font-semibold text-slate-500">Asset & Market</th>
              <th className="py-3 px-4 text-center font-semibold text-slate-500">Price in USD</th>
              <th className="py-3 px-4 text-center font-semibold text-slate-500">24h High / Low</th>
              <th className="py-3 px-4 text-center font-semibold text-slate-500">Est. Mkt Cap</th>
              <th className="py-3 px-4 text-right font-semibold text-slate-500">24h Returns</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {liveTickers.map((row) => {
              const isSelected = currentSymbol === row.symbol;
              const displayPrice = isSelected ? activePrice : row.price;
              const isPositive = row.priceChangePercent >= 0;
              const cleanSym = cleanSymbol(row.symbol);

              return (
                <tr
                  key={row.symbol}
                  onClick={() => onSelectSymbol(row.symbol)}
                  className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${isSelected ? 'bg-slate-50/60' : ''
                    }`}
                >
                  {/* Asset Info & Tag */}
                  <td className="py-3.5 px-4 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      {cleanSym.charAt(0)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">{cleanSym}</span>
                      <span className="text-slate-500 hidden sm:inline text-xs">{row.name}</span>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold">
                          This stock
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Real Live Price */}
                  <td className="py-3.5 px-4 text-center font-extrabold text-slate-900 text-sm tabular-nums">
                    ${displayPrice.toLocaleString(undefined, {
                      minimumFractionDigits: displayPrice >= 100 ? 2 : 4,
                      maximumFractionDigits: displayPrice >= 100 ? 2 : 4,
                    })}
                  </td>

                  {/* 24h High / Low */}
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-600 tabular-nums">
                    <span className="text-emerald-700">${row.highPrice.toLocaleString()}</span>
                    <span className="text-slate-300 mx-1.5">/</span>
                    <span className="text-rose-700">${row.lowPrice.toLocaleString()}</span>
                  </td>

                  {/* Market Cap */}
                  <td className="py-3.5 px-4 text-center font-bold text-slate-800 tabular-nums">
                    {row.marketCapApprox}
                  </td>

                  {/* 24h Returns */}
                  <td className="py-3.5 px-4 text-right">
                    <div
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold tabular-nums text-xs ${isPositive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                        }`}
                    >
                      {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      <span>
                        {isPositive ? '+' : ''}
                        {row.priceChangePercent.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
