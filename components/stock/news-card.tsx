import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { NewsItem } from "@/lib/market-data";
import { thaiSentiment } from "@/lib/formatters";

export function NewsCard({ items }: { items: NewsItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ข่าวและมุมมองตลาด</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, index) => (
          <div key={item.headline} className="grid grid-cols-[48px_1fr] gap-3 rounded-2xl border border-white/[0.06] p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.055] text-xs text-zinc-500">
              0{index + 1}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge tone={item.sentiment === "Positive" ? "gain" : item.sentiment === "Negative" ? "loss" : "neutral"}>
                  {thaiSentiment(item.sentiment)}
                </Badge>
                <span className="text-xs text-zinc-600">{item.time}</span>
              </div>
              <h3 className="mt-2 text-sm font-medium leading-5 text-zinc-100">{item.headline}</h3>
              <p className="mt-1 text-xs leading-5 text-zinc-500">{item.summary}</p>
              <div className="mt-2 text-xs text-zinc-600">{item.source}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
