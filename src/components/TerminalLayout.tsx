import React from 'react';
import { TerminalLayoutProps } from '../types';
import { TradingViewChart } from './TradingViewChart';
import { StocksTable } from './StocksTable';
import { OrderBookDepth } from './OrderBookDepth';
import { PeerAnalysisCard } from './PeerAnalysisCard';
import { CapitalizationCard } from './CapitalizationCard';
import { BuyStockCard } from './BuyStockCard';
import { OrderBookHeatmap } from './OrderBookHeatmap';
import { TimeAndSalesTape } from './TimeAndSalesTape';
import { QuantStatsPanel } from './QuantStatsPanel';
import { AlgoExecutionPanel } from './AlgoExecutionPanel';
import { PortfolioRiskPanel } from './PortfolioRiskPanel';
import { ErrorBoundary } from './ErrorBoundary';

export const TerminalLayout: React.FC<TerminalLayoutProps> = ({
  activeWorkspace,
  symbol,
  onSelectSymbol,
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
  onSubmitAlgoOrder,
  positions,
  liveTickers,
  onOpenSearch,
}) => {
  const activeTicker = liveTickers.find((t) => t.symbol === symbol) || null;

  return (
    <main className="flex-1 p-3 sm:p-4 md:p-6 max-w-[1920px] mx-auto w-full max-w-full overflow-x-hidden font-sans pb-8">
      {/* 1. OVERVIEW / CHART: Exact layout matching user's reference screenshot */}
      {activeWorkspace === 'OVERVIEW' && (
        <div className="flex flex-col gap-6">
          {/* Main Comparison Chart with Left Graph Selection Panel */}
          <ErrorBoundary fallbackTitle="Comparison Chart Initializing">
            <TradingViewChart
              symbol={symbol}
              currentPrice={currentPrice}
              latestTrade={latestTrade}
              candles={candles}
              onOpenSearch={onOpenSearch}
            />
          </ErrorBoundary>

          {/* Bottom Financial Stocks Table matching screenshot */}
          <StocksTable
            currentSymbol={symbol}
            onSelectSymbol={onSelectSymbol}
            activePrice={currentPrice}
            liveTickers={liveTickers}
          />
        </div>
      )}

      {/* 2. STATISTICS & QUANT TRENDS */}
      {activeWorkspace === 'QUANT_TRENDS' && (
        <div className="flex flex-col gap-6">
          <QuantStatsPanel
            orderFlow={orderFlow}
            risk={risk}
            garch={garch}
            correlation={correlation}
          />
        </div>
      )}

      {/* 3. ORDER FLOW & MICROSTRUCTURE */}
      {activeWorkspace === 'MICROSTRUCTURE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
          <div className="lg:col-span-4 h-[580px]">
            <OrderBookDepth orderBook={orderBook} />
          </div>
          <div className="lg:col-span-5 flex flex-col gap-4 h-[580px]">
            <div className="flex-1 min-h-[280px]">
              <OrderBookHeatmap orderBook={orderBook} latestTrade={latestTrade} />
            </div>
            <div className="flex-1 min-h-[280px]">
              <ErrorBoundary fallbackTitle="Chart Display Initializing">
                <TradingViewChart
                  symbol={symbol}
                  currentPrice={currentPrice}
                  latestTrade={latestTrade}
                  candles={candles}
                />
              </ErrorBoundary>
            </div>
          </div>
          <div className="lg:col-span-3 h-[580px]">
            <TimeAndSalesTape trades={trades} />
          </div>
        </div>
      )}

      {/* 4. SMART ALGO EXECUTION & TRADE TICKET */}
      {activeWorkspace === 'ALGO_LAB' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4">
            <BuyStockCard
              symbol={symbol}
              currentPrice={currentPrice}
              onPlaceOrder={onSubmitAlgoOrder}
              tradingBalance={10000.00}
            />
          </div>
          <div className="lg:col-span-8">
            <AlgoExecutionPanel
              currentSymbol={symbol}
              currentPrice={currentPrice}
              activeOrders={algoOrders}
              onSubmitOrder={onSubmitAlgoOrder}
            />
          </div>
        </div>
      )}

      {/* 5. FINANCIALS & PORTFOLIO */}
      {activeWorkspace === 'PORTFOLIO_RISK' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            <div className="md:col-span-6">
              <CapitalizationCard
                symbol={symbol}
                currentPrice={currentPrice}
                risk={risk}
                liveTicker={activeTicker}
              />
            </div>
            <div className="md:col-span-6">
              <PeerAnalysisCard
                currentSymbol={symbol}
                liveTickers={liveTickers}
                onSelectSymbol={onSelectSymbol}
              />
            </div>
          </div>
          <PortfolioRiskPanel positions={positions} risk={risk} />
        </div>
      )}
    </main>
  );
};
