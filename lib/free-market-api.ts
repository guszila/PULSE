import {
  candleData as fallbackCandleData,
  fallbackDashboardData,
  fundamentals as fallbackFundamentals,
  indicators as fallbackIndicators,
  macro as fallbackMacro,
  marketOverview as fallbackMarketOverview,
  news as fallbackNews,
  supportResistance as fallbackSupportResistance,
  watchlist as fallbackWatchlist,
  type AlphaEdgeDashboardData,
  type CandlePoint,
  type DecisionSnapshot,
  type FundamentalItem,
  type IndicatorItem,
  type MacroItem,
  type MarketOverviewItem,
  type NewsItem,
  type SelectedStock,
  type SupportResistanceData,
  type WatchlistStock
} from "@/lib/market-data";

const WATCHLIST_SYMBOLS = ["AAPL", "MSFT", "NVDA", "AMZN", "META", "JPM", "LLY"];

type ProviderResult<T> = {
  data: T;
  source: string;
  live: boolean;
};

type FinnhubQuote = {
  c?: number;
  d?: number;
  dp?: number;
  h?: number;
  l?: number;
  o?: number;
  pc?: number;
  t?: number;
};

import { unstable_cache } from "next/cache";

export const getDashboardData = async (symbol: string = "AAPL", customSymbols?: string[]): Promise<AlphaEdgeDashboardData> => {
  const cacheKeySuffix = customSymbols?.length ? customSymbols.join("-") : "default-v2";
  const cachedFn = unstable_cache(
    async () => {
  const [watchlistResult, overviewResult, fundamentalResult, newsResult, macroResult, candleResult] = await Promise.all([
    getWatchlist(customSymbols),
    getMarketOverview(),
    getFundamentals(symbol),
    getNews(symbol),
    getMacro(),
    getCandles(symbol)
  ]);

  const selectedStock = getSelectedStock(symbol, watchlistResult.data, candleResult.data);
  const indicatorsResult = buildIndicators(candleResult.data);
  const supportResistanceResult = buildSupportResistance(candleResult.data, selectedStock.price);
  const decisionResult = buildDecisionSnapshot(supportResistanceResult, indicatorsResult);

  const liveSources = [watchlistResult, overviewResult, fundamentalResult, newsResult, macroResult, candleResult]
    .filter((result) => result.live)
    .map((result) => result.source);

  return {
    watchlist: watchlistResult.data,
    marketOverview: overviewResult.data,
    fundamentals: fundamentalResult.data,
    news: newsResult.data,
    macro: macroResult.data,
    selectedStock,
    candleData: candleResult.data,
    indicators: indicatorsResult,
    supportResistance: supportResistanceResult,
    decision: decisionResult,
    dataSource: liveSources.length > 0 ? Array.from(new Set(liveSources)).join(" + ") : fallbackDashboardData.dataSource,
    isLive: liveSources.length > 0,
    providerStatus: {
      stocksLive: watchlistResult.live && overviewResult.live,
      fundamentalsLive: fundamentalResult.live,
      newsLive: newsResult.live,
      macroLive: macroResult.live
    },
    updatedAt: new Date().toISOString()
  };
},
[`alphaedge-dashboard-data-${symbol}-${cacheKeySuffix}`],
{ revalidate: 300, tags: ["dashboard", symbol] }
);

  return cachedFn();
};

