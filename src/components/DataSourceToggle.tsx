import React from 'react';
import { Cpu } from 'lucide-react';
import { MarketDataSource } from '../engine/types';

interface DataSourceToggleProps {
  dataSource: MarketDataSource;
  onSelectLive: () => void;
  onRequestSim: () => void;
}

export const DataSourceToggle: React.FC<DataSourceToggleProps> = ({
  dataSource,
  onSelectLive,
  onRequestSim,
}) => {
  return (
    <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200/80 shadow-2xs ml-1">
      <button
        onClick={onSelectLive}
        className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
          dataSource === 'BINANCE_LIVE'
            ? 'bg-white text-emerald-700 shadow-sm'
            : 'text-slate-500 hover:text-slate-800'
        }`}
        title="Connect to live Binance WebSockets"
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            dataSource === 'BINANCE_LIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
          }`}
        />
        <span>LIVE</span>
      </button>

      <button
        onClick={onRequestSim}
        className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
          dataSource === 'SYNTHETIC_HFT'
            ? 'bg-white text-indigo-600 shadow-sm'
            : 'text-slate-500 hover:text-slate-800'
        }`}
        title="Switch to Web Worker HFT Synthetic Simulation"
      >
        <Cpu className="w-3 h-3" />
        <span>SIM</span>
      </button>
    </div>
  );
};
