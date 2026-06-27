import { getDashboardData } from "@/lib/free-market-api";
import { DecisionHero } from "@/components/dashboard/decision-hero";
import { MarketOverviewCard } from "@/components/dashboard/market-overview-card";
import { SectionTitle } from "@/components/shared/section-title";
import { GlobalSearch } from "@/components/shared/global-search";
import { Card } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserWatchlistSymbols } from "@/lib/watchlist-server";
import { Badge } from "@/components/ui/badge";
import { Bell, PanelRightOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlphaEdgeLogo } from "@/components/ui/logo";

export const revalidate = 300;

export default async function Home({ searchParams }: { searchParams: Promise<{ symbol?: string }> }) {
  const resolvedParams = await searchParams;
  const symbol = resolvedParams.symbol?.toUpperCase() || "AAPL";
  const supabase = await createSupabaseServerClient();
  const [{ data: authData }, userSymbols] = await Promise.all([
    supabase.auth.getUser(),
    getUserWatchlistSymbols()
  ]);
  const data = await getDashboardData(symbol, userSymbols);
  const stockFeedLabel = data.providerStatus.stocksLive ? "ข้อมูลสด" : "ข้อมูลตัวอย่าง";

  return (
    <>
      <header className="mb-3 flex flex-col gap-3 border-b border-white/[0.07] pb-3 sm:mb-5 sm:gap-4 sm:pb-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] uppercase text-zinc-500 sm:gap-2 sm:text-xs">
            <span>หุ้นอเมริกา</span>
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            <span>ตัวช่วยดูหุ้นรายวัน</span>
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            <span>{stockFeedLabel}</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 sm:items-center sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-inset bg-[#03130d] border border-[#10b981]/20">
              <AlphaEdgeLogo className="h-[200%] w-[200%] -ml-[5%] -mb-[5%]" />
            </div>
            <h1 className="text-2xl font-semibold tracking-normal text-white sm:text-4xl">AlphaEdge</h1>
            <Badge tone={data.providerStatus.stocksLive ? "gain" : "neutral"}>
              {data.providerStatus.stocksLive ? data.dataSource : "เพิ่ม API เพื่อใช้ข้อมูลสด"}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <GlobalSearch />
          <Button variant="outline" size="icon" className="hidden sm:inline-flex" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="hidden sm:inline-flex" aria-label="Open AI sidebar">
            <PanelRightOpen className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <DecisionHero
        decision={data.decision}
        selectedStock={data.selectedStock}
        supportResistance={data.supportResistance}
        updatedAt={data.updatedAt}
        watchlist={data.watchlist}
      />

      <section id="dashboard" className="mt-8">
        <SectionTitle eyebrow="ตลาด" title="ภาพรวมตลาดวันนี้" />
        <MarketOverviewCard data={data} />
      </section>
    </>
  );
}
