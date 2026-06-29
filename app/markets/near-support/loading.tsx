import { SectionTitle } from "@/components/shared/section-title";
import { ArrowLeft, Target, TrendingUp, Zap, CircleDollarSign, Cpu, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function NearSupportLoading() {
  return (
    <div className="space-y-6 pt-4 pb-12 w-full animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-white/[0.05] shrink-0" disabled>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <SectionTitle eyebrow="Screener" title="กำลังโหลดข้อมูล..." />
      </div>
      
      {/* Category Tabs Skeleton */}
      <div 
        className="pl-0 sm:pl-12 flex overflow-x-auto items-center gap-2 pb-2 snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {[Target, TrendingUp, Zap, Cpu, CircleDollarSign, BarChart3].map((Icon, i) => (
          <div key={i} className="shrink-0 snap-start">
            <Button variant="outline" className="rounded-full h-9 px-4 text-xs bg-white/[0.02] border border-white/[0.05]" disabled>
              <Icon className="mr-2 h-3.5 w-3.5 opacity-50" />
              <div className="h-3 w-16 bg-white/[0.05] rounded animate-pulse" />
            </Button>
          </div>
        ))}
      </div>

      <div className="text-sm text-zinc-500 pl-0 sm:pl-12">
        <div className="h-4 w-3/4 max-w-md bg-white/[0.05] rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-0 sm:pl-12">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="relative overflow-hidden flex flex-col rounded-2xl border border-white/[0.04] bg-white/[0.02] p-5 h-full">
            <div className="flex items-start justify-between relative z-10 mb-5">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-xl bg-white/[0.05]" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-16 bg-white/[0.05]" />
                  <Skeleton className="h-3 w-24 bg-white/[0.05]" />
                </div>
              </div>
              <Skeleton className="h-6 w-16 bg-white/[0.05]" />
            </div>
            
            <div className="flex items-center justify-between border-t border-white/[0.04] pt-4 mt-auto relative z-10">
              <div className="flex flex-col space-y-2">
                <Skeleton className="h-2 w-12 bg-white/[0.05]" />
                <Skeleton className="h-4 w-16 bg-white/[0.05]" />
              </div>
              <div className="flex flex-col items-end space-y-2">
                <Skeleton className="h-2 w-12 bg-white/[0.05]" />
                <Skeleton className="h-5 w-14 rounded-full bg-white/[0.05]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
