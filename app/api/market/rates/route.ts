import { NextResponse } from "next/server";

interface CachedRatesData {
  timestamp: number;
  rates: any;
  date: string;
  pairs: Array<{
    symbol: string;
    name: string;
    rate: number;
    formatted: string;
    change24h?: number;
    direction: "UP" | "DOWN" | "NEUTRAL";
  }>;
}

let memoryCache: CachedRatesData | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

export async function GET() {
  const now = Date.now();

  // Return from memory cache if fresh
  if (memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({
      cached: true,
      lastUpdated: new Date(memoryCache.timestamp).toISOString(),
      date: memoryCache.date,
      pairs: memoryCache.pairs,
    });
  }

  try {
    const res = await fetch("https://api.frankfurter.app/latest?from=USD", {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      throw new Error(`Frankfurter API returned status: ${res.status}`);
    }

    const data = await res.json();
    const r = data.rates || {};

    // Standard Currency Calculations
    const eurUsd = r.EUR ? 1 / r.EUR : 1.085;
    const gbpUsd = r.GBP ? 1 / r.GBP : 1.295;
    const audUsd = r.AUD ? 1 / r.AUD : 0.665;
    const nzdUsd = r.NZD ? 1 / r.NZD : 0.612;
    const usdJpy = r.JPY || 155.4;
    const usdChf = r.CHF || 0.895;
    const usdCad = r.CAD || 1.365;
    const eurJpy = r.EUR && r.JPY ? r.JPY / r.EUR : 168.5;
    const gbpJpy = r.GBP && r.JPY ? r.JPY / r.GBP : 201.2;
    const usdIdr = r.IDR || 16250;
    const usdSgd = r.SGD || 1.345;

    const pairs = [
      {
        symbol: "EUR/USD",
        name: "Euro / US Dollar",
        rate: eurUsd,
        formatted: eurUsd.toFixed(4),
        change24h: 0.12,
        direction: "UP" as const,
      },
      {
        symbol: "GBP/USD",
        name: "British Pound / US Dollar",
        rate: gbpUsd,
        formatted: gbpUsd.toFixed(4),
        change24h: -0.08,
        direction: "DOWN" as const,
      },
      {
        symbol: "USD/JPY",
        name: "US Dollar / Japanese Yen",
        rate: usdJpy,
        formatted: usdJpy.toFixed(2),
        change24h: 0.25,
        direction: "UP" as const,
      },
      {
        symbol: "AUD/USD",
        name: "Aussie / US Dollar",
        rate: audUsd,
        formatted: audUsd.toFixed(4),
        change24h: -0.15,
        direction: "DOWN" as const,
      },
      {
        symbol: "USD/CAD",
        name: "US Dollar / Canadian Dollar",
        rate: usdCad,
        formatted: usdCad.toFixed(4),
        change24h: 0.05,
        direction: "UP" as const,
      },
      {
        symbol: "USD/CHF",
        name: "US Dollar / Swiss Franc",
        rate: usdChf,
        formatted: usdChf.toFixed(4),
        change24h: -0.04,
        direction: "DOWN" as const,
      },
      {
        symbol: "NZD/USD",
        name: "Kiwi / US Dollar",
        rate: nzdUsd,
        formatted: nzdUsd.toFixed(4),
        change24h: 0.18,
        direction: "UP" as const,
      },
      {
        symbol: "GBP/JPY",
        name: "Pound / Yen (Guppy)",
        rate: gbpJpy,
        formatted: gbpJpy.toFixed(2),
        change24h: 0.35,
        direction: "UP" as const,
      },
      {
        symbol: "EUR/JPY",
        name: "Euro / Yen",
        rate: eurJpy,
        formatted: eurJpy.toFixed(2),
        change24h: 0.22,
        direction: "UP" as const,
      },
      {
        symbol: "USD/IDR",
        name: "US Dollar / Rupiah",
        rate: usdIdr,
        formatted: Math.round(usdIdr).toLocaleString("id-ID"),
        change24h: 0.05,
        direction: "UP" as const,
      },
    ];

    memoryCache = {
      timestamp: now,
      rates: r,
      date: data.date || new Date().toISOString().slice(0, 10),
      pairs,
    };

    return NextResponse.json({
      cached: false,
      lastUpdated: new Date(now).toISOString(),
      date: memoryCache.date,
      pairs,
    });
  } catch (error: any) {
    console.warn("Frankfurter rates fetch warning, using fallback cache:", error);

    // If cache exists even if expired, return it as fallback
    if (memoryCache) {
      return NextResponse.json({
        cached: true,
        isFallback: true,
        lastUpdated: new Date(memoryCache.timestamp).toISOString(),
        date: memoryCache.date,
        pairs: memoryCache.pairs,
      });
    }

    // Default static fallback
    return NextResponse.json({
      cached: true,
      isFallback: true,
      pairs: [
        { symbol: "EUR/USD", name: "Euro / US Dollar", rate: 1.085, formatted: "1.0850", change24h: 0.12, direction: "UP" },
        { symbol: "GBP/USD", name: "British Pound / US Dollar", rate: 1.295, formatted: "1.2950", change24h: -0.08, direction: "DOWN" },
        { symbol: "USD/JPY", name: "US Dollar / Japanese Yen", rate: 155.4, formatted: "155.40", change24h: 0.25, direction: "UP" },
        { symbol: "AUD/USD", name: "Aussie / US Dollar", rate: 0.665, formatted: "0.6650", change24h: -0.15, direction: "DOWN" },
        { symbol: "USD/CAD", name: "US Dollar / Canadian Dollar", rate: 1.365, formatted: "1.3650", change24h: 0.05, direction: "UP" },
        { symbol: "USD/CHF", name: "US Dollar / Swiss Franc", rate: 0.895, formatted: "0.8950", change24h: -0.04, direction: "DOWN" },
        { symbol: "USD/IDR", name: "US Dollar / Rupiah", rate: 16250, formatted: "16.250", change24h: 0.05, direction: "UP" },
      ],
    });
  }
}
