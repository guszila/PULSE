"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Target, ShieldCheck, ChevronDown, Activity, ShieldAlert, Zap, BarChart2, Sparkles, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DecisionSnapshot, SelectedStock, SupportResistanceData, WatchlistStock, AlphaEdgeDashboardData } from "@/lib/market-data";
import { thaiAction, thaiBias, thaiConfidence, thaiRisk, formatUpdatedAt, thaiVolume } from "@/lib/formatters";

export function DecisionHero({
  decision: initialDecision,
  selectedStock,
  supportResistance: initialSupportResistance,
  updatedAt,
  watchlist,
  data
}: {
  decision: DecisionSnapshot;
  selectedStock: SelectedStock;
  supportResistance: SupportResistanceData;
  updatedAt: string;
  watchlist: WatchlistStock[];
  data: AlphaEdgeDashboardData;
}) {
  const router = useRouter();
  
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiData, setAiData] = useState<any>(null);
  
  const handleUseAi = async () => {
    setLoadingAi(true);
    try {
      const apiKey = window.localStorage.getItem("alphaedge-gemini-key") || "";
      const res = await fetch("/api/decision-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-gemini-key": apiKey },
        body: JSON.stringify({ data })
      });
      const json = await res.json();
      if (res.ok && json.result) {
        setAiData(json.result);
      } else {
        alert(json.error || "Failed to analyze with AI");
      }
    } catch (e) {
      alert("Error calling AI");
    } finally {
      setLoadingAi(false);
    }
  };

  const decision = useMemo(() => {
    if (aiData) {
      return {
        ...initialDecision,
        score: aiData.score,
        bias: aiData.bias,
        riskLevel: aiData.riskLevel,
        actionLabel: aiData.actionLabel
      };
    }
    return initialDecision;
  }, [initialDecision, aiData]);

  const supportResistance = useMemo(() => {
    if (aiData) {
      return {
        ...initialSupportResistance,
        support: aiData.support,
        strongSupport: aiData.strongSupport,
        resistance: aiData.resistance,
        strongResistance: aiData.strongResistance,
        suggestedEntry: aiData.suggestedEntry,
        stopLoss: aiData.stopLoss,
        takeProfit: aiData.takeProfit,
        riskReward: aiData.riskReward
      };
    }
    return initialSupportResistance;
  }, [initialSupportResistance, aiData]);

  const riskTone = decision.riskLevel.includes("High") || decision.riskLevel.includes("สูง") 
    ? "loss" 
    : decision.riskLevel.includes("Medium") || decision.riskLevel.includes("ปานกลาง") 
      ? "warning" 
      : "neutral";

  return (
    <section id="decision" className="grid gap-3 xl:grid-cols-[1fr_360px]">
      <Card className="relative overflow-hidden border-teal-500/20 bg-[linear-gradient(135deg,rgba(20,184,166,0.1),rgba(245,158,11,0.05)_42%,rgba(0,0,0,0))] shadow-glass">
        {aiData && (
          <div className="absolute top-0 right-0 p-3 flex items-center gap-1.5 opacity-60">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-bold text-amber-400 tracking-wider">AI POWERED</span>
          </div>
        )}
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Badge tone={decision.bias === "Bullish" ? "gain" : decision.bias === "Bearish" ? "loss" : "neutral"} className="px-2.5 py-1">
                  <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
                  {aiData ? (decision.bias === "Bullish" ? "แนวโน้มดี" : decision.bias === "Bearish" ? "เอนเอียงลบ" : "ทรงตัว") : thaiBias(decision.bias)}
                </Badge>
                {!aiData && (
                  <Badge tone="neutral" className="px-2.5 py-1 bg-white/[0.04]">
                    ความมั่นใจ {thaiConfidence(decision.confidence)}
                  </Badge>
                )}
                <span className="text-xs text-zinc-500">อัปเดต {formatUpdatedAt(updatedAt)}</span>
              </div>
              
              <div className="mt-4 flex flex-wrap items-center gap-1 sm:mt-5">
                <div className="relative flex items-center bg-white/[0.03] hover:bg-white/[0.06] transition-colors rounded-xl px-2 py-1 -ml-2">
                  <select
                    value={selectedStock.symbol}
                    onChange={(e) => router.push(`/?symbol=${e.target.value}`)}
                    className="appearance-none bg-transparent text-2xl font-bold tracking-tight text-white sm:text-4xl pr-8 focus:outline-none cursor-pointer"
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
                  <ChevronDown className="absolute right-2 h-5 w-5 text-zinc-400 pointer-events-none" />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <h2 className="text-xl font-medium tracking-tight text-zinc-300 sm:text-2xl mt-1">
                    วันนี้ควรดูโซนแนวรับ-แนวต้าน
                  </h2>
                  {!aiData && (
                    <Button 
                      size="sm" 
                      onClick={handleUseAi} 
                      disabled={loadingAi}
                      className="ml-auto sm:ml-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 h-8 text-xs font-semibold px-3 mt-1 shadow-lg shadow-orange-500/20"
                    >
                      {loadingAi ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
                      ใช้ AI วิเคราะห์เจาะลึก
                    </Button>
                  )}
                </div>
              </div>
              <div className="mt-4 max-w-2xl inline-flex items-start gap-2.5 rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3 shadow-glass backdrop-blur-sm">
                {aiData ? (
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                ) : (
                  <Target className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                )}
                <div className="text-sm font-medium leading-relaxed text-zinc-200">
                  <strong className={aiData ? "text-amber-400 font-bold mr-1" : "text-teal-400 font-bold mr-1"}>
                    สรุปแผนการเล่น:
                  </strong> 
                  {aiData ? decision.actionLabel : thaiAction(decision.actionLabel)}
                </div>
              </div>
            </div>
            
            <div className="grid w-full grid-cols-3 gap-2 lg:w-[360px] shrink-0">
              <HeroStat icon={Activity} label="คะแนน" value={`${decision.score}/100`} tone="gain" />
              <HeroStat icon={ShieldAlert} label="เสี่ยง" value={aiData ? (decision.riskLevel === "High" ? "สูง" : decision.riskLevel === "Medium" ? "ปานกลาง" : "ต่ำ") : thaiRisk(decision.riskLevel)} tone={riskTone} />
              <HeroStat icon={BarChart2} label="คุ้มเสี่ยง" value={supportResistance.riskReward} tone="gain" />
              <div className="col-span-3 mt-2 rounded-2xl border border-blue-500/20 bg-blue-500/[0.04] p-3 relative overflow-hidden group hover:bg-blue-500/[0.08] transition-colors flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <Target className="w-5 h-5 text-blue-400" />
                   <div>
                     <div className="text-[11px] font-medium text-blue-300/80">ช่วงราคาที่น่าสนใจ (Entry)</div>
                     <div className="text-sm font-bold text-blue-200">{supportResistance.suggestedEntry}</div>
                   </div>
                 </div>
                 <div className="text-[10px] text-blue-300/60 text-right">
                   ตัดขาดทุน: {supportResistance.stopLoss}<br/>
                   เป้าทำกำไร: {supportResistance.takeProfit}
                 </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 border-t border-white/[0.06] pt-6 relative">
            {loadingAi && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-sm rounded-xl">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
                <p className="text-sm font-medium text-amber-200 animate-pulse">AI กำลังคำนวณ Volatility และ Volume Profile...</p>
              </div>
            )}
            <PricePositionBar supportResistance={supportResistance} />
          </div>
        </CardContent>
      </Card>

    </section>
  );
}

