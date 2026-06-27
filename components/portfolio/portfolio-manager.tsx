"use client";

import { useState } from "react";
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
      <CardHeader className="bg-white/[0.02] pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <LayoutList className="h-5 w-5 text-indigo-400" />
          จัดการพอร์ตลงทุน
          <span className="ml-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-2.5 py-0.5 text-[10px] font-medium text-indigo-300">
            {positions.length} รายการ
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-5 space-y-6">
        {positions.length > 0 ? (
          <div className="space-y-2.5">
            <div className="grid grid-cols-[1fr_1fr_1fr_40px] gap-2 px-4 pb-2 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
              <div>สินทรัพย์</div>
              <div className="text-right">จำนวนถือครอง</div>
              <div className="text-right">ต้นทุนเฉลี่ย</div>
              <div></div>
            </div>
            
            {positions.map(p => (
              <div 
                key={p.id} 
                className="group flex items-center justify-between rounded-2xl border border-white/[0.04] bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04] hover:border-white/[0.08]"
              >
                <div className="flex items-center gap-3 w-full grid-cols-[1fr_1fr_1fr_40px] grid">
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
        
        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.02] p-5 shadow-inset">
          {/* Subtle background glow */}
          <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl"></div>
          
          <h3 className="mb-4 text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
            <Plus className="h-3 w-3" />
            เพิ่มรายการใหม่
          </h3>
          
          <form onSubmit={handleAdd} className="relative flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="grid flex-1 gap-1.5">
              <label className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider pl-1">สัญลักษณ์ (เช่น AAPL)</label>
              <input 
                type="text" 
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/40 px-4 text-sm font-bold text-white outline-none transition-colors focus:border-indigo-400/50 focus:bg-white/[0.03] placeholder:text-zinc-600 uppercase shadow-inset" 
                placeholder="AAPL" 
                value={symbol}
                onChange={e => setSymbol(e.target.value)}
                required
              />
            </div>
            <div className="grid flex-1 gap-1.5">
              <label className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider pl-1">จำนวนหุ้น</label>
              <input 
                type="number" 
                step="any"
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/40 px-4 text-sm font-bold text-white outline-none transition-colors focus:border-indigo-400/50 focus:bg-white/[0.03] placeholder:text-zinc-600 shadow-inset" 
                placeholder="10.5" 
                value={shares}
                onChange={e => setShares(e.target.value)}
                required
              />
            </div>
            <div className="grid flex-1 gap-1.5">
              <label className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider pl-1">ต้นทุนเฉลี่ย ($)</label>
              <input 
                type="number" 
                step="any"
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/40 px-4 text-sm font-bold text-white outline-none transition-colors focus:border-indigo-400/50 focus:bg-white/[0.03] placeholder:text-zinc-600 shadow-inset" 
                placeholder="150.00" 
                value={cost}
                onChange={e => setCost(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              disabled={busy} 
              className="h-11 shrink-0 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] font-semibold px-6"
            >
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มเข้าพอร์ต
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
