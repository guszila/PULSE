"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CandlestickChart } from "@/components/candlestick-chart";
import { formatCurrency, formatCompact } from "@/lib/utils";
import type { CandlePoint, SupportResistanceData } from "@/lib/market-data";

type StockChartSectionProps = {
  company: string;
  symbol: string;
  price: number;
  change: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  candleData: CandlePoint[];
  supportResistance: SupportResistanceData;
};

const TIMEFRAMES = ["1W", "1M", "3M", "6M", "YTD", "1Y", "ALL"];

export function StockChartSection({
  company,
  symbol,
  price,
  change,
  open,
  high,
  low,
  close,
  volume,
  candleData,
  supportResistance
}: StockChartSectionProps) {
  const [activeTimeframe, setActiveTimeframe] = useState("1M");

  const filteredData = useMemo(() => {
    if (activeTimeframe === "ALL") return candleData;
    
    // Estimate days for filtering
    const daysMap: Record<string, number> = {
      "1W": 5,
      "1M": 20,
      "3M": 60,
      "6M": 120,
      "YTD": 250, // Simplified
      "1Y": 250
    };
    
    const days = daysMap[activeTimeframe] || 20;
    return candleData.slice(-Math.max(1, days)); // Make sure we don't return an empty array if requested days > available
  }, [candleData, activeTimeframe]);

  return (
    <Card className="min-w-0">
      <CardHeader className="flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>{company} กราฟราคา</CardTitle>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-2xl font-semibold text-white">{formatCurrency(price)}</span>
            <Badge tone={change >= 0 ? "gain" : "loss"}>
              {change >= 0 ? "+" : ""}
              {change.toFixed(2)}%
            </Badge>
          </div>
        </div>
        <div className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-white/[0.08] bg-white/[0.035] p-1">
          {TIMEFRAMES.map((frame) => (
            <button
              key={frame}
              onClick={() => setActiveTimeframe(frame)}
              className={`h-8 shrink-0 rounded-full px-4 text-xs font-medium transition ${
                frame === activeTimeframe ? "bg-white text-zinc-950" : "text-zinc-400 hover:bg-white/[0.07]"
              }`}
            >
              {frame}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <CandlestickChart
          data={filteredData}
          supportResistance={supportResistance}
          symbol={symbol}
          theme="dark" 
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-y-2 rounded-xl bg-white/[0.02] px-4 py-3 sm:gap-4 shadow-inset">
          {[
            ["เปิด", formatCurrency(open)],
            ["สูงสุด", formatCurrency(high)],
            ["ต่ำสุด", formatCurrency(low)],
            ["ปิด", formatCurrency(close)],
            ["วอลุ่ม", formatCompact(volume)]
          ].map(([label, val]) => (
            <div key={label} className="flex flex-col items-start sm:items-center">
              <div className="text-[10px] text-zinc-500">{label}</div>
              <div className="text-sm font-semibold text-zinc-200">{val}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
