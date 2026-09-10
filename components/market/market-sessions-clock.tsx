"use client";

import * as React from "react";
import {
  Clock,
  Globe,
  Flame,
  Zap,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sun,
  Moon,
  Compass,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MarketSessionConfig {
  id: string;
  name: string;
  city: string;
  country: string;
  flag: string;
  timeZone: string;       // IANA Timezone identifier
  tzAbbr: string;         // Short timezone name (e.g. EDT, BST, JST, AEST)
  localOpenHour: number;  // Local bank open hour (e.g. 8)
  localCloseHour: number; // Local bank close hour (e.g. 17)
  wibHoursSummer: string; // e.g. "19:00 - 04:00 WIB"
  wibHoursWinter: string; // e.g. "20:00 - 05:00 WIB"
  pairs: string[];
  description: string;
  volumeShare: string;
}

const SESSIONS_CONFIG: MarketSessionConfig[] = [
  {
    id: "sydney",
    name: "Sesi Sydney",
    city: "Sydney",
    country: "Australia",
    flag: "🇦🇺",
    timeZone: "Australia/Sydney",
    tzAbbr: "AEST/AEDT",
    localOpenHour: 8,
    localCloseHour: 17,
    wibHoursSummer: "05:00 - 14:00 WIB",
    wibHoursWinter: "04:00 - 13:00 WIB",
    pairs: ["AUD/USD", "NZD/USD", "AUD/JPY"],
    description: "Pembuka pasar global, likuiditas awal",
    volumeShare: "4%",
  },
  {
    id: "tokyo",
    name: "Sesi Tokyo",
    city: "Tokyo",
    country: "Jepang",
    flag: "🇯🇵",
    timeZone: "Asia/Tokyo",
    tzAbbr: "JST",
    localOpenHour: 9,
    localCloseHour: 18,
    wibHoursSummer: "07:00 - 16:00 WIB",
    wibHoursWinter: "07:00 - 16:00 WIB",
    pairs: ["USD/JPY", "EUR/JPY", "GBP/JPY"],
    description: "Sesi Asia, pergerakan Yen & komoditas",
    volumeShare: "19%",
  },
  {
    id: "london",
    name: "Sesi London",
    city: "London",
    country: "Inggris",
    flag: "🇬🇧",
    timeZone: "Europe/London",
    tzAbbr: "BST/GMT",
    localOpenHour: 8,
    localCloseHour: 17,
    wibHoursSummer: "14:00 - 23:00 WIB",
    wibHoursWinter: "15:00 - 00:00 WIB",
    pairs: ["EUR/USD", "GBP/USD", "XAU/USD"],
    description: "Pusat volume forex terbesar dunia",
    volumeShare: "38%",
  },
  {
    id: "newyork",
    name: "Sesi New York",
    city: "New York",
    country: "Amerika Serikat",
    flag: "🇺🇸",
    timeZone: "America/New_York",
    tzAbbr: "EDT/EST",
    localOpenHour: 8,
    localCloseHour: 17,
    wibHoursSummer: "19:00 - 04:00 WIB",
    wibHoursWinter: "20:00 - 05:00 WIB",
    pairs: ["EUR/USD", "GBP/USD", "USD/CAD", "XAU/USD"],
    description: "Volatilitas tinggi, rilis data US & FOMC",
    volumeShare: "21%",
  },
];

function getDecimalHourInTimezone(date: Date, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
  const second = parseInt(parts.find((p) => p.type === "second")?.value || "0", 10);

  return (hour % 24) + minute / 60 + second / 3600;
}

function getLocalTimeString(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function isSessionOpenLocal(localDecimalHour: number, openHour: number, closeHour: number): boolean {
  if (openHour < closeHour) {
    return localDecimalHour >= openHour && localDecimalHour < closeHour;
  } else {
    return localDecimalHour >= openHour || localDecimalHour < closeHour;
  }
}

function getSessionProgressLocal(localDecimalHour: number, openHour: number, closeHour: number): number {
  if (!isSessionOpenLocal(localDecimalHour, openHour, closeHour)) return 0;
  const duration = closeHour - openHour;
  const elapsed = localDecimalHour - openHour;
  return Math.min(100, Math.max(0, (elapsed / duration) * 100));
}

function formatRemainingTime(hoursDecimal: number): string {
  const hours = Math.floor(hoursDecimal);
  const minutes = Math.floor((hoursDecimal - hours) * 60);
  return `${hours}j ${minutes}m`;
}

export function MarketSessionsClock() {
  const [now, setNow] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!now) return null;

  // Jakarta Time
  const wibTimeString = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);

  const utcTimeString = new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);

  // Check London & NY live hours
  const londonLocalHour = getDecimalHourInTimezone(now, "Europe/London");
  const nyLocalHour = getDecimalHourInTimezone(now, "America/New_York");

  const isLondonOpen = isSessionOpenLocal(londonLocalHour, 8, 17);
  const isNyOpen = isSessionOpenLocal(nyLocalHour, 8, 17);
  const isOverlapActive = isLondonOpen && isNyOpen;

  return (
    <div className="p-6 rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl shadow-2xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Compass className="h-5 w-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white">Jam Pasar Forex Dunia (Live Market Clock)</h2>
              <Badge variant="outline" className="text-[10px] font-mono border-slate-700 bg-slate-950 text-slate-300">
                Waktu Indonesia (WIB)
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Pantau jadwal buka/tutup sesi pasar dunia yang telah dikonversi langsung ke Waktu Indonesia Barat (WIB)
            </p>
          </div>
        </div>

        {/* Clocks */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-right transition-colors">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Waktu Jakarta (WIB)</div>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">{wibTimeString} WIB</div>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-right hidden sm:block transition-colors">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Waktu Global (UTC)</div>
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300 font-mono">{utcTimeString} UTC</div>
          </div>
        </div>
      </div>

      {/* London-NY Overlap Special Golden Banner */}
      {isOverlapActive && (
        <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-gradient-to-r dark:from-amber-500/15 dark:via-orange-500/10 dark:to-red-500/15 border border-amber-300 dark:border-amber-500/40 flex items-center justify-between gap-4 animate-in fade-in shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 flex-shrink-0 animate-bounce">
              <Flame className="h-5 w-5 fill-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">London – New York Overlap Sedang Berlangsung!</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black uppercase tracking-wider">
                  Golden Hours (19:00 - 23:00 WIB)
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Volatilitas & likuiditas pasar forex tertinggi saat ini. Spread paling tipis untuk pair EUR/USD, GBP/USD, dan XAU/USD.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="hidden md:flex border-amber-500/40 text-amber-700 dark:text-amber-300 font-mono text-xs">
            Sesi Bersama Aktif
          </Badge>
        </div>
      )}

      {/* 4 Major Sessions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SESSIONS_CONFIG.map((session) => {
          const localHour = getDecimalHourInTimezone(now, session.timeZone);
          const localTimeStr = getLocalTimeString(now, session.timeZone);
          const isOpen = isSessionOpenLocal(localHour, session.localOpenHour, session.localCloseHour);
          const progress = getSessionProgressLocal(localHour, session.localOpenHour, session.localCloseHour);

          // Calculate remaining or until open
          let timeRemainingStr = "";
          let timeUntilOpenStr = "";

          if (isOpen) {
            const remainingHours = session.localCloseHour - localHour;
            timeRemainingStr = formatRemainingTime(remainingHours);
          } else {
            let hoursUntil = 0;
            if (localHour < session.localOpenHour) {
              hoursUntil = session.localOpenHour - localHour;
            } else {
              hoursUntil = 24 - localHour + session.localOpenHour;
            }
            timeUntilOpenStr = formatRemainingTime(hoursUntil);
          }

          return (
            <div
              key={session.id}
              className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-4 shadow-sm ${
                isOpen
                  ? "border-emerald-300 dark:border-emerald-500/40 bg-gradient-to-b from-emerald-50/80 via-white to-white dark:from-emerald-500/10 dark:via-slate-900/80 dark:to-slate-950 ring-1 ring-emerald-500/20"
                  : "border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/60 opacity-90 hover:opacity-100"
              }`}
            >
              {/* Header: Flag, City, Status */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{session.flag}</span>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{session.name}</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{session.city}, {session.country}</p>
                  </div>
                </div>

                <Badge
                  variant={isOpen ? "profit" : "secondary"}
                  className={`text-[10px] font-bold ${
                    isOpen
                      ? "bg-emerald-100 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
                      : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {isOpen ? (
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
                      BUKA
                    </span>
                  ) : (
                    "TUTUP"
                  )}
                </Badge>
              </div>

              {/* Time Details Section */}
              <div className="space-y-2">
                {/* Primary: Jam Operasional WIB */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-1 transition-colors">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                    <span>Jam Operasional WIB</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">Vol: {session.volumeShare}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white font-mono flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{session.wibHoursSummer}</span>
                  </div>
                </div>

                {/* Secondary: Jam Lokal di Kota Asal */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
                  <span>Waktu di {session.city}:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">
                    {localTimeStr} ({session.localOpenHour}:00-{session.localCloseHour}:00)
                  </span>
                </div>

                {/* Progress Bar (if open) or Countdown (if closed) */}
                {isOpen ? (
                  <div className="space-y-1 pt-1">
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                      <span>Progres: {Math.round(progress)}%</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">Tutup dlm: {timeRemainingStr}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800/60 px-1">
                    <span>Buka dalam:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{timeUntilOpenStr}</span>
                  </div>
                )}
              </div>

              {/* Major Pairs Tag */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60 flex flex-wrap gap-1">
                {session.pairs.map((pair) => (
                  <span
                    key={pair}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    {pair}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
