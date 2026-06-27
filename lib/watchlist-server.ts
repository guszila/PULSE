import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getUserWatchlistSymbols(): Promise<string[] | undefined> {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (authData.user) {
    const { data: watchlists } = await supabase
      .from("watchlists")
      .select("symbol")
      .eq("user_id", authData.user.id)
      .order("created_at", { ascending: true });
      
    if (watchlists && watchlists.length > 0) {
      return watchlists.map((w) => w.symbol);
    }
  }

  const cookieStore = await cookies();
  const currentCookie = cookieStore.get("alphaedge_watchlist")?.value;
  if (currentCookie) {
    return currentCookie.split(",").filter(Boolean);
  }

  return undefined;
}
