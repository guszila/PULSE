import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FundamentalItem } from "@/lib/market-data";

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
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>วิเคราะห์พื้นฐาน</CardTitle>
        <Badge>มูลค่ายุติธรรม</Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
          {items.map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3 flex flex-col justify-between">
              <div>
                <div className="text-[11px] text-zinc-400 font-medium leading-tight">{label}</div>
                <div className="text-[9px] text-zinc-600 mt-0.5 leading-tight">{DESCRIPTIONS[label] || "ข้อมูลพื้นฐาน"}</div>
              </div>
              <div className="mt-2 text-sm font-semibold text-zinc-100">{value}</div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <div className="mb-2 flex justify-between text-xs text-zinc-500">
            <span>ต่ำกว่ามูลค่า</span>
            <span>มูลค่ายุติธรรม</span>
            <span>แพงกว่ามูลค่า</span>
          </div>
          <div className="h-2 rounded-full bg-white/[0.07]">
            <div className="h-2 w-[56%] rounded-full bg-amber-300" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
