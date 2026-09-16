import React, { useState } from 'react';
import {
  TrendingUp,
  Activity,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  ArrowRight,
  Globe,
  Radio,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { ThreeGlobeVisualizer } from './ThreeGlobeVisualizer';
import { D3MacroFlowChart } from './D3MacroFlowChart';
import { LiveTicker } from '../types';
import { cleanSymbol, formatCompactUsd, formatPrice, formatPercent } from '../utils';

interface WelcomeScreenProps {
  onEnterDashboard: () => void;
  liveTickers: LiveTicker[];
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onEnterDashboard,
  liveTickers,
  selectedSymbol,
  onSelectSymbol,
}) => {
  const [selectedDesk, setSelectedDesk] = useState<'HFT' | 'QUANT' | 'PORTFOLIO'>('HFT');

  const activeTicker = liveTickers.find((t) => t.symbol === selectedSymbol) || liveTickers[0] || {
    symbol: 'BTCUSDT',
    name: 'Bitcoin',
    price: 94250.00,
    priceChangePercent: 1.45,
    highPrice: 95800,
    lowPrice: 93100,
    volume: 45000,
    quoteVolume: 4200000000,
    marketCapApprox: '$1.86T',
  };

  const cleanSym = cleanSymbol(activeTicker.symbol);

  const keyFeatures = [
    {
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      title: 'Sub-100ms L2 Microstructure',
      description: 'Real-time WebSocket streaming directly from global liquidity pools without server proxies.',
    },
    {
      icon: <Cpu className="w-5 h-5 text-indigo-500" />,
      title: 'Browser Web Worker Quant Engine',
      description: 'Hawkes trade arrivals, VPIN adverse toxicity, and Monte Carlo 10,000-run VaR in background threads.',
    },
    {
      icon: <Activity className="w-5 h-5 text-emerald-500" />,
      title: 'Algorithmic Smart Order Router',
      description: 'Institutional TWAP, VWAP, POV, and Iceberg execution models with Kyle’s Lambda slippage analysis.',
    },
  ];

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#f4f6f9] text-slate-900 font-sans flex flex-col justify-between selection:bg-slate-200">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs sm:text-sm shadow-sm shrink-0">
              HX
            </div>
            <div>
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 block leading-tight">
                Hermex Terminal
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden xs:block">
                High-Frequency Trading & Statistical Trends
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Direct Public Exchange Engine • Real-Time Feeds</span>
            </div>

            <a
              href="#/dashboard"
              onClick={(e) => {
                e.preventDefault();
                onEnterDashboard();
              }}
              className="px-3 sm:px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 sm:gap-2 transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Launch Terminal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="max-w-7xl mx-auto px-3.5 sm:px-6 py-6 sm:py-8 flex-1 flex flex-col justify-center w-full max-w-full overflow-x-hidden">
        {/* Top Hero Banner */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs mb-4">
            <Radio className="w-3.5 h-3.5 text-emerald-600" />
            <span>Interactive Liquidity & Flow Visualization System</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Institutional Data Visualization Engineered for <span className="text-emerald-700">HFT</span> & Statistical Trends
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-3 max-w-2xl mx-auto">
            Track microsecond book depths, toxic order flow (VPIN), GARCH conditional volatility cones, and cross-asset correlation networks directly in your browser.
          </p>
        </div>

        {/* 2-Column Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-8">
          {/* Left: Interactive Global Liquidity Visualizer */}
          <section className="lg:col-span-6 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 z-10">
              <div>
                <h2 className="text-xs font-bold text-slate-900 block">Global Order Flow Visualizer</h2>
                <p className="text-[11px] text-slate-400">Institutional cross-venue liquidity orbital mapping</p>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                WebGL 60FPS
              </span>
            </div>

            {/* 3D Canvas */}
            <div className="h-[280px] w-full my-2">
              <ThreeGlobeVisualizer activeSymbol={cleanSym} price={activeTicker.price} />
            </div>

            {/* Bottom Live Asset Switcher Ribbon */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between z-10">
              <span className="text-xs text-slate-500 font-semibold">Active Reference:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {liveTickers.slice(0, 5).map((t) => (
                  <button
                    key={t.symbol}
                    onClick={() => onSelectSymbol(t.symbol)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedSymbol === t.symbol
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                    }`}
                  >
                    {cleanSymbol(t.symbol)}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Right: Macro Order Flow & Metric Stream */}
          <section className="lg:col-span-6 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-xs font-bold text-slate-900 block">Real-Time Liquidity Flow Dynamics</h2>
                  <p className="text-[11px] text-slate-400">Dynamic cumulative liquidity & volatility wave curve</p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                  <span>{formatPercent(activeTicker.priceChangePercent)}</span>
                </div>
              </div>

              {/* Live Metric Badges */}
              <div className="grid grid-cols-3 gap-3 my-4">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">24h Price</span>
                  <span className="text-sm sm:text-base font-extrabold text-slate-900 tabular-nums">
                    ${formatPrice(activeTicker.price)}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">24h Turnover</span>
                  <span className="text-sm sm:text-base font-extrabold text-slate-900 tabular-nums">
                    {formatCompactUsd(activeTicker.quoteVolume)}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Est. Mkt Cap</span>
                  <span className="text-sm sm:text-base font-extrabold text-slate-900 tabular-nums">
                    {activeTicker.marketCapApprox}
                  </span>
                </div>
              </div>

              {/* Liquidity Flow Curve */}
              <div className="my-1">
                <D3MacroFlowChart />
              </div>
            </div>

            {/* Quick Launch CTA */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Ready to explore microstructure?</span>
              <a
                href="#/dashboard"
                onClick={(e) => {
                  e.preventDefault();
                  onEnterDashboard();
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <span>Enter Live Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </section>
        </div>

        {/* 3 Value Pillars */}
        <section aria-label="Key Platform Capabilities" className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {keyFeatures.map((feat) => (
            <article
              key={feat.title}
              className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-start gap-3.5"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0">
                {feat.icon}
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">{feat.title}</h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{feat.description}</p>
              </div>
            </article>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200/80 mt-auto select-none">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 text-xs text-slate-500 text-center flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <span className="font-medium text-slate-500">
            &copy; {new Date().getFullYear()} Hermex Institutional HFT Analytics Platform. All rights reserved.
          </span>
          <span className="text-slate-500">
            Crafted by{' '}
            <a
              href="https://novartus.github.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-slate-800 hover:text-indigo-600 underline underline-offset-4 decoration-slate-300 hover:decoration-indigo-500 transition-colors"
            >
              Novartus
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
};
