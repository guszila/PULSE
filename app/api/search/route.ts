import { NextResponse } from "next/server";
import { getFinnhubApiKey } from "@/lib/free-market-api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.trim() === "") {
    return NextResponse.json({ result: [] });
  }

  const token = getFinnhubApiKey();
  if (!token) {
    return NextResponse.json({ result: [] });
  }

  try {
    const res = await fetch(`https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${token}`, {
      next: { revalidate: 86400 } // Cache search results for a day
    });
    
    if (!res.ok) {
      return NextResponse.json({ result: [] });
    }

    const data = await res.json();
    
    // Filter to prioritize common US stocks and avoid complex derivatives/foreign exchanges
    const rawResults = (data.result || [])
      .filter((item: any) => !item.symbol.includes(".") && !item.symbol.includes(":"));
      
    // Deduplicate by symbol
    const uniqueSymbols = new Set<string>();
    const results = rawResults
      .filter((item: any) => {
        const sym = item.displaySymbol || item.symbol;
        if (uniqueSymbols.has(sym)) return false;
        uniqueSymbols.add(sym);
        return true;
      })
      .slice(0, 6)
      .map((item: any) => ({
        symbol: item.displaySymbol || item.symbol,
        name: item.description
      }));

    return NextResponse.json({ result: results });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ result: [] });
  }
}
