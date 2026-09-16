import React, { useEffect, useRef, useState } from 'react';
import { OrderBookL2, TradeTick } from '../engine/types';
import { Flame, Box } from 'lucide-react';
import { OrderBookHeatmapProps, HeatmapSnapshot } from '../types';
import { ThreeOrderBookSurface } from './ThreeOrderBookSurface';

export const OrderBookHeatmap: React.FC<OrderBookHeatmapProps> = ({
  orderBook,
  latestTrade,
}) => {
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snapshotsRef = useRef<HeatmapSnapshot[]>([]);
  const tradesRef = useRef<TradeTick[]>([]);

  useEffect(() => {
    if (!orderBook) return;

    snapshotsRef.current.push({
      timestamp: Date.now(),
      midPrice: orderBook.midPrice,
      bids: orderBook.bids.slice(0, 15).map((b) => ({ price: b.price, size: b.size })),
      asks: orderBook.asks.slice(0, 15).map((a) => ({ price: a.price, size: a.size })),
    });

    if (snapshotsRef.current.length > 150) {
      snapshotsRef.current.shift();
    }
  }, [orderBook]);

  useEffect(() => {
    if (!latestTrade) return;
    tradesRef.current.push(latestTrade);
    if (tradesRef.current.length > 80) {
      tradesRef.current.shift();
    }
  }, [latestTrade]);

  useEffect(() => {
    if (viewMode !== '2D') return;
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Clear pure white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      const snapshots = snapshotsRef.current;
      if (snapshots.length < 2) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText('Accumulating liquidity history...', 20, height / 2);
        animId = requestAnimationFrame(render);
        return;
      }

      let minP = Infinity;
      let maxP = -Infinity;
      snapshots.forEach((s) => {
        minP = Math.min(minP, s.midPrice * 0.997);
        maxP = Math.max(maxP, s.midPrice * 1.003);
      });
      const priceRange = maxP - minP || 1;

      const getY = (price: number) => {
        return height - ((price - minP) / priceRange) * height;
      };

      const stepX = width / 150;

      // Subtle light grid lines
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 4; i++) {
        const y = (height / 5) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw heatmap depth slices
      snapshots.forEach((snap, idx) => {
        const x = idx * stepX;
        const colWidth = stepX + 0.8;

        // Bids (emerald/teal depth)
        snap.bids.forEach((b) => {
          const y = getY(b.price);
          const intensity = Math.min(0.6, (b.size / 150) * 0.6);
          ctx.fillStyle = `rgba(16, 185, 129, ${intensity})`;
          ctx.fillRect(x, y - 2, colWidth, 4);
        });

        // Asks (rose/coral depth)
        snap.asks.forEach((a) => {
          const y = getY(a.price);
          const intensity = Math.min(0.6, (a.size / 150) * 0.6);
          ctx.fillStyle = `rgba(244, 63, 94, ${intensity})`;
          ctx.fillRect(x, y - 2, colWidth, 4);
        });
      });

      // Mid-Price continuous trajectory line
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      snapshots.forEach((snap, idx) => {
        const x = idx * stepX;
        const y = getY(snap.midPrice);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Plot trade markers
      const now = Date.now();
      tradesRef.current.forEach((t) => {
        const ageMs = now - t.timestamp;
        const timeFraction = 1 - ageMs / 15000;
        if (timeFraction > 0 && timeFraction <= 1) {
          const x = timeFraction * width;
          const y = getY(t.price);
          const radius = t.isWhale ? 5 : 3;

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, 2 * Math.PI);
          ctx.fillStyle = t.side === 'BUY' ? '#10b981' : '#f43f5e';
          ctx.fill();
        }
      });

      // Legend overlay
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(10, 10, 180, 24);
      ctx.strokeStyle = '#e2e8f0';
      ctx.strokeRect(10, 10, 180, 24);

      ctx.fillStyle = '#10b981';
      ctx.fillRect(16, 18, 8, 8);
      ctx.fillStyle = '#64748b';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText('Bids Depth', 28, 25);

      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(100, 18, 8, 8);
      ctx.fillStyle = '#64748b';
      ctx.fillText('Asks Depth', 112, 25);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [viewMode]);

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200/80 rounded-2xl overflow-hidden font-sans text-xs shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {viewMode === '2D' ? (
            <Flame className="w-4 h-4 text-amber-500" />
          ) : (
            <Box className="w-4 h-4 text-indigo-500" />
          )}
          <span className="font-bold text-slate-900 text-sm">
            {viewMode === '2D' ? 'Liquidity Heatmap' : '3D Order Book Topography'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 hidden sm:inline">
            {viewMode === '2D' ? 'Resting Order Density Over Time' : 'Interactive 3D L2 Depth Surface'}
          </span>
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
            <button
              onClick={() => setViewMode('2D')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                viewMode === '2D'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              2D Heatmap
            </button>
            <button
              onClick={() => setViewMode('3D')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                viewMode === '3D'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Box className="w-3 h-3" />
              3D WebGL
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[220px] relative bg-white flex items-center justify-center">
        {viewMode === '2D' ? (
          <canvas
            ref={canvasRef}
            width={800}
            height={220}
            className="w-full h-full block"
          />
        ) : (
          <ThreeOrderBookSurface orderBook={orderBook} />
        )}
      </div>
    </div>
  );
};
