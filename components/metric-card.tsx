"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function MetricCard({
  label,
  value,
  delta,
  tone = "neutral"
}: {
  label: string;
  value: string;
  delta: string;
  tone?: "gain" | "loss" | "neutral";
}) {
  const Icon = tone === "gain" ? ArrowUpRight : tone === "loss" ? ArrowDownRight : Minus;

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.18 }}>
      <Card className="glass-line h-full p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs text-zinc-500">{label}</p>
          <Badge tone={tone} className="shrink-0">
            <Icon className="h-3 w-3" />
            {delta}
          </Badge>
        </div>
        <div className="mt-5 text-2xl font-semibold tracking-normal text-zinc-50 sm:text-3xl">{value}</div>
      </Card>
    </motion.div>
  );
}
