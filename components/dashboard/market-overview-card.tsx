import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AlphaEdgeDashboardData } from "@/lib/market-data";

export function MarketOverviewCard({ data }: { data: AlphaEdgeDashboardData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ภาพรวมตลาด</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
          {data.marketOverview.map((item) => (
            <div key={item.name} className="flex flex-col justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="text-[11px] text-zinc-500 truncate">{item.name}</div>
              <div className="mt-1 flex flex-wrap items-baseline justify-between gap-1">
                <span className="text-sm font-semibold text-zinc-100">{item.value}</span>
                <span className={`text-[10px] font-medium ${item.change >= 0 ? "text-teal-400" : "text-rose-400"}`}>
                  {item.change >= 0 ? "+" : ""}
                  {item.change.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
