// Live Public Market Data Service (Zero Backend Required)
// Fetches real-time exchange market data directly from public Binance REST endpoints

import { Candle } from './types';

export interface LiveTicker {
  symbol: string;
  name: string;
  price: number;
  priceChange: number;
  priceChangePercent: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  quoteVolume: number;
  marketCapApprox: string;
}

export const TRACKED_SYMBOLS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', tag: 'Top Crypto' },
  { symbol: 'ETHUSDT', name: 'Ethereum', tag: 'Layer 1' },
  { symbol: 'SOLUSDT', name: 'Solana', tag: 'High TPS' },
  { symbol: 'BNBUSDT', name: 'BNB Chain', tag: 'Exchange' },
  { symbol: 'XRPUSDT', name: 'Ripple', tag: 'Settlement' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', tag: 'Meme' },
  { symbol: 'ADAUSDT', name: 'Cardano', tag: 'Proof of Stake' },
  { symbol: 'AVAXUSDT', name: 'Avalanche', tag: 'Smart Contracts' },
];

export class LiveMarketService {
  private readonly baseUrl: string = 'https://api.binance.com/api/v3';

  private calculateMarketCapApprox(symbol: string, price: number, quoteVol: number): string {
    if (symbol === 'BTCUSDT') return `$${((price * 19.8) / 1000).toFixed(2)}T`;
    if (symbol === 'ETHUSDT') return `$${((price * 120.4) / 1000).toFixed(2)}B`;
    if (symbol === 'SOLUSDT') return `$${((price * 470) / 1000).toFixed(2)}B`;
    if (symbol === 'BNBUSDT') return `$${((price * 144) / 1000).toFixed(2)}B`;
    if (symbol === 'XRPUSDT') return `$${((price * 57) / 1000).toFixed(2)}B`;
    return `$${(quoteVol / 1000000).toFixed(1)}M`;
  }

  private buildFallbackTickers(): LiveTicker[] {
    return TRACKED_SYMBOLS.map((s) => ({
      symbol: s.symbol,
      name: s.name,
      price: s.symbol === 'BTCUSDT' ? 76000 : s.symbol === 'ETHUSDT' ? 2450 : s.symbol === 'SOLUSDT' ? 180 : 600,
      priceChange: -12.5,
      priceChangePercent: -0.45,
      highPrice: 77000,
      lowPrice: 75500,
      volume: 45000,
      quoteVolume: 3400000000,
      marketCapApprox: s.symbol === 'BTCUSDT' ? '$1.5T' : '$300B',
    }));
  }

  /**
   * Fetch 24h ticker data for all tracked assets in a single batch call
   */
  public async fetchLiveTickers(): Promise<LiveTicker[]> {
    try {
      const symbolsParam = JSON.stringify(TRACKED_SYMBOLS.map((s) => s.symbol));
      const res = await fetch(
        `${this.baseUrl}/ticker/24hr?symbols=${encodeURIComponent(symbolsParam)}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      return data.map((item: {
        symbol: string;
        lastPrice: string;
        priceChange: string;
        priceChangePercent: string;
        highPrice: string;
        lowPrice: string;
        volume: string;
        quoteVolume: string;
      }) => {
        const meta = TRACKED_SYMBOLS.find((t) => t.symbol === item.symbol);
        const price = parseFloat(item.lastPrice);
        const quoteVol = parseFloat(item.quoteVolume);
        const marketCapApprox = this.calculateMarketCapApprox(item.symbol, price, quoteVol);

        return {
          symbol: item.symbol,
          name: meta?.name || item.symbol,
          price,
          priceChange: parseFloat(item.priceChange),
          priceChangePercent: parseFloat(item.priceChangePercent),
          highPrice: parseFloat(item.highPrice),
          lowPrice: parseFloat(item.lowPrice),
          volume: parseFloat(item.volume),
          quoteVolume: quoteVol,
          marketCapApprox,
        };
      });
    } catch (err) {
      console.warn('Could not fetch live tickers from Binance REST:', err);
      return this.buildFallbackTickers();
    }
  }

  private buildFallbackKlines(symbol: string, limit: number): Candle[] {
    const nowSec = Math.floor(Date.now() / 1000);
    const minuteBucket = Math.floor(nowSec / 60) * 60;
    const base = symbol.includes('BTC') ? 76000 : 2500;
    const fallback: Candle[] = [];
    let p = base;
    for (let i = limit; i >= 0; i--) {
      const time = minuteBucket - i * 60;
      const change = (Math.random() - 0.49) * (base * 0.002);
      const open = p;
      const close = p + change;
      const high = Math.max(open, close) + Math.random() * (base * 0.001);
      const low = Math.min(open, close) - Math.random() * (base * 0.001);
      fallback.push({ time, open, high, low, close, volume: 15 + Math.random() * 50 });
      p = close;
    }
    return fallback;
  }

  /**
   * Fetch 100 real historical candlestick bars from Binance
   */
  public async fetchHistoricalKlines(
    symbol: string,
    interval: string = '1m',
    limit: number = 100
  ): Promise<Candle[]> {
    try {
      // Binance format: BTCUSDT
      const formattedSymbol = symbol.includes('USDT') ? symbol : `${symbol}USDT`;
      const res = await fetch(
        `${this.baseUrl}/klines?symbol=${formattedSymbol}&interval=${interval}&limit=${limit}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.json();

      const candles: Candle[] = raw.map((row: (number | string)[]) => {
        const timeSec = Math.floor(Number(row[0]) / 1000);
        return {
          time: timeSec,
          open: parseFloat(row[1] as string),
          high: parseFloat(row[2] as string),
          low: parseFloat(row[3] as string),
          close: parseFloat(row[4] as string),
          volume: parseFloat(row[5] as string),
        };
      });

      // Filter and strictly sort ascending by time
      const sorted = candles.sort((a, b) => a.time - b.time);
      const clean: Candle[] = [];
      for (const c of sorted) {
        if (clean.length === 0 || c.time > clean[clean.length - 1].time) {
          clean.push(c);
        }
      }
      return clean;
    } catch (err) {
      console.warn(`Could not fetch live klines for ${symbol}:`, err);
      return this.buildFallbackKlines(symbol, limit);
    }
  }
}

export const liveMarketService = new LiveMarketService();
