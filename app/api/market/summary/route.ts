import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/free-market-api";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function GET() {
  const data = await getDashboardData();
  return NextResponse.json(data);
}
