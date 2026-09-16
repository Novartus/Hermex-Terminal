import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  FileText,
  Filter,
  Building2,
  Sliders,
  Bell,
  X,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { INSTRUMENTS } from '../engine/instruments';
import { CommandPaletteProps, CommandItem } from '../types';
import {
  cleanSymbol,
  buildStockCommandItems,
  filterCommandItems,
} from '../utils';

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectStock,
  onSelectWorkspace,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Keyboard shortcut listener for Esc, Cmd+K, ArrowUp, ArrowDown, Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Build searchable items list
  const allItems: CommandItem[] = useMemo(() => {
    const stockItems: CommandItem[] = buildStockCommandItems(INSTRUMENTS).map((item) => ({
      ...item,
      icon: <TrendingUp className="w-4 h-4 text-emerald-600" />,
    }));

    const actionItems: CommandItem[] = [
      {
        id: 'action-summary',
        type: 'ACTION',
        workspace: 'QUANT_TRENDS',
        title: 'Daily Market Summary & Statistics',
        subtitle: 'View 24h market gainers, volume trends & macro flow',
        shortcut: ['⌥', 'S'],
        icon: <FileText className="w-4 h-4 text-slate-500" />,
      },
      {
        id: 'action-criteria',
        type: 'ACTION',
        workspace: 'MICROSTRUCTURE',
        title: 'Order Flow & Market Depth Analyst',
        subtitle: 'Filter by volatility, order flow imbalance & market cap',
        shortcut: ['⌥', 'F'],
        icon: <Filter className="w-4 h-4 text-slate-500" />,
      },
      {
        id: 'action-watchlist',
        type: 'ACTION',
        workspace: 'PORTFOLIO_RISK',
        title: 'Financials & Portfolio Risk',
        subtitle: 'Add, remove or organize active tracked portfolios',
        shortcut: ['⌘', 'M'],
        icon: <Sliders className="w-4 h-4 text-slate-500" />,
      },
      {
        id: 'action-alert',
        type: 'ACTION',
        workspace: 'ALGO_LAB',
        title: 'Smart Algo Execution & Orders',
        subtitle: 'Set TWAP, VWAP, POV, and Iceberg order executions',
        shortcut: ['F'],
        icon: <Bell className="w-4 h-4 text-slate-500" />,
      },
    ];

    const exchangeItems: CommandItem[] = [
      {
        id: 'ex-nyse',
        type: 'EXCHANGE',
        title: 'NYSE New York Stock Exchange',
        subtitle: 'Equities & ETFs',
        badge: 'Opens at 9:30 PM',
        icon: <Building2 className="w-4 h-4 text-slate-400" />,
      },
      {
        id: 'ex-nasdaq',
        type: 'EXCHANGE',
        title: 'Nasdaq Stock Exchange',
        subtitle: 'Tech & Global Equities',
        badge: 'Opens at 9:30 PM',
        icon: <Building2 className="w-4 h-4 text-slate-400" />,
      },
      {
        id: 'ex-binance',
        type: 'EXCHANGE',
        title: 'Binance Global Liquidity Feed',
        subtitle: 'Sub-100ms L2 Order Book & Trades',
        badge: '24/7 ONLINE',
        icon: <Building2 className="w-4 h-4 text-emerald-600" />,
      },
      {
        id: 'ex-bats',
        type: 'EXCHANGE',
        title: 'BATS Better Alternative Trading System',
        subtitle: 'Cross-venue execution routing',
        badge: 'Opens at 9:30 PM',
        icon: <Building2 className="w-4 h-4 text-slate-400" />,
      },
    ];

    return [...stockItems, ...actionItems, ...exchangeItems];
  }, []);

  // Filter items based on active query
  const filteredItems = useMemo(() => {
    return filterCommandItems(allItems, query);
  }, [allItems, query]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation for arrow keys and enter
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = filteredItems[selectedIndex];
      if (current) {
        handleSelectItem(current);
      }
    }
  };

  const handleSelectItem = (item: CommandItem) => {
    if (item.type === 'STOCK' && item.symbol) {
      onSelectStock(item.symbol);
    } else if (item.type === 'ACTION' && item.workspace && onSelectWorkspace) {
      onSelectWorkspace(item.workspace);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-[2px] animate-fadeIn">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-10 font-sans text-slate-800">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100">
          <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type to search stock (e.g. BTC, ETH, SOL, AAPL) or command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            className="w-full text-sm bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400 font-medium"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Command / Stock Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 text-xs divide-y divide-slate-50">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-medium">
              No matching assets or commands found for "{query}".
            </div>
          ) : (
            <div className="py-1 flex flex-col gap-0.5">
              {filteredItems.map((item, index) => {
                const isHighlighted = index === selectedIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors text-left ${
                      isHighlighted ? 'bg-slate-100/90 text-slate-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      {item.icon}
                      <div className="flex flex-col truncate">
                        <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          {item.title}
                          {item.type === 'STOCK' && (
                            <span className="text-[10px] text-slate-400 font-normal">
                              ({item.symbol})
                            </span>
                          )}
                        </span>
                        {item.subtitle && (
                          <span className="text-[11px] text-slate-400 font-normal truncate">
                            {item.subtitle}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {item.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                          {item.badge}
                        </span>
                      )}
                      {item.shortcut && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                          {item.shortcut.map((key) => (
                            <kbd key={key} className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                              {key}
                            </kbd>
                          ))}
                        </div>
                      )}
                      {isHighlighted && item.type === 'STOCK' && (
                        <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span>Navigate with ↑ ↓ and press Enter to select</span>
          <span className="font-mono">ESC to close</span>
        </div>
      </div>
    </div>
  );
};
