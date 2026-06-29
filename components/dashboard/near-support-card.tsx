import { Card, CardContent } from "@/components/ui/card";
import { AlphaEdgeDashboardData } from "@/lib/market-data";
import { Target, ArrowRight } from "lucide-react";
import Link from "next/link";
import { StockLogo } from "@/components/stock-logo";

export function NearSupportCard({ data }: { data: { nearSupport: AlphaEdgeDashboardData["nearSupport"] } }) {
  if (!data.nearSupport || data.nearSupport.length === 0) {
    return (
      <Card className="overflow-hidden border-none bg-transparent shadow-none">
        <CardContent className="p-4 rounded-2xl border border-white/[0.04] bg-white/[0.02] flex flex-col items-center justify-center text-sm text-zinc-500 min-h-[120px] gap-2">
          <Target className="h-6 w-6 text-zinc-700" />
          ไม่พบหุ้นที่ใกล้แนวรับในขณะนี้
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-none bg-transparent shadow-none">
      <CardContent className="p-0 space-y-3">
        {data.nearSupport.map((stock) => {
          const isBelow = stock.price < stock.support;
          return (
            <Link key={stock.symbol} href={`/stocks/${stock.symbol.toLowerCase()}`} className="group block">
              <div className="relative overflow-hidden flex items-center justify-between rounded-2xl border border-white/[0.04] bg-white/[0.02] p-4 transition-all hover:bg-white/[0.04] hover:border-indigo-500/30">
                <div className="absolute -left-4 -top-4 h-16 w-16 rounded-full blur-2xl opacity-0 bg-indigo-500 transition-opacity group-hover:opacity-10" />
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <StockLogo symbol={stock.symbol} className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-100 group-hover:text-indigo-400 transition-colors">{stock.symbol}</h3>
                    <p className="text-[11px] text-zinc-500 truncate max-w-[120px] sm:max-w-[150px] mt-0.5">{stock.company}</p>
                  </div>
                </div>
                <div className="text-right relative z-10">
                  <div className="text-base font-bold text-zinc-100">${stock.price.toFixed(2)}</div>
                  <div className="mt-1 flex items-center justify-end gap-1.5 text-[10px]">
                    <span className="text-zinc-500">แนวรับ: <span className="font-medium text-zinc-300">${stock.support.toFixed(2)}</span></span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold ${
                      isBelow 
                        ? 'bg-rose-400/10 text-rose-400 border border-rose-400/20' 
                        : 'bg-teal-400/10 text-teal-400 border border-teal-400/20'
                    }`}>
                      {isBelow ? '-' : '+'}{stock.distance.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </CardContent>
      <div className="px-4 pb-4 pt-2">
        <Link href="/markets/near-support" className="flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.04] bg-white/[0.02] py-2.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-zinc-100">
          ดูหุ้นใกล้แนวรับทั้งหมด <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </Card>
  );
}
