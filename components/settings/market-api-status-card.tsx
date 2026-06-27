import { LineChart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AlphaEdgeDashboardData } from "@/lib/market-data";

export function MarketApiStatusCard({ data }: { data: AlphaEdgeDashboardData }) {
  const rows = [
    ["ราคาหุ้น", data.providerStatus.stocksLive, "Finnhub / Twelve Data"],
    ["พื้นฐาน", data.providerStatus.fundamentalsLive, "FMP"],
    ["ข่าว", data.providerStatus.newsLive, "FMP / Finnhub"],
    ["มาโคร/คริปโต", data.providerStatus.macroLive, "FRED / CoinGecko"]
  ] as const;

  return (
    <Card className="mt-3 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.06]">
          <LineChart className="h-5 w-5 text-zinc-300" />
        </div>
        <div>
          <div className="text-sm font-medium text-zinc-100">สถานะ Market API</div>
          <p className="mt-1 text-xs text-zinc-500">เชื่อม key สำหรับราคาสด ข้อมูลพื้นฐาน ข่าว และข้อมูลมาโคร</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        {rows.map(([label, live, provider]) => (
          <div key={label} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-zinc-500">{label}</span>
              <Badge tone={live ? "gain" : "neutral"}>{live ? "สด" : "ตัวอย่าง"}</Badge>
            </div>
            <div className="mt-2 text-xs text-zinc-300">{provider}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
