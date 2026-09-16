import React, { useEffect, useRef, useState } from 'react';
import {
  createChart,
  LineSeries,
  CandlestickSeries,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  LineData,
  ColorType,
  Time
} from 'lightweight-charts';
import { Candle, TradeTick } from '../engine/types';
import { Plus, X, LineChart as LineIcon, CandlestickChart as CandleIcon } from 'lucide-react';
import { TradingViewChartProps } from '../types';
import {
  cleanSymbol,
  sortAndDeduplicateCandles,
  buildChartDatasets,
  buildLatestTickUpdate,
} from '../utils';

type MetricMode = 'Price' | 'Market Cap';
type Timeframe = '1D' | '1M' | '1Y' | '3Y' | '5Y';

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol,
  currentPrice,
  latestTrade,
  candles,
  onOpenSearch,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const targetSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  const [metricMode, setMetricMode] = useState<MetricMode>('Price');
  const [chartType, setChartType] = useState<'line' | 'candle'>('line');
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');

  const assetName = cleanSymbol(symbol);
  const [chips, setChips] = useState<string[]>([
    `${assetName} Market Cap`,
    `${assetName} Price Target`,
  ]);

  const suggestions = [
    'GM Net Income Actual',
    'LI Net Income Actual',
    'MBQYY Net Income Actual',
    'HMC Net Income Actual',
    'LCID Net Income Actual',
  ];

  // Initialize TradingView Chart on pure white background
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight || 380,
      layout: {
        background: { type: ColorType.Solid, color: '#ffffff' },
        textColor: '#64748b',
        fontSize: 11,
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      grid: {
        vertLines: { color: '#f1f5f9', style: 1 }, // dotted grid matching screenshot
        horzLines: { color: '#f1f5f9', style: 1 },
      },
      crosshair: {
        vertLine: {
          color: '#0f172a',
          width: 1,
          style: 0,
          labelBackgroundColor: '#0f172a',
        },
        horzLine: {
          color: '#0f172a',
          width: 1,
          style: 1,
          labelBackgroundColor: '#0f172a',
        },
      },
      timeScale: {
        borderColor: '#f1f5f9',
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: '#f1f5f9',
        scaleMargins: {
          top: 0.1,
          bottom: 0.15,
        },
      },
    });

    // Primary blue/purple line series matching the reference screenshot
    const lineSeries = chart.addSeries(LineSeries, {
      color: '#4338ca', // deep indigo/purple
      lineWidth: 2,
      title: 'Market Cap',
      priceScaleId: 'right',
    });

    // Secondary hot pink line series matching the reference screenshot
    const targetSeries = chart.addSeries(LineSeries, {
      color: '#ec4899', // vibrant pink
      lineWidth: 2,
      title: 'Price Target',
      priceScaleId: 'right',
    });

    // Candlestick series for toggle
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e',
      visible: false,
    });

    chartRef.current = chart;
    lineSeriesRef.current = lineSeries;
    targetSeriesRef.current = targetSeries;
    candleSeriesRef.current = candleSeries;

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0 || !entries[0].contentRect) return;
      const { width, height } = entries[0].contentRect;
      chart.applyOptions({ width, height });
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  // Sync chart type toggle
  useEffect(() => {
    if (!lineSeriesRef.current || !candleSeriesRef.current) return;
    if (chartType === 'candle') {
      lineSeriesRef.current.applyOptions({ visible: false });
      candleSeriesRef.current.applyOptions({ visible: true });
    } else {
      lineSeriesRef.current.applyOptions({ visible: true });
      candleSeriesRef.current.applyOptions({ visible: false });
    }
  }, [chartType]);

  // Sync historical candle & line data
  useEffect(() => {
    if (!lineSeriesRef.current || !targetSeriesRef.current || !candleSeriesRef.current || candles.length === 0) return;

    const { lineData, targetData, candleData } = buildChartDatasets(candles, 0.96);
    if (lineData.length === 0) return;

    try {
      lineSeriesRef.current.setData(lineData);
      targetSeriesRef.current.setData(targetData);
      candleSeriesRef.current.setData(candleData);
      chartRef.current?.timeScale().fitContent();
    } catch (err) {
      console.warn('Lightweight charts setData prevented:', err);
    }
  }, [candles]);

  // Update latest trade
  useEffect(() => {
    if (!lineSeriesRef.current || !latestTrade || candles.length === 0) return;
    const lastCandle = candles[candles.length - 1];
    if (!lastCandle) return;

    try {
      const updates = buildLatestTickUpdate(lastCandle, latestTrade, 0.96);
      lineSeriesRef.current.update(updates.linePoint);
      targetSeriesRef.current?.update(updates.targetPoint);
      candleSeriesRef.current?.update(updates.candlePoint);
    } catch {
      // Ignored
    }
  }, [latestTrade, currentPrice, candles]);

  const handleRemoveChip = (chip: string) => {
    setChips((prev) => prev.filter((c) => c !== chip));
  };

  const handleAddSuggestion = (sug: string) => {
    if (!chips.includes(sug)) {
      setChips((prev) => [...prev, sug]);
    }
  };

  return (
    <div className="w-full max-w-full bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden font-sans p-3.5 sm:p-5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left: Graph Selection Sidebar (3.5 cols on lg) */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-4 border-b lg:border-b-0 lg:border-r border-slate-100 pb-5 lg:pb-0 lg:pr-5 min-w-0">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">Graph selection</h3>

            {/* + Compare graphs button */}
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 bg-white shadow-sm transition-all hover:bg-slate-50 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-slate-500" />
                Compare graphs
              </span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-mono border border-slate-200">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Active Chips */}
          <div className="flex flex-col gap-2">
            {chips.map((chip, idx) => {
              const isIndigo = idx % 2 === 0;
              return (
                <div
                  key={chip}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    isIndigo
                      ? 'bg-indigo-50/70 border-indigo-100 text-indigo-950'
                      : 'bg-rose-50/70 border-rose-100 text-rose-950'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-1 h-3 rounded-full ${
                        isIndigo ? 'bg-indigo-600' : 'bg-rose-500'
                      }`}
                    />
                    <span className="truncate pr-2">{chip}</span>
                  </div>
                  {chips.length > 1 && (
                    <button
                      onClick={() => handleRemoveChip(chip)}
                      className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-white/60 transition-colors cursor-pointer shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Suggestions */}
          <div className="mt-1">
            <span className="text-xs font-bold text-slate-900 block mb-2">Suggestions</span>
            <div className="flex flex-col gap-1 text-xs">
              {suggestions.map((sug) => (
                <button
                  key={sug}
                  onClick={() => handleAddSuggestion(sug)}
                  className="w-full text-left py-1.5 px-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span className="truncate">{sug}</span>
                  <Plus className="w-3 h-3 text-slate-400 group-hover:text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Chart Canvas Area & Top Controls (8.5 cols on lg) */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col justify-between h-full min-h-[420px] min-w-0 w-full max-w-full overflow-hidden">
          {/* Top Controls Toolbar matching screenshot */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-100 w-full">
            {/* Metric Mode Pill: Price vs Market Cap */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 rounded-xl p-0.5">
                {(['Price', 'Market Cap'] as MetricMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMetricMode(m)}
                    className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      metricMode === m
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {/* Chart Type Toggle: Line vs Candlestick */}
              <div className="flex items-center bg-slate-100 rounded-xl p-0.5">
                <button
                  onClick={() => setChartType('line')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    chartType === 'line' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                  }`}
                  title="Line Chart"
                >
                  <LineIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setChartType('candle')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    chartType === 'candle' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                  }`}
                  title="Candlestick Chart"
                >
                  <CandleIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Timeframe Selector: 1D, 1M, 1Y, 3Y, 5Y */}
            <div className="flex items-center bg-slate-100 rounded-xl p-0.5 overflow-x-auto max-w-full">
              {(['1D', '1M', '1Y', '3Y', '5Y'] as Timeframe[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    timeframe === tf
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Canvas */}
          <div ref={chartContainerRef} className="flex-1 w-full max-w-full min-h-[340px] sm:min-h-[360px] relative mt-2 overflow-hidden" />
        </div>
      </div>
    </div>
  );
};
