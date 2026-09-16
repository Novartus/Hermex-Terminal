import { CommandItem } from '../types';
import { InstrumentConfig } from '../engine/types';
import { cleanSymbol } from './formatters';

/**
 * Builds standard instrument command items
 */
export function buildStockCommandItems(instruments: InstrumentConfig[]): Omit<CommandItem, 'icon'>[] {
  return instruments.map((inst) => ({
    id: `stock-${inst.symbol}`,
    type: 'STOCK' as const,
    title: cleanSymbol(inst.symbol),
    subtitle: `${inst.name} • ${inst.category}`,
    symbol: inst.symbol,
    badge: inst.isLiveSupported ? 'LIVE 100ms' : 'SIM HFT',
  }));
}

/**
 * Filters command items against query string
 */
export function filterCommandItems(items: CommandItem[], query: string): CommandItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.subtitle?.toLowerCase().includes(q) ||
      item.symbol?.toLowerCase().includes(q)
  );
}
