import React, { useState, useMemo } from 'react';
import { TradeTick } from '../engine/types';
import { Activity, Filter } from 'lucide-react';
import { TimeAndSalesTapeProps } from '../types';
import { formatTapeTime } from '../utils';

export const TimeAndSalesTape: React.FC<TimeAndSalesTapeProps & { precision?: number }> = ({
  trades,
  precision = 2,
}) => {
  const [whaleOnly, setWhaleOnly] = useState(false);

  const filteredTrades = useMemo(() => {
    if (whaleOnly) {
      return trades.filter((t) => t.isWhale);
    }
    return trades;
  }, [trades, whaleOnly]);

  const { buyPct } = useMemo(() => {
    let b = 0;
    let s = 0;
    trades.slice(0, 50).forEach((t) => {
      if (t.side === 'BUY') b += t.size * t.price;
      else s += t.size * t.price;
    });
    const total = b + s || 1;
    return { buyPct: Math.round((b / total) * 100) };
  }, [trades]);

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200/80 rounded-2xl overflow-hidden font-sans text-xs select-none shadow-sm">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-700" />
          <span className="font-bold text-slate-900 text-sm">Time & Sales (The Tape)</span>
        </div>

        {/* Whale Filter Toggle */}
        <button
          onClick={() => setWhaleOnly(!whaleOnly)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
            whaleOnly
              ? 'bg-slate-900 text-white border-slate-900'
              : 'border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Filter className="w-3 h-3" />
          Whales Only
        </button>
      </div>

      {/* Aggressive Volume Ratio Gauge */}
      <div className="px-4 py-2 bg-slate-50/60 border-b border-slate-100">
        <div className="flex justify-between text-[11px] mb-1 font-semibold">
          <span className="text-emerald-600">Buy Vol: {buyPct}%</span>
          <span className="text-rose-600">Sell Vol: {100 - buyPct}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-emerald-500 transition-all duration-150"
            style={{ width: `${buyPct}%` }}
          />
          <div
            className="h-full bg-rose-500 transition-all duration-150"
            style={{ width: `${100 - buyPct}%` }}
          />
        </div>
      </div>

      {/* Table Headers */}
      <div className="grid grid-cols-4 px-4 py-2 bg-slate-50/30 text-[11px] text-slate-400 font-semibold border-b border-slate-100">
        <div>TIME</div>
        <div>PRICE</div>
        <div className="text-right">SIZE</div>
        <div className="text-right">NOTIONAL</div>
      </div>

      {/* Tape Rows */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {filteredTrades.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs font-medium">
            Listening for trade executions...
          </div>
        ) : (
          filteredTrades.slice(0, 100).map((trade) => {
            const notional = trade.price * trade.size;
            return (
              <div
                key={trade.id}
                className={`grid grid-cols-4 px-4 py-1.5 items-center hover:bg-slate-50/70 transition-colors ${
                  trade.isWhale ? 'bg-amber-50/60' : ''
                }`}
              >
                <div className="text-slate-400 text-[11px] tabular-nums font-mono">
                  {formatTapeTime(trade.timestamp)}
                </div>

                <div
                  className={`font-bold tabular-nums text-xs ${
                    trade.side === 'BUY' ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  ${trade.price.toFixed(precision)}
                </div>

                <div className="text-right text-slate-700 font-semibold tabular-nums text-xs">
                  {trade.size.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  })}
                </div>

                <div className="text-right flex items-center justify-end gap-1 tabular-nums text-xs font-medium">
                  {trade.isWhale && (
                    <span className="text-[9px] font-bold px-1 rounded bg-amber-100 text-amber-800 border border-amber-200">
                      BLOCK
                    </span>
                  )}
                  <span className="text-slate-500">
                    ${notional >= 1000 ? `${(notional / 1000).toFixed(1)}k` : notional.toFixed(0)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
