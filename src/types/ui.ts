// Hermex Shared Component & UI Types
import { ReactNode } from 'react';
import {
  TerminalWorkspace,
  MarketDataSource,
  OrderBookL2,
  TradeTick,
  Candle,
  OrderFlowMetrics,
  RiskMetrics,
  GarchForecast,
  CorrelationMatrix,
  AlgoOrder,
  PortfolioPosition
} from '../engine/types';
import { LiveTicker } from '../engine/live-market-service';

export interface HeaderProps {
  currentSymbol: string;
  onSymbolChange: (symbol: string) => void;
  currentPrice: number;
  dataSource: MarketDataSource;
  onDataSourceChange: (source: MarketDataSource) => void;
  wsStatus: 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  latencyMs: number;
  activeWorkspace: TerminalWorkspace;
  onWorkspaceChange: (ws: TerminalWorkspace) => void;
  onOpenSearch: () => void;
  onReturnToWelcome?: () => void;
}

export interface TerminalLayoutProps {
  activeWorkspace: TerminalWorkspace;
  symbol: string;
  onSelectSymbol: (sym: string) => void;
  currentPrice: number;
  orderBook: OrderBookL2 | null;
  latestTrade: TradeTick | null;
  trades: TradeTick[];
  candles: Candle[];
  orderFlow: OrderFlowMetrics | null;
  risk: RiskMetrics | null;
  garch: GarchForecast | null;
  correlation: CorrelationMatrix | null;
  algoOrders: AlgoOrder[];
  onSubmitAlgoOrder: (order: AlgoOrder) => void;
  positions: PortfolioPosition[];
  liveTickers: LiveTicker[];
  onOpenSearch?: () => void;
}

export interface CommandItem {
  id: string;
  type: 'STOCK' | 'ACTION' | 'EXCHANGE';
  workspace?: TerminalWorkspace;
  title: string;
  subtitle?: string;
  symbol?: string;
  badge?: string;
  shortcut?: string[];
  icon?: ReactNode;
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStock: (symbol: string) => void;
  onSelectWorkspace?: (ws: TerminalWorkspace) => void;
}

export interface TradingViewChartProps {
  symbol: string;
  currentPrice: number;
  latestTrade: TradeTick | null;
  candles: Candle[];
  onOpenSearch?: () => void;
}

export interface StocksTableProps {
  currentSymbol: string;
  onSelectSymbol: (sym: string) => void;
  activePrice: number;
  liveTickers: LiveTicker[];
}

export interface PeerAnalysisCardProps {
  currentSymbol: string;
  liveTickers: LiveTicker[];
  onSelectSymbol?: (sym: string) => void;
}

export interface CapitalizationCardProps {
  symbol: string;
  currentPrice: number;
  risk: RiskMetrics | null;
  liveTicker?: LiveTicker | null;
}

export interface BuyStockCardProps {
  symbol: string;
  currentPrice: number;
  onPlaceOrder: (order: AlgoOrder) => void;
  tradingBalance?: number;
}

export interface QuantStatsPanelProps {
  orderFlow: OrderFlowMetrics | null;
  risk: RiskMetrics | null;
  garch: GarchForecast | null;
  correlation: CorrelationMatrix | null;
}

export interface AlgoExecutionPanelProps {
  currentSymbol: string;
  currentPrice: number;
  activeOrders: AlgoOrder[];
  onSubmitOrder: (order: AlgoOrder) => void;
}

export interface PortfolioRiskPanelProps {
  positions: PortfolioPosition[];
  risk: RiskMetrics | null;
}

export interface OrderBookDepthProps {
  orderBook: OrderBookL2 | null;
}

export interface OrderBookHeatmapProps {
  orderBook: OrderBookL2 | null;
  latestTrade: TradeTick | null;
}

export interface HeatmapSnapshot {
  timestamp: number;
  midPrice: number;
  bids: { price: number; size: number }[];
  asks: { price: number; size: number }[];
}

export interface TimeAndSalesTapeProps {
  trades: TradeTick[];
}
