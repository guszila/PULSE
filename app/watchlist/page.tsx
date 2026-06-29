import { getDashboardData } from "@/lib/free-market-api";
import { getUserWatchlistSymbols, getPinnedWatchlistSymbols } from "@/lib/watchlist-server";
import { SupportResistanceCard } from "@/components/watchlist/support-resistance-card";
import { WatchlistTable } from "@/components/watchlist/watchlist-table";

export const revalidate = 60;

export default async function WatchlistPage() {
  const [userSymbols, pinnedSymbols] = await Promise.all([
    getUserWatchlistSymbols(),
    getPinnedWatchlistSymbols()
  ]);
  
  // Sort symbols to prioritize pinned ones
  const sortedSymbols = [...(userSymbols || [])].sort((a, b) => {
    const aPinned = pinnedSymbols.includes(a);
    const bPinned = pinnedSymbols.includes(b);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return 0;
  });

  const topSymbol = sortedSymbols.length > 0 ? sortedSymbols[0] : "AAPL";
  const data = await getDashboardData(topSymbol, sortedSymbols);
  
  return (
    <div id="watchlist" className="mt-3 grid gap-3 xl:grid-cols-[1.05fr_0.95fr]">
      <SupportResistanceCard supportResistance={data.supportResistance} symbol={data.selectedStock.symbol} />
      <WatchlistTable stocks={data.watchlist} saved={!!userSymbols} pinnedSymbols={pinnedSymbols} />
    </div>
  );
}

