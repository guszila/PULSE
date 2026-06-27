import { createSupabaseServerClient } from "@/lib/supabase/server";
import { portfolioMetrics as fallbackMetrics, allocation as fallbackAllocation } from "@/lib/market-data";
import { getFinnhubApiKey, fetchFinnhubQuote } from "@/lib/free-market-api";

export type PortfolioPosition = {
  id: string;
  symbol: string;
  shares: number;
  average_cost: number;
  current_price: number;
  previous_close: number;
  total_value: number;
  day_gain: number;
  day_gain_percent: number;
  total_return: number;
  total_return_percent: number;
};

export type PortfolioData = {
  metrics: { label: string; value: string; delta: string; tone: "gain" | "loss" | "neutral" }[];
  allocation: { name: string; value: number; color: string }[];
  positions: PortfolioPosition[];
  isLive: boolean;
};

// Generic sector mapping for mock assignment
const SECTOR_MAP: Record<string, string> = {
  AAPL: "เทคโนโลยี",
  MSFT: "เทคโนโลยี",
  NVDA: "เทคโนโลยี",
  JPM: "การเงิน",
  V: "การเงิน",
  JNJ: "สุขภาพ",
  LLY: "สุขภาพ",
  XOM: "พลังงาน",
  WMT: "ผู้บริโภค",
  AMZN: "ผู้บริโภค",
};

const SECTOR_COLORS: Record<string, string> = {
  "เทคโนโลยี": "#2dd4bf",
  "สุขภาพ": "#60a5fa",
  "การเงิน": "#f59e0b",
  "ผู้บริโภค": "#a78bfa",
  "พลังงาน": "#fb7185",
  "อื่นๆ": "#94a3b8"
};

export async function getPortfolio(): Promise<PortfolioData> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: authData } = await supabase.auth.getUser();
    
    if (!authData.user) {
      return { metrics: fallbackMetrics as any, allocation: fallbackAllocation as any, positions: [], isLive: false };
    }

    const { data: positionsData, error } = await supabase
      .from("positions")
      .select("*")
      .eq("user_id", authData.user.id);

    if (error || !positionsData) {
      return { metrics: fallbackMetrics as any, allocation: fallbackAllocation as any, positions: [], isLive: false };
    }

    if (positionsData.length === 0) {
      const emptyMetrics: PortfolioData["metrics"] = [
        { label: "มูลค่าพอร์ต", value: "$0.00", delta: "0%", tone: "neutral" },
        { label: "กำไร/ขาดทุนวันนี้", value: "$0.00", delta: "0%", tone: "neutral" },
        { label: "ผลตอบแทนรวม", value: "$0.00", delta: "0%", tone: "neutral" },
        { label: "เงินสดสำรอง", value: "$0.00", delta: "เงินสด 0%", tone: "neutral" },
        { label: "กำลังซื้อ", value: "$0.00", delta: "พร้อมใช้", tone: "neutral" }
      ];
      return { metrics: emptyMetrics, allocation: [], positions: [], isLive: true };
    }

    const finnhubKey = getFinnhubApiKey();
    if (!finnhubKey) {
      return { metrics: fallbackMetrics as any, allocation: fallbackAllocation as any, positions: [], isLive: false };
    }

    let totalValue = 0;
    let totalCost = 0;
    let dayGainTotal = 0;
    
    const allocationMap = new Map<string, number>();

    const positions: PortfolioPosition[] = await Promise.all(
      positionsData.map(async (pos) => {
        const quote = await fetchFinnhubQuote(pos.symbol, finnhubKey);
        const currentPrice = quote?.c ?? pos.average_cost;
        const previousClose = quote?.pc ?? pos.average_cost;
        
        const value = currentPrice * pos.shares;
        const cost = pos.average_cost * pos.shares;
        
        const dayGain = (currentPrice - previousClose) * pos.shares;
        const totalReturn = value - cost;
        
        totalValue += value;
        totalCost += cost;
        dayGainTotal += dayGain;
        
        const sector = SECTOR_MAP[pos.symbol] || "อื่นๆ";
        allocationMap.set(sector, (allocationMap.get(sector) || 0) + value);
        
        return {
          id: pos.id,
          symbol: pos.symbol,
          shares: pos.shares,
          average_cost: pos.average_cost,
          current_price: currentPrice,
          previous_close: previousClose,
          total_value: value,
          day_gain: dayGain,
          day_gain_percent: previousClose > 0 ? (currentPrice - previousClose) / previousClose : 0,
          total_return: totalReturn,
          total_return_percent: cost > 0 ? totalReturn / cost : 0,
        };
      })
    );

    const formatCurrency = (val: number) => 
      new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);
      
    const formatPercent = (val: number) => 
      `${val >= 0 ? "+" : ""}${(val * 100).toFixed(2)}%`;

    const metrics: PortfolioData["metrics"] = [
      { 
        label: "มูลค่าพอร์ต", 
        value: formatCurrency(totalValue), 
        delta: totalCost > 0 ? formatPercent((totalValue - totalCost) / totalCost) : "0%", 
        tone: totalValue >= totalCost ? "gain" : "loss"
      },
      { 
        label: "กำไร/ขาดทุนวันนี้", 
        value: `${dayGainTotal >= 0 ? "+" : ""}${formatCurrency(dayGainTotal)}`, 
        delta: totalValue - dayGainTotal > 0 ? formatPercent(dayGainTotal / (totalValue - dayGainTotal)) : "0%", 
        tone: dayGainTotal >= 0 ? "gain" : "loss"
      },
      { 
        label: "ผลตอบแทนรวม", 
        value: `${(totalValue - totalCost) >= 0 ? "+" : ""}${formatCurrency(totalValue - totalCost)}`, 
        delta: totalCost > 0 ? formatPercent((totalValue - totalCost) / totalCost) : "0%", 
        tone: (totalValue - totalCost) >= 0 ? "gain" : "loss"
      },
      { label: "เงินสดสำรอง", value: "$0.00", delta: "เงินสด 0%", tone: "neutral" },
      { label: "กำลังซื้อ", value: "$0.00", delta: "พร้อมใช้", tone: "neutral" }
    ];

    const allocation = Array.from(allocationMap.entries())
      .map(([name, val]) => ({
        name,
        value: totalValue > 0 ? Math.round((val / totalValue) * 100) : 0,
        color: SECTOR_COLORS[name] || SECTOR_COLORS["อื่นๆ"]
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);

    return { metrics, allocation, positions, isLive: true };
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    return { metrics: fallbackMetrics as any, allocation: fallbackAllocation as any, positions: [], isLive: false };
  }
}
