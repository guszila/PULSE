import { NextResponse } from "next/server";
import { getSupabaseConfig, hasSupabaseConfig } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET() {
  if (!hasSupabaseConfig()) {
    return NextResponse.json({
      connected: false,
      message: "ยังไม่ได้ตั้งค่า Supabase environment variables"
    });
  }

  const { url, publishableKey } = getSupabaseConfig();
  const response = await fetch(`${url}/auth/v1/settings`, {
    headers: {
      apikey: publishableKey ?? "",
      Authorization: `Bearer ${publishableKey}`
    },
    next: { revalidate: 60 }
  });

  return NextResponse.json({
    connected: response.ok,
    projectUrl: url,
    message: response.ok ? "เชื่อมต่อ Supabase project ได้แล้ว" : `Supabase ตอบกลับด้วยสถานะ ${response.status}`
  });
}
