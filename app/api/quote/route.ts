import { NextResponse } from "next/server";
import { getFinnhubApiKey, fetchFinnhubQuote } from "@/lib/free-market-api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol || symbol.trim() === "") {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  const token = getFinnhubApiKey();
  if (!token) {
    return NextResponse.json({ error: "API key missing" }, { status: 500 });
  }

  try {
    const quote = await fetchFinnhubQuote(symbol, token);
    if (!quote || quote.c === undefined) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    return NextResponse.json({ price: quote.c });
  } catch (error) {
    console.error("Quote API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
