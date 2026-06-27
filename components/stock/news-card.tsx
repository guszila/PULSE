import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { NewsItem } from "@/lib/market-data";
import { thaiSentiment } from "@/lib/formatters";
import { Newspaper, Clock, ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react";

const sentimentConfig = {
  Positive: { icon: TrendingUp, accentBar: "bg-emerald-400" },
  Negative: { icon: TrendingDown, accentBar: "bg-rose-400" },
  Neutral: { icon: Minus, accentBar: "bg-zinc-500" }
} as const;

export function NewsCard({ items }: { items: NewsItem[] }) {
  if (!items || items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2.5">
            <Newspaper className="h-5 w-5 text-indigo-400" />
            ข่าวและมุมมองตลาด
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Newspaper className="h-10 w-10 text-zinc-700 mb-3" />
            <p className="text-sm text-zinc-500">ยังไม่มีข่าวล่าสุดในขณะนี้</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2.5">
          <Newspaper className="h-5 w-5 text-indigo-400" />
          ข่าวและมุมมองตลาด
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0 divide-y divide-white/[0.06]">
        {items.map((item) => {
          const config = sentimentConfig[item.sentiment] || sentimentConfig.Neutral;
          const SentimentIcon = config.icon;

          return (
            <article
              key={item.headline}
              className="group relative py-4 first:pt-0 last:pb-0 hover:bg-white/[0.02] -mx-4 px-4 transition-colors rounded-xl"
            >
              {/* Left accent bar */}
              <div className={`absolute left-0 top-4 bottom-4 w-[3px] rounded-full ${config.accentBar} opacity-40 group-hover:opacity-80 transition-opacity`} />

              <div className="pl-3">
                {/* Top meta row */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge
                    tone={item.sentiment === "Positive" ? "gain" : item.sentiment === "Negative" ? "loss" : "neutral"}
                    className="px-2 py-0.5 text-[10px]"
                  >
                    <SentimentIcon className="mr-1 h-3 w-3" />
                    {thaiSentiment(item.sentiment)}
                  </Badge>
                  <div className="flex items-center gap-1 text-[11px] text-zinc-600">
                    <Clock className="h-3 w-3" />
                    {item.time}
                  </div>
                  <span className="ml-auto text-[11px] text-zinc-600">
                    {item.source}
                  </span>
                </div>

                {/* Headline */}
                <h3 className="text-sm font-semibold leading-6 text-zinc-100 group-hover:text-white transition-colors">
                  {item.headline}
                </h3>

                {/* Summary */}
                <p className="mt-1.5 text-xs leading-5 text-zinc-500 line-clamp-2 group-hover:text-zinc-400 transition-colors">
                  {item.summary}
                </p>

                {/* Read more link */}
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-indigo-400/20 bg-indigo-400/[0.06] px-3 py-1.5 text-[11px] font-medium text-indigo-300 transition-all hover:bg-indigo-400/[0.12] hover:border-indigo-400/40 hover:text-indigo-200"
                  >
                    <ExternalLink className="h-3 w-3" />
                    อ่านเพิ่มเติม
                  </a>
                ) : (
                  <div className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] text-zinc-600">
                    <ExternalLink className="h-3 w-3" />
                    จาก {item.source}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </CardContent>
    </Card>
  );
}
