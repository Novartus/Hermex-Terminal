import { AlgoOrder, AlgoStrategyType } from '../engine/types';

export interface CreateOrderParams {
  symbol: string;
  side: 'BUY' | 'SELL';
  strategy?: AlgoStrategyType;
  quantity: number;
  benchmarkPrice: number;
  limitPrice?: number;
  durationSeconds?: number;
  icebergDisplaySize?: number;
  slippageBps?: number;
  marketImpactEstimateBps?: number;
}

/**
 * Creates an immutable AlgoOrder instance with calculated impact and defaults
 */
export function createAlgoOrder(params: CreateOrderParams): AlgoOrder {
  const strategy = params.strategy || 'TWAP';
  const marketImpact = params.marketImpactEstimateBps !== undefined
    ? params.marketImpactEstimateBps
    : Math.round((params.quantity / 500) * 1.8 * 10) / 10;

  return {
    id: `algo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    symbol: params.symbol,
    side: params.side,
    strategy,
    targetQuantity: params.quantity,
    filledQuantity: 0,
    avgFillPrice: params.limitPrice || 0,
    benchmarkPrice: params.benchmarkPrice,
    status: 'EXECUTING',
    startTime: Date.now(),
    durationSeconds: params.durationSeconds ?? 30,
    icebergDisplaySize: strategy === 'ICEBERG' ? params.icebergDisplaySize : undefined,
    slippageBps: params.slippageBps ?? 0,
    marketImpactEstimateBps: marketImpact,
    executions: [],
  };
}

/**
 * Calculates investment totals including fees and side considerations
 */
export function calculateOrderFinancials(
  price: number,
  quantity: number,
  side: 'BUY' | 'SELL',
  fee: number = 5.0
): { investmentTotal: number; grandTotal: number } {
  const investmentTotal = Math.round(price * quantity * 100) / 100;
  const grandTotal = Math.round((investmentTotal + (side === 'BUY' ? fee : -fee)) * 100) / 100;
  return { investmentTotal, grandTotal };
}
