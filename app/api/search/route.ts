import { NextResponse } from "next/server";
import yahooFinance from "../../../lib/yahoo-finance";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.trim() === "") {
    return NextResponse.json({ result: [] });
  }

  try {
    const result = (await yahooFinance.search(query, { quotesCount: 6, newsCount: 0 })) as any;
    const rawQuotes = result.quotes || [];
    
    const results = rawQuotes
      .filter((item: any) => item.isYahooFinance)
      .slice(0, 6)
      .map((item: any) => ({
        symbol: item.symbol,
        name: item.shortname || item.longname || item.symbol
      }));

    return NextResponse.json({ result: results });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ result: [] });
  }
}
