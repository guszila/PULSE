"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Command } from "lucide-react";

export const POPULAR_STOCKS = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corp." },
  { symbol: "NVDA", name: "NVIDIA Corp." },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "META", name: "Meta Platforms" },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "AVGO", name: "Broadcom Inc." },
  { symbol: "TSM", name: "Taiwan Semiconductor" },
  { symbol: "WMT", name: "Walmart Inc." },
  { symbol: "JPM", name: "JPMorgan Chase" },
  { symbol: "V", name: "Visa Inc." },
  { symbol: "LLY", name: "Eli Lilly and Co." },
  { symbol: "UNH", name: "UnitedHealth Group" },
  { symbol: "MA", name: "Mastercard Inc." },
  { symbol: "PG", name: "Procter & Gamble" },
  { symbol: "JNJ", name: "Johnson & Johnson" },
  { symbol: "XOM", name: "Exxon Mobil Corp." },
  { symbol: "HD", name: "Home Depot" },
  { symbol: "BAC", name: "Bank of America" },
  { symbol: "COST", name: "Costco Wholesale" },
  { symbol: "KO", name: "Coca-Cola Co." },
  { symbol: "PEP", name: "PepsiCo Inc." },
  { symbol: "NFLX", name: "Netflix Inc." },
  { symbol: "AMD", name: "Advanced Micro Devices" },
  { symbol: "DIS", name: "Walt Disney Co." },
  { symbol: "CRM", name: "Salesforce Inc." }
];



export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = POPULAR_STOCKS.filter(
    (s) => s.symbol.toLowerCase().includes(query.toLowerCase()) || s.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  if (query.trim().length > 0 && !filtered.find(s => s.symbol.toLowerCase() === query.trim().toLowerCase())) {
    filtered.push({ symbol: query.trim().toUpperCase(), name: "ค้นหาข้อมูลหุ้นตัวนี้..." });
  }

  const showDropdown = isFocused && query.length > 0 && filtered.length > 0;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim().toUpperCase();
    if (!trimmed) return;
    
    // Find if the query matches any symbol exactly
    const exactMatch = POPULAR_STOCKS.find(s => s.symbol === trimmed);
    if (exactMatch) {
      router.push(`/stocks/${exactMatch.symbol}`);
      setIsFocused(false);
      return;
    }
    
    // Find if there is a good match in popular stocks
    const bestMatch = POPULAR_STOCKS.find(
      (s) => s.symbol.toLowerCase().includes(trimmed.toLowerCase()) || s.name.toLowerCase().includes(trimmed.toLowerCase())
    );

    if (bestMatch) {
      router.push(`/stocks/${bestMatch.symbol}`);
      setQuery(bestMatch.symbol);
    } else {
      router.push(`/stocks/${trimmed}`);
    }
    setIsFocused(false);
  }

  return (
    <div className="relative flex-1 sm:flex-none">
      <form 
        ref={formRef}
        onSubmit={onSubmit}
        className="flex h-10 min-w-0 w-full items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 text-sm text-zinc-100 focus-within:border-emerald-400/50 focus-within:bg-white/[0.06] transition-colors"
      >
        <Search className="h-4 w-4 text-zinc-500" />
        <input
          type="text"
          placeholder="ค้นหาหุ้น เช่น AAPL, MSFT..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="w-full bg-transparent outline-none placeholder:text-zinc-500 sm:w-56"
        />
        <Command className="ml-auto hidden h-3.5 w-3.5 text-zinc-500 sm:block" />
      </form>
      
      {showDropdown && (
        <div className="absolute top-full left-0 z-50 mt-2 w-full sm:w-[300px] rounded-2xl border border-white/[0.08] bg-[#070807]/95 backdrop-blur-xl shadow-glass overflow-hidden p-1.5">
          <div className="px-2 pb-1.5 pt-2 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
            ผลการค้นหา
          </div>
          {filtered.map((stock) => (
            <button
              key={stock.symbol}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent blur
                setQuery(stock.symbol);
                setIsFocused(false);
                router.push(`/stocks/${stock.symbol}`);
              }}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition hover:bg-white/[0.06]"
            >
              <span className="font-semibold text-zinc-100">{stock.symbol}</span>
              <span className="truncate text-xs text-zinc-500 ml-2">{stock.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
