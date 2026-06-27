export type WatchlistStock = {
  symbol: string;
  company: string;
  price: number;
  change: number;
  volume: number;
  marketCap: number;
};

export type MarketOverviewItem = {
  name: string;
  value: string;
  change: number;
};

export type MacroItem = {
  label: string;
  value: string;
  change: number;
};

export type NewsItem = {
  headline: string;
  summary: string;
  sentiment: "Positive" | "Neutral" | "Negative";
  source: string;
  time: string;
};

export type FundamentalItem = [string, string];

export type CandlePoint = {
  x: number;
  time?: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type IndicatorItem = {
  label: string;
  value: string;
  state: string;
};

export type SupportResistanceData = {
  strongSupport: number;
  support: number;
  currentPrice: number;
  resistance: number;
  strongResistance: number;
  distanceToSupport: string;
  distanceToResistance: string;
  riskReward: string;
  breakoutLevel: string;
  breakdownLevel: string;
  touches: number;
  volumeConfirmation: string;
  trendDirection: string;
  breakoutProbability: string;
  suggestedEntry: string;
  stopLoss: string;
  takeProfit: string;
};

export type SelectedStock = {
  symbol: string;
  company: string;
  price: number;
  change: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type DecisionSnapshot = {
  bias: "Bullish" | "Neutral" | "Bearish";
  actionLabel: string;
  score: number;
  confidence: string;
  riskLevel: "Low" | "Medium" | "High";
  entryPlan: string;
  invalidation: string;
  nextTrigger: string;
  note: string;
};

export type AlphaEdgeDashboardData = {
  watchlist: WatchlistStock[];
  marketOverview: MarketOverviewItem[];
  fundamentals: FundamentalItem[];
  news: NewsItem[];
  macro: MacroItem[];
  selectedStock: SelectedStock;
  candleData: CandlePoint[];
  indicators: IndicatorItem[];
  supportResistance: SupportResistanceData;
  decision: DecisionSnapshot;
  dataSource: string;
  isLive: boolean;
  providerStatus: {
    stocksLive: boolean;
    fundamentalsLive: boolean;
    newsLive: boolean;
    macroLive: boolean;
  };
  updatedAt: string;
};

export const portfolioMetrics = [
  { label: "มูลค่าพอร์ต", value: "$1,284,620.44", delta: "+2.42%", tone: "gain" },
  { label: "กำไร/ขาดทุนวันนี้", value: "+$18,904.21", delta: "+1.49%", tone: "gain" },
  { label: "ผลตอบแทนรวม", value: "+$318,440.08", delta: "+32.96%", tone: "gain" },
  { label: "เงินสดสำรอง", value: "$92,480.00", delta: "เงินสด 7.2%", tone: "neutral" },
  { label: "กำลังซื้อ", value: "$184,960.00", delta: "พร้อมใช้", tone: "neutral" }
] as const;

export const allocation = [
  { name: "เทคโนโลยี", value: 42, color: "#2dd4bf" },
  { name: "สุขภาพ", value: 15, color: "#60a5fa" },
  { name: "การเงิน", value: 13, color: "#f59e0b" },
  { name: "ผู้บริโภค", value: 11, color: "#a78bfa" },
  { name: "พลังงาน", value: 8, color: "#fb7185" },
  { name: "เงินสด", value: 11, color: "#94a3b8" }
];

export const watchlist: WatchlistStock[] = [
  { symbol: "AAPL", company: "Apple Inc.", price: 214.38, change: 1.18, volume: 47120000, marketCap: 3280000000000 },
  { symbol: "MSFT", company: "Microsoft Corp.", price: 472.62, change: 0.84, volume: 21890000, marketCap: 3510000000000 },
  { symbol: "NVDA", company: "NVIDIA Corp.", price: 138.91, change: 2.76, volume: 186400000, marketCap: 3420000000000 },
  { symbol: "AMZN", company: "Amazon.com Inc.", price: 186.77, change: -0.42, volume: 39110000, marketCap: 1950000000000 },
  { symbol: "META", company: "Meta Platforms", price: 582.13, change: 1.96, volume: 14280000, marketCap: 1470000000000 },
  { symbol: "JPM", company: "JPMorgan Chase", price: 247.19, change: -0.31, volume: 9010000, marketCap: 687000000000 },
  { symbol: "LLY", company: "Eli Lilly and Co.", price: 812.44, change: 0.67, volume: 2870000, marketCap: 771000000000 }
];

export const marketOverview: MarketOverviewItem[] = [
  { name: "S&P 500", value: "5,912.40", change: 0.64 },
  { name: "NASDAQ", value: "18,742.18", change: 0.92 },
  { name: "Dow Jones", value: "42,188.20", change: 0.28 },
  { name: "Russell 2000", value: "2,238.91", change: -0.18 },
  { name: "VIX", value: "14.82", change: -3.41 }
];

export const sectors = [
  { name: "เทคโนโลยี", change: 1.84, weight: "col-span-2 row-span-2" },
  { name: "สุขภาพ", change: 0.42, weight: "col-span-1 row-span-2" },
  { name: "การเงิน", change: -0.31, weight: "col-span-1 row-span-1" },
  { name: "พลังงาน", change: -1.12, weight: "col-span-1 row-span-1" },
  { name: "อุตสาหกรรม", change: 0.36, weight: "col-span-1 row-span-1" },
  { name: "สาธารณูปโภค", change: -0.18, weight: "col-span-1 row-span-1" },
  { name: "ผู้บริโภค", change: 0.71, weight: "col-span-2 row-span-1" },
  { name: "สื่อสาร", change: 1.21, weight: "col-span-1 row-span-1" },
  { name: "วัสดุ", change: -0.62, weight: "col-span-1 row-span-1" },
  { name: "อสังหาฯ", change: 0.09, weight: "col-span-1 row-span-1" }
];

export const indicators: IndicatorItem[] = [
  { label: "RSI", value: "61.4", state: "เอนเอียงบวก" },
  { label: "MACD", value: "+1.82", state: "ตัดขึ้น" },
  { label: "EMA20", value: "$211.44", state: "อยู่เหนือ" },
  { label: "EMA50", value: "$204.18", state: "อยู่เหนือ" },
  { label: "EMA200", value: "$184.20", state: "อยู่เหนือ" },
  { label: "VWAP", value: "$213.12", state: "ยืนได้" },
  { label: "ATR", value: "4.86", state: "ปกติ" },
  { label: "ADX", value: "28.9", state: "มีเทรนด์" },
  { label: "Volume", value: "1.18x", state: "ยืนยันด้วยวอลุ่ม" },
  { label: "ความแข็งแรงเทรนด์", value: "76/100", state: "แข็งแรง" }
];

export const supportResistance: SupportResistanceData = {
  strongSupport: 196.4,
  support: 204.2,
  currentPrice: 214.38,
  resistance: 221.8,
  strongResistance: 232.5,
  distanceToSupport: "-4.75%",
  distanceToResistance: "+3.46%",
  riskReward: "2.8 : 1",
  breakoutLevel: "$222.40",
  breakdownLevel: "$203.10",
  touches: 6,
  volumeConfirmation: "สูง",
  trendDirection: "ขาขึ้น",
  breakoutProbability: "68%",
  suggestedEntry: "$211.80 - $214.50",
  stopLoss: "$203.10",
  takeProfit: "$231.50"
};

export const decision: DecisionSnapshot = {
  bias: "Bullish",
  actionLabel: "Watch for pullback entry",
  score: 76,
  confidence: "Moderate",
  riskLevel: "Medium",
  entryPlan: "พิจารณาเข้าซื้อในโซน $211.80 - $214.50 ตราบใดที่ราคายังยืนเหนือ VWAP",
  invalidation: "แผนอ่อนลงหากราคาหลุด $203.10 หรือความพยายามเบรคเอาท์ไม่มีวอลุ่ม",
  nextTrigger: "ราคาทะลุและปิดเหนือ $222.40 พร้อมวอลุ่มที่หนาแน่นขึ้น",
  note: "ใช้เป็นบริบทวิเคราะห์เท่านั้น ไม่ใช่คำแนะนำการลงทุน ควรกำหนดขนาดสถานะและความเสี่ยงส่วนตัวก่อนทุกครั้ง"
};

export const fundamentals: FundamentalItem[] = [
  ["มูลค่าตลาด", "$3.28T"],
  ["PE", "33.8"],
  ["Forward PE", "27.6"],
  ["PEG", "2.2"],
  ["EPS", "$6.35"],
  ["รายได้", "$391.0B"],
  ["อัตรากำไรขั้นต้น", "46.2%"],
  ["อัตรากำไรดำเนินงาน", "31.5%"],
  ["อัตรากำไรสุทธิ", "26.4%"],
  ["ROE", "148.1%"],
  ["ROA", "28.3%"],
  ["หนี้สินต่อทุน", "1.41"],
  ["กระแสเงินสดอิสระ", "$108.8B"],
  ["เงินปันผลตอบแทน", "0.47%"]
];

export const news: NewsItem[] = [
  {
    headline: "Apple supplier checks point to a stronger iPhone upgrade cycle",
    summary: "Channel inventory has tightened while premium models continue to take share in US carrier stores.",
    sentiment: "Positive",
    source: "MarketDesk",
    time: "24 min ago"
  },
  {
    headline: "Mega-cap technology leads as rates stabilize",
    summary: "Portfolio managers rotated back into durable free-cash-flow leaders after Treasury volatility eased.",
    sentiment: "Positive",
    source: "Street Ledger",
    time: "1 hr ago"
  },
  {
    headline: "Regulators review app store payment compliance",
    summary: "Analysts expect limited near-term earnings impact, but headline risk may remain elevated.",
    sentiment: "Neutral",
    source: "Capitol Markets",
    time: "2 hrs ago"
  }
];

export const events = [
  ["ประกาศงบ", "AAPL ประกาศงบ 31 ก.ค. หลังตลาดปิด"],
  ["ปันผล", "AAPL ขึ้น XD วันที่ 12 ส.ค."],
  ["ISM Manufacturing", "Monday 10:00 ET"],
  ["ประชุม Fed", "มติ FOMC วันที่ 30 ก.ค."],
  ["CPI", "ประกาศเงินเฟ้อ 11 ก.ค. เวลา 08:30 ET"],
  ["PPI", "ประกาศราคาผู้ผลิต 12 ก.ค. เวลา 08:30 ET"],
  ["รายงานจ้างงาน", "Nonfarm payrolls 5 ก.ค."],
  ["ปฏิทิน IPO", "ติดตามช่วง roadshow ของ Figma"]
];

export const macro: MacroItem[] = [
  { label: "BTC", value: "$67,840", change: 1.7 },
  { label: "ETH", value: "$3,512", change: 0.9 },
  { label: "Gold", value: "$2,358", change: -0.2 },
  { label: "Oil", value: "$78.42", change: -1.1 },
  { label: "USD Index", value: "104.1", change: 0.3 }
];

export const candleData: CandlePoint[] = [
  { x: 0, open: 201, high: 207, low: 198, close: 205, volume: 42 },
  { x: 1, open: 205, high: 209, low: 202, close: 203, volume: 38 },
  { x: 2, open: 203, high: 211, low: 201, close: 210, volume: 55 },
  { x: 3, open: 210, high: 214, low: 207, close: 212, volume: 51 },
  { x: 4, open: 212, high: 216, low: 209, close: 211, volume: 47 },
  { x: 5, open: 211, high: 219, low: 210, close: 218, volume: 66 },
  { x: 6, open: 218, high: 222, low: 214, close: 216, volume: 58 },
  { x: 7, open: 216, high: 224, low: 215, close: 223, volume: 73 },
  { x: 8, open: 223, high: 228, low: 219, close: 221, volume: 61 },
  { x: 9, open: 221, high: 226, low: 217, close: 219, volume: 53 },
  { x: 10, open: 219, high: 225, low: 213, close: 214, volume: 69 },
  { x: 11, open: 214, high: 218, low: 207, close: 209, volume: 74 },
  { x: 12, open: 209, high: 216, low: 205, close: 215, volume: 62 },
  { x: 13, open: 215, high: 222, low: 212, close: 221, volume: 68 },
  { x: 14, open: 221, high: 231, low: 219, close: 229, volume: 88 },
  { x: 15, open: 229, high: 233, low: 224, close: 226, volume: 76 },
  { x: 16, open: 226, high: 230, low: 220, close: 224, volume: 65 },
  { x: 17, open: 224, high: 229, low: 213, close: 214, volume: 92 }
];

export const fallbackDashboardData: AlphaEdgeDashboardData = {
  watchlist,
  marketOverview,
  fundamentals,
  news,
  macro,
  selectedStock: {
    symbol: "AAPL",
    company: "Apple Inc.",
    price: 214.38,
    change: 1.18,
    open: 211.02,
    high: 218.48,
    low: 209.76,
    close: 214.38,
    volume: 47100000
  },
  candleData,
  indicators,
  supportResistance,
  decision,
  dataSource: "ข้อมูลตัวอย่าง",
  isLive: false,
  providerStatus: {
    stocksLive: false,
    fundamentalsLive: false,
    newsLive: false,
    macroLive: false
  },
  updatedAt: new Date(0).toISOString()
};
