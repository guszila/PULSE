import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { events } from "@/lib/market-data";

export function EventsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>อีเวนต์ที่กำลังจะมา</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2">
          {events.map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="text-xs text-zinc-500">{label}</div>
              <div className="mt-2 text-sm text-zinc-100">{value}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
