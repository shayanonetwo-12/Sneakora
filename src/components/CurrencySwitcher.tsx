import { useState, useRef, useEffect } from 'react';
import { useCurrency, CURRENCIES } from '@/store/currency';
import { ChevronDown, Check } from 'lucide-react';

export function CurrencySwitcher() {
  const { currency, setCurrencyCode } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold text-ink-300 transition-all duration-300 hover:bg-ink-800 hover:text-ink-100"
        aria-label="Change currency"
      >
        <span className="text-sm">{currency.symbol}</span>
        <span className="hidden sm:inline">{currency.code}</span>
        <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-2xl border border-ink-700 bg-ink-900 shadow-2xl animate-scale-in glass-card">
          <div className="border-b border-ink-800 px-4 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">Currency</p>
          </div>
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              onClick={() => {
                setCurrencyCode(c.code);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between px-4 py-3 text-sm transition-all duration-200 ${
                c.code === currency.code
                  ? 'bg-ink-800 text-ink-100'
                  : 'text-ink-300 hover:bg-ink-800/50 hover:text-ink-100'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span className="text-base font-bold">{c.symbol}</span>
                <span className="font-medium">{c.code}</span>
                <span className="text-xs text-ink-500">{c.label}</span>
              </span>
              {c.code === currency.code && <Check className="h-4 w-4 text-accent-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
