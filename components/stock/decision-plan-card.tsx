import { Target, AlertTriangle, TrendingUp, Scale, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DecisionSnapshot, SupportResistanceData } from "@/lib/market-data";
import { thaiAction, thaiBias, thaiRisk } from "@/lib/formatters";

export function DecisionPlanCard({ decision, supportResistance }: { decision: DecisionSnapshot; supportResistance: SupportResistanceData }) {
  const isBullish = decision.bias === "Bullish";
  const isBearish = decision.bias === "Bearish";

  return (
    <Card className={`overflow-hidden border-t-[3px] ${isBullish ? 'border-t-emerald-500' : isBearish ? 'border-t-rose-500' : 'border-t-amber-500'}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4 text-amber-400" />
            ตัวช่วยตัดสินใจ
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/20">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              REAL-TIME
            </div>
            <Badge tone={isBullish ? "gain" : isBearish ? "loss" : "neutral"} className="px-3 py-1 font-bold shadow-glass text-xs">
              {thaiAction(decision.actionLabel)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Top Stats - Inline layout */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/[0.03] p-3.5 shadow-inset">
          {[
            ["มุมมอง", thaiBias(decision.bias), isBullish ? "text-emerald-400" : isBearish ? "text-rose-400" : "text-zinc-300"],
            ["คะแนน", `${decision.score}/100`, decision.score > 60 ? "text-emerald-400" : decision.score < 40 ? "text-rose-400" : "text-amber-400"],
            ["ความเสี่ยง", thaiRisk(decision.riskLevel), decision.riskLevel === "Low" ? "text-emerald-400" : decision.riskLevel === "High" ? "text-rose-400" : "text-amber-400"]
          ].map(([label, value, colorClass]) => (
            <div key={label} className="flex flex-col">
              <div className="text-[10px] font-medium text-zinc-500">{label}</div>
              <div className={`mt-0.5 text-sm font-bold ${colorClass}`}>{value}</div>
            </div>
          ))}
        </div>
        
        {/* Prominent Suggested Entry Box */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.05] p-5 shadow-[0_0_15px_rgba(16,185,129,0.1)] text-center">
          <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none"></div>
          <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
              <Target className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wide">ราคาที่น่าสนใจ (Suggested Entry)</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight my-2">
              {supportResistance.suggestedEntry}
            </div>
            <div className="text-[11px] text-zinc-400 bg-black/40 px-3 py-1 rounded-full border border-white/5">
              โซนปลอดภัยตราบใดที่ไม่หลุดแนวรับ <span className="text-zinc-200 font-semibold">${supportResistance.support}</span>
            </div>
          </div>
        </div>
        
        {/* Rows layout for other info */}
        <div className="grid gap-2.5 sm:grid-cols-2">
          {[
            {
              label: "จุดที่ควรระวัง",
              value: `หลุด ${supportResistance.breakdownLevel} แผนจะเริ่มอ่อนลง`,
              icon: AlertTriangle,
              style: "text-rose-400 bg-rose-400/10 border-rose-400/20",
              glow: "group-hover:shadow-[0_0_15px_rgba(251,113,133,0.15)]"
            },
            {
              label: "สัญญาณบวก",
              value: `ยืนเหนือ ${supportResistance.breakoutLevel} ได้พร้อมวอลุ่ม`,
              icon: TrendingUp,
              style: "text-sky-400 bg-sky-400/10 border-sky-400/20",
              glow: "group-hover:shadow-[0_0_15px_rgba(56,189,248,0.15)]"
            },
            {
              label: "ความเสี่ยง-ผลตอบแทน",
              value: `อัตราส่วน ${supportResistance.riskReward}`,
              icon: Scale,
              style: "text-amber-400 bg-amber-400/10 border-amber-400/20",
              glow: "group-hover:shadow-[0_0_15px_rgba(251,191,36,0.15)]"
            }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className={`group relative flex flex-col gap-2 rounded-xl border border-white/[0.04] bg-white/[0.01] p-4 transition-all duration-300 hover:bg-white/[0.03] hover:-translate-y-0.5 cursor-default ${item.glow}`}>
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${item.style} transition-transform group-hover:scale-110`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-xs font-bold text-zinc-200 group-hover:text-white transition-colors">{item.label}</div>
                </div>
                <p className="text-[11px] leading-relaxed text-zinc-400 pl-9.5 group-hover:text-zinc-300 transition-colors">{item.value}</p>
              </div>
            );
          })}
        </div>
        
        <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-3 text-center text-[10px] leading-relaxed text-zinc-500">
          ข้อมูลนี้เป็นตัวช่วยวิเคราะห์เบื้องต้น ไม่ใช่คำแนะนำการลงทุนโดยตรง
        </div>
      </CardContent>
    </Card>
  );
}
