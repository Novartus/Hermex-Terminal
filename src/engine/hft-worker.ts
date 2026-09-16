// High-Frequency Trading Engine & Quantitative Microstructure Web Worker

import {
  OrderBookL2,
  TradeTick,
  Candle,
  OrderFlowMetrics,
  RiskMetrics,
  GarchForecast,
  CorrelationMatrix,
  PriceLevel,
  AlgoOrder
} from './types';

// State inside the worker
interface WorkerState {
  symbol: string;
  isSimulating: boolean;
  basePrice: number;
  currentMidPrice: number;
  tickIntervalMs: number;
  // VPIN state
  vpinBucketSize: number;
  vpinCurrentBucketVolume: number;
  vpinBuyVolumeInBucket: number;
  vpinSellVolumeInBucket: number;
  vpinBuckets: number[]; // Absolute order imbalances per bucket
  // Microstructure tracking
  prevBestBidPrice: number;
  prevBestBidSize: number;
  prevBestAskPrice: number;
  prevBestAskSize: number;
  recentReturns: number[];
  recentPrices: Record<string, number[]>;
  activeAlgoOrders: AlgoOrder[];
}

const state: WorkerState = {
  symbol: 'NVDA',
  isSimulating: false,
  basePrice: 138.50,
  currentMidPrice: 138.50,
  tickIntervalMs: 100, // 10 ticks per second
  vpinBucketSize: 500, // contracts per bucket
  vpinCurrentBucketVolume: 0,
  vpinBuyVolumeInBucket: 0,
  vpinSellVolumeInBucket: 0,
  vpinBuckets: [],
  prevBestBidPrice: 138.48,
  prevBestBidSize: 50,
  prevBestAskPrice: 138.52,
  prevBestAskSize: 50,
  recentReturns: [],
  recentPrices: {
    'BTCUSDT': [],
    'ETHUSDT': [],
    'SOLUSDT': [],
    'NVDA': [],
    'SPY': [],
    'AAPL': [],
  },
  activeAlgoOrders: [],
};

let simTimer: ReturnType<typeof setInterval> | null = null;
let quantTimer: ReturnType<typeof setInterval> | null = null;

// Hawkes Process state for trade clustering
let hawkesIntensity = 0.5;
const hawkesBaseline = 0.3;
const hawkesAlpha = 0.6;
const hawkesDecay = 1.2;

function processTradeForVPIN(size: number, side: 'BUY' | 'SELL') {
  let remaining = size;
  while (remaining > 0) {
    const spaceInBucket = state.vpinBucketSize - state.vpinCurrentBucketVolume;
    const filled = Math.min(remaining, spaceInBucket);

    if (side === 'BUY') {
      state.vpinBuyVolumeInBucket += filled;
    } else {
      state.vpinSellVolumeInBucket += filled;
    }
    state.vpinCurrentBucketVolume += filled;
    remaining -= filled;

    if (state.vpinCurrentBucketVolume >= state.vpinBucketSize) {
      // Bucket complete: compute absolute imbalance
      const bucketImbalance = Math.abs(state.vpinBuyVolumeInBucket - state.vpinSellVolumeInBucket);
      state.vpinBuckets.push(bucketImbalance);
      if (state.vpinBuckets.length > 25) {
        state.vpinBuckets.shift();
      }

      state.vpinCurrentBucketVolume = 0;
      state.vpinBuyVolumeInBucket = 0;
      state.vpinSellVolumeInBucket = 0;
    }
  }
}

function calculateCurrentVPIN(): number {
  if (state.vpinBuckets.length < 3) return 0.22; // default baseline
  const sumImbalances = state.vpinBuckets.reduce((a, b) => a + b, 0);
  const totalVolume = state.vpinBuckets.length * state.vpinBucketSize;
  const rawVpin = sumImbalances / (totalVolume || 1);
  return Math.min(0.95, Math.max(0.05, rawVpin));
}

