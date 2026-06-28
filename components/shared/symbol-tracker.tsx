"use client";

import { useEffect } from "react";

export function SymbolTracker({ symbol }: { symbol: string }) {
  useEffect(() => {
    if (symbol) {
      document.cookie = `pulse-symbol=${symbol}; path=/; max-age=31536000`;
    }
  }, [symbol]);

  return null;
}
