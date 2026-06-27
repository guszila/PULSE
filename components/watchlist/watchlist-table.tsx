"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Plus, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatCompact } from "@/lib/utils";
import type { WatchlistStock } from "@/lib/market-data";
import { StockLogo } from "@/components/stock-logo";
import { addWatchlistSymbol, removeWatchlistSymbol } from "@/app/actions/watchlist";
import { Button } from "@/components/ui/button";
import { POPULAR_STOCKS } from "@/components/shared/global-search";

export function WatchlistTable({ stocks, saved }: { stocks: WatchlistStock[]; saved: boolean }) {
  const [newSymbol, setNewSymbol] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
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

  const handleAdd = async (e: React.FormEvent, symbolOverride?: string) => {
    e.preventDefault();
    const targetSymbol = symbolOverride || newSymbol;
    if (!targetSymbol.trim() || isPending) return;
    setIsPending(true);
    await addWatchlistSymbol(targetSymbol);
    setNewSymbol("");
    setIsFocused(false);
    setIsPending(false);
  };

  const handleRemove = async (e: React.MouseEvent, symbol: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (isPending) return;
    setIsPending(true);
    await removeWatchlistSymbol(symbol);
    setIsPending(false);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle>หุ้นที่ติดตาม</CardTitle>
          {saved && <Badge tone="gain">Supabase</Badge>}
        </div>
        <Link href="/stocks/AAPL" className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-100">
          เปิด AAPL
          <ChevronRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 md:hidden">
          {stocks.map((stock) => (
            <Link
              key={stock.symbol}
              href={`/stocks/${stock.symbol}`}
              className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 transition hover:bg-white/[0.06]"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <StockLogo symbol={stock.symbol} className="h-6 w-6" />
                  <span className="font-semibold text-zinc-100">{stock.symbol}</span>
                  <Badge tone={stock.change >= 0 ? "gain" : "loss"}>
                    {stock.change >= 0 ? "+" : ""}
                    {stock.change.toFixed(2)}%
                  </Badge>
                </div>
                <div className="mt-1 truncate text-xs text-zinc-500">{stock.company}</div>
              </div>
              <div className="ml-3 flex shrink-0 items-center gap-3 text-right">
                <div>
                  <div className="text-sm font-semibold text-zinc-100">{formatCurrency(stock.price)}</div>
                  <div className="mt-1 text-[11px] text-zinc-500">{formatCompact(stock.volume)} วอลุ่ม</div>
                </div>
                <button
                  onClick={(e) => handleRemove(e, stock.symbol)}
                  disabled={isPending}
                  className="rounded p-1.5 text-zinc-500 hover:bg-white/[0.1] hover:text-rose-400 disabled:opacity-50"
                  aria-label="ลบ"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Link>
          ))}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>สัญลักษณ์</TableHead>
                <TableHead>บริษัท</TableHead>
                <TableHead className="text-right">ราคา</TableHead>
                <TableHead className="text-right">เปลี่ยน</TableHead>
                <TableHead className="text-right">วอลุ่ม</TableHead>
                <TableHead className="text-right">มูลค่าตลาด</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stocks.map((stock) => (
                <TableRow key={stock.symbol}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <StockLogo symbol={stock.symbol} className="h-7 w-7" />
                      <span className="font-medium text-zinc-100">{stock.symbol}</span>
                    </div>
                  </TableCell>
                  <TableCell>{stock.company}</TableCell>
                  <TableCell className="text-right">{formatCurrency(stock.price)}</TableCell>
                  <TableCell className={stock.change >= 0 ? "text-right text-emerald-300" : "text-right text-red-300"}>
                    {stock.change >= 0 ? "+" : ""}
                    {stock.change.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right">{formatCompact(stock.volume)}</TableCell>
                  <TableCell className="text-right">{formatCompact(stock.marketCap)}</TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={(e) => handleRemove(e, stock.symbol)}
                      disabled={isPending}
                      className="inline-flex rounded p-1.5 text-zinc-500 hover:bg-white/[0.1] hover:text-rose-400 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <form ref={formRef} onSubmit={(e) => handleAdd(e)} className="relative mt-4 flex items-center gap-2">
          <input
            type="text"
            placeholder="เพิ่มหุ้น (เช่น TSLA)"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
            onFocus={() => setIsFocused(true)}
            disabled={isPending}
            className="h-10 w-full max-w-[200px] rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 text-sm text-white placeholder-zinc-500 focus:border-teal-500/50 focus:outline-none"
          />
          <Button type="submit" disabled={!newSymbol.trim() || isPending} variant="outline" className="h-10">
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            เพิ่ม
          </Button>

          {/* Autocomplete Dropdown */}
          {isFocused && newSymbol.length > 0 && (
            <div className="absolute bottom-full left-0 mb-2 z-50 w-full max-w-[280px] rounded-2xl border border-white/[0.08] bg-[#070807]/95 p-1.5 shadow-glass backdrop-blur-xl">
              <div className="px-2 pb-1.5 pt-2 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                รายชื่อหุ้นที่แนะนำ
              </div>
              {POPULAR_STOCKS.filter((s) => 
                s.symbol.toLowerCase().includes(newSymbol.toLowerCase()) || 
                s.name.toLowerCase().includes(newSymbol.toLowerCase())
              ).slice(0, 5).map((stock) => (
                <button
                  key={stock.symbol}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleAdd(e as unknown as React.FormEvent, stock.symbol);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition hover:bg-white/[0.06]"
                >
                  <span className="font-semibold text-zinc-100">{stock.symbol}</span>
                  <span className="ml-2 truncate text-xs text-zinc-500">{stock.name}</span>
                </button>
              ))}
              {!POPULAR_STOCKS.find((s) => s.symbol.toLowerCase() === newSymbol.trim().toLowerCase()) && (
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleAdd(e as unknown as React.FormEvent, newSymbol.trim().toUpperCase());
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition hover:bg-white/[0.06]"
                >
                  <span className="font-semibold text-zinc-100">{newSymbol.trim().toUpperCase()}</span>
                  <span className="ml-2 truncate text-xs text-zinc-500">เพิ่มหุ้นนี้</span>
                </button>
              )}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
