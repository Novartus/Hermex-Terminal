// High-Frequency Trading & Microstructure Analytical Types

export type MarketDataSource = 'BINANCE_LIVE' | 'COINBASE_LIVE' | 'SYNTHETIC_HFT';

export interface PriceLevel {
  price: number;
  size: number;
  total: number;
  count?: number;
}

export interface OrderBookL2 {
  symbol: string;
  timestamp: number;
  bids: PriceLevel[]; // sorted descending by price
  asks: PriceLevel[]; // sorted ascending by price
  midPrice: number;
  spread: number;
  spreadBps: number;
  microPrice: number; // Size-weighted mid price
  imbalanceRatio: number; // (bids - asks) / (bids + asks) [-1, 1]
  depth5Bids: number;
  depth5Asks: number;
  depth20Bids: number;
  depth20Asks: number;
}

export interface TradeTick {
  id: string;
  symbol: string;
  price: number;
  size: number;
  side: 'BUY' | 'SELL';
  timestamp: number;
  isWhale: boolean; // Trade size exceeds institution threshold
}

export interface Candle {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap?: number;
}

export interface OrderFlowMetrics {
  timestamp: number;
  vpin: number; // Volume-Synchronized Probability of Toxicity (0.0 to 1.0)
  vpinBucketProgress: number; // 0 to 100%
  ofi: number; // Order Flow Imbalance (shares/contracts)
  normalizedOfi: number; // -1 to 1
  effectiveSpread: number;
  realizedVolatility: number; // Rolling realized volatility (annualized %)
  parkinsonVolatility: number;
  hurstExponent: number; // Mean-reversion (<0.5) vs momentum (>0.5)
}

export interface RiskMetrics {
  var95: number; // Value-at-Risk 95% (USD)
  var99: number; // Value-at-Risk 99% (USD)
  cvar95: number; // Conditional VaR / Expected Shortfall (USD)
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  maxDrawdownPct: number;
  currentDrawdownPct: number;
  beta: number;
  dailyPnl: number;
  unrealizedPnl: number;
  realizedPnl: number;
}

export interface GarchForecast {
  currentVol: number;
  forecast1h: number;
  forecast24h: number;
  persistence: number; // alpha + beta
  volatilityRegime: 'LOW' | 'NORMAL' | 'ELEVATED' | 'EXTREME';
}

export interface CorrelationMatrix {
  symbols: string[];
  matrix: number[][]; // N x N pairwise correlation coefficients (-1 to 1)
  timestamp: number;
}

export type AlgoStrategyType = 'TWAP' | 'VWAP' | 'POV' | 'ICEBERG' | 'MARKET_MAKER';

export interface AlgoOrder {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  strategy: AlgoStrategyType;
  targetQuantity: number;
  filledQuantity: number;
  avgFillPrice: number;
  benchmarkPrice: number; // Arrival price or market price when placed
  status: 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'CANCELLED';
  startTime: number;
  durationSeconds: number; // For TWAP/VWAP
  povRate?: number; // e.g., 0.15 = participate in 15% of volume
  icebergDisplaySize?: number;
  slippageBps: number;
  marketImpactEstimateBps: number;
  executions: {
    timestamp: number;
    price: number;
    size: number;
    slippage: number;
  }[];
}

export interface PortfolioPosition {
  symbol: string;
  quantity: number;
  avgEntryPrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  weightPct: number;
}

export interface InstrumentConfig {
  symbol: string;
  name: string;
  category: 'CRYPTO' | 'EQUITY' | 'INDEX' | 'FOREX';
  pricePrecision: number;
  sizePrecision: number;
  whaleThresholdUsd: number;
  isLiveSupported: boolean;
  basePrice: number;
}

export type TerminalWorkspace = 
  | 'OVERVIEW' 
  | 'MICROSTRUCTURE' 
  | 'QUANT_TRENDS' 
  | 'ALGO_LAB' 
  | 'PORTFOLIO_RISK';
