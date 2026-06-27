import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/database.types";

import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const { url, publishableKey } = getSupabaseConfig();
  const cookieStore = await cookies();
  const token = cookieStore.get("sb-access-token")?.value;

  if (!url || !publishableKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient<Database>(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    }
  });
}
