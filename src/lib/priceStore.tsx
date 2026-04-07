'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PriceData } from '@/types';

interface PriceDataStore {
  prices: Record<string, PriceData[]>; // productId -> PriceData[]
  setProductPrices: (productId: string, data: PriceData[]) => void;
  getProductPrices: (productId: string) => PriceData[] | null;
  setBulkPrices: (map: Record<string, PriceData[]>) => void;
  clearAll: () => void;
  productCount: number;
}

const PriceDataContext = createContext<PriceDataStore | null>(null);

const STORAGE_KEY = 'ff-bulk-prices';

export function PriceDataProvider({ children }: { children: ReactNode }) {
  const [prices, setPrices] = useState<Record<string, PriceData[]>>({});

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setPrices(parsed);
        }
      }
    } catch { /* ignore */ }
  }, []);

  // Save to localStorage on change
  function persist(data: Record<string, PriceData[]>) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch { /* ignore quota errors */ }
  }

  function setProductPrices(productId: string, data: PriceData[]) {
    setPrices(prev => {
      const next = { ...prev, [productId]: data };
      persist(next);
      return next;
    });
  }

  function getProductPrices(productId: string): PriceData[] | null {
    const data = prices[productId];
    return data && data.length > 0 ? data : null;
  }

  function setBulkPrices(map: Record<string, PriceData[]>) {
    setPrices(prev => {
      const next = { ...prev, ...map };
      persist(next);
      return next;
    });
  }

  function clearAll() {
    setPrices({});
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* */ }
  }

  const productCount = Object.keys(prices).filter(k => prices[k].length > 0).length;

  return (
    <PriceDataContext.Provider value={{ prices, setProductPrices, getProductPrices, setBulkPrices, clearAll, productCount }}>
      {children}
    </PriceDataContext.Provider>
  );
}

export function usePriceData(): PriceDataStore {
  const ctx = useContext(PriceDataContext);
  if (!ctx) throw new Error('usePriceData must be used within PriceDataProvider');
  return ctx;
}
