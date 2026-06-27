"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PortfolioPosition } from "@/lib/portfolio-api";
import { Trash2, Plus, LayoutList, GripVertical } from "lucide-react";
import { StockLogo } from "@/components/stock-logo";

export function PortfolioManager({ initialPositions, userId }: { initialPositions: PortfolioPosition[], userId: string | null }) {
  const [positions, setPositions] = useState<PortfolioPosition[]>(initialPositions);
  const [symbol, setSymbol] = useState("");
  const [shares, setShares] = useState("");
  const [cost, setCost] = useState("");
  const [busy, setBusy] = useState(false);
  
  // New state for UX improvements
  const [searchResults, setSearchResults] = useState<{symbol: string, name: string}[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (symbol.length < 1) {
      setSearchResults([]);
      return;
    }
    // Only search if user hasn't typed an exact match that we already selected
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${symbol}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.result || []);
        }
      } catch (e) {}
    }, 400);
    return () => clearTimeout(timer);
  }, [symbol]);

  const handleSelectSymbol = async (selectedSymbol: string) => {
    setSymbol(selectedSymbol);
    setShowDropdown(false);
    
    try {
      const res = await fetch(`/api/quote?symbol=${selectedSymbol}`);
      if (res.ok) {
        const data = await res.json();
        if (data.price) {
          setCost(data.price.toString());
        }
      }
    } catch (e) {}
  };

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !symbol || !shares || !cost) return;
    
    setBusy(true);
    const { data, error } = await supabase.from("positions").insert({
      user_id: userId,
      symbol: symbol.toUpperCase(),
      shares: Number(shares),
      average_cost: Number(cost)
    }).select().single();
    
    if (!error && data) {
      setPositions([...positions, { ...data, current_price: data.average_cost, previous_close: data.average_cost, total_value: data.shares * data.average_cost, day_gain: 0, day_gain_percent: 0, total_return: 0, total_return_percent: 0 } as any]);
      setSymbol("");
      setShares("");
      setCost("");
      window.location.reload();
    } else {
      console.error(error);
    }
    setBusy(false);
  }

  async function handleDelete(id: string) {
    setBusy(true);
    const { error } = await supabase.from("positions").delete().eq("id", id);
    if (!error) {
      setPositions(positions.filter(p => p.id !== id));
      window.location.reload();
    }
    setBusy(false);
  }

  if (!userId) {
    return (
      <Card className="mt-4 border-dashed border-white/[0.1] bg-white/[0.01]">
        <CardContent className="py-12 flex flex-col items-center justify-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.03] mb-4">
            <LayoutList className="h-6 w-6 text-zinc-500" />
          </div>
          <p className="text-sm text-zinc-400">กรุณาเข้าสู่ระบบ (ในหน้าตั้งค่า) เพื่อสร้างพอร์ตลงทุนของคุณ</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4 overflow-hidden border-t-[3px] border-t-indigo-500">
      <CardHeader className="bg-white/[0.02] pb-4 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <LayoutList className="h-5 w-5 text-indigo-400" />
          จัดการพอร์ตลงทุน
          <span className="ml-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-2.5 py-0.5 text-[10px] font-medium text-indigo-300">
            {positions.length} รายการ
          </span>
        </CardTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsAdding(!isAdding)}
          className={`h-8 w-8 shrink-0 rounded-full transition-all duration-300 ${isAdding ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] rotate-45' : 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20'}`}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="pt-5 space-y-6">
        {positions.length > 0 ? (
          <div className="space-y-2.5">
            <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_40px] gap-2 px-4 pb-2 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
              <div>สินทรัพย์</div>
              <div className="text-right">จำนวนถือครอง</div>
              <div className="text-right">ต้นทุนเฉลี่ย</div>
              <div className="text-right">ราคาปัจจุบัน</div>
              <div></div>
            </div>
            
            {positions.map(p => (
              <div 
                key={p.id} 
                className="group flex items-center justify-between rounded-2xl border border-white/[0.04] bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04] hover:border-white/[0.08]"
              >
                <div className="flex items-center gap-3 w-full grid-cols-[1.5fr_1fr_1fr_1fr_40px] grid">
                  {/* Stock Info */}
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.05]">
                      <StockLogo symbol={p.symbol} className="h-full w-full" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-zinc-100">{p.symbol}</div>
                      <div className="text-[10px] text-zinc-500">หุ้นสหรัฐฯ</div>
                    </div>
                  </div>
                  
                  {/* Shares */}
                  <div className="flex flex-col items-end justify-center">
                    <span className="text-sm font-semibold text-zinc-200">{p.shares}</span>
                    <span className="text-[10px] text-zinc-500">หุ้น</span>
                  </div>
                  
                  {/* Avg Cost */}
                  <div className="flex flex-col items-end justify-center">
                    <span className="text-sm font-semibold text-zinc-200">${p.average_cost.toFixed(2)}</span>
                    <span className="text-[10px] text-zinc-500">ต่อหุ้น</span>
                  </div>
                  
                  {/* Current Price & Change */}
                  <div className="flex flex-col items-end justify-center">
                    <span className="text-sm font-semibold text-zinc-200">${(p.current_price ?? p.average_cost).toFixed(2)}</span>
                    <span className={`text-[10px] font-medium ${
                      (p.day_gain_percent ?? 0) > 0 ? "text-emerald-400" : (p.day_gain_percent ?? 0) < 0 ? "text-rose-400" : "text-zinc-500"
                    }`}>
                      {(p.day_gain_percent ?? 0) > 0 ? "+" : ""}{((p.day_gain_percent ?? 0) * 100).toFixed(2)}%
                    </span>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center justify-end">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(p.id)} 
                      disabled={busy} 
                      className="h-8 w-8 rounded-full text-zinc-600 opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-400 transition-all focus:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.01] py-12 text-center">
            <GripVertical className="h-8 w-8 text-zinc-600 mb-3" />
            <div className="text-sm font-medium text-zinc-300">ยังไม่มีหุ้นในพอร์ต</div>
            <p className="mt-1 text-xs text-zinc-500">เพิ่มหุ้นที่คุณถือครองเพื่อติดตามผลกำไรขาดทุน</p>
          </div>
        )}
        
        <div className={`relative overflow-visible transition-all duration-300 ${isAdding ? 'mt-6 opacity-100' : 'h-0 opacity-0 overflow-hidden mt-0'}`}>
          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/[0.03] shadow-[0_0_15px_rgba(99,102,241,0.05)] p-5 relative">
            {/* Subtle background glow */}
            <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
            
            <form onSubmit={handleAdd} className="relative flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="grid gap-1.5 relative" ref={dropdownRef}>
                    <label className="text-xs font-semibold text-zinc-300">สัญลักษณ์หุ้น</label>
                    <input 
                      type="text" 
                      className="h-12 w-full rounded-xl border border-white/[0.1] bg-black/60 px-4 text-sm font-bold text-white outline-none transition-colors focus:border-indigo-400/50 focus:bg-white/[0.05] placeholder:text-zinc-600 uppercase" 
                      placeholder="ค้นหา เช่น AAPL..." 
                      value={symbol}
                      onChange={e => {
                        setSymbol(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => {
                        if (symbol.length > 0) setShowDropdown(true);
                      }}
                      required
                    />
                    
                    {/* Autocomplete Dropdown */}
                    {showDropdown && searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-white/10 bg-zinc-900/95 backdrop-blur-md p-1 shadow-xl z-50 overflow-hidden">
                        {searchResults.map(res => (
                          <button
                            key={res.symbol}
                            type="button"
                            onClick={() => handleSelectSymbol(res.symbol)}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-white/10 transition-colors"
                          >
                            <span className="font-bold text-white text-sm">{res.symbol}</span>
                            <span className="text-xs text-zinc-400 truncate max-w-[120px]">{res.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="grid gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-zinc-300">จำนวนหุ้น</label>
                      <div className="flex gap-1">
                        {[1, 10, 100].map(val => (
                          <button 
                            key={val} 
                            type="button" 
                            onClick={() => setShares((Number(shares || 0) + val).toString())}
                            className="rounded px-1.5 py-0.5 text-[9px] font-bold bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                          >
                            +{val}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input 
                      type="number" 
                      step="any"
                      className="h-12 w-full rounded-xl border border-white/[0.1] bg-black/60 px-4 text-sm font-bold text-white outline-none transition-colors focus:border-indigo-400/50 focus:bg-white/[0.05] placeholder:text-zinc-600" 
                      placeholder="0" 
                      value={shares}
                      onChange={e => setShares(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-zinc-300">ต้นทุนเฉลี่ย ($)</label>
                      {Number(shares) > 0 && Number(cost) > 0 && (
                        <span className="text-[10px] text-indigo-400 font-medium tracking-wide">
                          รวม ${(Number(shares) * Number(cost)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </span>
                      )}
                    </div>
                    <input 
                      type="number" 
                      step="any"
                      className="h-12 w-full rounded-xl border border-white/[0.1] bg-black/60 px-4 text-sm font-bold text-white outline-none transition-colors focus:border-indigo-400/50 focus:bg-white/[0.05] placeholder:text-zinc-600" 
                      placeholder="0.00" 
                      value={cost}
                      onChange={e => setCost(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={busy} 
                  className="h-12 w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_4px_14px_0_rgb(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] hover:-translate-y-[1px] transition-all font-bold text-sm mt-2"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  เพิ่มรายการเข้าพอร์ต
                </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
