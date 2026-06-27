"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Target, ShieldCheck, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DecisionSnapshot, SelectedStock, SupportResistanceData, WatchlistStock } from "@/lib/market-data";
import { thaiAction, thaiBias, thaiConfidence, thaiRisk, formatUpdatedAt, thaiVolume } from "@/lib/formatters";

export function DecisionHero({
  decision,
  selectedStock,
  supportResistance,
  updatedAt,
  watchlist
}: {
  decision: DecisionSnapshot;
  selectedStock: SelectedStock;
  supportResistance: SupportResistanceData;
  updatedAt: string;
  watchlist: WatchlistStock[];
}) {
  const router = useRouter();
  return (
    <section id="decision" className="grid gap-3 xl:grid-cols-[1fr_360px]">
      <Card className="overflow-hidden border-teal-300/15 bg-[linear-gradient(135deg,rgba(20,184,166,0.12),rgba(245,158,11,0.07)_42%,rgba(255,255,255,0.035))]">
        <CardContent className="pt-4 sm:pt-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <Badge tone={decision.bias === "Bullish" ? "gain" : decision.bias === "Bearish" ? "loss" : "neutral"}>
                  <TrendingUp className="h-3 w-3" />
                  {thaiBias(decision.bias)}
                </Badge>
                <Badge tone="neutral">ความมั่นใจ {thaiConfidence(decision.confidence)}</Badge>
                <span className="text-xs text-zinc-500">อัปเดต {formatUpdatedAt(updatedAt)}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center sm:mt-4">
                <div className="relative flex items-center">
                  <select
                    value={selectedStock.symbol}
                    onChange={(e) => router.push(`/?symbol=${e.target.value}`)}
                    className="appearance-none bg-transparent text-xl font-semibold tracking-normal text-white sm:text-3xl pr-8 focus:outline-none cursor-pointer"
                  >
                    {!watchlist.find(s => s.symbol === selectedStock.symbol) && (
                      <option value={selectedStock.symbol} className="bg-zinc-900 text-base">
                        {selectedStock.symbol}
                      </option>
                    )}
                    {watchlist.map(stock => (
                      <option key={stock.symbol} value={stock.symbol} className="bg-zinc-900 text-base">
                        {stock.symbol}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-0 h-5 w-5 text-zinc-400 pointer-events-none" />
                </div>
                <h2 className="text-xl font-semibold tracking-normal text-white sm:text-3xl">
                  : วันนี้ควรดูโซนแนวรับ-แนวต้าน
                </h2>
              </div>
              <p className="mt-2 max-w-3xl text-xs leading-5 text-zinc-400 sm:text-sm sm:leading-6">
                สรุปง่าย ๆ: {thaiAction(decision.actionLabel)} ดูว่าราคายืนเหนือแนวรับได้ไหม และอย่าลืมกำหนดจุดตัดขาดทุนก่อนซื้อ
              </p>
            </div>
            <div className="grid w-full grid-cols-3 gap-2 lg:w-[360px]">
              <HeroStat label="คะแนน" value={`${decision.score}/100`} tone="gain" />
              <HeroStat label="เสี่ยง" value={thaiRisk(decision.riskLevel)} tone="neutral" />
              <HeroStat label="คุ้มเสี่ยง" value={supportResistance.riskReward} tone="gain" />
            </div>
          </div>
          <PricePositionBar supportResistance={supportResistance} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>แผนก่อนกดซื้อ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <PlanRow icon={Target} label="จุดน่าสนใจ" value={supportResistance.suggestedEntry} />
          <PlanRow icon={ShieldCheck} label="ตัดขาดทุน" value={supportResistance.stopLoss} />
          <PlanRow icon={TrendingUp} label="เป้าทำกำไร" value={supportResistance.takeProfit} />
        </CardContent>
      </Card>
    </section>
  );
}

export function HeroStat({ label, value, tone }: { label: string; value: string; tone: "gain" | "loss" | "neutral" }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-4">
      <div className="text-[10px] uppercase text-zinc-500 sm:text-[11px]">{label}</div>
      <div className={tone === "gain" ? "mt-1.5 text-base font-semibold text-emerald-200 sm:mt-2 sm:text-lg" : "mt-1.5 text-base font-semibold text-zinc-100 sm:mt-2 sm:text-lg"}>
        {value}
      </div>
    </div>
  );
}

export function PricePositionBar({ supportResistance }: { supportResistance: SupportResistanceData }) {
  const position = useMemo(() => {
    const range = supportResistance.strongResistance - supportResistance.strongSupport;
    if (range <= 0) {
      return 50;
    }
    return Math.max(2, Math.min(98, ((supportResistance.currentPrice - supportResistance.strongSupport) / range) * 100));
  }, [supportResistance]);

  return (
    <div className="mt-4 sm:mt-5">
      <div className="mb-2 grid grid-cols-3 gap-2 text-[10px] text-zinc-500 sm:text-xs">
        <span>รับใหญ่ ${supportResistance.strongSupport}</span>
        <span className="text-center">ตอนนี้ ${supportResistance.currentPrice}</span>
        <span className="text-right">ต้านใหญ่ ${supportResistance.strongResistance}</span>
      </div>
      <div className="relative h-3 rounded-full bg-[linear-gradient(90deg,rgba(16,185,129,0.55),rgba(245,158,11,0.55),rgba(248,113,113,0.55))]">
        <div
          className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-white bg-zinc-950 shadow-glass"
          style={{ left: `calc(${position}% - 10px)` }}
        />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ["แนวรับ", `$${supportResistance.support}`, supportResistance.distanceToSupport],
          ["แนวต้าน", `$${supportResistance.resistance}`, supportResistance.distanceToResistance],
          ["ทะลุขึ้น", supportResistance.breakoutLevel, supportResistance.breakoutProbability],
          ["วอลุ่ม", thaiVolume(supportResistance.volumeConfirmation), `${supportResistance.touches} ครั้ง`]
        ].map(([label, value, meta]) => (
          <div key={label} className="rounded-2xl border border-white/[0.06] bg-black/15 p-4">
            <div className="text-[11px] text-zinc-500">{label}</div>
            <div className="mt-1 text-sm font-semibold text-zinc-100">{value}</div>
            <div className="mt-1 text-[11px] text-zinc-500">{meta}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PlanRow({ icon: Icon, label, value }: { icon: typeof Target; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <Icon className="h-4 w-4 text-zinc-400" />
        {label}
      </div>
      <div className="text-right text-sm font-medium text-zinc-100">{value}</div>
    </div>
  );
}
