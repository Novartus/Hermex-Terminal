import React, { useState, useEffect } from 'react';
import { Minus, Plus, Settings2, CheckCircle2 } from 'lucide-react';
import { AlgoOrder } from '../engine/types';
import { BuyStockCardProps } from '../types';
import {
  cleanSymbol as getCleanSymbol,
  calculateOrderFinancials,
  createAlgoOrder,
} from '../utils';

export const BuyStockCard: React.FC<BuyStockCardProps> = ({
  symbol,
  currentPrice,
  onPlaceOrder,
  tradingBalance = 10000.00,
}) => {
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [sliderPct, setSliderPct] = useState<number>(19);
  const [price, setPrice] = useState<number>(currentPrice || 190.25);
  const [quantity, setQuantity] = useState<number>(10);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (currentPrice > 0) {
      setPrice(Number(currentPrice.toFixed(2)));
    }
  }, [currentPrice]);

  const handleSliderChange = (pct: number) => {
    setSliderPct(pct);
    const targetInvestment = (tradingBalance * pct) / 100;
    const calcQty = Math.max(1, Math.round((targetInvestment / (price || 1)) * 100) / 100);
    setQuantity(calcQty);
  };

  const transactionFee = 5.00;
  const { investmentTotal, grandTotal } = calculateOrderFinancials(price, quantity, side, transactionFee);

  const handlePriceStep = (delta: number) => {
    const next = Math.max(0.01, Number((price + delta).toFixed(2)));
    setPrice(next);
  };

  const handleQtyStep = (delta: number) => {
    const next = Math.max(1, Math.round(quantity + delta));
    setQuantity(next);
    const pct = Math.min(100, Math.round(((next * price) / tradingBalance) * 100));
    setSliderPct(pct);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const order = createAlgoOrder({
      symbol,
      side,
      strategy: 'TWAP',
      quantity,
      benchmarkPrice: currentPrice,
      limitPrice: price,
      durationSeconds: 15,
      slippageBps: 0.8,
      marketImpactEstimateBps: 1.2,
    });

    onPlaceOrder(order);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 2500);
  };

  const cleanSymbol = getCleanSymbol(symbol);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full font-sans transition-colors">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSide('BUY')}
              className={`text-base font-bold transition-colors ${side === 'BUY'
                  ? 'text-slate-900'
                  : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              Buy Stock
            </button>
            <span className="text-slate-300">/</span>
            <button
              onClick={() => setSide('SELL')}
              className={`text-base font-bold transition-colors ${side === 'SELL'
                  ? 'text-slate-900'
                  : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              Sell Stock
            </button>
          </div>
          <button className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors">
            <Settings2 className="w-4 h-4" />
          </button>
        </div>

        {/* Balance & Slider */}
        <div className="py-4 border-b border-slate-100">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-500">Trading balance</span>
            <span className="font-semibold text-slate-900 tabular-nums">
              ${tradingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPct}
              onChange={(e) => handleSliderChange(parseInt(e.target.value, 10))}
              className="flex-1 w-full"
            />
            <span className="text-xs font-semibold text-slate-500 min-w-[32px] text-right tabular-nums">
              {sliderPct}%
            </span>
          </div>
        </div>

        {/* Investment Total */}
        <div className="flex items-center justify-between py-3 border-b border-slate-100 text-sm">
          <span className="text-slate-500">Investment Total</span>
          <span className="font-bold text-slate-900 tabular-nums">
            ${investmentTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Stepper Inputs: Buy Price & Quantity */}
        <div className="py-3 flex flex-col gap-3">
          {/* Price Stepper */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              {side === 'BUY' ? 'Buy Price' : 'Sell Price'}
            </span>
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => handlePriceStep(-0.25)}
                className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-900 rounded-lg transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="w-20 text-center text-xs font-bold text-slate-900 bg-transparent focus:outline-none tabular-nums"
              />
              <button
                type="button"
                onClick={() => handlePriceStep(0.25)}
                className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-900 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quantity Stepper */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Quantity</span>
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => handleQtyStep(-1)}
                className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-900 rounded-lg transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-20 text-center text-xs font-bold text-slate-900 bg-transparent focus:outline-none tabular-nums"
              />
              <button
                type="button"
                onClick={() => handleQtyStep(1)}
                className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-900 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Total, Fee & Primary Button */}
      <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-700">Total</span>
          <span className="font-bold text-slate-900 tabular-nums">
            ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Transaction Fee</span>
          <span>${transactionFee}</span>
        </div>

        <button
          onClick={handleSubmit}
          className={`w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all shadow-sm ${side === 'BUY'
              ? 'bg-slate-900 hover:bg-black active:scale-[0.99]'
              : 'bg-rose-600 hover:bg-rose-700 active:scale-[0.99]'
            }`}
        >
          {isSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Order Submitted!
            </>
          ) : (
            `${side === 'BUY' ? 'Buy' : 'Sell'} ${cleanSymbol}`
          )}
        </button>

        <p className="text-[11px] text-center text-slate-400 leading-tight">
          By placing this order, you agree to our{' '}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              alert('Simulation & Trading Terms: All market analytics and orders executed on Hermex are subject to standard paper trading execution guidelines.');
            }}
            className="text-slate-700 hover:underline font-medium cursor-pointer"
          >
            Terms and Conditions
          </button>
          .
        </p>
      </div>
    </div>
  );
};
