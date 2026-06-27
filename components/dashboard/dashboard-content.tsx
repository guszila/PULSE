import { DecisionHero } from "@/components/dashboard/decision-hero";
import { MarketOverviewCard } from "@/components/dashboard/market-overview-card";
import { NewsCard } from "@/components/stock/news-card";
import { SectionTitle } from "@/components/shared/section-title";
import { getDashboardData } from "@/lib/free-market-api";
import Link from "next/link";
import { ArrowRight, Activity, TrendingUp } from "lucide-react";

interface DashboardContentProps {
  symbol: string;
  userSymbols?: string[];
}

export async function DashboardContent({ symbol, userSymbols }: DashboardContentProps) {
  const data = await getDashboardData(symbol, userSymbols);

  return (
    <>
      <section className="mt-4 sm:mt-6">
        <DecisionHero
          decision={data.decision}
          selectedStock={data.selectedStock}
          supportResistance={data.supportResistance}
          watchlist={data.watchlist}
          updatedAt={data.updatedAt}
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
          <MarketOverviewCard data={data} />
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
