"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { PortfolioPosition } from "@/lib/portfolio-api";
import { Trash2 } from "lucide-react";
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
      // In a real app, you'd refetch quotes here. For this simple UI, just append it.
      setPositions([...positions, { ...data, current_price: data.average_cost, previous_close: data.average_cost, total_value: data.shares * data.average_cost, day_gain: 0, day_gain_percent: 0, total_return: 0, total_return_percent: 0 } as any]);
      setSymbol("");
      setShares("");
      setCost("");
      // Force page refresh to update server-rendered metrics
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
      // Force page refresh to update server-rendered metrics
      window.location.reload();
    }
    setBusy(false);
  }

  if (!userId) {
    return (
      <Card className="mt-3">
        <CardContent className="py-8 text-center text-zinc-500">
          กรุณาเข้าสู่ระบบ (ในหน้าตั้งค่า) เพื่อสร้างพอร์ตลงทุนของคุณ
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-3">
      <CardHeader>
        <CardTitle>จัดการพอร์ตลงทุน (Positions)</CardTitle>
      </CardHeader>
      <CardContent>
        {positions.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>หุ้น</TableHead>
                <TableHead className="text-right">จำนวน (หุ้น)</TableHead>
                <TableHead className="text-right">ต้นทุนเฉลี่ย</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map(p => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <StockLogo symbol={p.symbol} className="h-7 w-7" />
                      <span className="font-medium">{p.symbol}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{p.shares}</TableCell>
                  <TableCell className="text-right">${p.average_cost.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} disabled={busy} className="h-8 w-8 text-zinc-500 hover:text-rose-400">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        <form onSubmit={handleAdd} className="mt-4 flex flex-wrap items-end gap-3 rounded-lg border border-white/[0.08] bg-white/[0.02] p-4">
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-zinc-400">สัญลักษณ์หุ้น</label>
            <input 
              type="text" 
              className="h-9 w-24 rounded-md border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-zinc-100 outline-none focus:border-emerald-400/50 uppercase" 
              placeholder="AAPL" 
              value={symbol}
              onChange={e => setSymbol(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-zinc-400">จำนวนหุ้น</label>
            <input 
              type="number" 
              step="any"
              className="h-9 w-24 rounded-md border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-zinc-100 outline-none focus:border-emerald-400/50" 
              placeholder="10" 
              value={shares}
              onChange={e => setShares(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-zinc-400">ต้นทุน/หุ้น ($)</label>
            <input 
              type="number" 
              step="any"
              className="h-9 w-28 rounded-md border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-zinc-100 outline-none focus:border-emerald-400/50" 
              placeholder="150.00" 
              value={cost}
              onChange={e => setCost(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={busy} variant="outline" className="h-9">เพิ่มหุ้น</Button>
        </form>
      </CardContent>
    </Card>
  );
}
