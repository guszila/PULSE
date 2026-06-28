"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PortfolioPosition } from "@/lib/portfolio-api";
import { Trash2, Plus, LayoutList, GripVertical, ScanLine, Loader2, Sparkles, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { StockLogo } from "@/components/stock-logo";

export function PortfolioManager({ initialPositions, userId }: { initialPositions: PortfolioPosition[], userId: string | null }) {
  const [positions, setPositions] = useState<PortfolioPosition[]>(initialPositions);
  const [symbol, setSymbol] = useState("");
  const [shares, setShares] = useState("");
  const [cost, setCost] = useState("");
  const [busy, setBusy] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // New state for UX improvements
  const [searchResults, setSearchResults] = useState<{symbol: string, name: string}[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [addedStock, setAddedStock] = useState<PortfolioPosition | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use useEffect to handle clicks outside of the dropdown...
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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!userId) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("ไฟล์รูปภาพใหญ่เกินไป (จำกัด 5MB)");
      return;
    }

    setIsScanning(true);
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        const apiKey = window.localStorage.getItem("alphaedge-gemini-key") || "";

        const res = await fetch("/api/vision", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-gemini-key": apiKey
          },
          body: JSON.stringify({ 
            imageBase64: base64String, 
            mimeType: file.type 
          })
        });

        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error);
        
        if (data.result && Array.isArray(data.result) && data.result.length > 0) {
          setBusy(true);
          let successCount = 0;
          for (const stock of data.result) {
             if (stock.symbol && stock.shares && stock.average_cost) {
                const upperSymbol = stock.symbol.toUpperCase();
                // Check if already exists
                const { data: existing } = await supabase
                  .from("positions")
                  .select("id")
                  .eq("user_id", userId)
                  .eq("symbol", upperSymbol)
                  .maybeSingle();

                if (existing) {
                  // Update existing
                  const { error } = await supabase
                    .from("positions")
                    .update({
                      shares: Number(stock.shares),
                      average_cost: Number(stock.average_cost)
                    })
                    .eq("id", existing.id);
                  if (!error) successCount++;
                } else {
                  // Insert new
                  const { error } = await supabase
                    .from("positions")
                    .insert({
                      user_id: userId,
                      symbol: upperSymbol,
                      shares: Number(stock.shares),
                      average_cost: Number(stock.average_cost)
                    });
                  if (!error) successCount++;
                }
             }
          }
          alert(`สแกนพอร์ตสำเร็จ! นำเข้าข้อมูลหุ้น ${successCount} รายการ`);
          window.location.reload();
        } else {
          alert("ไม่พบข้อมูลพอร์ตการลงทุนในรูปภาพนี้ครับ");
          setIsScanning(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      alert(error.message || "เกิดข้อผิดพลาดในการสแกนรูปภาพ");
      setIsScanning(false);
      setBusy(false);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

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
      setAddedStock(data as any);
      setSymbol("");
      setShares("");
      setCost("");
      setIsAdding(false);
    } else {
      console.error(error);
    }
    setBusy(false);
  }

  async function confirmDelete() {
    if (!deleteConfirmId) return;
    setBusy(true);
    const { error } = await supabase.from("positions").delete().eq("id", deleteConfirmId);
    if (!error) {
      setPositions(positions.filter(p => p.id !== deleteConfirmId));
    }
    setDeleteConfirmId(null);
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
        <div className="flex items-center gap-2">
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            className="hidden" 
          />
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning || busy}
            className="h-8 border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200 transition-all font-medium text-xs hidden sm:flex"
          >
            {isScanning ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-indigo-400" />
            )}
            {isScanning ? "AI กำลังอ่านภาพ..." : "สแกนภาพพอร์ต"}
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning || busy}
            className="h-8 w-8 sm:hidden border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20"
          >
             {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanLine className="h-4 w-4 text-indigo-400" />}
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsAdding(!isAdding)}
            className={`h-8 w-8 shrink-0 rounded-full transition-all duration-300 ${isAdding ? 'bg-zinc-700 text-white rotate-45' : 'bg-white/5 text-zinc-300 hover:bg-white/10'}`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-5 space-y-6">
        {positions.length > 0 ? (
          <div className="space-y-0">
            {/* Header row */}
            <div className="flex justify-between items-center px-2 pb-2 text-[11px] font-medium text-zinc-500 mb-2 border-b border-white/[0.05]">
              <div>{positions.length} assets</div>
              <div className="flex gap-12 sm:gap-16">
                <div className="text-right">Holding Value (THB)</div>
                <div className="text-right w-24">% Profit & Amount</div>
              </div>
            </div>
            
            {(() => {
              const totalPortfolioValueUSD = positions.reduce((sum, p) => sum + (p.total_value || p.shares * (p.current_price ?? p.average_cost)), 0);
              const THB_RATE = 34.50;

              return positions.map((p) => {
                const positionValueUSD = p.total_value || p.shares * (p.current_price ?? p.average_cost);
                const positionValueTHB = positionValueUSD * THB_RATE;
                const allocationPercent = totalPortfolioValueUSD > 0 ? (positionValueUSD / totalPortfolioValueUSD) * 100 : 0;
                
                // Use total_return for Unrealized P/L if available, otherwise calculate it
                const unrealizedPlUSD = p.total_return ?? (positionValueUSD - (p.shares * p.average_cost));
                const unrealizedPlTHB = unrealizedPlUSD * THB_RATE;
                const unrealizedPlPercent = p.total_return_percent ?? (p.shares * p.average_cost > 0 ? unrealizedPlUSD / (p.shares * p.average_cost) : 0);
                
                const isGain = unrealizedPlUSD >= 0;

                return (
                  <div key={p.id} className="group relative flex flex-col border-b border-white/[0.04]">
                    <div 
                      onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                      className="flex items-center justify-between py-4 hover:bg-white/[0.02] px-2 rounded-xl transition-colors cursor-pointer"
                    >
                      {/* Left: Stock & Allocation */}
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-900 border border-white/[0.05]">
                          <StockLogo symbol={p.symbol} className="h-full w-full" />
                        </div>
                        <div className="flex flex-col">
                          <div className="text-sm font-bold text-zinc-100">{p.symbol}</div>
                          <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3 text-zinc-500">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                            </svg>
                            {allocationPercent.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                      
                      {/* Right side containers */}
                      <div className="flex gap-8 sm:gap-16 items-center">
                        {/* Middle: Holding Value */}
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-semibold text-zinc-100">
                            {new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(positionValueTHB)}
                          </span>
                          <span className="text-[11px] text-zinc-500 mt-0.5 font-medium">
                            ≈ {new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(positionValueUSD)} USD
                          </span>
                        </div>
                        
                        {/* Right: Profit & Amount */}
                        <div className="flex flex-col items-end w-24">
                          <span className={`text-sm font-bold flex items-center gap-1 ${isGain ? "text-emerald-400" : "text-rose-400"}`}>
                            {isGain ? (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowDownRight className="w-3.5 h-3.5" />
                            )}
                            {isGain ? "+" : ""}{(unrealizedPlPercent * 100).toFixed(2)}%
                          </span>
                          <span className={`text-[11px] font-medium mt-0.5 ${isGain ? "text-emerald-400" : "text-rose-400"}`}>
                            ({isGain ? "+" : ""}{new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(unrealizedPlTHB)} THB)
                          </span>
                        </div>

                        {/* Delete Action (Hidden by default, shows on hover) */}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(p.id); }} 
                          disabled={busy} 
                          className="absolute right-2 h-8 w-8 rounded-full text-zinc-500 opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 hover:text-rose-400 transition-all focus:opacity-100 bg-black/50 backdrop-blur-md border border-white/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedId === p.id && (
                      <div className="px-4 pb-4 pt-2 grid grid-cols-2 gap-4 text-sm animate-in slide-in-from-top-2 fade-in duration-200">
                        <div className="flex flex-col">
                          <span className="text-zinc-500 text-[11px] mb-1 font-medium">Outstanding Shares</span>
                          <span className="text-zinc-200 font-semibold">{p.shares}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-zinc-500 text-[11px] mb-1 font-medium">Price (USD) & 1D Change</span>
                          <span className="text-zinc-200 font-semibold flex items-center gap-2">
                            {new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(p.current_price ?? p.average_cost)}
                            <span className={`text-[11px] font-bold ${((p.day_gain_percent ?? 0) >= 0) ? "text-emerald-400" : "text-rose-400"}`}>
                              {((p.day_gain_percent ?? 0) >= 0) ? "↗ " : "↘ "}{Math.abs((p.day_gain_percent ?? 0) * 100).toFixed(2)}%
                            </span>
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-zinc-500 text-[11px] mb-1 font-medium">Cost per Share (USD)</span>
                          <span className="text-zinc-200 font-semibold">{new Intl.NumberFormat("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(p.average_cost)}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-zinc-500 text-[11px] mb-1 font-medium">Total Cost (USD)</span>
                          <span className="text-zinc-200 font-semibold">{new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(p.shares * p.average_cost)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.01] py-12 text-center">
            <LayoutList className="h-8 w-8 text-zinc-600 mb-3" />
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

      {/* Success Modal */}
      {addedStock && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
            <div className="h-20 w-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-5 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)] relative">
              <StockLogo symbol={addedStock.symbol} className="h-12 w-12 rounded-full absolute" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">เพิ่มหุ้นสำเร็จ!</h3>
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              คุณได้เพิ่ม <span className="font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded text-base">{addedStock.symbol}</span><br/>จำนวน <span className="text-white font-medium">{addedStock.shares}</span> หุ้น เข้าสู่พอร์ตของคุณเรียบร้อยแล้ว
            </p>
            <Button 
              onClick={() => setAddedStock(null)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-12 shadow-[0_4px_14px_0_rgb(16,185,129,0.39)] transition-all"
            >
              ตกลง
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (() => {
        const stockToDelete = positions.find(p => p.id === deleteConfirmId);
        if (!stockToDelete) return null;
        
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-rose-500" />
              <div className="flex justify-center mb-5">
                <div className="h-16 w-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
                  <Trash2 className="h-7 w-7" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 text-center">ยืนยันการลบหุ้น?</h3>
              <p className="text-zinc-400 text-sm mb-7 text-center leading-relaxed">
                คุณแน่ใจหรือไม่ว่าต้องการลบ <span className="font-bold text-rose-400 bg-rose-400/10 px-1.5 py-0.5 rounded">{stockToDelete.symbol}</span> จำนวน <span className="text-white font-medium">{stockToDelete.shares}</span> หุ้น ออกจากพอร์ต? <br/><span className="text-xs text-zinc-500 mt-2 block">การกระทำนี้ไม่สามารถยกเลิกได้</span>
              </p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 rounded-xl h-12 border-white/10 text-white hover:bg-white/5 bg-transparent"
                  disabled={busy}
                >
                  ยกเลิก
                </Button>
                <Button 
                  onClick={confirmDelete}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl h-12 shadow-[0_4px_14px_0_rgb(244,63,94,0.39)] transition-all"
                  disabled={busy}
                >
                  {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : "ลบหุ้น"}
                </Button>
              </div>
            </div>
          </div>
        );
      })()}
    </Card>
  );
}
