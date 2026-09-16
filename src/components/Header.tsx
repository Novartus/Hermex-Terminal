import React, { useState } from 'react';
import { ChevronLeft, Scan, Search, Menu, X } from 'lucide-react';
import { TerminalWorkspace } from '../engine/types';
import { HeaderProps } from '../types';
import { AssetDropdown } from './AssetDropdown';
import { DataSourceToggle } from './DataSourceToggle';
import { SimulationModal } from './SimulationModal';

export const Header: React.FC<HeaderProps> = ({
  currentSymbol,
  onSymbolChange,
  dataSource,
  onDataSourceChange,
  wsStatus,
  latencyMs,
  activeWorkspace,
  onWorkspaceChange,
  onOpenSearch,
  onReturnToWelcome,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSimModal, setShowSimModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navTabs: { id: TerminalWorkspace; label: string }[] = [
    { id: 'OVERVIEW', label: 'Chart' },
    { id: 'QUANT_TRENDS', label: 'Statistics' },
    { id: 'MICROSTRUCTURE', label: 'Analyst' },
    { id: 'ALGO_LAB', label: 'Earnings' },
    { id: 'PORTFOLIO_RISK', label: 'Financials' },
  ];

  return (
    <header className="w-full bg-white border-b border-slate-200/80 select-none sticky top-0 z-30 font-sans shadow-xs">
      {/* Main Top Bar */}
      <div className="max-w-[1920px] mx-auto px-2.5 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between gap-2">
        {/* Left Section: Back link + Asset Selector */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 min-w-0">
          <a
            href="#/"
            onClick={(e) => {
              e.preventDefault();
              if (onReturnToWelcome) onReturnToWelcome();
              else onWorkspaceChange('OVERVIEW');
            }}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
            title="Return to Welcome Screen"
            aria-label="Return to Welcome Screen"
          >
            <ChevronLeft className="w-4 h-4" />
          </a>

          <AssetDropdown
            currentSymbol={currentSymbol}
            onSymbolChange={onSymbolChange}
            isOpen={isDropdownOpen}
            onToggle={() => setIsDropdownOpen(!isDropdownOpen)}
            onClose={() => setIsDropdownOpen(false)}
          />
        </div>

        {/* Center: Search trigger - Desktop full button, Mobile icon button */}
        <div className="hidden sm:flex flex-1 max-w-md mx-2 min-w-0">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-600 transition-all text-xs group cursor-pointer"
            title="Search stock or command (⌘K)"
          >
            <div className="flex items-center gap-2 truncate min-w-0">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
              <span className="truncate text-slate-500 font-medium text-xs">
                Search ticker (BTC, ETH, AAPL) or ⌘K
              </span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-white text-[10px] font-mono text-slate-500 border border-slate-200 shadow-2xs shrink-0 ml-1">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Desktop Controls (>= md screens) */}
        <div className="hidden md:flex items-center gap-1.5 sm:gap-2 shrink-0">
          <nav className="flex items-center gap-1">
            {navTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onWorkspaceChange(tab.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeWorkspace === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <span className="text-slate-300 text-xs px-0.5">|</span>

          <button
            onClick={() => onWorkspaceChange('QUANT_TRENDS')}
            className="flex items-center gap-1.5 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            title="Launch Institutional Quant Analytics"
          >
            <Scan className="w-3.5 h-3.5 text-slate-600" />
            Analyze
          </button>

          <DataSourceToggle
            dataSource={dataSource}
            onSelectLive={() => {
              if (dataSource !== 'BINANCE_LIVE') onDataSourceChange('BINANCE_LIVE');
            }}
            onRequestSim={() => {
              if (dataSource !== 'SYNTHETIC_HFT') setShowSimModal(true);
            }}
          />

          {/* WebSocket Latency Indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] text-slate-500 font-semibold ml-1">
            <span
              className={`w-2 h-2 rounded-full ${
                wsStatus === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span>{latencyMs}ms</span>
          </div>
        </div>

        {/* Mobile Action Controls (< md screens): Search Icon Button + Data Toggle + Drawer Toggle */}
        <div className="flex md:hidden items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onOpenSearch}
            className="w-7 h-7 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
            title="Search stock or command (⌘K)"
            aria-label="Search stock or command"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          <DataSourceToggle
            dataSource={dataSource}
            onSelectLive={() => {
              if (dataSource !== 'BINANCE_LIVE') onDataSourceChange('BINANCE_LIVE');
            }}
            onRequestSim={() => {
              if (dataSource !== 'SYNTHETIC_HFT') setShowSimModal(true);
            }}
          />

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
            aria-label={mobileMenuOpen ? 'Close navigation drawer' : 'Open navigation drawer'}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Horizontal Navigation Scroller */}
      <div className="md:hidden border-t border-slate-100 px-3 py-1.5 bg-slate-50/70 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
        {navTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onWorkspaceChange(tab.id)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeWorkspace === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200/80 text-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <button
          onClick={() => onWorkspaceChange('QUANT_TRENDS')}
          className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-white border border-slate-200/80 text-slate-700 flex items-center gap-1"
        >
          <Scan className="w-3 h-3 text-slate-500" />
          Analyze
        </button>
      </div>

      {/* Mobile Expandable Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 shadow-lg flex flex-col gap-3 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
            <span className="font-semibold text-slate-500">Feed Connection</span>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600">
              <span
                className={`w-2 h-2 rounded-full ${
                  wsStatus === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span>{wsStatus} ({latencyMs}ms)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                onWorkspaceChange('QUANT_TRENDS');
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-50"
            >
              <Scan className="w-3.5 h-3.5 text-slate-600" />
              Quant Trends
            </button>
            <button
              onClick={() => {
                onOpenSearch();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-50"
            >
              <Search className="w-3.5 h-3.5 text-slate-600" />
              Spotlight (⌘K)
            </button>
          </div>
        </div>
      )}

      <SimulationModal
        isOpen={showSimModal}
        onClose={() => setShowSimModal(false)}
        onConfirm={() => {
          onDataSourceChange('SYNTHETIC_HFT');
          setShowSimModal(false);
        }}
      />
    </header>
  );
};
