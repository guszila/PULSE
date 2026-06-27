export function getSupabaseConfig() {
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey
  };
}

export function hasSupabaseConfig() {
  const { url, publishableKey } = getSupabaseConfig();
  return Boolean(url && publishableKey);
}
