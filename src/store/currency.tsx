import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';

export interface CurrencyInfo {
  code: string;
  symbol: string;
  label: string;
  rate: number;
  locale: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', symbol: '$', label: 'US Dollar', rate: 1, locale: 'en-US' },
  { code: 'EUR', symbol: '€', label: 'Euro', rate: 0.92, locale: 'de-DE' },
  { code: 'GBP', symbol: '£', label: 'British Pound', rate: 0.79, locale: 'en-GB' },
  { code: 'PKR', symbol: '₨', label: 'Pakistani Rupee', rate: 278, locale: 'en-PK' },
];

const CURRENCY_KEY = 'sneakora_currency_v1';

function loadCurrency(): string {
  try {
    return localStorage.getItem(CURRENCY_KEY) || 'USD';
  } catch {
    return 'USD';
  }
}

function getCurrencyInfo(code: string): CurrencyInfo {
  return CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
}

interface CurrencyContextValue {
  currency: CurrencyInfo;
  setCurrencyCode: (code: string) => void;
  formatPrice: (value: number) => string;
  formatPriceCents: (value: number) => string;
  convert: (value: number) => number;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [code, setCode] = useState<string>(loadCurrency);

  useEffect(() => {
    try {
      localStorage.setItem(CURRENCY_KEY, code);
    } catch {
      /* ignore */
    }
  }, [code]);

  const currency = getCurrencyInfo(code);

  const setCurrencyCode = useCallback((c: string) => setCode(c), []);

  const convert = useCallback((value: number) => value * currency.rate, [currency]);

  const formatPrice = useCallback(
    (value: number) => {
      const converted = value * currency.rate;
      if (currency.code === 'PKR') {
        return `${currency.symbol}${Math.round(converted).toLocaleString('en-PK')}`;
      }
      const formatted = converted.toFixed(2).replace(/\.00$/, '');
      return `${currency.symbol}${formatted}`;
    },
    [currency],
  );

  const formatPriceCents = useCallback(
    (value: number) => {
      const converted = value * currency.rate;
      if (currency.code === 'PKR') {
        return `${currency.symbol}${Math.round(converted).toLocaleString('en-PK')}`;
      }
      return `${currency.symbol}${converted.toFixed(2)}`;
    },
    [currency],
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrencyCode, formatPrice, formatPriceCents, convert }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