async function fetchJson<T>(url: string, revalidate = 300): Promise<T | null> {
  try {
    const response = await fetch(url, {
      next: { revalidate },
      headers: { Accept: "application/json" }
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as T;
    if (
      data &&
      typeof data === "object" &&
      ("code" in data || "error" in data || "Note" in data || "Error Message" in data)
    ) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

function finiteNumber(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function getCandles(symbol: string): Promise<ProviderResult<CandlePoint[]>> {
  const twelveDataKey = process.env.TWELVE_DATA_API_KEY;
  if (!twelveDataKey) {
    return { data: fallbackCandleData, source: "Mock fallback", live: false };
  }

  const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=220&apikey=${twelveDataKey}`;
  const data = await fetchJson<{ values?: Array<Record<string, unknown>> }>(url, 900);
  const values = data?.values;

  if (!values || values.length < 10) {
    return { data: fallbackCandleData, source: "Mock fallback", live: false };
  }

  const rows = values
    .slice()
    .reverse()
    .map((item, index) => ({
      x: index,
      time: typeof item.datetime === "string" ? item.datetime.slice(0, 10) : undefined,
      open: finiteNumber(item.open) ?? 0,
      high: finiteNumber(item.high) ?? 0,
      low: finiteNumber(item.low) ?? 0,
      close: finiteNumber(item.close) ?? 0,
      volume: finiteNumber(item.volume) ?? 0
    }))
    .filter((item) => item.open > 0 && item.high > 0 && item.low > 0 && item.close > 0);

  return rows.length >= 10
    ? { data: rows, source: "Twelve Data", live: true }
    : { data: fallbackCandleData, source: "Mock fallback", live: false };
}

function getSelectedStock(symbol: string, watchlist: WatchlistStock[], candles: CandlePoint[]): SelectedStock {
  const stock = watchlist.find((item) => item.symbol.toUpperCase() === symbol.toUpperCase());
  const latest = candles.at(-1) ?? fallbackCandleData.at(-1)!;
  const prev = candles.at(-2);
  const volume = latest.volume || (stock ? stock.volume : 0);
  const currentPrice = stock ? stock.price : latest.close;
  
  let change = stock ? stock.change : 0;
  if (!stock && prev && prev.close > 0) {
    change = ((latest.close - prev.close) / prev.close) * 100;
  }

  return {
    symbol: symbol.toUpperCase(),
    company: stock ? stock.company : symbol.toUpperCase(),
    price: currentPrice,
    change: change,
    open: latest.open,
    high: latest.high,
    low: latest.low,
    close: latest.close,
    volume
  };
}

async function getWatchlist(customSymbols?: string[]): Promise<ProviderResult<WatchlistStock[]>> {
  const symbolsToFetch = customSymbols?.length ? customSymbols : WATCHLIST_SYMBOLS;
  const finnhubKey = getFinnhubApiKey();
  if (!finnhubKey) {
    return { data: fallbackWatchlist, source: "Mock fallback", live: false };
  }

  const quotes = await Promise.all(
    symbolsToFetch.map(async (symbol) => ({
      symbol,
      quote: await fetchFinnhubQuote(symbol, finnhubKey)
    }))
  );

  const rows = quotes
    .map(({ symbol, quote }) => {
      const fallback = fallbackWatchlist.find((stock) => stock.symbol === symbol);
      const price = finiteNumber(quote?.c);
      if (!quote || price === null || price <= 0) {
        return fallback || null;
      }

      return {
        symbol,
        company: fallback?.company || symbol,
        price,
        change: finiteNumber(quote.dp) ?? (fallback?.change || 0),
        volume: fallback?.volume || 0,
        marketCap: fallback?.marketCap || 0
      };
    })
    .filter(Boolean) as WatchlistStock[];

  const liveCount = rows.filter(
    (row) => row.price !== fallbackWatchlist.find((stock) => stock.symbol === row.symbol)?.price
  ).length;

  return liveCount > 0
    ? { data: rows, source: "Finnhub", live: true }
    : { data: fallbackWatchlist, source: "Mock fallback", live: false };
}

async function getMarketOverview(): Promise<ProviderResult<MarketOverviewItem[]>> {
  const finnhubKey = getFinnhubApiKey();
  if (!finnhubKey) {
    return { data: fallbackMarketOverview, source: "Mock fallback", live: false };
  }

  const labels = [
    { symbol: "SPY", name: "S&P 500" },
    { symbol: "QQQ", name: "NASDAQ" },
    { symbol: "GLD", name: "Gold" },
    { symbol: "USO", name: "Crude Oil" }
  ];

  const quotes = await Promise.all(
    labels.map(async (item) => ({
      ...item,
      quote: await fetchFinnhubQuote(item.symbol, finnhubKey)
    }))
  );

  const mappedRows = quotes.map(({ name, quote }) => {
    const fallback = fallbackMarketOverview.find((item) => item.name === name);
    const price = finiteNumber(quote?.c);
    const hasLivePrice = price !== null && price > 0;
    return {
      row: {
        name,
        value: hasLivePrice ? price.toFixed(2) : fallback?.value ?? "0",
        change: finiteNumber(quote?.dp) ?? fallback?.change ?? 0
      },
      hasLivePrice
    };
  });

  const rows = mappedRows.map((item) => item.row);
  const hasLiveOverview = mappedRows.some((item) => item.hasLivePrice);

  return hasLiveOverview
    ? {
        data: rows,
        source: "Finnhub",
        live: true
      }
    : { data: fallbackMarketOverview, source: "Mock fallback", live: false };
}

export async function fetchFinnhubQuote(symbol: string, token: string) {
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`;
  return fetchJson<FinnhubQuote>(url, 300);
}

export function getFinnhubApiKey() {
  return process.env.FINNHUB_API_KEY || process.env.TWELVE_DATA_API_KEY;
}

async function getFundamentals(symbol: string): Promise<ProviderResult<FundamentalItem[]>> {
  const fmpKey = process.env.FMP_API_KEY;
  if (!fmpKey) {
    return { data: fallbackFundamentals, source: "Mock fallback", live: false };
  }

  const [quote, profile, ratios, metrics] = await Promise.all([
    fetchFmp<Array<Record<string, unknown>>>(`quote?symbol=${symbol}`, fmpKey, 1800),
    fetchFmp<Array<Record<string, unknown>>>(`profile?symbol=${symbol}`, fmpKey, 3600),
    fetchFmp<Array<Record<string, unknown>>>(`ratios-ttm?symbol=${symbol}`, fmpKey, 3600),
    fetchFmp<Array<Record<string, unknown>>>(`key-metrics-ttm?symbol=${symbol}`, fmpKey, 3600)
  ]);

  const quoteRow = quote?.[0];
  const profileRow = profile?.[0];
  const ratioRow = ratios?.[0];
  const metricRow = metrics?.[0];
  if (!quoteRow && !profileRow && !ratioRow && !metricRow) {
    return { data: fallbackFundamentals, source: "Mock fallback", live: false };
  }

  const fallbackMap = new Map(fallbackFundamentals);
  const rows: FundamentalItem[] = [
    ["มูลค่าตลาด", formatCompactCurrency(readField(profileRow, quoteRow, "marketCap", "mktCap")) || fallbackMap.get("มูลค่าตลาด") || "N/A"],
    ["PE", formatPositiveRatio(readField(quoteRow, profileRow, "pe", "peRatioTTM")) || fallbackMap.get("PE") || "N/A"],
    ["Forward PE", fallbackMap.get("Forward PE") || "N/A"],
    ["PEG", formatPositiveRatio(readField(ratioRow, "priceEarningsToGrowthRatioTTM", "pegRatioTTM")) || fallbackMap.get("PEG") || "N/A"],
    ["EPS", formatPositiveCurrency(readField(quoteRow, profileRow, "eps", "epsTTM")) || fallbackMap.get("EPS") || "N/A"],
    [
      "รายได้",
      formatCompactCurrency(readField(metricRow, profileRow, "revenuePerShareTTM", "revenueTTM")) ||
        fallbackMap.get("รายได้") ||
        "N/A"
    ],
    ["อัตรากำไรขั้นต้น", formatPercent(readField(ratioRow, "grossProfitMarginTTM", "grossMarginTTM")) || fallbackMap.get("อัตรากำไรขั้นต้น") || "N/A"],
    [
      "อัตรากำไรดำเนินงาน",
      formatPercent(readField(ratioRow, "operatingProfitMarginTTM", "operatingMarginTTM")) ||
        fallbackMap.get("อัตรากำไรดำเนินงาน") ||
        "N/A"
    ],
    ["อัตรากำไรสุทธิ", formatPercent(readField(ratioRow, "netProfitMarginTTM", "netMarginTTM")) || fallbackMap.get("อัตรากำไรสุทธิ") || "N/A"],
    ["ROE", formatPercent(readField(ratioRow, "returnOnEquityTTM", "roeTTM")) || fallbackMap.get("ROE") || "N/A"],
    ["ROA", formatPercent(readField(ratioRow, "returnOnAssetsTTM", "roaTTM")) || fallbackMap.get("ROA") || "N/A"],
    ["หนี้สินต่อทุน", formatRatio(readField(ratioRow, "debtEquityRatioTTM", "debtToEquityTTM")) || fallbackMap.get("หนี้สินต่อทุน") || "N/A"],
    [
      "กระแสเงินสดอิสระ",
      formatCompactCurrency(readField(metricRow, "freeCashFlowPerShareTTM", "freeCashFlowTTM")) ||
        fallbackMap.get("กระแสเงินสดอิสระ") ||
        "N/A"
    ],
    ["เงินปันผลตอบแทน", formatPercent(readField(ratioRow, "dividendYielTTM", "dividendYieldTTM")) || fallbackMap.get("เงินปันผลตอบแทน") || "N/A"]
  ];

  return { data: rows, source: "FMP", live: true };
}

async function getNews(symbol: string): Promise<ProviderResult<NewsItem[]>> {
  const fmpKey = process.env.FMP_API_KEY;
  if (fmpKey) {
    const data =
      (await fetchFmp<Array<Record<string, unknown>>>(`news/stock?symbols=${symbol}&page=0&limit=3`, fmpKey, 900)) ??
      (await fetchFmp<Array<Record<string, unknown>>>("news/stock-latest?page=0&limit=20", fmpKey, 900));
    const rows = mapFmpNews(symbol, data);

    if (rows.length > 0) {
      return { data: rows, source: "FMP", live: true };
    }
  }

  const finnhubRows = await getFinnhubNews(symbol);
  if (finnhubRows.length > 0) {
    return { data: finnhubRows, source: "Finnhub", live: true };
  }

  return { data: fallbackNews, source: "Mock fallback", live: false };
}

function mapFmpNews(symbol: string, data: Array<Record<string, unknown>> | null) {
  if (!data || data.length === 0) {
    return [];
  }

  const symbolNews = data.filter((item) => {
    const symbols = String(item.symbols ?? item.symbol ?? item.ticker ?? "");
    return symbols.length === 0 || symbols.toUpperCase().includes(symbol);
  });

  return (symbolNews.length > 0 ? symbolNews : data).slice(0, 3).map((item) => ({
    headline: String(item.title ?? "Market update"),
    summary: String(item.text ?? item.snippet ?? item.summary ?? "No summary available.").slice(0, 180),
    sentiment: "Neutral" as const,
    source: String(item.site ?? item.publisher ?? item.source ?? "FMP"),
    time: formatRelativeTime(String(item.publishedDate ?? item.date ?? "")),
    url: typeof item.url === "string" ? item.url : typeof item.link === "string" ? item.link : undefined
  }));
}

async function getFinnhubNews(symbol: string) {
  const finnhubKey = getFinnhubApiKey();
  if (!finnhubKey) {
    return [];
  }

  const to = new Date();
  const from = new Date(to);
  from.setDate(to.getDate() - 14);

  const data = await fetchJson<Array<Record<string, unknown>>>(
    `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${formatDate(from)}&to=${formatDate(to)}&token=${finnhubKey}`,
    900
  );

  if (!data || data.length === 0) {
    return [];
  }

  return data.slice(0, 3).map((item) => ({
    headline: String(item.headline ?? "Market update"),
    summary: String(item.summary ?? "No summary available.").slice(0, 180),
    sentiment: "Neutral" as const,
    source: String(item.source ?? "Finnhub"),
    time: formatRelativeTime(typeof item.datetime === "number" ? new Date(item.datetime * 1000).toISOString() : ""),
    url: typeof item.url === "string" ? item.url : undefined
  }));
}

function fetchFmp<T>(path: string, apiKey: string, revalidate: number) {
  const joiner = path.includes("?") ? "&" : "?";
  return fetchJson<T>(`https://financialmodelingprep.com/stable/${path}${joiner}apikey=${apiKey}`, revalidate);
}

function readField(...args: Array<Record<string, unknown> | string | undefined>) {
  const records = args.filter((arg): arg is Record<string, unknown> => Boolean(arg) && typeof arg === "object");
  const fields = args.filter((arg): arg is string => typeof arg === "string");

  for (const record of records) {
    for (const field of fields) {
      if (record[field] !== undefined && record[field] !== null) {
        return record[field];
      }
    }
  }

  return null;
}

async function getMacro(): Promise<ProviderResult<MacroItem[]>> {
  const [crypto, fred] = await Promise.all([getCryptoMacro(), getFredMacro()]);
  const merged = [...crypto.data, ...fred.data];

  if (crypto.live || fred.live) {
    const seen = new Set<string>();
    const data = [...merged, ...fallbackMacro].filter((item) => {
      if (seen.has(item.label)) {
        return false;
      }
      seen.add(item.label);
      return true;
    });

    return {
      data,
      source: [crypto.live ? crypto.source : null, fred.live ? fred.source : null].filter(Boolean).join(" + "),
      live: true
    };
  }

  return { data: fallbackMacro, source: "Mock fallback", live: false };
}

async function getCryptoMacro(): Promise<ProviderResult<MacroItem[]>> {
  const data = await fetchJson<Record<string, { usd: number; usd_24h_change?: number }>>(
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true",
    120
  );

  if (!data) {
    return { data: [], source: "Mock fallback", live: false };
  }

  return {
    data: [
      { label: "BTC", value: formatCurrency(data.bitcoin?.usd), change: data.bitcoin?.usd_24h_change ?? 0 },
      { label: "ETH", value: formatCurrency(data.ethereum?.usd), change: data.ethereum?.usd_24h_change ?? 0 }
    ],
    source: "CoinGecko",
    live: true
  };
}

async function getFredMacro(): Promise<ProviderResult<MacroItem[]>> {
  const fredKey = process.env.FRED_API_KEY;
  if (!fredKey) {
    return { data: [], source: "Mock fallback", live: false };
  }

  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=DGS10&api_key=${fredKey}&file_type=json&sort_order=desc&limit=2`;
  const data = await fetchJson<{ observations?: Array<{ value: string }> }>(url, 3600);
  const value = finiteNumber(data?.observations?.[0]?.value);
  const previous = finiteNumber(data?.observations?.[1]?.value);
  if (value === null) {
    return { data: [], source: "Mock fallback", live: false };
  }

  return {
    data: [{ label: "US10Y", value: `${value.toFixed(2)}%`, change: previous === null ? 0 : value - previous }],
    source: "FRED",
    live: true
  };
}

function buildIndicators(candles: CandlePoint[]): IndicatorItem[] {
  if (candles.length < 20) {
    return fallbackIndicators;
  }

  const closes = candles.map((item) => item.close);
  const volumes = candles.map((item) => item.volume);
  const latestClose = closes.at(-1) ?? 0;
  const ema20 = ema(closes, 20);
  const ema50 = ema(closes, 50);
  const ema200 = ema(closes, 200);
  const rsi14 = rsi(closes, 14);
  const macdValue = macd(closes);
  const atr14 = atr(candles, 14);
  const avgVolume = average(volumes.slice(-20));
  const latestVolume = volumes.at(-1) ?? 0;
  const volumeRatio = avgVolume > 0 ? latestVolume / avgVolume : 1;
  const trendScore = scoreTrend(latestClose, ema20, ema50, ema200, rsi14, macdValue);

  return [
    { label: "RSI", value: formatIndicatorNumber(rsi14), state: rsi14 >= 70 ? "ซื้อมากเกินไป" : rsi14 <= 30 ? "ขายมากเกินไป" : rsi14 >= 55 ? "เอนเอียงบวก" : "กลาง" },
    { label: "MACD", value: signed(macdValue), state: macdValue >= 0 ? "ขาขึ้น" : "ขาลง" },
    { label: "EMA20", value: formatCurrency(ema20), state: latestClose >= ema20 ? "อยู่เหนือ" : "อยู่ใต้" },
    { label: "EMA50", value: formatCurrency(ema50), state: latestClose >= ema50 ? "อยู่เหนือ" : "อยู่ใต้" },
    { label: "EMA200", value: formatCurrency(ema200), state: latestClose >= ema200 ? "อยู่เหนือ" : "อยู่ใต้" },
    { label: "VWAP", value: formatCurrency(vwap(candles.slice(-20))), state: "ประมาณ 20 วัน" },
    { label: "ATR", value: formatIndicatorNumber(atr14), state: atr14 > latestClose * 0.035 ? "ผันผวนสูง" : "ปกติ" },
    { label: "ADX", value: formatIndicatorNumber(estimateAdx(candles)), state: "ประมาณการ" },
    { label: "Volume", value: `${volumeRatio.toFixed(2)}x`, state: volumeRatio >= 1.15 ? "ยืนยันด้วยวอลุ่ม" : "วอลุ่มเบา" },
    { label: "ความแข็งแรงเทรนด์", value: `${trendScore}/100`, state: trendScore >= 70 ? "แข็งแรง" : trendScore >= 45 ? "ปานกลาง" : "อ่อน" }
  ];
}

function buildSupportResistance(candles: CandlePoint[], currentPrice: number): SupportResistanceData {
  if (candles.length < 10 || currentPrice <= 0) {
    return fallbackSupportResistance;
  }

  const recent = candles.slice(-80);
  const lows = recent.map((item) => item.low).sort((a, b) => a - b);
  const highs = recent.map((item) => item.high).sort((a, b) => a - b);
  const support = nearestBelow(lows, currentPrice) ?? percentile(lows, 0.25);
  const strongSupport = percentile(lows, 0.1);
  const resistance = nearestAbove(highs, currentPrice) ?? percentile(highs, 0.75);
  const strongResistance = percentile(highs, 0.9);
  const risk = Math.max(0.01, currentPrice - support);
  const reward = Math.max(0.01, resistance - currentPrice);
  const touches = recent.filter(
    (item) => Math.abs(item.low - support) / support < 0.015 || Math.abs(item.high - resistance) / resistance < 0.015
  ).length;
  const latestClose = recent.at(-1)?.close ?? currentPrice;
  const priorClose = recent.at(-20)?.close ?? recent[0]?.close ?? currentPrice;
  const trendDirection = latestClose >= priorClose ? "ขาขึ้น" : "ขาลง";
  const breakoutProbability = Math.max(25, Math.min(78, Math.round(50 + ((latestClose - priorClose) / priorClose) * 400))).toString();

  return {
    strongSupport: roundPrice(strongSupport),
    support: roundPrice(support),
    currentPrice: roundPrice(currentPrice),
    resistance: roundPrice(resistance),
    strongResistance: roundPrice(strongResistance),
    distanceToSupport: percentDistance(support, currentPrice),
    distanceToResistance: percentDistance(resistance, currentPrice),
    riskReward: `${(reward / risk).toFixed(1)} : 1`,
    breakoutLevel: formatCurrency(resistance * 1.003),
    breakdownLevel: formatCurrency(support * 0.997),
    touches,
    volumeConfirmation: isVolumeConfirmed(recent) ? "สูง" : "ปานกลาง",
    trendDirection,
    breakoutProbability: `${breakoutProbability}%`,
    suggestedEntry: `${formatCurrency(currentPrice * 0.992)} - ${formatCurrency(currentPrice * 1.004)}`,
    stopLoss: formatCurrency(support * 0.99),
    takeProfit: formatCurrency(strongResistance)
  };
}

function buildDecisionSnapshot(supportResistance: SupportResistanceData, indicators: IndicatorItem[]): DecisionSnapshot {
  const trendStrength = Number.parseInt(indicators.find((item) => item.label === "Trend Strength")?.value ?? "50", 10);
  const volumeConfirmed = supportResistance.volumeConfirmation === "สูง" || supportResistance.volumeConfirmation === "High";
  const bullishTrend = supportResistance.trendDirection === "ขาขึ้น" || supportResistance.trendDirection === "Bullish";
  const score = Math.max(20, Math.min(92, trendStrength + (volumeConfirmed ? 6 : -2) + (bullishTrend ? 4 : -10)));
  const bias = score >= 68 ? "Bullish" : score <= 42 ? "Bearish" : "Neutral";
  const riskLevel = score >= 70 && volumeConfirmed ? "Medium" : score < 45 ? "High" : "Medium";

  return {
    bias,
    actionLabel: bias === "Bullish" ? "Watch for pullback entry" : bias === "Bearish" ? "Avoid new buys" : "Wait for confirmation",
    score,
    confidence: score >= 75 ? "High" : score >= 55 ? "Moderate" : "Low",
    riskLevel,
    entryPlan: `พิจารณาโซน ${supportResistance.suggestedEntry} ถ้าราคายังยืนเหนือแนวรับ $${supportResistance.support}`,
    invalidation: `แผนอ่อนลงหากหลุด ${supportResistance.breakdownLevel} หรือ breakout แต่ไม่มีวอลุ่ม`,
    nextTrigger: `อยากเห็นราคาปิดเหนือ ${supportResistance.breakoutLevel} พร้อมวอลุ่มที่แข็งแรงขึ้น`,
    note: "ใช้เป็นบริบทวิเคราะห์เท่านั้น ไม่ใช่คำแนะนำการลงทุน ควรกำหนดขนาดสถานะและความเสี่ยงส่วนตัวก่อนทุกครั้ง"
  };
}

function formatCurrency(value: unknown) {
  const number = finiteNumber(value);
  if (number === null) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: number > 1000 ? 0 : 2
  }).format(number);
}

function formatCompactCurrency(value: unknown) {
  const number = finiteNumber(value);
  if (number === null || number === 0) {
    return null;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1
  }).format(number);
}

function formatRatio(value: unknown) {
  const number = finiteNumber(value);
  return number === null ? null : number.toFixed(2);
}

function formatPositiveRatio(value: unknown) {
  const number = finiteNumber(value);
  return number === null || number <= 0 ? null : number.toFixed(2);
}

function formatPositiveCurrency(value: unknown) {
  const number = finiteNumber(value);
  return number === null || number <= 0 ? null : formatCurrency(number);
}

function formatPercent(value: unknown) {
  const number = finiteNumber(value);
  if (number === null) {
    return null;
  }

  const percentage = Math.abs(number) <= 1 ? number * 100 : number;
  return `${percentage.toFixed(2)}%`;
}

function formatRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "ล่าสุด";
  }

  const formattedDate = date.toLocaleString('th-TH', { 
    day: 'numeric', 
    month: 'short', 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const minutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));
  if (minutes < 60) {
    return `${minutes} นาทีที่แล้ว (${formattedDate})`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours} ชั่วโมงที่แล้ว (${formattedDate})`;
  }

  return `${Math.round(hours / 24)} วันที่แล้ว (${formattedDate})`;
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function ema(values: number[], period: number) {
  if (values.length === 0) {
    return 0;
  }

  const multiplier = 2 / (period + 1);
  return values.reduce((previous, value, index) => (index === 0 ? value : value * multiplier + previous * (1 - multiplier)), values[0]);
}

function rsi(values: number[], period: number) {
  if (values.length <= period) {
    return 50;
  }

  let gains = 0;
  let losses = 0;
  const window = values.slice(-period - 1);

  for (let index = 1; index < window.length; index += 1) {
    const change = window[index] - window[index - 1];
    if (change >= 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }

  if (losses === 0) {
    return 100;
  }

  const rs = gains / losses;
  return 100 - 100 / (1 + rs);
}

function macd(values: number[]) {
  return ema(values, 12) - ema(values, 26);
}

function atr(candles: CandlePoint[], period: number) {
  const recent = candles.slice(-period - 1);
  const ranges = recent.slice(1).map((candle, index) => {
    const previousClose = recent[index].close;
    return Math.max(candle.high - candle.low, Math.abs(candle.high - previousClose), Math.abs(candle.low - previousClose));
  });

  return average(ranges);
}

function vwap(candles: CandlePoint[]) {
  const totalVolume = candles.reduce((sum, candle) => sum + candle.volume, 0);
  if (totalVolume <= 0) {
    return candles.at(-1)?.close ?? 0;
  }

  return candles.reduce((sum, candle) => sum + ((candle.high + candle.low + candle.close) / 3) * candle.volume, 0) / totalVolume;
}

function estimateAdx(candles: CandlePoint[]) {
  const recent = candles.slice(-20);
  if (recent.length < 2) {
    return 20;
  }

  const first = recent[0].close;
  const last = recent.at(-1)?.close ?? first;
  const volatility = atr(recent, Math.min(14, recent.length - 1));
  return Math.max(10, Math.min(55, (Math.abs(last - first) / Math.max(volatility, 0.01)) * 8));
}

function average(values: number[]) {
  const valid = values.filter((value) => Number.isFinite(value));
  return valid.length === 0 ? 0 : valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function scoreTrend(close: number, ema20: number, ema50: number, ema200: number, rsiValue: number, macdValue: number) {
  let score = 40;
  if (close > ema20) score += 12;
  if (close > ema50) score += 12;
  if (close > ema200) score += 12;
  if (ema20 > ema50) score += 8;
  if (rsiValue > 55) score += 8;
  if (macdValue > 0) score += 8;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function nearestBelow(values: number[], target: number) {
  return values.filter((value) => value < target).at(-1) ?? null;
}

function nearestAbove(values: number[], target: number) {
  return values.find((value) => value > target) ?? null;
}

function percentile(sortedValues: number[], percentileValue: number) {
  if (sortedValues.length === 0) {
    return 0;
  }

  const index = Math.max(0, Math.min(sortedValues.length - 1, Math.round((sortedValues.length - 1) * percentileValue)));
  return sortedValues[index];
}

function percentDistance(level: number, price: number) {
  const distance = ((level - price) / price) * 100;
  return `${distance >= 0 ? "+" : ""}${distance.toFixed(2)}%`;
}

function roundPrice(value: number) {
  return Number(value.toFixed(2));
}

function isVolumeConfirmed(candles: CandlePoint[]) {
  const latest = candles.at(-1)?.volume ?? 0;
  return latest > average(candles.slice(-20).map((item) => item.volume)) * 1.1;
}

function signed(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;
}

function formatIndicatorNumber(value: number) {
  return Number.isFinite(value) ? value.toFixed(1) : "N/A";
}
