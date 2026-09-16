import React from 'react';
import { Cpu, X, CheckCircle2 } from 'lucide-react';

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const SimulationModal: React.FC<SimulationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-md w-full p-6 z-10 font-sans">
        <div className="flex items-start justify-between gap-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Switch to Web Worker Simulation Mode?
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Here is what happens when you switch from Live Exchange feeds to the Synthetic HFT Engine:
          </p>

          <div className="mt-4 space-y-2.5 bg-slate-50/80 border border-slate-200/70 rounded-2xl p-3.5 text-xs text-slate-600">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                <strong>Isolated Background Thread:</strong> Runs order book matching and Poisson tick generation in a dedicated Web Worker without main-thread UI lag.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                <strong>Synthetic Microstructure:</strong> Simulates resting L2 liquidity depth, whale trades, and algorithmic order flow (TWAP/VWAP/Iceberg).
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                <strong>Offline Resilience:</strong> Enables quant testing, Monte Carlo risk runs, and algo execution even without external exchange connectivity.
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
          >
            Enable SIM Mode
          </button>
        </div>
      </div>
    </div>
  );
};