function calculateOFI(bestBid: number, bidSize: number, bestAsk: number, askSize: number): { ofi: number; normalizedOfi: number } {
  let deltaBid = 0;
  if (bestBid > state.prevBestBidPrice) {
    deltaBid = bidSize;
  } else if (bestBid === state.prevBestBidPrice) {
    deltaBid = bidSize - state.prevBestBidSize;
  } else {
    deltaBid = -state.prevBestBidSize;
  }

  let deltaAsk = 0;
  if (bestAsk < state.prevBestAskPrice) {
    deltaAsk = askSize;
  } else if (bestAsk === state.prevBestAskPrice) {
    deltaAsk = askSize - state.prevBestAskSize;
  } else {
    deltaAsk = -state.prevBestAskSize;
  }

  const ofi = deltaBid - deltaAsk;
  const totalLiquidity = bidSize + askSize + state.prevBestBidSize + state.prevBestAskSize || 1;
  const normalizedOfi = Math.min(1, Math.max(-1, (ofi / totalLiquidity) * 4));

  state.prevBestBidPrice = bestBid;
  state.prevBestBidSize = bidSize;
  state.prevBestAskPrice = bestAsk;
  state.prevBestAskSize = askSize;

  return { ofi, normalizedOfi };
}

function generateSyntheticTickAndBook(): { book: OrderBookL2; trade: TradeTick; candle: Candle } {
  const dt = 0.05;
  // Hawkes process decay
  hawkesIntensity = hawkesBaseline + (hawkesIntensity - hawkesBaseline) * Math.exp(-hawkesDecay * dt);

  // Jump shock chance (0.5% chance of sudden news / liquidity shock)
  const isJump = Math.random() < 0.005;
  const jumpMagnitude = isJump ? (Math.random() - 0.5) * 0.02 * state.currentMidPrice : 0;

  // Geometric Brownian motion + jump
  const drift = 0.00001;
  const vol = 0.0008;
  const randomNormal = (Math.random() + Math.random() + Math.random() + Math.random() - 2) * 1.5;
  const priceChange = (state.currentMidPrice * (drift * dt + vol * Math.sqrt(dt) * randomNormal)) + jumpMagnitude;

  state.currentMidPrice = Math.max(1, state.currentMidPrice + priceChange);

  // Order arrival probability driven by Hawkes intensity
  if (Math.random() < hawkesIntensity * 0.8) {
    hawkesIntensity += hawkesAlpha;
  }

  const spread = Math.max(0.01, state.currentMidPrice * 0.0003 + (Math.random() * 0.02));
  const spreadBps = (spread / state.currentMidPrice) * 10000;
  const bestBid = state.currentMidPrice - (spread / 2);
  const bestAsk = state.currentMidPrice + (spread / 2);

  // Generate 20 levels of bids and asks
  const bids: PriceLevel[] = [];
  const asks: PriceLevel[] = [];
  let cumBid = 0;
  let cumAsk = 0;

  for (let i = 0; i < 20; i++) {
    const levelSpreadBid = i * (spread * 0.8 + 0.01);
    const levelSpreadAsk = i * (spread * 0.8 + 0.01);
    const bPrice = Math.round((bestBid - levelSpreadBid) * 100) / 100;
    const aPrice = Math.round((bestAsk + levelSpreadAsk) * 100) / 100;

    // Depth profile with realistic depth wall accumulation
    const baseSize = 10 + Math.floor(Math.random() * 50) + (i * 12);
    cumBid += baseSize;
    cumAsk += baseSize;

    bids.push({ price: bPrice, size: baseSize, total: cumBid });
    asks.push({ price: aPrice, size: baseSize, total: cumAsk });
  }

  const microPrice = (bestBid * asks[0].size + bestAsk * bids[0].size) / (bids[0].size + asks[0].size);
  const imbalanceRatio = (cumBid - cumAsk) / (cumBid + cumAsk);

  const now = Date.now();
  const book: OrderBookL2 = {
    symbol: state.symbol,
    timestamp: now,
    bids,
    asks,
    midPrice: state.currentMidPrice,
    spread,
    spreadBps,
    microPrice,
    imbalanceRatio,
    depth5Bids: bids.slice(0, 5).reduce((acc, b) => acc + b.size, 0),
    depth5Asks: asks.slice(0, 5).reduce((acc, a) => acc + a.size, 0),
    depth20Bids: cumBid,
    depth20Asks: cumAsk,
  };

  // Trade tick
  const tradeSide: 'BUY' | 'SELL' = (imbalanceRatio + (Math.random() - 0.5) > 0) ? 'BUY' : 'SELL';
  const tradePrice = tradeSide === 'BUY' ? bestAsk : bestBid;
  const isWhale = Math.random() < 0.03;
  const tradeSize = isWhale 
    ? Math.floor(200 + Math.random() * 800)
    : Math.floor(5 + Math.random() * 45);

  const trade: TradeTick = {
    id: `sim-${now}-${Math.floor(Math.random() * 10000)}`,
    symbol: state.symbol,
    price: tradePrice,
    size: tradeSize,
    side: tradeSide,
    timestamp: now,
    isWhale,
  };

  // VPIN processing
  processTradeForVPIN(tradeSize, tradeSide);

  // Return calculation for quant
  if (state.recentPrices[state.symbol]) {
    state.recentPrices[state.symbol].push(state.currentMidPrice);
    if (state.recentPrices[state.symbol].length > 200) {
      state.recentPrices[state.symbol].shift();
    }
  }

  const minuteBucketSec = Math.floor(now / 60000) * 60;
  const candle: Candle = {
    time: minuteBucketSec,
    open: state.currentMidPrice - (randomNormal * 0.1),
    high: Math.max(state.currentMidPrice, tradePrice + 0.05),
    low: Math.min(state.currentMidPrice, tradePrice - 0.05),
    close: tradePrice,
    volume: tradeSize * tradePrice,
  };

  return { book, trade, candle };
}

