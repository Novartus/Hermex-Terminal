import React from 'react';
import { ExternalLink } from 'lucide-react';
import { PeerAnalysisCardProps } from '../types';
import { LiveTicker } from '../engine/live-market-service';
import { cleanSymbol } from '../utils';

export const PeerAnalysisCard: React.FC<PeerAnalysisCardProps> = ({
  currentSymbol,
  liveTickers,
  onSelectSymbol,
}) => {
  // Exclude current symbol from peers to compare against
  const peers = liveTickers.filter((t) => t.symbol !== currentSymbol).slice(0, 4);
  const referenceAsset = liveTickers.find((t) => t.symbol === currentSymbol) || liveTickers[0];

  // Colors for brand badges
  const bgColors = ['bg-rose-500', 'bg-amber-500', 'bg-emerald-600', 'bg-slate-800'];

  const renderPeerRow = (ticker: LiveTicker, idx: number, isRef = false) => {
    const cleanSym = cleanSymbol(ticker.symbol);
    const isPositive = ticker.priceChangePercent >= 0;
    // Normalized turnover volume percentage
    const progressPct = Math.min(95, Math.max(25, Math.round((ticker.quoteVolume / 1000000000) * 20)));

    return (
      <div
        key={ticker.symbol}
        onClick={() => onSelectSymbol && onSelectSymbol(ticker.symbol)}
        className="flex items-center justify-between py-2 hover:bg-slate-50 px-2 rounded-xl transition-colors cursor-pointer group"
      >
        <div className="flex items-center gap-2.5 min-w-[85px]">
          <div
            className={`w-7 h-7 rounded-full ${bgColors[idx % bgColors.length]} text-white flex items-center justify-center text-xs font-bold shadow-sm`}
          >
            {cleanSym.charAt(0)}
          </div>
          <div>
            <span className="font-extrabold text-sm text-slate-900 group-hover:text-slate-700">
              {cleanSym}
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">
              ${ticker.price.toLocaleString(undefined, { minimumFractionDigits: ticker.price > 10 ? 2 : 4 })}
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 flex-1 max-w-[240px] mx-3">
          <span className="text-[11px] text-slate-400 whitespace-nowrap">
            24h Turnover
          </span>
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden flex items-center relative">
            <div
              className="h-full bg-slate-800 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-700 tabular-nums">
            ${(ticker.quoteVolume / 1000000).toFixed(0)}M
          </span>
        </div>

        <div className="flex items-center">
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold tabular-nums border ${isPositive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                : 'bg-rose-50 text-rose-700 border-rose-200/60'
              }`}
          >
            {isPositive ? '+' : ''}
            {ticker.priceChangePercent.toFixed(2)}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full font-sans transition-colors">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Live Peer Analysis
            </h3>
            <span className="text-xs text-slate-400">
              Real-time exchange cross-market metrics
            </span>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE
          </span>
        </div>

        {/* Real Peer Rows */}
        <div className="pt-2 flex flex-col gap-1">
          {peers.map((peer, idx) => renderPeerRow(peer, idx))}
        </div>
      </div>

      {/* Reference Asset */}
      {referenceAsset && (
        <div className="pt-3 border-t border-slate-100 mt-2">
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            Reference asset ({cleanSymbol(referenceAsset.symbol)})
          </span>
          {renderPeerRow(referenceAsset, 3, true)}
        </div>
      )}
    </div>
  );
};
