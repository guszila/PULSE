import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IndicatorItem } from "@/lib/market-data";

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
    return "text-rose-400";
  }
  if (["ขายมากเกินไป", "เอนเอียงบวก", "ขาขึ้น", "อยู่เหนือ", "ยืนยันด้วยวอลุ่ม", "แข็งแรง"].includes(state)) {
    return "text-emerald-400";
  }
  if (["ปานกลาง"].includes(state)) {
    return "text-amber-400";
  }
  return "text-zinc-500";
}

export function TechnicalPanel({ indicators }: { indicators: IndicatorItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>อินดิเคเตอร์เทคนิค</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {indicators.map((indicator) => (
            <div key={indicator.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3 flex flex-col justify-between">
              <div>
                <div className="text-[11px] text-zinc-400 font-medium leading-tight">{indicator.label}</div>
                <div className="text-[9px] text-zinc-600 mt-0.5 leading-tight">{DESCRIPTIONS[indicator.label] || "อินดิเคเตอร์เทคนิค"}</div>
              </div>
              <div className="mt-2 text-lg font-semibold text-zinc-100">{indicator.value}</div>
              <div className={`mt-1 text-[11px] font-medium ${getStateColor(indicator.state)}`}>{indicator.state}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
