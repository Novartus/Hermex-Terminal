// Quantitative Metrics and Risk Analytics Helper Functions

/**
 * Returns color class based on VPIN toxicity value
 */
export function getVpinColor(v: number): string {
  if (v < 0.3) return 'text-emerald-600';
  if (v < 0.55) return 'text-amber-600';
  return 'text-rose-600';
}

/**
 * Returns background color class based on VPIN toxicity value
 */
export function getVpinBg(v: number): string {
  if (v < 0.3) return 'bg-emerald-500';
  if (v < 0.55) return 'bg-amber-500';
  return 'bg-rose-500';
}

/**
 * Returns text classification description for VPIN toxicity
 */
export function getVpinStatusLabel(v: number): string {
  return v > 0.5 ? 'Toxic Flow' : 'Normal Flow';
}

/**
 * Interprets Hurst Exponent into statistical market regime description
 */
export function getHurstRegime(h: number): { label: string; colorClass: string } {
  if (h > 0.52) {
    return { label: 'Persistent / Momentum Trend', colorClass: 'text-emerald-600' };
  }
  if (h < 0.48) {
    return { label: 'Mean-Reverting Regime', colorClass: 'text-amber-600' };
  }
  return { label: 'Random Walk', colorClass: 'text-slate-500' };
}

/**
 * Returns Tailwind cell color class for correlation matrix value
 */
export function getCorrelationCellStyle(val: number, isDiag: boolean): string {
  if (isDiag) {
    return 'bg-slate-900 text-white font-bold';
  }
  if (val >= 0.7) {
    return 'bg-emerald-100 text-emerald-900 font-semibold';
  }
  if (val >= 0.4) {
    return 'bg-slate-200 text-slate-800';
  }
  if (val >= 0) {
    return 'bg-slate-100 text-slate-600';
  }
  return 'bg-rose-100 text-rose-900 font-semibold';
}
