// Market & Candle Calculation Helpers
// Eliminates repetitive candle merging and sorting logic across feeds and charts

import { Candle } from '../engine/types';

/**
 * Merges an incoming live candle bar into an existing candle series
 * Guarantees strict ascending time ordering required by financial charting engines
 */
export function mergeCandle(prev: Candle[], newCandle: Candle, maxBars: number = 100): Candle[] {
  if (prev.length === 0) return [newCandle];
  const last = prev[prev.length - 1];

  if (newCandle.time === last.time) {
    return [
      ...prev.slice(0, -1),
      {
        ...last,
        high: Math.max(last.high, newCandle.high),
        low: Math.min(last.low, newCandle.low),
        close: newCandle.close,
        volume: last.volume + newCandle.volume,
      },
    ];
  }

  if (newCandle.time > last.time) {
    return [...prev.slice(-(maxBars - 1)), newCandle];
  }

  const existingIdx = prev.findIndex((p) => p.time === newCandle.time);
  if (existingIdx !== -1) {
    const copy = [...prev];
    copy[existingIdx] = newCandle;
    return copy;
  }

  return [...prev, newCandle].sort((a, b) => a.time - b.time).slice(-maxBars);
}

/**
 * Deduplicates and sorts candle series to ensure strictly ascending timestamps
 */
export function sortAndDeduplicateCandles(candles: Candle[]): Candle[] {
  const sorted = [...candles].sort((a, b) => a.time - b.time);
  const clean: Candle[] = [];
  for (const c of sorted) {
    if (clean.length === 0 || c.time > clean[clean.length - 1].time) {
      clean.push(c);
    } else if (c.time === clean[clean.length - 1].time) {
      clean[clean.length - 1] = c;
    }
  }
  return clean;
}
