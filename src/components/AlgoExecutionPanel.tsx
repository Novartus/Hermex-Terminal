import React, { useState } from 'react';
import { AlgoOrder, AlgoStrategyType } from '../engine/types';
import { Sliders, Play, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { AlgoExecutionPanelProps } from '../types';
import { createAlgoOrder } from '../utils';

export const AlgoExecutionPanel: React.FC<AlgoExecutionPanelProps> = ({
  currentSymbol,
  currentPrice,
  activeOrders,
  onSubmitOrder,
}) => {
  const [strategy, setStrategy] = useState<AlgoStrategyType>('TWAP');
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState<number>(100);
  const [durationSec, setDurationSec] = useState<number>(30);
  const [icebergSize, setIcebergSize] = useState<number>(20);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;

    const newOrder = createAlgoOrder({
      symbol: currentSymbol,
      side,
      strategy,
      quantity,
      benchmarkPrice: currentPrice,
      durationSeconds: durationSec,
      icebergDisplaySize: icebergSize,
    });

    onSubmitOrder(newOrder);
  };

  return (
    <div className="flex flex-col gap-6 font-sans select-none">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Ticket Form */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-slate-700" />
                <span className="font-bold text-slate-900 text-sm">Algo Order Ticket</span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Smart Router</span>
            </div>

            {/* Buy / Sell Direction */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSide('BUY')}
                className={`py-2 rounded-xl font-bold text-xs transition-colors ${side === 'BUY'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
              >
                Buy / Long
              </button>
              <button
                type="button"
                onClick={() => setSide('SELL')}
                className={`py-2 rounded-xl font-bold text-xs transition-colors ${side === 'SELL'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
              >
                Sell / Short
              </button>
            </div>

            {/* Strategy Selection */}
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Strategy Model:</label>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value as AlgoStrategyType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-400"
              >
                <option value="TWAP">TWAP (Time-Weighted Avg Price)</option>
                <option value="VWAP">VWAP (Volume-Weighted Profile)</option>
                <option value="POV">POV (15% Percentage of Volume)</option>
                <option value="ICEBERG">ICEBERG (Hidden Reserve Order)</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">
                Target Quantity ({currentSymbol}):
              </label>
              <input
                type="number"
                min="1"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-400"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Est. Notional: ${(quantity * currentPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Horizon */}
            {strategy === 'ICEBERG' ? (
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">
                  Visible Display Size:
                </label>
                <input
                  type="number"
                  min="1"
                  value={icebergSize}
                  onChange={(e) => setIcebergSize(parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>
            ) : (
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">
                  Execution Horizon (Seconds):
                </label>
                <input
                  type="number"
                  min="5"
                  max="600"
                  value={durationSec}
                  onChange={(e) => setDurationSec(parseInt(e.target.value, 10) || 30)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-2 w-full py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-black transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Route Algo Order
            </button>
          </form>
        </div>

        {/* Active & Historical Executions */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-900 text-sm">Active Execution Monitor</span>
              </div>
              <span className="text-xs text-slate-400">Kyle's Lambda Slippage</span>
            </div>

            {activeOrders.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs font-medium">
                No active execution orders. Submit an order from the ticket to track real-time slicing and fills.
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[340px] overflow-y-auto">
                {activeOrders.map((order) => {
                  const fillPct = Math.min(100, Math.round((order.filledQuantity / order.targetQuantity) * 100));
                  return (
                    <div
                      key={order.id}
                      className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 flex flex-col gap-2.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${order.side === 'BUY'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                              }`}
                          >
                            {order.side}
                          </span>
                          <span className="font-bold text-slate-900">{order.symbol}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-slate-600 font-semibold border border-slate-200">
                            {order.strategy}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-xs">
                          {order.status === 'COMPLETED' ? (
                            <span className="flex items-center gap-1 text-emerald-600 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> FILLED
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-slate-900 font-semibold animate-pulse">
                              SLICING ({fillPct}%)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-900 transition-all duration-300"
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>

                      {/* Breakdown */}
                      <div className="grid grid-cols-4 gap-2 text-xs text-slate-500 mt-1">
                        <div>
                          <span>Filled:</span>{' '}
                          <strong className="text-slate-900">
                            {order.filledQuantity} / {order.targetQuantity}
                          </strong>
                        </div>
                        <div>
                          <span>Avg Fill:</span>{' '}
                          <strong className="text-slate-900">
                            ${order.avgFillPrice.toFixed(2)}
                          </strong>
                        </div>
                        <div>
                          <span>Arrival:</span>{' '}
                          <strong className="text-slate-600">
                            ${order.benchmarkPrice.toFixed(2)}
                          </strong>
                        </div>
                        <div>
                          <span>Slippage:</span>{' '}
                          <strong
                            className={order.slippageBps > 5 ? 'text-amber-600' : 'text-emerald-600'}
                          >
                            +{order.slippageBps.toFixed(1)} bps
                          </strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Slippage model dynamically reflects current L2 order book wall depletion.
            </span>
            <span className="font-semibold text-slate-500">Real-Time Core</span>
          </div>
        </div>
      </div>
    </div>
  );
};
