import { NextResponse } from "next/server";

export interface ForexFactoryEvent {
  title: string;
  country: string;
  date: string;
  impact: string; // "High" | "Medium" | "Low" | "Holiday"
  forecast: string;
  previous: string;
  actual?: string;
}

function mapForexFactoryEvents(data: any[]) {
  return data.map((item, index) => ({
    id: `ff-${index}-${item.country}-${item.date}`,
    title: item.title,
    currency: item.country?.toUpperCase() || "USD",
    date: item.date,
    impact:
      item.impact === "High"
        ? "HIGH"
        : item.impact === "Medium"
        ? "MEDIUM"
        : item.impact === "Low"
        ? "LOW"
        : "HOLIDAY",
    forecast: item.forecast || "—",
    previous: item.previous || "—",
    actual: item.actual || "—",
  }));
}

let cachedEvents: any[] | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION_MS = 15 * 60 * 1000; // Cache 15 menit

export async function GET() {
  const now = Date.now();

  // 1. Jika masih ada data di cache memori dan belum lewat 15 menit
  if (cachedEvents && now - lastFetchTime < CACHE_DURATION_MS) {
    return NextResponse.json({
      success: true,
      events: cachedEvents,
      total: cachedEvents.length,
      fromCache: true,
      updatedAt: new Date(lastFetchTime).toISOString(),
    });
  }

  try {
    const response = await fetch(
      "https://nfs.faireconomy.media/ff_calendar_thisweek.json",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept: "application/json, text/plain, */*",
          "Accept-Language": "en-US,en;q=0.9",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      // Jika Forex Factory mengembalikan 429 atau error
      if (cachedEvents) {
        return NextResponse.json({
          success: true,
          events: cachedEvents,
          total: cachedEvents.length,
          fromCache: true,
          updatedAt: new Date(lastFetchTime).toISOString(),
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: "RATE_LIMIT",
          message:
            "Server Forex Factory sedang membatasi permintaan (Too Many Requests). Silakan tunggu sekitar 5 menit lalu klik Perbarui Data.",
        },
        { status: 429 }
      );
    }

    const data: ForexFactoryEvent[] = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      const formatted = mapForexFactoryEvents(data);
      cachedEvents = formatted;
      lastFetchTime = now;

      return NextResponse.json({
        success: true,
        events: formatted,
        total: formatted.length,
        fromCache: false,
        updatedAt: new Date().toISOString(),
      });
    }

    throw new Error("Format data Forex Factory tidak valid.");
  } catch (error: any) {
    console.warn("Forex Factory live fetch error:", error.message);

    if (cachedEvents) {
      return NextResponse.json({
        success: true,
        events: cachedEvents,
        total: cachedEvents.length,
        fromCache: true,
        updatedAt: new Date(lastFetchTime).toISOString(),
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "UNAVAILABLE",
        message:
          "Gagal mengambil data live dari Forex Factory. Silakan tunggu sekitar 5 menit lalu klik Perbarui Data.",
        details: error.message,
      },
      { status: 503 }
    );
  }
}
