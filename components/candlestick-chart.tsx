"use client";

import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  LineStyle,
  createChart,
  type CandlestickData,
  type HistogramData,
  type Time
} from "lightweight-charts";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CandlePoint, SupportResistanceData } from "@/lib/market-data";
import { formatCompact, formatCurrency } from "@/lib/utils";

type HoverCandle = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export function CandlestickChart({
  data,
  supportResistance,
  symbol,
  theme = "dark"
}: {
  data: CandlePoint[];
  supportResistance: SupportResistanceData;
  symbol: string;
  theme?: "dark" | "light";
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoverCandle, setHoverCandle] = useState<HoverCandle | null>(null);

  const chartData = useMemo(() => normalizeCandles(data), [data]);
  const latest = hoverCandle ?? chartData.latest;
  const previousClose = chartData.candles.at(-2)?.close ?? supportResistance.currentPrice;
  const chartChange = ((supportResistance.currentPrice - previousClose) / previousClose) * 100;
  const isLight = theme === "light";
  const chartColors = useMemo(
    () =>
      isLight
        ? {
            background: "#ffffff",
            text: "rgba(39,39,42,0.66)",
            grid: "rgba(24,24,27,0.075)",
            crosshair: "rgba(24,24,27,0.28)",
            label: "#f4f4f5",
            border: "rgba(24,24,27,0.1)",
            current: "rgba(24,24,27,0.68)"
          }
        : {
            background: "#090d0c",
            text: "rgba(244,244,245,0.62)",
            grid: "rgba(255,255,255,0.055)",
            crosshair: "rgba(255,255,255,0.25)",
            label: "#111827",
            border: "rgba(255,255,255,0.08)",
            current: "rgba(255,255,255,0.75)"
          },
    [isLight]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || chartData.candles.length === 0) {
      return;
    }

    const chart = createChart(container, {
      autoSize: true,
      height: 360,
      layout: {
        background: { type: ColorType.Solid, color: chartColors.background },
        textColor: chartColors.text,
        fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
      },
      grid: {
        vertLines: { color: chartColors.grid },
        horzLines: { color: chartColors.grid }
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: chartColors.crosshair,
          labelBackgroundColor: chartColors.label
        },
        horzLine: {
          color: chartColors.crosshair,
          labelBackgroundColor: chartColors.label
        }
      },
      rightPriceScale: {
        borderColor: chartColors.border,
        scaleMargins: { top: 0.08, bottom: 0.26 }
      },
      timeScale: {
        borderColor: chartColors.border,
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 6,
        barSpacing: 7,
        fixLeftEdge: true
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true
      },
      localization: {
        priceFormatter: (price: number) => formatCurrency(price)
      }
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#2dd4bf",
      downColor: "#fb7185",
      borderUpColor: "#2dd4bf",
      borderDownColor: "#fb7185",
      wickUpColor: "#5eead4",
      wickDownColor: "#fda4af",
      priceLineVisible: false,
      lastValueVisible: true
    });

    candleSeries.setData(chartData.candles);
    candleSeries.createPriceLine({
      price: supportResistance.currentPrice,
      color: chartColors.current,
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      title: "Current"
    });
    candleSeries.createPriceLine({
      price: supportResistance.support,
      color: "#2dd4bf",
      lineWidth: 1,
      lineStyle: LineStyle.Dotted,
      axisLabelVisible: true,
      title: "Support"
    });
    candleSeries.createPriceLine({
      price: supportResistance.resistance,
      color: "#fb7185",
      lineWidth: 1,
      lineStyle: LineStyle.Dotted,
      axisLabelVisible: true,
      title: "Resistance"
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
      lastValueVisible: false,
      priceLineVisible: false
    });

    volumeSeries.setData(chartData.volume);
    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
      borderVisible: false
    });

    chart.timeScale().fitContent();

    chart.subscribeCrosshairMove((param) => {
      const point = param.seriesData.get(candleSeries) as CandlestickData<Time> | undefined;
      if (!point) {
        setHoverCandle(null);
        return;
      }

      const volume = chartData.volumeByTime.get(String(point.time)) ?? 0;
      setHoverCandle({
        open: point.open,
        high: point.high,
        low: point.low,
        close: point.close,
        volume
      });
    });

    return () => {
      chart.remove();
    };
  }, [chartColors, chartData, supportResistance]);

  return (
    <div className="relative w-full min-w-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#090d0c]">
      <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-2xl border border-white/[0.08] bg-black/45 px-2.5 py-2 backdrop-blur sm:left-4 sm:top-4 sm:px-3">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="font-medium text-zinc-100">{symbol}</span>
          <span className={chartChange >= 0 ? "text-emerald-300" : "text-red-300"}>
            {chartChange >= 0 ? "+" : ""}
            {chartChange.toFixed(2)}%
          </span>
        </div>
        {latest && (
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-zinc-500 min-[390px]:grid-cols-3 sm:grid-cols-6 sm:text-[11px]">
            <OhlcLabel label="O" value={formatCurrency(latest.open)} />
            <OhlcLabel label="H" value={formatCurrency(latest.high)} />
            <OhlcLabel label="L" value={formatCurrency(latest.low)} />
            <OhlcLabel label="C" value={formatCurrency(latest.close)} />
            <OhlcLabel label="Vol" value={formatCompact(latest.volume)} />
            <OhlcLabel label="R" value={`$${supportResistance.resistance}`} />
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-10 flex flex-wrap gap-1.5 text-[10px] text-zinc-500 sm:left-4 sm:right-auto sm:gap-2 sm:text-[11px]">
        <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-emerald-200">
          แนวรับ ${supportResistance.support}
        </span>
        <span className="rounded-full border border-red-300/20 bg-red-300/10 px-2.5 py-1 text-red-200">
          แนวต้าน ${supportResistance.resistance}
        </span>
        <span className="hidden rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 sm:inline-flex">
          ลากเพื่อเลื่อน บีบหรือเลื่อนเมาส์เพื่อซูม
        </span>
      </div>

      <div ref={containerRef} className="h-[360px] w-full sm:h-[420px]" />
      <div className="border-t border-white/[0.06] px-3 py-2 text-[10px] text-zinc-600 sm:px-4 sm:text-[11px]">
        กราฟโต้ตอบได้ ใช้ TradingView Lightweight Charts
      </div>
    </div>
  );
}

function OhlcLabel({ label, value }: { label: string; value: string }) {
  return (
    <span>
      {label} <span className="text-zinc-300">{value}</span>
    </span>
  );
}

function normalizeCandles(data: CandlePoint[]) {
  const baseDate = new Date(Date.UTC(2025, 0, 2));
  const candles: CandlestickData<Time>[] = [];
  const volume: HistogramData<Time>[] = [];
  const volumeByTime = new Map<string, number>();

  data.forEach((candle, index) => {
    const time = candle.time ?? businessDayFromOffset(baseDate, index);
    candles.push({
      time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close
    });
    volume.push({
      time,
      value: candle.volume,
      color: candle.close >= candle.open ? "rgba(45, 212, 191, 0.28)" : "rgba(251, 113, 133, 0.28)"
    });
    volumeByTime.set(String(time), candle.volume);
  });

  return {
    candles,
    volume,
    volumeByTime,
    latest: data.at(-1) ?? null
  };
}

function businessDayFromOffset(baseDate: Date, offset: number) {
  const date = new Date(baseDate);
  let remaining = offset;

  while (remaining > 0) {
    date.setUTCDate(date.getUTCDate() + 1);
    const day = date.getUTCDay();
    if (day !== 0 && day !== 6) {
      remaining -= 1;
    }
  }

  return date.toISOString().slice(0, 10);
}
