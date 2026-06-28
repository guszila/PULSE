import { NextResponse } from "next/server";
import yahooFinance from "../../../lib/yahoo-finance";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol || symbol.trim() === "") {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  try {
    const quote = (await yahooFinance.quote(symbol)) as any;
    if (!quote || quote.regularMarketPrice === undefined) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    return NextResponse.json({ price: quote.regularMarketPrice });
  } catch (error) {
    console.error("Quote API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
