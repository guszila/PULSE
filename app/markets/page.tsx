import { getDashboardData } from "@/lib/free-market-api";
import { SectionTitle } from "@/components/shared/section-title";
import { Card, CardContent } from "@/components/ui/card";
import { sectors } from "@/lib/market-data";

export const revalidate = 300;

export default async function MarketsPage() {
  const data = await getDashboardData();

  return (
    <section id="markets" className="mt-8">
      <SectionTitle eyebrow="ตลาด" title="ภาพรวมตลาดวันนี้" />
      <Card>
        <CardContent className="pt-4 sm:pt-5">
          <div className="grid auto-rows-[88px] grid-cols-2 gap-3 sm:grid-cols-4 sm:auto-rows-[110px]">
            {sectors.map((sector) => (
              <div
                key={sector.name}
                className={`${sector.weight} flex flex-col justify-between rounded-2xl border p-4 transition-transform hover:scale-[1.015] ${
                  sector.change >= 0
                    ? "border-emerald-400/15 bg-emerald-400/[0.08]"
                    : "border-red-400/15 bg-red-400/[0.08]"
                }`}
              >
                <span className="text-sm font-medium text-zinc-100">{sector.name}</span>
                <span className={sector.change >= 0 ? "text-emerald-300" : "text-red-300"}>
                  {sector.change >= 0 ? "+" : ""}
                  {sector.change.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
