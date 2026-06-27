"use client";

import { useState } from "react";

export function StockLogo({ symbol, className = "h-8 w-8" }: { symbol: string, className?: string }) {
  const [error, setError] = useState(false);
  const cleanSymbol = symbol.trim().toUpperCase();

  if (error || !cleanSymbol) {
    return (
      <div 
        className={`flex shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-white font-medium border border-white/[0.05] ${className}`} 
        style={{ fontSize: '45%' }}
      >
        {cleanSymbol.slice(0, 2)}
      </div>
    );
  }

  return (
    <img
      src={`https://financialmodelingprep.com/image-stock/${cleanSymbol}.png`}
      alt={`${cleanSymbol} logo`}
      className={`shrink-0 rounded-full object-cover bg-white border border-white/[0.1] ${className}`}
      onError={() => setError(true)}
    />
  );
}
