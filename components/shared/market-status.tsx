"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export function MarketStatus() {
  const [isOpen, setIsOpen] = useState(false);
  const [statusText, setStatusText] = useState("Checking...");

  useEffect(() => {
    function checkMarketStatus() {
      // Create a date object for the current time in New York
      const nyTime = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
      const nyDate = new Date(nyTime);
      
      const day = nyDate.getDay();
      const hours = nyDate.getHours();
      const minutes = nyDate.getMinutes();
      
      const timeInMinutes = hours * 60 + minutes;
      const marketOpenMinutes = 9 * 60 + 30; // 9:30 AM
      const marketCloseMinutes = 16 * 60;    // 4:00 PM
      
      // Check if weekday
      if (day >= 1 && day <= 5) {
        if (timeInMinutes >= marketOpenMinutes && timeInMinutes < marketCloseMinutes) {
          setIsOpen(true);
          setStatusText("Market Open (Live)");
          return;
        }
      }
      
      setIsOpen(false);
      setStatusText("Market Closed");
    }

    checkMarketStatus();
    // Update status every minute
    const interval = setInterval(checkMarketStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors ${
      isOpen 
        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.1)]" 
        : "border-zinc-500/20 bg-white/[0.03] text-zinc-400"
    }`}>
      <Clock className="h-3 w-3" />
      {statusText}
      {isOpen && (
        <span className="relative flex h-2 w-2 ml-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      )}
    </div>
  );
}
