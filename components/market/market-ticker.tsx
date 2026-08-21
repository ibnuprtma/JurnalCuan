"use client";

import * as React from "react";
import { TrendingUp, TrendingDown, Activity, Globe } from "lucide-react";

interface PairRate {
  symbol: string;
  name: string;
  rate: number;
  formatted: string;
  change24h?: number;
  direction: "UP" | "DOWN" | "NEUTRAL";
}

export function MarketTicker() {
  const [pairs, setPairs] = React.useState<PairRate[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchRates = React.useCallback(async () => {
    try {
      const res = await fetch("/api/market/rates", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.pairs) && data.pairs.length > 0) {
          setPairs(data.pairs);
        }
      }
    } catch (e) {
      console.warn("MarketTicker fetch warning:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 60000); // refresh data every 60s
    return () => clearInterval(interval);
  }, [fetchRates]);

  if (pairs.length === 0 && !isLoading) return null;

  // Duplicate pairs for continuous 100% seamless marquee loop
  const displayPairs = [...pairs, ...pairs];

  return (
    <div className="ticker-container relative w-full bg-[#060913] border-b border-slate-800/90 px-3 py-1.5 overflow-hidden flex items-center gap-2 text-xs select-none z-20">
      {/* Left Static Tag */}
      <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider flex-shrink-0 pr-3 border-r border-slate-800 bg-[#060913] z-10 shadow-lg">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
        <Activity className="h-3 w-3 text-emerald-400" />
        <span className="hidden sm:inline">Kurs Live</span>
      </div>

      {/* Subtle Gradient Fade Masks */}
      <div className="absolute left-20 sm:left-28 top-0 bottom-0 w-8 bg-gradient-to-r from-[#060913] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 sm:right-28 top-0 bottom-0 w-8 bg-gradient-to-l from-[#060913] to-transparent z-10 pointer-events-none" />

      {/* Auto-scrolling Continuous Marquee Track */}
      <div className="flex-1 overflow-hidden">
        <div className="animate-ticker-marquee py-0.5">
          {displayPairs.map((pair, idx) => {
            const isUp = pair.direction === "UP";
            return (
              <div
                key={`${pair.symbol}-${idx}`}
                className="inline-flex items-center gap-1.5 mx-3 px-2 py-0.5 rounded-lg bg-slate-900/40 hover:bg-slate-800/80 border border-slate-800/60 transition-all font-mono cursor-pointer"
                title={`${pair.name}: ${pair.formatted}`}
              >
                <span className="font-bold text-slate-200 text-[11px]">{pair.symbol}</span>
                <span className="text-white font-semibold text-[11px]">{pair.formatted}</span>
                {pair.change24h !== undefined && (
                  <span
                    className={`inline-flex items-center text-[10px] font-bold ${
                      isUp ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {isUp ? (
                      <TrendingUp className="h-2.5 w-2.5 mr-0.5 inline" />
                    ) : (
                      <TrendingDown className="h-2.5 w-2.5 mr-0.5 inline" />
                    )}
                    {isUp ? "+" : ""}
                    {pair.change24h}%
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Source Tag */}
      <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-500 flex-shrink-0 pl-3 border-l border-slate-800 bg-[#060913] z-10 font-mono">
        <Globe className="h-2.5 w-2.5 text-slate-400" />
        <span>ECB / Frankfurter</span>
      </div>
    </div>
  );
}
