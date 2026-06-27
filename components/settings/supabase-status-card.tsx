import { Database, CheckCircle2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type SupabaseStatus = {
  connected: boolean;
  projectUrl?: string;
  message: string;
};

export function SupabaseStatusCard({ status }: { status: SupabaseStatus | null }) {
  return (
    <Card className="mt-3 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.06]">
            <Database className="h-5 w-5 text-zinc-300" />
          </div>
          <div>
            <div className="text-sm font-medium text-zinc-100">Supabase</div>
            <p className="mt-1 text-xs text-zinc-500">{status?.projectUrl ?? "กำลังเช็คการเชื่อมต่อโปรเจกต์"}</p>
          </div>
        </div>
        <Badge tone={status?.connected ? "gain" : "neutral"}>
          {status?.connected ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
          {status?.connected ? "เชื่อมต่อแล้ว" : status ? "ยังไม่เชื่อมต่อ" : "กำลังเช็ค"}
        </Badge>
      </div>
      <p className="mt-3 text-xs leading-5 text-zinc-500">
        {status?.message ?? "โหลด Supabase URL และ publishable key จาก .env.local แล้ว"}
      </p>
    </Card>
  );
}
