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
          <Badge tone={isBullish ? "gain" : isBearish ? "loss" : "neutral"} className="px-3 py-1 font-bold shadow-glass">
            {thaiAction(decision.actionLabel)}
          </Badge>
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
        
        {/* Rows layout instead of bulky boxes */}
        <div className="space-y-2.5">
          {[
            {
              label: "จุดน่าสนใจ",
              value: `แถว $${supportResistance.suggestedEntry} และไม่หลุดรับ $${supportResistance.support}`,
              icon: Target,
              style: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
            },
            {
              label: "จุดที่ควรระวัง",
              value: `หลุด $${supportResistance.breakdownLevel} แผนจะเริ่มอ่อนลง`,
              icon: AlertTriangle,
              style: "text-rose-400 bg-rose-400/10 border-rose-400/20"
            },
            {
              label: "สัญญาณบวก",
              value: `ยืนเหนือ $${supportResistance.breakoutLevel} ได้พร้อมวอลุ่ม`,
              icon: TrendingUp,
              style: "text-sky-400 bg-sky-400/10 border-sky-400/20"
            },
            {
              label: "คุ้มเสี่ยง",
              value: `${supportResistance.riskReward} คือผลตอบแทนเทียบความเสี่ยง`,
              icon: Scale,
              style: "text-amber-400 bg-amber-400/10 border-amber-400/20"
            }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="group flex items-start gap-3 rounded-xl border border-white/[0.04] p-3.5 transition-colors hover:bg-white/[0.03]">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${item.style}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="pt-0.5">
                  <div className="text-xs font-bold text-zinc-200 group-hover:text-white transition-colors">{item.label}</div>
                  <p className="mt-1 text-[11px] leading-5 text-zinc-400">{item.value}</p>
                </div>
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