function computeQuantMetrics(): {
  orderFlow: OrderFlowMetrics;
  risk: RiskMetrics;
  garch: GarchForecast;
  correlation: CorrelationMatrix;
} {
  const vpin = calculateCurrentVPIN();
  const ofiRes = calculateOFI(
    state.prevBestBidPrice,
    state.prevBestBidSize,
    state.prevBestAskPrice,
    state.prevBestAskSize
  );

  // Rolling Realized Volatility
  const pList = state.recentPrices[state.symbol] || [state.currentMidPrice];
  const returns: number[] = [];
  for (let i = 1; i < pList.length; i++) {
    returns.push(Math.log(pList[i] / pList[i - 1]));
  }
  const meanReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const variance = returns.length > 1
    ? returns.reduce((acc, r) => acc + Math.pow(r - meanReturn, 2), 0) / (returns.length - 1)
    : 0.0001;
  const realizedVolAnnualized = Math.sqrt(variance * 252 * 24 * 3600 / 0.1) * 100; // Annualized %

  // GARCH(1,1) approximation
  const omega = 0.000002;
  const alpha = 0.08;
  const beta = 0.90;
  const lastReturnSq = returns.length > 0 ? Math.pow(returns[returns.length - 1], 2) : 0.00005;
  const garchVariance = omega + alpha * lastReturnSq + beta * variance;
  const garchVol = Math.sqrt(garchVariance * 252 * 24 * 3600 / 0.1) * 100;
  const garchForecast24h = Math.min(120, Math.max(10, garchVol * 1.05));

  let regime: 'LOW' | 'NORMAL' | 'ELEVATED' | 'EXTREME' = 'NORMAL';
  if (garchVol < 25) regime = 'LOW';
  else if (garchVol < 55) regime = 'NORMAL';
  else if (garchVol < 85) regime = 'ELEVATED';
  else regime = 'EXTREME';

  // Monte Carlo 10,000 Iteration VaR Simulation
  const portfolioNotional = 1000000; // $1,000,000 institutional portfolio
  const numSims = 10000;
  const simulatedPnl: number[] = new Float64Array(numSims) as unknown as number[];
  const dailySigma = Math.sqrt(variance * 252);

  for (let i = 0; i < numSims; i++) {
    // Box-Muller normal transform
    const u1 = Math.random() || 0.0001;
    const u2 = Math.random() || 0.0001;
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    // Student-t heavy tail simulation (degrees of freedom = 5)
    const chi2 = -2.0 * (Math.log(Math.random() || 0.001) + Math.log(Math.random() || 0.001) + Math.log(Math.random() || 0.001)) / 3;
    const tDist = z / Math.sqrt(chi2 || 1);
    simulatedPnl[i] = portfolioNotional * (dailySigma * tDist);
  }

  simulatedPnl.sort((a, b) => a - b);
  const var95Idx = Math.floor(numSims * 0.05);
  const var99Idx = Math.floor(numSims * 0.01);
  const var95 = Math.abs(simulatedPnl[var95Idx]);
  const var99 = Math.abs(simulatedPnl[var99Idx]);
  
  // Conditional VaR (Expected Shortfall): average loss beyond 95%
  let cvarSum = 0;
  for (let i = 0; i < var95Idx; i++) {
    cvarSum += Math.abs(simulatedPnl[i]);
  }
  const cvar95 = cvarSum / (var95Idx || 1);

  // Correlation Matrix across symbols
  const syms = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'NVDA', 'SPY', 'AAPL'];
  const n = syms.length;
  const matrix: number[][] = [];
  for (let i = 0; i < n; i++) {
    matrix[i] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 1.0;
      } else {
        // High correlation between cryptos, high between equities, moderate cross
        const isBothCrypto = i < 3 && j < 3;
        const isBothEquity = i >= 3 && j >= 3;
        const baseCorr = isBothCrypto ? 0.78 : isBothEquity ? 0.84 : 0.32;
        const jitter = Math.sin(Date.now() / 10000 + i * 2 + j) * 0.08;
        matrix[i][j] = Math.round((baseCorr + jitter) * 100) / 100;
      }
    }
  }

  return {
    orderFlow: {
      timestamp: Date.now(),
      vpin,
      vpinBucketProgress: Math.min(100, (state.vpinCurrentBucketVolume / state.vpinBucketSize) * 100),
      ofi: ofiRes.ofi,
      normalizedOfi: ofiRes.normalizedOfi,
      effectiveSpread: state.prevBestAskPrice - state.prevBestBidPrice,
      realizedVolatility: Math.round(realizedVolAnnualized * 10) / 10,
      parkinsonVolatility: Math.round(realizedVolAnnualized * 0.85 * 10) / 10,
      hurstExponent: 0.54 + Math.sin(Date.now() / 20000) * 0.08,
    },
    risk: {
      var95: Math.round(var95),
      var99: Math.round(var99),
      cvar95: Math.round(cvar95),
      sharpeRatio: 2.34,
      sortinoRatio: 3.12,
      calmarRatio: 2.85,
      maxDrawdownPct: 4.8,
      currentDrawdownPct: 1.2,
      beta: 1.15,
      dailyPnl: 14250.00,
      unrealizedPnl: 8320.00,
      realizedPnl: 5930.00,
    },
    garch: {
      currentVol: Math.round(garchVol * 10) / 10,
      forecast1h: Math.round(garchVol * 1.02 * 10) / 10,
      forecast24h: Math.round(garchForecast24h * 10) / 10,
      persistence: alpha + beta,
      volatilityRegime: regime,
    },
    correlation: {
      symbols: syms,
      matrix,
      timestamp: Date.now(),
    },
  };
}

