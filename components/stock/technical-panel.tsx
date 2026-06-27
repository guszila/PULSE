import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IndicatorItem } from "@/lib/market-data";
import { Activity } from "lucide-react";

const DESCRIPTIONS: Record<string, string> = {
  "RSI": "วัดรอบแรงซื้อ/ขาย (Overbought/Oversold)",
  "MACD": "ทิศทางโมเมนตัมของเทรนด์",
  "EMA20": "ราคาเฉลี่ย 20 วัน (ระยะสั้น)",
  "EMA50": "ราคาเฉลี่ย 50 วัน (ระยะกลาง)",
  "EMA200": "ราคาเฉลี่ย 200 วัน (เทรนด์หลัก)",
  "VWAP": "ราคาเฉลี่ยที่รวมปริมาณซื้อขายแล้ว",
  "ATR": "รอบความผันผวนของราคาเฉลี่ย",
  "ADX": "ความแรงของเทรนด์ปัจจุบัน",
  "Volume": "ปริมาณซื้อขายเทียบค่าเฉลี่ย",
  "ความแข็งแรงเทรนด์": "คะแนนความชัดเจนของเทรนด์ขาขึ้น"
};

function getStateColor(state: string) {
  if (["ซื้อมากเกินไป", "ขาลง", "อยู่ใต้", "ผันผวนสูง", "อ่อน", "วอลุ่มเบา"].includes(state)) {
    return "text-rose-400 border-rose-400/20 bg-rose-400/10";
  }
  if (["ขายมากเกินไป", "เอนเอียงบวก", "ขาขึ้น", "อยู่เหนือ", "ยืนยันด้วยวอลุ่ม", "แข็งแรง"].includes(state)) {
    return "text-emerald-400 border-emerald-400/20 bg-emerald-400/10";
  }
  if (["ปานกลาง"].includes(state)) {
    return "text-amber-400 border-amber-400/20 bg-amber-400/10";
  }
  return "text-zinc-300 border-white/10 bg-white/[0.04]";
}

export function TechnicalPanel({ indicators }: { indicators: IndicatorItem[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-white/[0.02]">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4 text-indigo-400" />
          อินดิเคเตอร์เทคนิค
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-white/[0.06]">
          {indicators.map((indicator) => (
            <div key={indicator.label} className="flex items-center justify-between p-3.5 sm:px-5 hover:bg-white/[0.02] transition-colors">
              <div>
                <div className="text-sm font-medium text-zinc-200">{indicator.label}</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">{DESCRIPTIONS[indicator.label] || "อินดิเคเตอร์เทคนิค"}</div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <div className="text-sm font-bold text-zinc-100">{indicator.value}</div>
                <div className={`text-[10px] font-medium px-2 py-0.5 rounded border ${getStateColor(indicator.state)}`}>
                  {indicator.state}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
