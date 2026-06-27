import { getDashboardData } from "@/lib/free-market-api";
import { getUserWatchlistSymbols } from "@/lib/watchlist-server";
import { SupportResistanceCard } from "@/components/watchlist/support-resistance-card";
import { WatchlistTable } from "@/components/watchlist/watchlist-table";

export const revalidate = 300;

export default async function WatchlistPage() {
  const userSymbols = await getUserWatchlistSymbols();
  const data = await getDashboardData("AAPL", userSymbols);
  
  return (
    <div id="watchlist" className="mt-3 grid gap-3 xl:grid-cols-[1.05fr_0.95fr]">
      <SupportResistanceCard supportResistance={data.supportResistance} />
      <WatchlistTable stocks={data.watchlist} saved={!!userSymbols} />
    </div>
  );
}
