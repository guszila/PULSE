import { AlphaEdgeLogo } from "@/components/ui/logo";
import { DecisionHero } from "@/components/dashboard/decision-hero";
import { MarketOverviewCard } from "@/components/dashboard/market-overview-card";
import { NewsCard } from "@/components/stock/news-card";
import { SectionTitle } from "@/components/shared/section-title";
import { GlobalSearch } from "@/components/shared/global-search";
import { AutoRefresh } from "@/components/shared/auto-refresh";
import { MarketStatus } from "@/components/shared/market-status";
import { Card } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserWatchlistSymbols } from "@/lib/watchlist-server";
import { getDashboardData } from "@/lib/free-market-api";
import Link from "next/link";
import { ArrowRight, Activity, TrendingUp } from "lucide-react";

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
      <AutoRefresh intervalMs={60000} />
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
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              สรุปวันนี้ <span className="text-zinc-500 font-medium ml-1">Market Pulse</span>
            </h1>
            <div className="ml-2 hidden sm:block">
              <MarketStatus />
            </div>
          </div>
          <div className="mt-3 block sm:hidden">
            <MarketStatus />
          </div>
        </div>
        <div className="flex w-full xl:w-72 mt-2 xl:mt-0">
          <GlobalSearch />
        </div>
      </header>

      <section className="mt-4 sm:mt-6">
        <DecisionHero
          decision={data.decision}
          selectedStock={data.selectedStock}
          supportResistance={data.supportResistance}
          watchlist={data.watchlist}
          updatedAt={data.timestamp}
        />
      </section>

      <div className="mt-4 sm:mt-6 grid gap-4 sm:gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <SectionTitle icon={Activity}>
              มุมมองตลาด <span className="text-zinc-500 font-normal ml-1">Market Setup</span>
            </SectionTitle>
            <Link 
              href="/markets" 
              className="group flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300"
            >
              ดูทั้งหมด
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <MarketOverviewCard items={data.overview} />
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <SectionTitle icon={TrendingUp}>
              ข่าวล่าสุด <span className="text-zinc-500 font-normal ml-1">Latest News</span>
            </SectionTitle>
            <span className="text-[10px] font-medium text-emerald-400 border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 rounded-full">
              อัปเดตเรียลไทม์
            </span>
          </div>
          <NewsCard items={data.news} />
        </section>
      </div>
    </>
  );
}
