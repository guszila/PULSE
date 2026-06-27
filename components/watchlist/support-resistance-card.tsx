import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PricePositionBar } from "@/components/dashboard/decision-hero";
import type { SupportResistanceData } from "@/lib/market-data";
import { thaiVolume, thaiBiasLike } from "@/lib/formatters";
import { TrendingUp, TrendingDown, Target, Zap, Activity, BarChart2, ArrowUpRight, ArrowDownRight } from "lucide-react";

export function SupportResistanceCard({ supportResistance, symbol }: { supportResistance: SupportResistanceData; symbol?: string }) {
  const isUptrend = supportResistance.trendDirection.includes("ขึ้น") || supportResistance.trendDirection === "Bullish";
  const probValue = parseInt(supportResistance.breakoutProbability) || 0;
  const probColor = probValue > 60 ? "text-emerald-400" : probValue < 40 ? "text-rose-400" : "text-amber-400";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-teal-400" />
          แผนที่แนวรับและแนวต้าน {symbol && <span className="text-zinc-500 font-normal">({symbol})</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <PricePositionBar supportResistance={supportResistance} />
        </div>

        {/* 3 Main Highlights */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3 text-center">
            <div className="mb-1 flex items-center justify-center gap-1 text-[10px] text-zinc-500">
              <Activity className="h-3 w-3" /> ทิศทางเทรนด์
            </div>
            <div className={`flex items-center justify-center gap-1 text-sm font-semibold ${isUptrend ? "text-emerald-400" : "text-rose-400"}`}>
              {isUptrend ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {thaiBiasLike(supportResistance.trendDirection)}
            </div>
          </div>
          
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3 text-center">
            <div className="mb-1 flex items-center justify-center gap-1 text-[10px] text-zinc-500">
              <BarChart2 className="h-3 w-3" /> Risk:Reward
            </div>
            <div className="text-sm font-semibold text-zinc-100">
              {supportResistance.riskReward}
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3 text-center">
            <div className="mb-1 flex items-center justify-center gap-1 text-[10px] text-zinc-500">
              <Zap className="h-3 w-3" /> โอกาสทะลุขึ้น
            </div>
            <div className={`text-sm font-semibold ${probColor}`}>
              {supportResistance.breakoutProbability}
            </div>
          </div>
        </div>

        {/* Breakout / Breakdown Levels */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4">
            <div className="mb-2 flex items-start justify-between">
              <span className="text-xs font-medium text-emerald-400/80">ระดับ Breakout</span>
              <ArrowUpRight className="h-4 w-4 text-emerald-400/50" />
            </div>
            <div className="text-lg font-semibold text-emerald-300">{supportResistance.breakoutLevel}</div>
            <div className="mt-1 text-[10px] text-emerald-400/60">แนวต้านสำคัญเพื่อไปต่อ</div>
          </div>

          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.05] p-4">
            <div className="mb-2 flex items-start justify-between">
              <span className="text-xs font-medium text-rose-400/80">ระดับ Breakdown</span>
              <ArrowDownRight className="h-4 w-4 text-rose-400/50" />
            </div>
            <div className="text-lg font-semibold text-rose-300">{supportResistance.breakdownLevel}</div>
            <div className="mt-1 text-[10px] text-rose-400/60">จุดระวังอันตรายถ้าร่วงหลุด</div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          <div className="flex items-center justify-between rounded-xl bg-white/[0.02] px-3 py-2.5">
            <span className="text-[11px] text-zinc-500">ระยะแนวต้าน</span>
            <span className="text-[11px] font-medium text-emerald-400">{supportResistance.distanceToResistance}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-white/[0.02] px-3 py-2.5">
            <span className="text-[11px] text-zinc-500">ระยะแนวรับ</span>
            <span className="text-[11px] font-medium text-rose-400">{supportResistance.distanceToSupport}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-white/[0.02] px-3 py-2.5">
            <span className="text-[11px] text-zinc-500">จำนวนที่ชน</span>
            <span className="text-[11px] font-medium text-zinc-300">{supportResistance.touches} ครั้ง</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-white/[0.02] px-3 py-2.5">
            <span className="text-[11px] text-zinc-500">วอลุ่มยืนยัน</span>
            <span className="text-[11px] font-medium text-zinc-300">{thaiVolume(supportResistance.volumeConfirmation)}</span>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
