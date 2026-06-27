import { SectionTitle } from "@/components/shared/section-title";
import { PortfolioManager } from "@/components/portfolio/portfolio-manager";
import { PortfolioSummaryCard } from "@/components/portfolio/portfolio-summary-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPortfolio } from "@/lib/portfolio-api";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const AllocationChart = dynamic(() => import("@/components/allocation-chart").then(mod => mod.AllocationChart), {
  loading: () => <Skeleton className="h-[200px] w-full bg-zinc-800 rounded-lg" />
});

interface PortfolioContentProps {
  userId: string | null;
}

export async function PortfolioContent({ userId }: PortfolioContentProps) {
  const portfolio = await getPortfolio();

  return (
    <section id="portfolio-overview" className="mt-8">
      <SectionTitle eyebrow="สรุปผล" title="ภาพรวมพอร์ตลงทุน" />
      <PortfolioSummaryCard metrics={portfolio.metrics} />
      
      <div className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>สัดส่วนพอร์ต</CardTitle>
          </CardHeader>
          <CardContent>
            <AllocationChart data={portfolio.allocation} />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-4">
              {portfolio.allocation.map((item) => (
                <div key={item.name} className="flex items-center gap-2 rounded-lg bg-white/[0.035] px-3 py-2 text-xs text-zinc-400">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="truncate">{item.name}</span>
                  <span className="ml-auto font-medium text-zinc-300">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-4">
        <PortfolioManager initialPositions={portfolio.positions} userId={userId} />
      </div>
    </section>
  );
}
