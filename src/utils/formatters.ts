// Centralized Formatting Utilities for Hermex
// Eliminates code duplication across all dashboard components

/**
 * Strips USDT or other quote tickers to produce a clean asset ticker (e.g. BTCUSDT -> BTC)
 */
export function cleanSymbol(symbol: string): string {
  if (!symbol) return '';
  return symbol.replace(/USDT$/i, '');
}

/**
 * Formats large USD currency numbers with compact unit suffixes (K, M, B, T)
 * Handles negative values cleanly
 */
export function formatCompactUsd(val: number): string {
  if (isNaN(val)) return '$0.00';
  const abs = Math.abs(val);
  const sign = val < 0 ? '-' : '';

  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(1)}K`;

  return `${sign}$${abs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Formats market prices with precision depending on price scale
 */
export function formatPrice(price: number, minDecimals?: number, maxDecimals?: number): string {
  if (isNaN(price)) return '0.00';
  const defaultMin = price >= 100 ? 2 : 4;
  const defaultMax = price >= 100 ? 2 : 4;
  return price.toLocaleString(undefined, {
    minimumFractionDigits: minDecimals ?? defaultMin,
    maximumFractionDigits: maxDecimals ?? defaultMax,
  });
}

/**
 * Formats percentage change with explicit +/- sign
 */
export function formatPercent(pct: number, decimals: number = 2): string {
  if (isNaN(pct)) return '0.00%';
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(decimals)}%`;
}

/**
 * Formats millisecond timestamps into HH:mm:ss.SSS for the virtualized order tape
 */
export function formatTapeTime(ts: number): string {
  const d = new Date(ts);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  const ms = String(d.getMilliseconds()).padStart(3, '0');
  return `${h}:${m}:${s}.${ms}`;
}
