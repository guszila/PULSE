import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MacroItem } from "@/lib/market-data";

export function MacroCard({ items }: { items: MacroItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>คริปโตและมาโคร</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-2xl bg-white/[0.035] p-4">
            <div className="text-sm font-medium text-zinc-100">{item.label}</div>
            <div className="text-right">
              <div className="text-sm text-zinc-100">{item.value}</div>
              <div className={item.change >= 0 ? "text-xs text-emerald-300" : "text-xs text-red-300"}>
                {item.change >= 0 ? "+" : ""}
                {item.change.toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
