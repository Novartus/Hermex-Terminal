import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MarketDataSource,
  OrderBookL2,
  TradeTick,
  Candle,
  OrderFlowMetrics,
  RiskMetrics,
  GarchForecast,
  CorrelationMatrix,
  AlgoOrder,
} from '../engine/types';
import { getInstrument } from '../engine/instruments';
import { BinanceWebSocketFeed } from '../engine/websocket-feed';
import { HftWorkerClient } from '../engine/hft-worker-client';
import { audioEngine } from '../engine/audio-engine';
import { localDB } from '../engine/storage';
import { liveMarketService } from '../engine/live-market-service';
import { mergeCandle } from '../utils';

interface UseMarketEngineProps {
  symbol: string;
  dataSource: MarketDataSource;
}

export function useMarketEngine({ symbol, dataSource }: UseMarketEngineProps) {
  const [currentPrice, setCurrentPrice] = useState<number>(94250.0);
  const [orderBook, setOrderBook] = useState<OrderBookL2 | null>(null);
  const [latestTrade, setLatestTrade] = useState<TradeTick | null>(null);
  const [trades, setTrades] = useState<TradeTick[]>([]);
  const [candles, setCandles] = useState<Candle[]>([]);

  const [orderFlow, setOrderFlow] = useState<OrderFlowMetrics | null>(null);
  const [risk, setRisk] = useState<RiskMetrics | null>(null);
  const [garch, setGarch] = useState<GarchForecast | null>(null);
  const [correlation, setCorrelation] = useState<CorrelationMatrix | null>(null);

  const [algoOrders, setAlgoOrders] = useState<AlgoOrder[]>([]);
  const [wsStatus, setWsStatus] = useState<'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR'>('CONNECTING');
  const [latencyMs, setLatencyMs] = useState<number>(12);

  const wsFeedRef = useRef<BinanceWebSocketFeed | null>(null);
  const workerClientRef = useRef<HftWorkerClient | null>(null);

  // Initial historical candle bootstrap
  const initCandlesForSymbol = useCallback((baseP: number) => {
    const initList: Candle[] = [];
    const nowSec = Math.floor(Date.now() / 1000);
    const minuteBucket = Math.floor(nowSec / 60) * 60;
    let p = baseP * 0.985;

    for (let i = 60; i >= 0; i--) {
      const time = minuteBucket - i * 60;
      const change = (Math.random() - 0.48) * (baseP * 0.003);
      const open = p;
      const close = p + change;
      const high = Math.max(open, close) + Math.random() * (baseP * 0.002);
      const low = Math.min(open, close) - Math.random() * (baseP * 0.002);
      const volume = Math.round(50 + Math.random() * 250);

      initList.push({ time, open, high, low, close, volume });
      p = close;
    }
    setCandles(initList);
    setCurrentPrice(p);
  }, []);

  // Web Worker Client initialization
  useEffect(() => {
    const client = new HftWorkerClient({
      onSimTick: ({ book, trade, candle }) => {
        setOrderBook(book);
        setLatestTrade(trade);
        setCurrentPrice(trade.price);

        if (trade.isWhale) {
          audioEngine.playWhaleAlert(trade.side);
        }

        setTrades((prev) => [trade, ...prev.slice(0, 99)]);
        setCandles((prev) => mergeCandle(prev, candle));
      },

      onQuantMetrics: (metrics) => {
        setOrderFlow(metrics.orderFlow);
        setRisk(metrics.risk);
        setGarch(metrics.garch);
        setCorrelation(metrics.correlation);

        if (metrics.orderFlow.vpin > 0.7) {
          audioEngine.playToxicityWarning();
        }
      },

      onAlgoFill: ({ orderId, fillPrice, fillSize, slippageBps }) => {
        audioEngine.playOrderFill();
        setAlgoOrders((prev) =>
          prev.map((ord) => {
            if (ord.id === orderId) {
              const updated: AlgoOrder = {
                ...ord,
                filledQuantity: ord.targetQuantity,
                avgFillPrice: fillPrice,
                status: 'COMPLETED',
                slippageBps,
                executions: [
                  ...ord.executions,
                  {
                    timestamp: Date.now(),
                    price: fillPrice,
                    size: fillSize,
                    slippage: slippageBps,
                  },
                ],
              };
              localDB.saveAlgoOrder(updated);
              return updated;
            }
            return ord;
          })
        );
      },
    });

    workerClientRef.current = client;

    localDB.getAlgoOrders().then((saved) => {
      if (saved && saved.length > 0) {
        setAlgoOrders(saved);
      }
    });

    return () => {
      client.terminate();
      workerClientRef.current = null;
    };
  }, []);

  // Market feed connection
  useEffect(() => {
    const inst = getInstrument(symbol);
    let isMounted = true;
    const effectiveSource = !inst.isLiveSupported ? 'SYNTHETIC_HFT' : dataSource;

    if (effectiveSource === 'BINANCE_LIVE') {
      workerClientRef.current?.stopSimulation();

      liveMarketService.fetchHistoricalKlines(symbol, '1m', 80).then((historical) => {
        if (!isMounted) return;
        if (historical && historical.length > 0) {
          setCandles(historical);
          const last = historical[historical.length - 1];
          if (last) setCurrentPrice(last.close);
        } else {
          initCandlesForSymbol(inst.basePrice);
        }
      });

      const feed = new BinanceWebSocketFeed({
        onOrderBook: (book) => {
          setOrderBook(book);
          workerClientRef.current?.ingestLiveBook(book);
        },
        onTrade: (trade) => {
          setLatestTrade(trade);
          setCurrentPrice(trade.price);
          if (trade.isWhale) {
            audioEngine.playWhaleAlert(trade.side);
          }
          setTrades((prev) => [trade, ...prev.slice(0, 99)]);
          workerClientRef.current?.ingestLiveTrade(trade);
        },
        onCandle: (c) => {
          setCandles((prev) => mergeCandle(prev, c));
        },
        onLatencyUpdate: (ms) => setLatencyMs(ms),
        onStatusChange: (status) => setWsStatus(status),
      });

      feed.connect(symbol);
      wsFeedRef.current = feed;

      return () => {
        isMounted = false;
        feed.disconnect();
        wsFeedRef.current = null;
      };
    } else {
      initCandlesForSymbol(inst.basePrice);
      if (wsFeedRef.current) {
        wsFeedRef.current.disconnect();
        wsFeedRef.current = null;
      }
      setWsStatus('CONNECTED');
      setLatencyMs(3);
      workerClientRef.current?.startSimulation(symbol, inst.basePrice, 150);

      return () => {
        isMounted = false;
        workerClientRef.current?.stopSimulation();
      };
    }
  }, [symbol, dataSource, initCandlesForSymbol]);

  const submitAlgoOrder = (order: AlgoOrder) => {
    setAlgoOrders((prev) => [order, ...prev]);
    localDB.saveAlgoOrder(order);
    workerClientRef.current?.submitAlgoOrder(order);
  };

  return {
    currentPrice,
    orderBook,
    latestTrade,
    trades,
    candles,
    orderFlow,
    risk,
    garch,
    correlation,
    algoOrders,
    submitAlgoOrder,
    wsStatus,
    latencyMs,
  };
}
