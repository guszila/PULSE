import { redirect } from "next/navigation";
import { getUserWatchlistSymbols } from "@/lib/watchlist-server";

export default async function StockIndexPage() {
  const userSymbols = await getUserWatchlistSymbols();
  const topSymbol = userSymbols && userSymbols.length > 0 ? userSymbols[0] : "AAPL";
  redirect(`/stocks/${topSymbol}`);
}
