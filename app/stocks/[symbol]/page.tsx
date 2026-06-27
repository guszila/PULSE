import { getDashboardData } from "@/lib/free-market-api";
import { getUserWatchlistSymbols } from "@/lib/watchlist-server";
import { CandlestickChart } from "@/components/candlestick-chart";
import { DecisionPlanCard } from "@/components/stock/decision-plan-card";
import { TechnicalPanel } from "@/components/stock/technical-panel";
import { FundamentalsCard } from "@/components/stock/fundamentals-card";
import { NewsCard } from "@/components/stock/news-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatCompact } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { GlobalSearch } from "@/components/shared/global-search";

export const revalidate = 300;

export default async function StockSymbolPage({ params }: { params: Promise<{ symbol: string }> }) {
  const resolvedParams = await params;
  const symbol = resolvedParams.symbol.toUpperCase();
  const userSymbols = await getUserWatchlistSymbols();
  const data = await getDashboardData(symbol, userSymbols);
  const timeframes = ["1D", "5D", "1M", "3M", "6M", "YTD", "1Y", "5Y"];

  return (
    <>
      <div className="mt-2 mb-4">
        <GlobalSearch />
      </div>
      <section id="stock" className="mt-4 grid gap-3 xl:grid-cols-[1fr_380px]">
        <Card className="min-w-0">
          <CardHeader className="flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>{data.selectedStock.company} กราฟราคา</CardTitle>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                <span className="text-2xl font-semibold text-white">{formatCurrency(data.selectedStock.price)}</span>
                <Badge tone={data.selectedStock.change >= 0 ? "gain" : "loss"}>
                  {data.selectedStock.change >= 0 ? "+" : ""}
                  {data.selectedStock.change.toFixed(2)}%
                </Badge>
              </div>
            </div>
            <div className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-white/[0.08] bg-white/[0.035] p-1">
              {timeframes.map((frame) => (
                <button
                  key={frame}
                  className={`h-8 shrink-0 rounded-full px-4 text-xs font-medium transition ${
                    frame === "1M" ? "bg-white text-zinc-950" : "text-zinc-400 hover:bg-white/[0.07]"
                  }`}
                >
                  {frame}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <CandlestickChart
              data={data.candleData}
              supportResistance={data.supportResistance}
              symbol={data.selectedStock.symbol}
              theme={"dark"} 
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-y-2 rounded-xl bg-white/[0.02] px-4 py-3 sm:gap-4">
              {[
                ["เปิด", formatCurrency(data.selectedStock.open)],
                ["สูงสุด", formatCurrency(data.selectedStock.high)],
                ["ต่ำสุด", formatCurrency(data.selectedStock.low)],
                ["ปิด", formatCurrency(data.selectedStock.close)],
                ["วอลุ่ม", formatCompact(data.selectedStock.volume)]
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col items-start sm:items-center">
                  <div className="text-[10px] text-zinc-500">{label}</div>
                  <div className="text-sm font-semibold text-zinc-200">{value}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <DecisionPlanCard decision={data.decision} supportResistance={data.supportResistance} />
          <TechnicalPanel indicators={data.indicators} />
        </div>
      </section>
      
      <div className="mt-3 grid gap-3 xl:grid-cols-[1fr_420px]">
        <FundamentalsCard items={data.fundamentals} />
        <NewsCard items={data.news} />
      </div>
    </>
  );
}
