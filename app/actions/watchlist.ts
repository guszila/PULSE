"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function addWatchlistSymbol(symbol: string) {
  const upperSymbol = symbol.toUpperCase().trim();
  if (!upperSymbol) return { error: "Symbol is required" };

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (authData.user) {
    const { error } = await supabase.from("watchlists").upsert(
      {
        user_id: authData.user.id,
        symbol: upperSymbol,
        company: upperSymbol,
      },
      { onConflict: "user_id,symbol" }
    );
    if (error) return { error: error.message };
  } else {
    const cookieStore = await cookies();
    const currentCookie = cookieStore.get("alphaedge_watchlist")?.value;
    let symbols = currentCookie ? currentCookie.split(",").filter(Boolean) : ["AAPL", "MSFT", "NVDA", "AMZN", "META", "JPM", "LLY"];
    
    if (!symbols.includes(upperSymbol)) {
      symbols.push(upperSymbol);
      cookieStore.set("alphaedge_watchlist", symbols.join(","), { maxAge: 60 * 60 * 24 * 365, path: "/" });
    }
  }

  revalidatePath("/");
  revalidatePath("/watchlist");
  revalidatePath("/stocks/[symbol]", "page");
  return { success: true };
}

export async function removeWatchlistSymbol(symbol: string) {
  const upperSymbol = symbol.toUpperCase().trim();
  if (!upperSymbol) return { error: "Symbol is required" };

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (authData.user) {
    const { error } = await supabase.from("watchlists")
      .delete()
      .eq("user_id", authData.user.id)
      .eq("symbol", upperSymbol);
    if (error) return { error: error.message };
  } else {
    const cookieStore = await cookies();
    const currentCookie = cookieStore.get("alphaedge_watchlist")?.value;
    let symbols = currentCookie ? currentCookie.split(",").filter(Boolean) : ["AAPL", "MSFT", "NVDA", "AMZN", "META", "JPM", "LLY"];
    
    symbols = symbols.filter(s => s !== upperSymbol);
    cookieStore.set("alphaedge_watchlist", symbols.join(","), { maxAge: 60 * 60 * 24 * 365, path: "/" });
  }

  revalidatePath("/");
  revalidatePath("/watchlist");
  revalidatePath("/stocks/[symbol]", "page");
  return { success: true };
}

export async function reorderWatchlist(symbols: string[]) {
  if (!symbols || !Array.isArray(symbols) || symbols.length === 0) return { success: true };

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (authData.user) {
    // Hack: Update created_at sequentially to preserve the new order in Supabase
    // since the query relies on sorting by created_at.
    const now = Date.now();
    for (let i = 0; i < symbols.length; i++) {
      await supabase.from("watchlists").update({ 
        created_at: new Date(now + i * 1000).toISOString() 
      }).eq("user_id", authData.user.id).eq("symbol", symbols[i]);
    }
  } else {
    const cookieStore = await cookies();
    cookieStore.set("alphaedge_watchlist", symbols.join(","), { maxAge: 60 * 60 * 24 * 365, path: "/" });
  }

  revalidatePath("/");
  revalidatePath("/watchlist");
  return { success: true };
}

export async function toggleWatchlistPin(symbol: string) {
  const upperSymbol = symbol.toUpperCase().trim();
  if (!upperSymbol) return { error: "Symbol is required" };

  const cookieStore = await cookies();
  const currentCookie = cookieStore.get("alphaedge_pinned_watchlist")?.value;
  let pinned = currentCookie ? currentCookie.split(",").filter(Boolean) : [];
  
  if (pinned.includes(upperSymbol)) {
    pinned = pinned.filter(s => s !== upperSymbol);
  } else {
    pinned.push(upperSymbol);
  }
  
  cookieStore.set("alphaedge_pinned_watchlist", pinned.join(","), { maxAge: 60 * 60 * 24 * 365, path: "/" });

  revalidatePath("/");
  revalidatePath("/watchlist");
  return { success: true, pinned };
}
