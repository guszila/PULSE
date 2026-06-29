import { getAllNearSupportStocks, getMag7Stocks, getSmallCapStocks, getDividendStocks, getAiChipStocks, getEtfStocks } from "@/lib/free-market-api";
import { SectionTitle } from "@/components/shared/section-title";
import { StockLogo } from "@/components/stock-logo";
import Link from "next/link";
import { ArrowLeft, Target, TrendingUp, Zap, CircleDollarSign, Cpu, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const revalidate = 60;

export default async function NearSupportPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const resolvedParams = await searchParams;
  const category = resolvedParams.category || "near-support";

  let stocks = [];
  let title = "";
  let description = "";

  if (category === "mag7") {
    stocks = await getMag7Stocks();
    title = "หุ้น 7 นางฟ้า (Magnificent 7)";
    description = "บริษัทเทคโนโลยีขนาดใหญ่ 7 แห่งที่เป็นผู้นำตลาด";
  } else if (category === "smallcap") {
    stocks = await getSmallCapStocks();
    title = "หุ้นเล็กน่าสนใจ (Small/Mid Caps)";
    description = "หุ้นเติบโตขนาดเล็กถึงกลางที่มีโอกาสเติบโตสูงและน่าจับตามอง";
  } else if (category === "dividend") {
    stocks = await getDividendStocks();
    title = "หุ้นปันผลเด่น (Dividend Stars)";
    description = "บริษัทพื้นฐานดีที่มีประวัติการจ่ายเงินปันผลต่อเนื่องและให้ผลตอบแทนน่าสนใจ";
  } else if (category === "aichip") {
    stocks = await getAiChipStocks();
    title = "หุ้น AI & Semiconductor";
    description = "กลุ่มบริษัทผู้นำด้านปัญญาประดิษฐ์และการผลิตชิปประมวลผล";
  } else if (category === "etf") {
    stocks = await getEtfStocks();
    title = "กองทุน ETF น่าสนใจ";
    description = "กองทุนรวมดัชนีที่ช่วยกระจายความเสี่ยงและครอบคลุมอุตสาหกรรมหลัก";
  } else {
    stocks = await getAllNearSupportStocks();
    title = "หุ้นใกล้แนวรับทั้งหมด (Near Support)";
    description = "ผลการสแกนหุ้นที่มีราคาปัจจุบันใกล้เคียงกับแนวรับสำคัญ (ระยะห่างไม่เกิน 3%) รวมถึงหุ้นใหญ่ หุ้นเทคโนโลยี และหุ้นเติบโตขนาดเล็ก";
  }

  return (
    <div className="space-y-6 pt-4 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-white/[0.05] hover:bg-white/[0.05]">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <SectionTitle eyebrow="Screener" title={title} />
      </div>
      
      {/* Category Tabs */}
      <div 
        className="pl-0 sm:pl-12 flex overflow-x-auto items-center gap-2 pb-2 snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <Link href="?category=near-support" className="shrink-0 snap-start">
          <Button 
            variant={category === "near-support" ? "default" : "outline"} 
            className={`rounded-full h-9 px-4 text-xs ${category === "near-support" ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-white/[0.05] text-zinc-300 hover:bg-white/[0.1] hover:text-white border border-white/[0.05]"}`}
          >
            <Target className="mr-2 h-3.5 w-3.5" />
            หุ้นใกล้แนวรับ
          </Button>
        </Link>
        <Link href="?category=mag7" className="shrink-0 snap-start">
          <Button 
            variant={category === "mag7" ? "default" : "outline"} 
            className={`rounded-full h-9 px-4 text-xs ${category === "mag7" ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-white/[0.05] text-zinc-300 hover:bg-white/[0.1] hover:text-white border border-white/[0.05]"}`}
          >
            <TrendingUp className="mr-2 h-3.5 w-3.5" />
            หุ้น 7 นางฟ้า
          </Button>
        </Link>
        <Link href="?category=smallcap" className="shrink-0 snap-start">
          <Button 
            variant={category === "smallcap" ? "default" : "outline"} 
            className={`rounded-full h-9 px-4 text-xs ${category === "smallcap" ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-white/[0.05] text-zinc-300 hover:bg-white/[0.1] hover:text-white border border-white/[0.05]"}`}
          >
            <Zap className="mr-2 h-3.5 w-3.5" />
            หุ้นเล็กน่าสนใจ
          </Button>
        </Link>
        <Link href="?category=aichip" className="shrink-0 snap-start">
          <Button 
            variant={category === "aichip" ? "default" : "outline"} 
            className={`rounded-full h-9 px-4 text-xs ${category === "aichip" ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-white/[0.05] text-zinc-300 hover:bg-white/[0.1] hover:text-white border border-white/[0.05]"}`}
          >
            <Cpu className="mr-2 h-3.5 w-3.5" />
            AI & Chips
          </Button>
        </Link>
        <Link href="?category=dividend" className="shrink-0 snap-start">
          <Button 
            variant={category === "dividend" ? "default" : "outline"} 
            className={`rounded-full h-9 px-4 text-xs ${category === "dividend" ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-white/[0.05] text-zinc-300 hover:bg-white/[0.1] hover:text-white border border-white/[0.05]"}`}
          >
            <CircleDollarSign className="mr-2 h-3.5 w-3.5" />
            หุ้นปันผล
          </Button>
        </Link>
        <Link href="?category=etf" className="shrink-0 snap-start">
          <Button 
            variant={category === "etf" ? "default" : "outline"} 
            className={`rounded-full h-9 px-4 text-xs ${category === "etf" ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-white/[0.05] text-zinc-300 hover:bg-white/[0.1] hover:text-white border border-white/[0.05]"}`}
          >
            <BarChart3 className="mr-2 h-3.5 w-3.5" />
            ETF น่าสนใจ
          </Button>
        </Link>
      </div>

      <div className="text-sm text-zinc-400 pl-0 sm:pl-12">
        {description}
      </div>

      {stocks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-white/[0.04] rounded-2xl bg-white/[0.02]">
          <Target className="h-10 w-10 text-zinc-600 mb-4" />
          <h3 className="text-lg font-medium text-zinc-300">ไม่พบหุ้นในหมวดหมู่นี้</h3>
          <p className="text-zinc-500 mt-2">ยังไม่มีข้อมูลสำหรับหมวดหมู่ที่คุณเลือก</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-0 sm:pl-12">
          {stocks.map((stock) => {
            const isBelow = stock.price < stock.support;
            return (
              <Link key={stock.symbol} href={`/stocks/${stock.symbol.toLowerCase()}`} className="group block h-full">
                <div className="relative overflow-hidden flex flex-col rounded-2xl border border-white/[0.04] bg-white/[0.02] p-5 transition-all hover:bg-white/[0.04] hover:border-indigo-500/30 h-full">
                  <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-0 bg-indigo-500 transition-opacity group-hover:opacity-10" />
                  
                  <div className="flex items-start justify-between relative z-10 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        <StockLogo symbol={stock.symbol} className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-zinc-100 group-hover:text-indigo-400 transition-colors">{stock.symbol}</h3>
                        <p className="text-[11px] text-zinc-500 line-clamp-1 max-w-[140px]">{stock.company}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-zinc-100">${stock.price.toFixed(2)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-white/[0.04] pt-4 mt-auto relative z-10">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">แนวรับสำคัญ</span>
                      <span className="font-medium text-zinc-300">${stock.support.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">ระยะห่าง</span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                        isBelow 
                          ? 'bg-rose-400/10 text-rose-400 border border-rose-400/20' 
                          : 'bg-teal-400/10 text-teal-400 border border-teal-400/20'
                      }`}>
                        {isBelow ? '-' : '+'}{stock.distance.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
