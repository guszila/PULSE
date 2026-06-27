import { Target, AlertTriangle, TrendingUp, Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DecisionSnapshot, SupportResistanceData } from "@/lib/market-data";
import { thaiAction, thaiBias, thaiRisk } from "@/lib/formatters";

export function DecisionPlanCard({ decision, supportResistance }: { decision: DecisionSnapshot; supportResistance: SupportResistanceData }) {
  const isBullish = decision.bias === "Bullish";
  const isBearish = decision.bias === "Bearish";

  return (
    <Card className={`overflow-hidden border-t-2 ${isBullish ? 'border-t-emerald-400' : isBearish ? 'border-t-rose-400' : 'border-t-zinc-400'}`}>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>ตัวช่วยตัดสินใจก่อนซื้อ</CardTitle>
          <Badge tone={isBullish ? "gain" : isBearish ? "loss" : "neutral"}>
            {thaiAction(decision.actionLabel)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            ["มุมมอง", thaiBias(decision.bias), isBullish ? "text-emerald-300" : isBearish ? "text-rose-300" : "text-zinc-300"],
            ["คะแนน", `${decision.score}/100`, decision.score > 60 ? "text-emerald-300" : decision.score < 40 ? "text-rose-300" : "text-amber-300"],
            ["ความเสี่ยง", thaiRisk(decision.riskLevel), decision.riskLevel === "Low" ? "text-emerald-300" : decision.riskLevel === "High" ? "text-rose-300" : "text-amber-300"]
          ].map(([label, value, colorClass]) => (
            <div key={label} className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-4 text-center sm:text-left">
              <div className="text-[11px] text-zinc-500">{label}</div>
              <div className={`mt-2 text-sm font-semibold ${colorClass}`}>{value}</div>
            </div>
          ))}
        </div>
        
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            {
              label: "จุดน่าสนใจ",
              value: `พิจารณาเมื่อราคาอยู่แถว ${supportResistance.suggestedEntry} และยังยืนเหนือแนวรับ $${supportResistance.support}`,
              icon: Target,
              style: {
                bg: "border-emerald-400/20 bg-emerald-400/[0.05]",
                iconBox: "bg-emerald-400/10 text-emerald-400",
                title: "text-emerald-100"
              }
            },
            {
              label: "จุดที่ควรระวัง",
              value: `ถ้าราคาหลุด ${supportResistance.breakdownLevel} แปลว่าแผนนี้เริ่มอ่อนลง`,
              icon: AlertTriangle,
              style: {
                bg: "border-rose-400/20 bg-rose-400/[0.05]",
                iconBox: "bg-rose-400/10 text-rose-400",
                title: "text-rose-100"
              }
            },
            {
              label: "สัญญาณที่อยากเห็น",
              value: `ถ้าราคาปิดเหนือ ${supportResistance.breakoutLevel} พร้อมวอลุ่มดี จะดูแข็งแรงขึ้น`,
              icon: TrendingUp,
              style: {
                bg: "border-sky-400/20 bg-sky-400/[0.05]",
                iconBox: "bg-sky-400/10 text-sky-400",
                title: "text-sky-100"
              }
            },
            {
              label: "คุ้มเสี่ยง",
              value: `${supportResistance.riskReward} คือผลตอบแทนเทียบกับความเสี่ยงจากรับต้าน`,
              icon: Scale,
              style: {
                bg: "border-amber-400/20 bg-amber-400/[0.05]",
                iconBox: "bg-amber-400/10 text-amber-400",
                title: "text-amber-100"
              }
            }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className={`flex items-start gap-3 rounded-2xl border p-4 ${item.style.bg}`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.style.iconBox}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className={`text-xs font-semibold ${item.style.title}`}>{item.label}</div>
                  <p className="mt-1 text-xs leading-5 text-zinc-400">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="rounded-2xl border border-zinc-500/20 bg-zinc-500/10 p-4 text-xs leading-5 text-zinc-400">
          ข้อมูลนี้เป็นตัวช่วยวิเคราะห์สำหรับมือใหม่ ไม่ใช่คำแนะนำการลงทุนโดยตรง ควรกำหนดเงินที่จะเสี่ยงได้ก่อนทุกครั้ง
        </div>
      </CardContent>
    </Card>
  );
}
