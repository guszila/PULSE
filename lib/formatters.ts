import type { DecisionSnapshot, NewsItem } from "./market-data";

export function thaiBias(value: DecisionSnapshot["bias"]) {
  if (value === "Bullish") return "เอนเอียงบวก";
  if (value === "Bearish") return "เอนเอียงลบ";
  return "เป็นกลาง";
}

export function thaiConfidence(value: string) {
  if (value === "High") return "สูง";
  if (value === "Moderate") return "ปานกลาง";
  if (value === "Low") return "ต่ำ";
  return value;
}

export function thaiRisk(value: DecisionSnapshot["riskLevel"]) {
  if (value === "Low") return "ต่ำ";
  if (value === "High") return "สูง";
  return "ปานกลาง";
}

export function thaiAction(value: string) {
  const map: Record<string, string> = {
    "Watch for pullback entry": "รอจังหวะย่อเพื่อเข้าซื้อ",
    "Avoid new buys": "หลีกเลี่ยงการซื้อเพิ่ม",
    "Wait for confirmation": "รอสัญญาณยืนยัน"
  };

  return map[value] ?? value;
}

export function thaiVolume(value: string) {
  if (value === "High") return "สูง";
  if (value === "Moderate") return "ปานกลาง";
  if (value === "Low") return "ต่ำ";
  return value;
}

export function thaiBiasLike(value: string) {
  if (value === "Bullish") return "ขาขึ้น";
  if (value === "Bearish") return "ขาลง";
  if (value === "Neutral") return "เป็นกลาง";
  return value;
}

export function thaiSentiment(value: NewsItem["sentiment"]) {
  if (value === "Positive") return "บวก";
  if (value === "Negative") return "ลบ";
  return "กลาง";
}

export function formatUpdatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.getTime() === 0) {
    return "ข้อมูลตัวอย่าง";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}
