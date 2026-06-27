import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "gain" | "loss";

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { tone?: BadgeTone }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tone === "neutral" && "border-white/[0.06] bg-white/[0.03] text-zinc-300",
        tone === "gain" && "border-emerald-400/15 bg-emerald-400/10 text-emerald-300",
        tone === "loss" && "border-red-400/15 bg-red-400/10 text-red-300",
        className
      )}
      {...props}
    />
  );
}
