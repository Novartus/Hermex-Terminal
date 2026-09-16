import React from 'react';
import { ChevronDown } from 'lucide-react';
import { INSTRUMENTS } from '../engine/instruments';
import { cleanSymbol } from '../utils';

interface AssetDropdownProps {
  currentSymbol: string;
  onSymbolChange: (symbol: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export const AssetDropdown: React.FC<AssetDropdownProps> = ({
  currentSymbol,
  onSymbolChange,
  isOpen,
  onToggle,
  onClose,
}) => {
  const displaySymbol = cleanSymbol(currentSymbol);

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 sm:gap-2 hover:bg-slate-50 px-1.5 sm:px-2 py-1 rounded-xl transition-colors group cursor-pointer"
      >
        <span className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">
          {displaySymbol} <span className="hidden xs:inline">Graph Comparison</span>
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Select Live / Tracked Asset
            </div>
            {INSTRUMENTS.map((inst) => (
              <button
                key={inst.symbol}
                onClick={() => {
                  onSymbolChange(inst.symbol);
                  onClose();
                }}
                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                  currentSymbol === inst.symbol ? 'font-bold text-slate-900 bg-slate-50' : 'text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                    {inst.symbol.charAt(0)}
                  </span>
                  <span>{inst.name}</span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">
                  {inst.isLiveSupported ? 'LIVE' : 'SIM'}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