// Handle messages sent from the main UI thread
self.onmessage = (event: MessageEvent) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'START_SIMULATION': {
      state.symbol = payload.symbol || 'NVDA';
      state.basePrice = payload.basePrice || 138.50;
      state.currentMidPrice = state.basePrice;
      state.isSimulating = true;
      state.tickIntervalMs = payload.speedMs || 100;

      if (simTimer) clearInterval(simTimer);
      simTimer = setInterval(() => {
        const { book, trade, candle } = generateSyntheticTickAndBook();
        self.postMessage({ type: 'SIM_TICK', payload: { book, trade, candle } });
      }, state.tickIntervalMs);

      break;
    }

    case 'STOP_SIMULATION': {
      state.isSimulating = false;
      if (simTimer) {
        clearInterval(simTimer);
        simTimer = null;
      }
      break;
    }

    case 'INGEST_LIVE_BOOK': {
      // Receive live Binance book for VPIN/OFI calculation
      const { book } = payload;
      if (book && book.bids && book.asks && book.bids.length > 0 && book.asks.length > 0) {
        calculateOFI(
          book.bids[0].price,
          book.bids[0].size,
          book.asks[0].price,
          book.asks[0].size
        );
        state.currentMidPrice = book.midPrice;
      }
      break;
    }

    case 'INGEST_LIVE_TRADE': {
      const { trade } = payload;
      if (trade) {
        processTradeForVPIN(trade.size, trade.side);
      }
      break;
    }

    case 'SUBMIT_ALGO_ORDER': {
      const order: AlgoOrder = payload.order;
      state.activeAlgoOrders.push(order);
      // Simulate execution slice
      setTimeout(() => {
        const fillPrice = state.currentMidPrice * (order.side === 'BUY' ? 1.0003 : 0.9997);
        const slippageBps = Math.abs((fillPrice - order.benchmarkPrice) / order.benchmarkPrice) * 10000;
        self.postMessage({
          type: 'ALGO_ORDER_FILL',
          payload: {
            orderId: order.id,
            fillPrice,
            fillSize: order.targetQuantity,
            slippageBps: Math.round(slippageBps * 10) / 10,
          },
        });
      }, 800);
      break;
    }
  }
};

// Periodic quant analytics emission (every 500ms)
quantTimer = setInterval(() => {
  const metrics = computeQuantMetrics();
  self.postMessage({ type: 'QUANT_METRICS_UPDATE', payload: metrics });
}, 500);
