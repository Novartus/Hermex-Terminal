// IndexedDB Local Storage Layer for High-Frequency Tick & Order History (Zero Backend DB)

import { TradeTick, AlgoOrder, Candle } from './types';

export class LocalDatabase {
  private static readonly DB_NAME: string = 'Hermex_Storage';
  private static readonly DB_VERSION: number = 1;
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(LocalDatabase.DB_NAME, LocalDatabase.DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Ticks store
        if (!db.objectStoreNames.contains('ticks')) {
          const tickStore = db.createObjectStore('ticks', { keyPath: 'id' });
          tickStore.createIndex('symbol', 'symbol', { unique: false });
          tickStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Algo orders store
        if (!db.objectStoreNames.contains('algo_orders')) {
          const orderStore = db.createObjectStore('algo_orders', { keyPath: 'id' });
          orderStore.createIndex('symbol', 'symbol', { unique: false });
          orderStore.createIndex('status', 'status', { unique: false });
        }

        // Candles store
        if (!db.objectStoreNames.contains('candles')) {
          const candleStore = db.createObjectStore('candles', { keyPath: 'key' });
          candleStore.createIndex('symbol', 'symbol', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  public async saveTicks(ticks: TradeTick[]): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('ticks', 'readwrite');
      const store = tx.objectStore('ticks');
      for (const tick of ticks) {
        store.put(tick);
      }
    } catch (err) {
      console.warn('Failed to save ticks to IndexedDB:', err);
    }
  }

  public async saveAlgoOrder(order: AlgoOrder): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('algo_orders', 'readwrite');
      const store = tx.objectStore('algo_orders');
      store.put(order);
    } catch (err) {
      console.warn('Failed to save algo order to IndexedDB:', err);
    }
  }

  public async getAlgoOrders(): Promise<AlgoOrder[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction('algo_orders', 'readonly');
        const store = tx.objectStore('algo_orders');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  public async exportHistoryToJSON(): Promise<string> {
    try {
      const orders = await this.getAlgoOrders();
      const exportData = {
        exportTimestamp: Date.now(),
        algoOrders: orders,
        userAgent: navigator.userAgent,
      };
      return JSON.stringify(exportData, null, 2);
    } catch {
      return '{}';
    }
  }
}

export const localDB = new LocalDatabase();
