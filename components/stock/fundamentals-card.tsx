import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FundamentalItem } from "@/lib/market-data";
import { Briefcase } from "lucide-react";

const DESCRIPTIONS: Record<string, string> = {
  "มูลค่าตลาด": "ขนาดบริษัทโดยรวม",
  "PE": "ราคาต่อกำไร (บอกความถูกแพง)",
  "Forward PE": "PE คาดการณ์ในอนาคต",
  "PEG": "ความคุ้มค่าเทียบการเติบโต",
  "EPS": "กำไรต่อ 1 หุ้น",
  "รายได้": "ยอดขายรวม",
  "อัตรากำไรขั้นต้น": "กำไรหลังหักต้นทุนขาย",
  "อัตรากำไรดำเนินงาน": "กำไรจากการทำธุรกิจ",
  "อัตรากำไรสุทธิ": "กำไรสุทธิบรรทัดสุดท้าย",
  "ROE": "ผลตอบแทนต่อส่วนทุน",
  "ROA": "ผลตอบแทนต่อสินทรัพย์",
  "หนี้สินต่อทุน": "ภาระหนี้สินเทียบกับทุน",
  "กระแสเงินสดอิสระ": "เงินสดสุทธิหลังลงทุน",
  "เงินปันผลตอบแทน": "ผลตอบแทนปันผลรายปี"
};

export function FundamentalsCard({ items }: { items: FundamentalItem[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between bg-white/[0.02] pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Briefcase className="h-4 w-4 text-emerald-400" />
          วิเคราะห์พื้นฐาน
        </CardTitle>
        <Badge className="bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 border-emerald-400/20">มูลค่ายุติธรรม</Badge>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 xl:grid-cols-4">
          {items.map(([label, value]) => (
            <div key={label} className="flex flex-col">
              <div className="text-[11px] font-medium text-zinc-500">{label}</div>
              <div className="mt-1 text-sm font-bold text-zinc-100">{value}</div>
              <div className="mt-1 text-[9px] text-zinc-600 line-clamp-1" title={DESCRIPTIONS[label]}>
                {DESCRIPTIONS[label] || "ข้อมูลพื้นฐาน"}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-5 border-t border-white/[0.06]">
          <div className="mb-2 flex justify-between text-[10px] font-medium text-zinc-500">
            <span>ต่ำกว่ามูลค่า (Undervalued)</span>
            <span className="text-amber-400">มูลค่ายุติธรรม (Fair)</span>
            <span>แพงกว่ามูลค่า (Overvalued)</span>
          </div>
          <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden shadow-inset">
            <div className="h-full w-[56%] rounded-full bg-[linear-gradient(90deg,rgba(16,185,129,0.8),rgba(245,158,11,0.8))]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