export function HeroStat({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: "gain" | "loss" | "neutral" | "warning" }) {
  const colorMap = {
    gain: "text-emerald-400 bg-emerald-400/[0.08] border-emerald-400/20",
    loss: "text-rose-400 bg-rose-400/[0.08] border-rose-400/20",
    warning: "text-amber-400 bg-amber-400/[0.08] border-amber-400/20",
    neutral: "text-zinc-300 bg-white/[0.04] border-white/10"
  };

  const textMap = {
    gain: "text-emerald-300",
    loss: "text-rose-300",
    warning: "text-amber-300",
    neutral: "text-zinc-100"
  };

  return (
    <div className={`rounded-2xl border p-3 flex flex-col items-center justify-center text-center transition-colors hover:brightness-110 ${colorMap[tone]}`}>
      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs opacity-80 mb-1 font-medium">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className={`text-base sm:text-lg font-bold tracking-tight ${textMap[tone]}`}>
        {value}
      </div>
    </div>
  );
}

export function PricePositionBar({ supportResistance }: { supportResistance: SupportResistanceData }) {
  const position = useMemo(() => {
    const range = supportResistance.strongResistance - supportResistance.strongSupport;
    if (range <= 0) return 50;
    return Math.max(2, Math.min(98, ((supportResistance.currentPrice - supportResistance.strongSupport) / range) * 100));
  }, [supportResistance]);

  return (
    <div>
      {/* Visual Bar */}
      <div className="mb-3 grid grid-cols-3 gap-2 text-[10px] font-medium text-zinc-500 sm:text-xs px-1">
        <span>รับใหญ่ ${supportResistance.strongSupport}</span>
        <span className="text-center text-zinc-400">ตอนนี้ ${supportResistance.currentPrice}</span>
        <span className="text-right">ต้านใหญ่ ${supportResistance.strongResistance}</span>
      </div>
      
      <div className="relative h-4 rounded-full bg-[linear-gradient(90deg,rgba(16,185,129,0.4),rgba(245,158,11,0.4),rgba(248,113,113,0.4))] shadow-inset mb-6">
        <div
          className="absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-[3px] border-white bg-zinc-950 shadow-[0_0_12px_rgba(255,255,255,0.3)] transition-all duration-500 ease-out"
          style={{ left: `calc(${position}% - 12px)` }}
        />
      </div>

      {/* 4 Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 relative overflow-hidden group hover:bg-white/[0.04] transition-colors">
           <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldCheck className="w-10 h-10" />
           </div>
           <div className="text-[11px] font-medium text-zinc-500 mb-1">แนวรับ (Support)</div>
           <div className="text-lg font-bold text-zinc-100">${supportResistance.support}</div>
           <div className="text-[10px] text-rose-400/80 mt-1">ระยะห่าง {supportResistance.distanceToSupport}</div>
        </div>
        
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 relative overflow-hidden group hover:bg-white/[0.04] transition-colors">
           <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <Target className="w-10 h-10" />
           </div>
           <div className="text-[11px] font-medium text-zinc-500 mb-1">แนวต้าน (Resistance)</div>
           <div className="text-lg font-bold text-zinc-100">${supportResistance.resistance}</div>
           <div className="text-[10px] text-emerald-400/80 mt-1">ระยะห่าง {supportResistance.distanceToResistance}</div>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 relative overflow-hidden group hover:bg-emerald-500/[0.08] transition-colors">
           <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap className="w-10 h-10 text-emerald-400" />
           </div>
           <div className="text-[11px] font-medium text-emerald-400/80 mb-1">ทะลุขึ้น (Breakout)</div>
           <div className="text-lg font-bold text-emerald-300">{supportResistance.breakoutLevel}</div>
           <div className="text-[10px] text-emerald-400/60 mt-1">โอกาสไปต่อ {supportResistance.breakoutProbability}</div>
        </div>

        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.04] p-4 relative overflow-hidden group hover:bg-indigo-500/[0.08] transition-colors">
           <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity className="w-10 h-10 text-indigo-400" />
           </div>
           <div className="text-[11px] font-medium text-indigo-300/80 mb-1">วอลุ่มยืนยัน</div>
           <div className="text-lg font-bold text-indigo-200">{thaiVolume(supportResistance.volumeConfirmation)}</div>
           <div className="text-[10px] text-indigo-300/60 mt-1">เคยชน {supportResistance.touches} ครั้ง</div>
        </div>
      </div>
    </div>
  );
}

export function PlanRow({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: "blue" | "red" | "green" }) {
  const colorMap = {
    blue: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    red: "text-rose-400 bg-rose-400/10 border-rose-400/20",
    green: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5 hover:bg-white/[0.04] transition-colors">
      <div className="flex items-center gap-3 text-sm text-zinc-300 font-medium">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full border ${colorMap[tone]}`}>
          <Icon className="h-4 w-4" />
        </div>
        {label}
      </div>
      <div className="text-right text-base font-bold tracking-tight text-zinc-100">{value}</div>
    </div>
  );
}
