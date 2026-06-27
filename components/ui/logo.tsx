import * as React from "react";
import { cn } from "@/lib/utils";

export function AlphaEdgeLogo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={cn("shrink-0", className)}
    >
      {/* Background Glow Ring */}
      <circle cx="100" cy="100" r="90" fill="url(#bgGrad)" fillOpacity="0.1" />
      
      {/* The 'A' Shape */}
      <path 
        d="M50 160 L100 40 L150 160" 
        stroke="url(#aGrad)" 
        strokeWidth="20" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* The 'Edge' Trend Line replacing the crossbar */}
      <path 
        d="M70 120 L120 120 L170 45" 
        stroke="#10b981" 
        strokeWidth="22" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Trend Point / Glow */}
      <circle cx="170" cy="45" r="11" fill="#34d399" />
      <circle cx="170" cy="45" r="22" fill="#10b981" fillOpacity="0.3" />

      <defs>
        <linearGradient id="bgGrad" x1="10" y1="10" x2="190" y2="190" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#059669" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="aGrad" x1="50" y1="160" x2="150" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="1" stopColor="#71717a" />
        </linearGradient>
      </defs>
    </svg>
  );
}
