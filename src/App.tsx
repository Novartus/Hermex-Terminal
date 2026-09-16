import React, { useState, useEffect } from 'react';
import { MarketDataSource, TerminalWorkspace, PortfolioPosition } from './types';
import { getInstrument } from './engine/instruments';
import { Header } from './components/Header';
import { TerminalLayout } from './components/TerminalLayout';
import { CommandPalette } from './components/CommandPalette';
import { WelcomeScreen } from './components/WelcomeScreen';
import { useHashRoute, useLiveTickers, useMarketEngine } from './hooks';

export const App: React.FC = () => {
  const { currentView, navigateToDashboard, navigateToWelcome } = useHashRoute('WELCOME');

  const [symbol, setSymbol] = useState<string>(() => {
    return localStorage.getItem('hermex_active_symbol') || localStorage.getItem('fintrack_active_symbol') || 'BTCUSDT';
  });
  const [dataSource, setDataSource] = useState<MarketDataSource>('BINANCE_LIVE');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  const [activeWorkspace, setActiveWorkspace] = useState<TerminalWorkspace>(() => {
    const saved = (localStorage.getItem('hermex_active_workspace') || localStorage.getItem('fintrack_active_workspace')) as TerminalWorkspace;
    const valid: TerminalWorkspace[] = ['OVERVIEW', 'QUANT_TRENDS', 'MICROSTRUCTURE', 'ALGO_LAB', 'PORTFOLIO_RISK'];
    return valid.includes(saved) ? saved : 'OVERVIEW';
  });

  // Pure clean white theme guarantee
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('hermex_theme');
    localStorage.removeItem('fintrack_theme');
  }, []);

  // Save workspace & symbol persistence
  useEffect(() => {
    localStorage.setItem('hermex_active_workspace', activeWorkspace);
  }, [activeWorkspace]);

  useEffect(() => {
    localStorage.setItem('hermex_active_symbol', symbol);
  }, [symbol]);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Modular custom hooks
  const liveTickers = useLiveTickers(4000);
  const {
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
  } = useMarketEngine({ symbol, dataSource });

  // Default portfolio positions
  const [positions] = useState<PortfolioPosition[]>([
    {
      symbol: 'AAPL',
      quantity: 50,
      avgEntryPrice: 188.8,
      currentPrice: 190.4,
      marketValue: 9520.0,
      unrealizedPnl: 80.0,
      unrealizedPnlPct: 0.85,
      weightPct: 35.0,
    },
    {
      symbol: 'NVDA',
      quantity: 80,
      avgEntryPrice: 134.2,
      currentPrice: 138.4,
      marketValue: 11072.0,
      unrealizedPnl: 336.0,
      unrealizedPnlPct: 3.13,
      weightPct: 40.0,
    },
    {
      symbol: 'BTCUSDT',
      quantity: 0.15,
      avgEntryPrice: 91200.0,
      currentPrice: 94250.0,
      marketValue: 14137.5,
      unrealizedPnl: 457.5,
      unrealizedPnlPct: 3.34,
      weightPct: 25.0,
    },
  ]);

  const handleSymbolChange = (newSym: string) => {
    setSymbol(newSym);
    const inst = getInstrument(newSym);
    if (!inst.isLiveSupported && dataSource === 'BINANCE_LIVE') {
      setDataSource('SYNTHETIC_HFT');
    }
  };

  const handleDataSourceChange = (newSrc: MarketDataSource) => {
    const inst = getInstrument(symbol);
    if (newSrc === 'BINANCE_LIVE' && !inst.isLiveSupported) {
      setSymbol('BTCUSDT');
    }
    setDataSource(newSrc);
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#f3f5f8] text-slate-900 flex flex-col font-sans relative antialiased selection:bg-slate-200">
      {currentView === 'WELCOME' ? (
        <WelcomeScreen
          onEnterDashboard={navigateToDashboard}
          liveTickers={liveTickers}
          selectedSymbol={symbol}
          onSelectSymbol={handleSymbolChange}
        />
      ) : (
        <>
          <Header
            currentSymbol={symbol}
            onSymbolChange={handleSymbolChange}
            currentPrice={currentPrice}
            dataSource={dataSource}
            onDataSourceChange={handleDataSourceChange}
            wsStatus={wsStatus}
            latencyMs={latencyMs}
            activeWorkspace={activeWorkspace}
            onWorkspaceChange={setActiveWorkspace}
            onOpenSearch={() => setIsSearchOpen(true)}
            onReturnToWelcome={navigateToWelcome}
          />

          <TerminalLayout
            activeWorkspace={activeWorkspace}
            symbol={symbol}
            onSelectSymbol={handleSymbolChange}
            currentPrice={currentPrice}
            orderBook={orderBook}
            latestTrade={latestTrade}
            trades={trades}
            candles={candles}
            orderFlow={orderFlow}
            risk={risk}
            garch={garch}
            correlation={correlation}
            algoOrders={algoOrders}
            onSubmitAlgoOrder={submitAlgoOrder}
            positions={positions}
            liveTickers={liveTickers}
            onOpenSearch={() => setIsSearchOpen(true)}
          />

          {/* Institutional Terminal Footer with Author Credit */}
          <footer className="w-full bg-white border-t border-slate-200/80 mt-auto select-none">
            <div className="max-w-[1920px] mx-auto py-3.5 px-4 sm:px-6 text-xs text-slate-500 text-center flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <span className="font-medium text-slate-500">
                &copy; {new Date().getFullYear()} Hermex Institutional HFT Analytics Platform. All rights reserved.
              </span>
              <span className="text-slate-500">
                Crafted by{' '}
                <a
                  href="https://novartus.github.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-slate-800 hover:text-indigo-600 underline underline-offset-4 decoration-slate-300 hover:decoration-indigo-500 transition-colors"
                >
                  Novartus
                </a>
              </span>
            </div>
          </footer>
        </>
      )}

      {/* Spotlight Command Palette Modal */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectStock={handleSymbolChange}
        onSelectWorkspace={(ws) => {
          navigateToDashboard();
          setActiveWorkspace(ws);
        }}
      />
    </div>
  );
};

export default App;
