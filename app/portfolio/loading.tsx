import { PortfolioSkeleton } from "@/components/portfolio/portfolio-skeleton";

export default function Loading() {
  return (
    <>
      <header className="mb-3 flex flex-col gap-3 border-b border-white/[0.07] pb-3 sm:mb-5 sm:gap-4 sm:pb-5">
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] uppercase text-zinc-500 sm:gap-2 sm:text-xs">
          <span>พอร์ตลงทุน</span>
          <span className="h-1 w-1 rounded-full bg-zinc-700" />
          <span>จัดการหุ้นและสินทรัพย์</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-normal text-white sm:text-4xl">บัญชีของฉัน</h1>
        </div>
      </header>

      <PortfolioSkeleton />
    </>
  );
}
