"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Plus, Trash2, Search, X, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatCompact } from "@/lib/utils";
import type { WatchlistStock } from "@/lib/market-data";
import { StockLogo } from "@/components/stock-logo";
import { addWatchlistSymbol, removeWatchlistSymbol, toggleWatchlistPin } from "@/app/actions/watchlist";
import { Button } from "@/components/ui/button";
import { POPULAR_STOCKS } from "@/components/shared/global-search";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

export function WatchlistTable({ stocks, saved, pinnedSymbols = [] }: { stocks: WatchlistStock[]; saved: boolean; pinnedSymbols?: string[] }) {
  const [localStocks, setLocalStocks] = useState<WatchlistStock[]>(stocks);
  const [localPinned, setLocalPinned] = useState<string[]>(pinnedSymbols);
  const [isPending, setIsPending] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Sync prop changes
  useEffect(() => {
    setLocalStocks(stocks);
  }, [stocks]);

  useEffect(() => {
    setLocalPinned(pinnedSymbols);
  }, [pinnedSymbols]);

  const sortedStocks = useMemo(() => {
    return [...localStocks].sort((a, b) => {
      const aPinned = localPinned.includes(a.symbol);
      const bPinned = localPinned.includes(b.symbol);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0; // maintain original or alphabetical order if needed
    });
  }, [localStocks, localPinned]);

  const handlePin = async (e: React.MouseEvent, symbol: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Optimistic update
    setLocalPinned(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol) 
        : [...prev, symbol]
    );
    
    await toggleWatchlistPin(symbol);
  };

  const handleAdd = async (symbol: string) => {
    if (!symbol.trim() || isPending) return;
    setIsPending(true);
    await addWatchlistSymbol(symbol.toUpperCase());
    setIsSearchOpen(false);
    setSearchQuery("");
    setIsPending(false);
  };

  const handleRemove = async (e: React.MouseEvent, symbol: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (isPending) return;
    setIsPending(true);
    setLocalStocks(prev => prev.filter(s => s.symbol !== symbol));
    await removeWatchlistSymbol(symbol);
    setIsPending(false);
  };

  const filteredStocks = POPULAR_STOCKS.filter((s) => 
    s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exactMatch = POPULAR_STOCKS.find((s) => s.symbol.toLowerCase() === searchQuery.trim().toLowerCase());

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle>หุ้นที่ติดตาม</CardTitle>
          {saved && <Badge tone="gain">Supabase</Badge>}
        </div>
        <Link href="/watchlist" className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-100">
          เปิดเต็มจอ
          <ChevronRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {/* Pinned / Sorted List */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {sortedStocks.map((stock) => {
              const isPinned = localPinned.includes(stock.symbol);
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  key={stock.symbol}
                  className="group relative flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3 transition hover:bg-white/[0.06]"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Pin Toggle */}
                    <button 
                      onClick={(e) => handlePin(e, stock.symbol)}
                      className={`p-1 transition-colors ${isPinned ? 'text-yellow-400 hover:text-yellow-500' : 'text-zinc-600 hover:text-yellow-400/50'}`}
                      aria-label="Pin to top"
                    >
                      <Star className="h-4 w-4" fill={isPinned ? "currentColor" : "none"} />
                    </button>
                    
                    <Link href={`/stocks/${stock.symbol}`} className="flex items-center gap-3 flex-1 min-w-0">
                      <StockLogo symbol={stock.symbol} className="h-7 w-7 sm:h-8 sm:w-8 shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-100">{stock.symbol}</span>
                          <Badge tone={stock.change >= 0 ? "gain" : "loss"} className="hidden sm:inline-flex">
                            {stock.change >= 0 ? "+" : ""}
                            {stock.change.toFixed(2)}%
                          </Badge>
                        </div>
                        <div className="mt-0.5 truncate text-xs text-zinc-500">{stock.company}</div>
                      </div>
                    </Link>
                  </div>
                  
                  <div className="ml-3 flex shrink-0 items-center gap-4 text-right">
                    {/* Price & Mobile Change */}
                    <Link href={`/stocks/${stock.symbol}`} className="flex flex-col items-end">
                      <div className="text-sm font-semibold text-zinc-100">{formatCurrency(stock.price)}</div>
                      <div className={`mt-0.5 text-[11px] font-medium sm:hidden ${stock.change >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)}%
                      </div>
                      {/* Desktop Stats */}
                      <div className="hidden sm:flex items-center gap-3 mt-1 text-[11px] text-zinc-500">
                        <span>{stock.volume > 0 ? `Vol: ${formatCompact(stock.volume)}` : ""}</span>
                        <span>{stock.marketCap > 0 ? `Cap: ${formatCompact(stock.marketCap)}` : ""}</span>
                      </div>
                    </Link>

                    <button
                      onClick={(e) => handleRemove(e, stock.symbol)}
                      disabled={isPending}
                      className="rounded-lg p-2 text-zinc-600 hover:bg-white/[0.1] hover:text-rose-400 disabled:opacity-50 transition"
                      aria-label="ลบ"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <Button 
          onClick={() => setIsSearchOpen(true)} 
          variant="outline" 
          className="w-full mt-4 h-12 border-dashed border-white/[0.1] bg-transparent hover:bg-white/[0.02] hover:border-white/[0.2] text-zinc-400 transition"
        >
          <Plus className="mr-2 h-4 w-4" /> เพิ่มหุ้นใหม่
        </Button>

        {/* Search Modal */}
        {isSearchOpen && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
            <Card className="flex flex-col w-full h-[90vh] sm:h-auto sm:max-h-[85vh] sm:max-w-xl bg-zinc-950 border-0 sm:border sm:border-white/[0.1] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
              
              <div className="flex items-center p-4 border-b border-white/[0.08] gap-3">
                <Search className="h-5 w-5 text-zinc-400" />
                <input
                  autoFocus
                  type="text"
                  placeholder="ค้นหาชื่อหุ้น หรือสัญลักษณ์ (เช่น AAPL)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-base text-white placeholder-zinc-500 outline-none"
                />
                <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)} className="text-zinc-400 hover:text-white rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                {searchQuery.trim().length > 0 && !exactMatch && (
                  <button
                    onClick={() => handleAdd(searchQuery.trim())}
                    className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition hover:bg-white/[0.06] border border-dashed border-white/[0.1] mb-2"
                  >
                    <span className="font-semibold text-zinc-100">{searchQuery.trim().toUpperCase()}</span>
                    <span className="text-xs text-indigo-400">กดเพื่อเพิ่มหุ้นนี้</span>
                  </button>
                )}

                <div className="px-3 pb-2 pt-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  รายชื่อหุ้นที่แนะนำ
                </div>
                
                <div className="flex flex-col gap-1">
                  {filteredStocks.map((stock) => (
                    <button
                      key={stock.symbol}
                      onClick={() => handleAdd(stock.symbol)}
                      className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition hover:bg-indigo-500/10 group"
                    >
                      <div className="flex items-center gap-3">
                        <StockLogo symbol={stock.symbol} className="h-8 w-8" />
                        <div>
                          <div className="font-semibold text-zinc-100 group-hover:text-indigo-300 transition-colors">{stock.symbol}</div>
                          <div className="text-xs text-zinc-500">{stock.name}</div>
                        </div>
                      </div>
                      <Plus className="h-4 w-4 text-zinc-600 group-hover:text-indigo-400" />
                    </button>
                  ))}
                  {filteredStocks.length === 0 && (
                    <div className="p-8 text-center text-zinc-500 text-sm">
                      ไม่พบผลลัพธ์จากหุ้นยอดนิยม พิมพ์ชื่อหุ้นที่ต้องการเพื่อเพิ่มเองได้เลย
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>,
          document.body
        )}
      </CardContent>
    </Card>
  );
}
