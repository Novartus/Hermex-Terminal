import { Time, LineData, CandlestickData } from 'lightweight-charts';
import { Candle, TradeTick } from '../engine/types';
import { sortAndDeduplicateCandles } from './market-helpers';

export interface ChartSeriesDataset {
  lineData: LineData<Time>[];
  targetData: LineData<Time>[];
  candleData: CandlestickData<Time>[];
}

/**
 * Transforms raw candles into Lightweight Charts line, target, and candlestick series datasets
 */
export function buildChartDatasets(candles: Candle[], targetMultiplier: number = 0.96): ChartSeriesDataset {
  const validCandles = sortAndDeduplicateCandles(candles);
  const lineData: LineData<Time>[] = [];
  const targetData: LineData<Time>[] = [];
  const candleData: CandlestickData<Time>[] = [];

  for (const c of validCandles) {
    const time = c.time as Time;
    lineData.push({ time, value: c.close });
    targetData.push({ time, value: c.close * targetMultiplier });
    candleData.push({
      time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    });
  }

  return { lineData, targetData, candleData };
}

/**
 * Calculates updated series points for latest incoming tick
 */
export function buildLatestTickUpdate(
  lastCandle: Candle,
  latestTrade: TradeTick,
  targetMultiplier: number = 0.96
): {
  time: Time;
  linePoint: LineData<Time>;
  targetPoint: LineData<Time>;
  candlePoint: CandlestickData<Time>;
} {
  const time = lastCandle.time as Time;
  return {
    time,
    linePoint: { time, value: latestTrade.price },
    targetPoint: { time, value: latestTrade.price * targetMultiplier },
    candlePoint: {
      time,
      open: lastCandle.open,
      high: Math.max(lastCandle.high, latestTrade.price),
      low: Math.min(lastCandle.low, latestTrade.price),
      close: latestTrade.price,
    },
  };
}
