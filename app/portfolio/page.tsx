import { SectionTitle } from "@/components/shared/section-title";
import { AllocationChart } from "@/components/allocation-chart";
import { PortfolioManager } from "@/components/portfolio/portfolio-manager";
import { PortfolioSummaryCard } from "@/components/portfolio/portfolio-summary-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPortfolio } from "@/lib/portfolio-api";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 300;

export default async function PortfolioPage() {
  const supabase = await createSupabaseServerClient();
  const [{ data: authData }, portfolio] = await Promise.all([
    supabase.auth.getUser(),
    getPortfolio()
  ]);

  return (
    <>
      <header className="mb-3 flex flex-col gap-3 border-b border-white/[0.07] pb-3 sm:mb-5 sm:gap-4 sm:pb-5">
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] uppercase text-zinc-500 sm:gap-2 sm:text-xs">
          <span>พอร์ตลงทุน</span>
          <span className="h-1 w-1 rounded-full bg-zinc-700" />
          <span>จัดการหุ้นและสินทรัพย์</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-normal text-white sm:text-4xl">บัญชีของฉัน</h1>
        </div>
      </header>

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
          <PortfolioManager initialPositions={portfolio.positions} userId={authData.user?.id ?? null} />
        </div>
      </section>
    </>
  );
}
