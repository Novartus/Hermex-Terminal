import React, { useState } from 'react';
import { OrderBookL2 } from '../engine/types';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { OrderBookDepthProps } from '../types';

export const OrderBookDepth: React.FC<OrderBookDepthProps & { precision?: number }> = ({
  orderBook,
  precision = 2,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Clean fallback demo levels if orderbook is booting
  const asks = orderBook && orderBook.asks.length > 0 
    ? orderBook.asks.slice(0, 4).reverse()
    : [
        { price: 190.50, size: 500, total: 95250 },
        { price: 190.45, size: 1200, total: 228540 },
        { price: 190.40, size: 1800, total: 342720 },
        { price: 190.35, size: 750, total: 142762.50 },
      ];

  const bids = orderBook && orderBook.bids.length > 0
    ? orderBook.bids.slice(0, 4)
    : [
        { price: 190.30, size: 1000, total: 190300 },
        { price: 190.25, size: 1500, total: 285375 },
        { price: 190.20, size: 2200, total: 418440 },
        { price: 190.15, size: 2200, total: 418440 },
      ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full font-sans transition-colors">
      <div>
        {/* Card Header matching reference */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-base text-slate-900">
            Order Book
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Table Column Headers */}
        <div className="grid grid-cols-3 py-2 text-xs font-medium text-slate-400">
          <div>Price</div>
          <div className="text-center">Amount</div>
          <div className="text-right">Total</div>
        </div>

        {isExpanded && (
          <div className="flex flex-col gap-1 text-xs">
            {/* Asks (Sells) */}
            {asks.map((a, i) => (
              <div key={`ask-${a.price}-${i}`} className="grid grid-cols-3 py-1 items-center">
                <div className="text-rose-600 font-semibold tabular-nums">
                  {a.price.toFixed(precision)}
                </div>
                <div className="text-center text-slate-700 tabular-nums">
                  {a.size.toLocaleString()}
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-rose-50 text-slate-800 font-medium tabular-nums border border-rose-100">
                    {a.total.toLocaleString(undefined, { minimumFractionDigits: precision === 2 ? 0 : 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ))}

            <div className="my-1.5 border-t border-dashed border-slate-200" />

            {/* Bids (Buys) */}
            {bids.map((b, i) => (
              <div key={`bid-${b.price}-${i}`} className="grid grid-cols-3 py-1 items-center">
                <div className="text-emerald-600 font-semibold tabular-nums">
                  {b.price.toFixed(precision)}
                </div>
                <div className="text-center text-slate-700 tabular-nums">
                  {b.size.toLocaleString()}
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-slate-800 font-medium tabular-nums border border-emerald-100">
                    {b.total.toLocaleString(undefined, { minimumFractionDigits: precision === 2 ? 0 : 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Spread Note */}
      {orderBook && (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Spread: ${orderBook.spread.toFixed(precision)}</span>
          <span>Micro: ${orderBook.microPrice.toFixed(precision)}</span>
        </div>
      )}
    </div>
  );
};
