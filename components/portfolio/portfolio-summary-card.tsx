"use client";

import { Card } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PortfolioData } from "@/lib/portfolio-api";

export function PortfolioSummaryCard({ metrics }: { metrics: PortfolioData["metrics"] }) {
  if (!metrics || metrics.length < 5) return null;
  
  const [totalValue, dayGain, totalReturn, cash, buyingPower] = metrics;
  
  const getIcon = (tone: string) => 
    tone === "gain" ? ArrowUpRight : tone === "loss" ? ArrowDownRight : Minus;

  const MainIcon = getIcon(totalValue.tone);

  return (
    <Card className="glass-line p-5">
      <div className="flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-3">
             <p className="text-sm font-medium text-zinc-400">{totalValue.label}</p>
             <Badge tone={totalValue.tone} className="px-1.5 py-0">
               <MainIcon className="h-3 w-3 mr-1" />
               {totalValue.delta}
             </Badge>
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">{totalValue.value}</div>
        </div>

        <div className="h-px bg-white/[0.08]" />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[dayGain, totalReturn, cash, buyingPower].map((metric) => {
             const Icon = getIcon(metric.tone);
             const isNeutralText = metric.label === "เงินสดสำรอง" || metric.label === "กำลังซื้อ";
             
             return (
               <div key={metric.label}>
                 <p className="text-xs text-zinc-500">{metric.label}</p>
                 <div className="mt-1 flex items-baseline gap-2">
                   <span className="text-lg font-medium text-zinc-200">{metric.value}</span>
                   {!isNeutralText && (
                     <span className={`text-[10px] flex items-center ${metric.tone === 'gain' ? 'text-teal-400' : metric.tone === 'loss' ? 'text-rose-400' : 'text-zinc-400'}`}>
                       <Icon className="h-2.5 w-2.5 mr-0.5" />
                       {metric.delta}
                     </span>
                   )}
                   {isNeutralText && (
                     <span className="text-[10px] text-zinc-500">
                       {metric.delta}
                     </span>
                   )}
                 </div>
               </div>
             )
          })}
        </div>
      </div>
    </Card>
  )
}
