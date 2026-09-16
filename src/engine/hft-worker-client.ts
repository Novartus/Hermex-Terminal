// Typed Client Interface for High-Frequency Web Worker

import {
  OrderBookL2,
  TradeTick,
  Candle,
  OrderFlowMetrics,
  RiskMetrics,
  GarchForecast,
  CorrelationMatrix,
  AlgoOrder
} from './types';

export interface WorkerCallbacks {
  onSimTick?: (data: { book: OrderBookL2; trade: TradeTick; candle: Candle }) => void;
  onQuantMetrics?: (metrics: {
    orderFlow: OrderFlowMetrics;
    risk: RiskMetrics;
    garch: GarchForecast;
    correlation: CorrelationMatrix;
  }) => void;
  onAlgoFill?: (data: { orderId: string; fillPrice: number; fillSize: number; slippageBps: number }) => void;
}

export class HftWorkerClient {
  private worker: Worker | null = null;
  private readonly callbacks: WorkerCallbacks;

  constructor(callbacks: WorkerCallbacks) {
    this.callbacks = callbacks;
    this.initWorker();
  }

  private initWorker(): void {
    try {
      this.worker = new Worker(new URL('./hft-worker.ts', import.meta.url), {
        type: 'module',
      });

      this.worker.onmessage = (event: MessageEvent) => {
        const { type, payload } = event.data;

        switch (type) {
          case 'SIM_TICK':
            if (this.callbacks.onSimTick) this.callbacks.onSimTick(payload);
            break;
          case 'QUANT_METRICS_UPDATE':
            if (this.callbacks.onQuantMetrics) this.callbacks.onQuantMetrics(payload);
            break;
          case 'ALGO_ORDER_FILL':
            if (this.callbacks.onAlgoFill) this.callbacks.onAlgoFill(payload);
            break;
        }
      };

      this.worker.onerror = (err) => {
        console.error('HFT Worker encountered error:', err);
      };
    } catch (e) {
      console.error('Failed to initialize HFT Web Worker:', e);
    }
  }

  public startSimulation(symbol: string, basePrice: number, speedMs: number = 100): void {
    this.worker?.postMessage({
      type: 'START_SIMULATION',
      payload: { symbol, basePrice, speedMs },
    });
  }

  public stopSimulation(): void {
    this.worker?.postMessage({
      type: 'STOP_SIMULATION',
    });
  }

  public ingestLiveBook(book: OrderBookL2): void {
    this.worker?.postMessage({
      type: 'INGEST_LIVE_BOOK',
      payload: { book },
    });
  }

  public ingestLiveTrade(trade: TradeTick): void {
    this.worker?.postMessage({
      type: 'INGEST_LIVE_TRADE',
      payload: { trade },
    });
  }

  public submitAlgoOrder(order: AlgoOrder): void {
    this.worker?.postMessage({
      type: 'SUBMIT_ALGO_ORDER',
      payload: { order },
    });
  }

  public terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}
