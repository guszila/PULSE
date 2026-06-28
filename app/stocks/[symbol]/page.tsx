import { getDashboardData } from "@/lib/free-market-api";
import { getUserWatchlistSymbols } from "@/lib/watchlist-server";
import { DecisionPlanCard } from "@/components/stock/decision-plan-card";
import { TechnicalPanel } from "@/components/stock/technical-panel";
import { FundamentalsCard } from "@/components/stock/fundamentals-card";
import { StockChartSection } from "@/components/stock/stock-chart-section";
import { GlobalSearch } from "@/components/shared/global-search";
import { AutoRefresh } from "@/components/shared/auto-refresh";
import { SymbolTracker } from "@/components/shared/symbol-tracker";

export const revalidate = 300;

export default async function StockSymbolPage({ params }: { params: Promise<{ symbol: string }> }) {
  const resolvedParams = await params;
  const symbol = resolvedParams.symbol.toUpperCase();
  const userSymbols = await getUserWatchlistSymbols();
  const data = await getDashboardData(symbol, userSymbols);

  return (
    <>
      <SymbolTracker symbol={symbol} />
      <AutoRefresh intervalMs={60000} />
      <div className="mt-2 mb-4">
        <GlobalSearch />
      </div>
      <section id="stock" className="mt-4 grid gap-3 xl:grid-cols-[1fr_380px]">
        <StockChartSection
          company={data.selectedStock.company}
          symbol={data.selectedStock.symbol}
          price={data.selectedStock.price}
          change={data.selectedStock.change}
          open={data.selectedStock.open}
          high={data.selectedStock.high}
          low={data.selectedStock.low}
          close={data.selectedStock.close}
          volume={data.selectedStock.volume}
          candleData={data.candleData}
          supportResistance={data.supportResistance}
        />

        <div className="space-y-3">
          <DecisionPlanCard decision={data.decision} supportResistance={data.supportResistance} />
          <TechnicalPanel indicators={data.indicators} />
        </div>
      </section>
      
      <div className="mt-3">
        <FundamentalsCard items={data.fundamentals} />
      </div>
    </>
  );
}
