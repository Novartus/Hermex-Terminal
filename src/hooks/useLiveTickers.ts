import { useState, useEffect } from 'react';
import { liveMarketService, LiveTicker, TRACKED_SYMBOLS } from '../engine/live-market-service';

export function useLiveTickers(pollIntervalMs = 4000) {
  const [liveTickers, setLiveTickers] = useState<LiveTicker[]>(() =>
    TRACKED_SYMBOLS.map((s) => ({
      symbol: s.symbol,
      name: s.name,
      price: s.symbol === 'BTCUSDT' ? 94250 : s.symbol === 'ETHUSDT' ? 3420 : 198,
      priceChange: 120.5,
      priceChangePercent: 1.45,
      highPrice: s.symbol === 'BTCUSDT' ? 95800 : 3500,
      lowPrice: s.symbol === 'BTCUSDT' ? 93100 : 3380,
      volume: 45000,
      quoteVolume: 4200000000,
      marketCapApprox: s.symbol === 'BTCUSDT' ? '$1.86T' : '$410.5B',
    }))
  );

  useEffect(() => {
    let isMounted = true;

    const poll = async () => {
      try {
        const fresh = await liveMarketService.fetchLiveTickers();
        if (isMounted && fresh && fresh.length > 0) {
          setLiveTickers(fresh);
        }
      } catch (err) {
        console.warn('Ticker polling error:', err);
      }
    };

    poll();
    const timer = setInterval(poll, pollIntervalMs);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [pollIntervalMs]);

  return liveTickers;
}
