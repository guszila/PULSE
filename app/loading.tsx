import { AlphaEdgeLogo } from "@/components/ui/logo";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

export default function Loading() {
  return (
    <>
      <header className="mb-3 flex flex-col gap-3 border-b border-white/[0.07] pb-3 sm:mb-5 sm:gap-4 sm:pb-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] uppercase text-zinc-500 sm:gap-2 sm:text-xs">
            <span>หุ้นอเมริกา</span>
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            <span>ตัวช่วยดูหุ้นรายวัน</span>
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            <span>สรุปข้อมูลตลาด</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 sm:items-center sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-inset bg-[#03130d] border border-[#10b981]/20">
              <AlphaEdgeLogo className="h-[200%] w-[200%] -ml-[5%] -mb-[5%]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              สรุปวันนี้ <span className="text-zinc-500 font-medium ml-1">Market Pulse</span>
            </h1>
          </div>
        </div>
        <div className="flex w-full xl:w-72 mt-2 xl:mt-0 opacity-50 pointer-events-none">
          <div className="h-10 w-full rounded-xl bg-zinc-800/50 animate-pulse border border-white/[0.04]"></div>
        </div>
      </header>

      <DashboardSkeleton />
    </>
  );
}
