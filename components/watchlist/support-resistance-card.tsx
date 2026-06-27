import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PricePositionBar } from "@/components/dashboard/decision-hero";
import type { SupportResistanceData } from "@/lib/market-data";
import { thaiVolume, thaiBiasLike } from "@/lib/formatters";

export function SupportResistanceCard({ supportResistance }: { supportResistance: SupportResistanceData }) {
  const stats = [
    ["ระยะถึงแนวรับ", supportResistance.distanceToSupport],
    ["ระยะถึงแนวต้าน", supportResistance.distanceToResistance],
    ["Risk Reward", supportResistance.riskReward],
    ["ระดับ Breakout", supportResistance.breakoutLevel],
    ["ระดับ Breakdown", supportResistance.breakdownLevel],
    ["จำนวนครั้งที่แตะ", String(supportResistance.touches)],
    ["ยืนยันด้วยวอลุ่ม", thaiVolume(supportResistance.volumeConfirmation)],
    ["ทิศทางเทรนด์", thaiBiasLike(supportResistance.trendDirection)],
    ["โอกาส Breakout", supportResistance.breakoutProbability]
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>แผนที่แนวรับและแนวต้าน</CardTitle>
      </CardHeader>
      <CardContent>
        <PricePositionBar supportResistance={supportResistance} />
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.06] p-4">
              <span className="text-xs text-zinc-500">{label}</span>
              <span className="text-right text-xs font-medium text-zinc-100">{value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
