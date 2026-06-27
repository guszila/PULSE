import { Card, CardContent } from "@/components/ui/card";
import type { MarketOverviewItem } from "@/lib/market-data";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function MarketOverviewCard({ data }: { data: { marketOverview: MarketOverviewItem[] } }) {
  return (
    <Card className="overflow-hidden border-none bg-transparent shadow-none">
      <CardContent className="p-0">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {data.marketOverview.map((item) => {
            const isPositive = item.change > 0;
            const isNegative = item.change < 0;
            const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
            
            return (
              <div 
                key={item.name} 
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.04] bg-white/[0.02] p-4 transition-all hover:bg-white/[0.04] hover:border-white/[0.08]"
              >
                {/* Accent glow */}
                <div className={`absolute -right-4 -top-4 h-16 w-16 rounded-full blur-2xl opacity-20 transition-opacity group-hover:opacity-40 ${
                  isPositive ? 'bg-teal-400' : isNegative ? 'bg-rose-400' : 'bg-zinc-400'
                }`} />

                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-medium text-zinc-400 truncate pr-2">{item.name}</div>
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.03] ${
                    isPositive ? 'text-teal-400' : isNegative ? 'text-rose-400' : 'text-zinc-500'
                  }`}>
                    <TrendIcon className="h-3 w-3" />
                  </div>
                </div>
                
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-lg font-bold text-zinc-100">{item.value}</span>
                </div>
                
                <div className="mt-1">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isPositive 
                      ? "bg-teal-400/10 text-teal-400 border border-teal-400/20" 
                      : isNegative 
                        ? "bg-rose-400/10 text-rose-400 border border-rose-400/20" 
                        : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                  }`}>
                    {isPositive ? "+" : ""}
                    {item.change.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
