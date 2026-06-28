"use client";

import { Card } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, Minus, Wallet, Zap, TrendingUp, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PortfolioData } from "@/lib/portfolio-api";

export function PortfolioSummaryCard({ metrics }: { metrics: PortfolioData["metrics"] }) {
  if (!metrics || metrics.length < 3) return null;
  
  const [totalValue, dayGain, totalReturn] = metrics;
  
  const getIcon = (tone: string) => 
    tone === "gain" ? ArrowUpRight : tone === "loss" ? ArrowDownRight : Minus;

  const MainIcon = getIcon(totalValue.tone);
  const isPositive = totalValue.tone === "gain";
  const isNegative = totalValue.tone === "loss";

  return (
    <Card className="relative overflow-hidden border-0 bg-transparent">
      {/* Background Gradient Mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
      <div className={`absolute -right-20 -top-20 h-64 w-64 rounded-full blur-[80px] opacity-20 ${isPositive ? 'bg-emerald-500' : isNegative ? 'bg-rose-500' : 'bg-indigo-500'}`} />
      <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-indigo-500/10 blur-[80px]" />

      <div className="relative p-1">
        {/* Top Section: Total Value */}
        <div className={`rounded-2xl border ${isPositive ? 'border-emerald-500/20 bg-emerald-500/5' : isNegative ? 'border-rose-500/20 bg-rose-500/5' : 'border-indigo-500/20 bg-indigo-500/5'} p-6 sm:p-8 backdrop-blur-md`}>
          <div className="flex items-center gap-3 mb-2">
             <div className={`p-2 rounded-xl ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : isNegative ? 'bg-rose-500/10 text-rose-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
               <Wallet className="h-4 w-4 sm:h-5 sm:w-5" />
             </div>
             <p className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">{totalValue.label}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-3 sm:gap-4 mt-2">
            <div className="flex flex-col">
              <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-sm">
                {totalValue.value}
              </h2>
              {totalValue.rawValue !== undefined && (
                <span className="text-sm font-medium text-zinc-400 mt-1">
                  ≈ ฿{new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(totalValue.rawValue * 34.50)}
                </span>
              )}
            </div>
            <Badge 
              className={`px-2 py-1 text-xs sm:text-sm border-0 ${isPositive ? 'bg-emerald-500/20 text-emerald-400' : isNegative ? 'bg-rose-500/20 text-rose-400' : 'bg-zinc-800 text-zinc-300'}`}
            >
              <MainIcon className="h-3.5 w-3.5 mr-1" />
              {totalValue.delta} วันนี้
            </Badge>
          </div>
        </div>

        {/* Bottom Section: Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          {[dayGain, totalReturn].map((metric, idx) => {
             const Icon = getIcon(metric.tone);
             const isNeutral = false;
             const MetricIcon = idx === 0 ? TrendingUp : DollarSign;
             
             return (
               <div key={metric.label} className="flex flex-col rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]">
                 <div className="flex items-center gap-2 mb-2">
                   <MetricIcon className="h-3.5 w-3.5 text-zinc-500" />
                   <p className="text-xs font-medium text-zinc-400">{metric.label}</p>
                 </div>
                 
                 <div className="mt-auto">
                   <div className="text-lg font-bold text-zinc-100 flex items-baseline gap-2">
                     {metric.value}
                     {metric.rawValue !== undefined && (
                       <span className="text-[10px] font-medium text-zinc-500">
                         (฿{new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(Math.abs(metric.rawValue * 34.50))})
                       </span>
                     )}
                   </div>
                   
                   {!isNeutral ? (
                     <div className={`mt-1 flex items-center text-[11px] font-medium ${metric.tone === 'gain' ? 'text-emerald-400' : metric.tone === 'loss' ? 'text-rose-400' : 'text-zinc-500'}`}>
                       <Icon className="h-3 w-3 mr-0.5" />
                       {metric.delta}
                     </div>
                   ) : (
                     <div className="mt-1 flex items-center text-[11px] font-medium text-zinc-500">
                       {metric.delta}
                     </div>
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
