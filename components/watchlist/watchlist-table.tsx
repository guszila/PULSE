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

function Sparkline({ change, seed }: { change: number, seed: string }) {
  const isPositive = change >= 0;
  const color = isPositive ? "#34d399" : "#fb7185";
  const id = useMemo(() => `gradient-${seed.replace(/[^a-zA-Z0-9]/g, '')}`, [seed]);
  
  const { points, baseline } = useMemo(() => {
    // Better string hash (djb2) to avoid identical sums for different symbols
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0; 
    }
    const seedNum = Math.abs(hash);
    const baseline = 50;
    
    // Pseudo-random generator based on seed
    let currentSeed = seedNum;
    const random = () => {
      const x = Math.sin(currentSeed++) * 10000;
      return x - Math.floor(x);
    };
    
    let pts = [];
    // Open gap
    let val = baseline + (random() * 8 - 4); 
    pts.push(val);
    
    const numPoints = 40;
    let momentum = 0;
    
    for(let i=1; i<numPoints; i++) {
       // Organic random walk with momentum
       momentum = momentum * 0.7 + (random() * 4 - 2);
       val += momentum;
       pts.push(val);
    }
    
    // Anchor the final point to reflect the actual 'change' percentage
    const finalVal = baseline + (change * 4); // Scale change for visual representation
    const currentLast = pts[pts.length - 1];
    const diff = finalVal - currentLast;
    
    // Distribute the difference smoothly (cubic ease-in so the beginning looks natural)
    pts = pts.map((p, i) => {
      const progress = i / (numPoints - 1);
      const ease = progress * progress; // ease-in
      return p + (diff * ease);
    });
    
    return { points: pts, baseline };
  }, [change, seed]);

  const min = Math.min(...points, baseline - 5);
  const max = Math.max(...points, baseline + 5);
  const range = max - min || 1;
  const width = 80;
  const height = 28;

  const baselineY = height - ((baseline - min) / range) * height * 0.8 - (height * 0.1);

  const path = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((p - min) / range) * height * 0.8 - (height * 0.1); 
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(" ");

  const areaPath = `${path} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="opacity-90">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      {/* Previous Close Reference Line */}
      <line x1="0" y1={baselineY} x2={width} y2={baselineY} stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="2 2" />
      
      <path d={areaPath} fill={`url(#${id})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function WatchlistTable({ stocks, saved, pinnedSymbols = [] }: { stocks: WatchlistStock[]; saved: boolean; pinnedSymbols?: string[] }) {
  const [localStocks, setLocalStocks] = useState<WatchlistStock[]>(stocks);
  const [localPinned, setLocalPinned] = useState<string[]>(pinnedSymbols);
  const [isPending, setIsPending] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [addedStockSymbol, setAddedStockSymbol] = useState<string | null>(null);
  const [deleteConfirmSymbol, setDeleteConfirmSymbol] = useState<string | null>(null);

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
    setAddedStockSymbol(symbol.toUpperCase());
    setIsPending(false);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmSymbol || isPending) return;
    setIsPending(true);
    setLocalStocks(prev => prev.filter(s => s.symbol !== deleteConfirmSymbol));
    await removeWatchlistSymbol(deleteConfirmSymbol);
    setDeleteConfirmSymbol(null);
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
                      <div className="min-w-0 w-20 sm:w-28">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-100">{stock.symbol}</span>
                        </div>
                        <div className="mt-0.5 truncate text-[11px] text-zinc-500">{stock.company}</div>
                      </div>
                    </Link>
                  </div>

                  <div className="hidden sm:flex flex-1 items-center justify-center px-2">
                    <Sparkline change={stock.change} seed={stock.symbol} />
                  </div>
                  
                  <div className="ml-3 flex shrink-0 items-center gap-3 sm:gap-4 text-right">
                    <div className="flex sm:hidden items-center justify-center mr-2">
                      <Sparkline change={stock.change} seed={stock.symbol} />
                    </div>
                    {/* Price & Mobile Change */}
                    <Link href={`/stocks/${stock.symbol}`} className="flex flex-col items-end min-w-[70px]">
                      <div className="text-sm font-semibold text-zinc-100">{formatCurrency(stock.price)}</div>
                      <div className={`mt-0.5 text-[11px] font-medium ${stock.change >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)}%
                      </div>
                      {/* Desktop Stats */}
                      <div className="hidden sm:flex items-center gap-3 mt-1 text-[11px] text-zinc-500">
                        <span>{stock.volume > 0 ? `Vol: ${formatCompact(stock.volume)}` : ""}</span>
                        <span>{stock.marketCap > 0 ? `Cap: ${formatCompact(stock.marketCap)}` : ""}</span>
                      </div>
                    </Link>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeleteConfirmSymbol(stock.symbol);
                      }}
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

      {/* Success Modal */}
      {addedStockSymbol && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
            <div className="h-20 w-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-5 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)] relative">
              <StockLogo symbol={addedStockSymbol} className="h-12 w-12 rounded-full absolute" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">เพิ่มหุ้นสำเร็จ!</h3>
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              คุณได้เพิ่ม <span className="font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded text-base">{addedStockSymbol}</span> เข้าสู่รายการที่ติดตามเรียบร้อยแล้ว
            </p>
            <Button 
              onClick={() => setAddedStockSymbol(null)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-12 shadow-[0_4px_14px_0_rgb(16,185,129,0.39)] transition-all"
            >
              ตกลง
            </Button>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmSymbol && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-rose-500" />
            <div className="flex justify-center mb-5">
              <div className="h-16 w-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
                <Trash2 className="h-7 w-7" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 text-center">ยืนยันการลบหุ้น?</h3>
            <p className="text-zinc-400 text-sm mb-7 text-center leading-relaxed">
              คุณแน่ใจหรือไม่ว่าต้องการลบ <span className="font-bold text-rose-400 bg-rose-400/10 px-1.5 py-0.5 rounded">{deleteConfirmSymbol}</span> ออกจากรายการที่ติดตาม?
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setDeleteConfirmSymbol(null)}
                className="flex-1 rounded-xl h-12 border-white/10 text-white hover:bg-white/5 bg-transparent"
                disabled={isPending}
              >
                ยกเลิก
              </Button>
              <Button 
                onClick={confirmDelete}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl h-12 shadow-[0_4px_14px_0_rgb(244,63,94,0.39)] transition-all flex items-center justify-center"
                disabled={isPending}
              >
                {isPending ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "ลบหุ้น"}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </Card>
  );
}
