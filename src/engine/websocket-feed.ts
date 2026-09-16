// Direct Public Real-Time Exchange WebSocket Feed (Zero Backend Required)

import { OrderBookL2, TradeTick, Candle, PriceLevel } from './types';
import { getInstrument } from './instruments';

export interface FeedCallbacks {
  onOrderBook: (book: OrderBookL2) => void;
  onTrade: (trade: TradeTick) => void;
  onCandle: (candle: Candle) => void;
  onLatencyUpdate: (latencyMs: number) => void;
  onStatusChange: (status: 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR') => void;
}

export class BinanceWebSocketFeed {
  private ws: WebSocket | null = null;
  private currentSymbol: string = '';
  private readonly callbacks: FeedCallbacks;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isIntentionalClose: boolean = false;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private lastPingTime: number = 0;

  constructor(callbacks: FeedCallbacks) {
    this.callbacks = callbacks;
  }

  public connect(symbol: string): void {
    this.disconnect();
    this.currentSymbol = symbol.toLowerCase();
    this.isIntentionalClose = false;

    this.callbacks.onStatusChange('CONNECTING');

    const streams = [
      `${this.currentSymbol}@depth20@100ms`,
      `${this.currentSymbol}@aggTrade`,
      `${this.currentSymbol}@kline_1m`,
    ].join('/');

    const wsUrl = `wss://stream.binance.com:9443/ws/${streams}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.callbacks.onStatusChange('CONNECTED');
        this.startLatencyPing();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onerror = () => {
        this.callbacks.onStatusChange('ERROR');
      };

      this.ws.onclose = () => {
        this.callbacks.onStatusChange('DISCONNECTED');
        this.cleanupPing();
        if (!this.isIntentionalClose) {
          this.scheduleReconnect();
        }
      };
    } catch (e) {
      console.error('Failed to open Binance WebSocket:', e);
      this.callbacks.onStatusChange('ERROR');
      this.scheduleReconnect();
    }
  }

  public disconnect(): void {
    this.isIntentionalClose = true;
    this.cleanupPing();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.callbacks.onStatusChange('DISCONNECTED');
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.currentSymbol) {
        this.connect(this.currentSymbol);
      }
    }, 2500);
  }

  private startLatencyPing(): void {
    this.cleanupPing();
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.lastPingTime = performance.now();
        // Binance ws accepts ping frame or client round-trip measurement
      }
    }, 5000);
  }

  private cleanupPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private handleMessage(rawData: string): void {
    try {
      const data = JSON.parse(rawData);

      // 1. Order book depth: depth20@100ms
      if (data.bids && data.asks) {
        const clientTimestamp = Date.now();
        // If exchange provides timestamp (E / T)
        if (data.E) {
          const latency = Math.max(1, Math.min(999, clientTimestamp - data.E));
          this.callbacks.onLatencyUpdate(latency);
        }

        const bids: PriceLevel[] = [];
        let cumBid = 0;
        for (let i = 0; i < data.bids.length; i++) {
          const price = parseFloat(data.bids[i][0]);
          const size = parseFloat(data.bids[i][1]);
          cumBid += size;
          bids.push({ price, size, total: cumBid });
        }

        const asks: PriceLevel[] = [];
        let cumAsk = 0;
        for (let i = 0; i < data.asks.length; i++) {
          const price = parseFloat(data.asks[i][0]);
          const size = parseFloat(data.asks[i][1]);
          cumAsk += size;
          asks.push({ price, size, total: cumAsk });
        }

        if (bids.length > 0 && asks.length > 0) {
          const bestBid = bids[0].price;
          const bestAsk = asks[0].price;
          const midPrice = (bestBid + bestAsk) / 2;
          const spread = bestAsk - bestBid;
          const spreadBps = (spread / midPrice) * 10000;

          // Calculate size-weighted micro-price: (bestBid * askSize0 + bestAsk * bidSize0) / (bidSize0 + askSize0)
          const bid0 = bids[0].size;
          const ask0 = asks[0].size;
          const microPrice = (bestBid * ask0 + bestAsk * bid0) / (bid0 + ask0 || 1);

          // Top 5 and Top 20 depth sums
          let depth5Bids = 0, depth5Asks = 0;
          for (let i = 0; i < Math.min(5, bids.length); i++) depth5Bids += bids[i].size;
          for (let i = 0; i < Math.min(5, asks.length); i++) depth5Asks += asks[i].size;

          const depth20Bids = cumBid;
          const depth20Asks = cumAsk;
          const imbalanceRatio = (depth20Bids - depth20Asks) / (depth20Bids + depth20Asks || 1);

          const book: OrderBookL2 = {
            symbol: this.currentSymbol.toUpperCase(),
            timestamp: clientTimestamp,
            bids,
            asks,
            midPrice,
            spread,
            spreadBps,
            microPrice,
            imbalanceRatio,
            depth5Bids,
            depth5Asks,
            depth20Bids,
            depth20Asks,
          };

          this.callbacks.onOrderBook(book);
        }
      }

      // 2. Trade execution: aggTrade
      else if (data.e === 'aggTrade') {
        const symbol = data.s || this.currentSymbol.toUpperCase();
        const price = parseFloat(data.p);
        const size = parseFloat(data.q);
        const side: 'BUY' | 'SELL' = data.m ? 'SELL' : 'BUY'; // 'm' is true if buyer is market maker (sell order executed)
        const timestamp = data.T || Date.now();
        const inst = getInstrument(symbol);
        const isWhale = (price * size) >= (inst?.whaleThresholdUsd || 100000);

        const trade: TradeTick = {
          id: `t-${data.a || Math.random()}`,
          symbol,
          price,
          size,
          side,
          timestamp,
          isWhale,
        };

        this.callbacks.onTrade(trade);
      }

      // 3. Candlestick: kline
      else if (data.e === 'kline') {
        const k = data.k;
        const candle: Candle = {
          time: Math.floor(k.t / 1000),
          open: parseFloat(k.o),
          high: parseFloat(k.h),
          low: parseFloat(k.l),
          close: parseFloat(k.c),
          volume: parseFloat(k.v),
        };
        this.callbacks.onCandle(candle);
      }
    } catch {
      // Ignored malformed frame
    }
  }
}
