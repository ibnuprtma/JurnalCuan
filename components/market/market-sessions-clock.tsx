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

interface MarketSession {
  id: string;
  name: string;
  city: string;
  country: string;
  flag: string;
  startHourWIB: number; // 0-23
  endHourWIB: number;   // 0-23
  pairs: string[];
  description: string;
  volumeShare: string;
}

const SESSIONS: MarketSession[] = [
  {
    id: "sydney",
    name: "Sesi Sydney",
    city: "Sydney",
    country: "Australia",
    flag: "🇦🇺",
    startHourWIB: 5,
    endHourWIB: 14,
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
    startHourWIB: 7,
    endHourWIB: 16,
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
    startHourWIB: 14,
    endHourWIB: 23,
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
    startHourWIB: 19,
    endHourWIB: 4, // passes midnight (19:00 - 04:00 WIB)
    pairs: ["EUR/USD", "GBP/USD", "USD/CAD", "XAU/USD"],
    description: "Volatilitas tinggi, rilis data US & FOMC",
    volumeShare: "21%",
  },
];

function isSessionOpen(start: number, end: number, currentDecimalHour: number): boolean {
  if (start < end) {
    return currentDecimalHour >= start && currentDecimalHour < end;
  } else {
    // Crosses midnight (e.g. 19:00 to 04:00)
    return currentDecimalHour >= start || currentDecimalHour < end;
  }
}

function getSessionProgress(start: number, end: number, currentDecimalHour: number): number {
  if (!isSessionOpen(start, end, currentDecimalHour)) return 0;

  const totalDuration = start < end ? end - start : 24 - start + end;
  let elapsed = 0;

  if (start < end) {
    elapsed = currentDecimalHour - start;
  } else {
    if (currentDecimalHour >= start) {
      elapsed = currentDecimalHour - start;
    } else {
      elapsed = 24 - start + currentDecimalHour;
    }
  }

  return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
}

function getTimeRemainingString(endHour: number, currentDecimalHour: number): string {
  let remainingHours = 0;
  if (currentDecimalHour < endHour) {
    remainingHours = endHour - currentDecimalHour;
  } else {
    remainingHours = 24 - currentDecimalHour + endHour;
  }

  const hours = Math.floor(remainingHours);
  const minutes = Math.floor((remainingHours - hours) * 60);

  return `${hours}j ${minutes}m`;
}

function getTimeUntilOpenString(startHour: number, currentDecimalHour: number): string {
  let hoursUntil = 0;
  if (currentDecimalHour < startHour) {
    hoursUntil = startHour - currentDecimalHour;
  } else {
    hoursUntil = 24 - currentDecimalHour + startHour;
  }

  const hours = Math.floor(hoursUntil);
  const minutes = Math.floor((hoursUntil - hours) * 60);

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

  // Calculate WIB time (UTC+7)
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  const utcSeconds = now.getUTCSeconds();

  const wibDecimalHour = (utcHours + 7 + utcMinutes / 60 + utcSeconds / 3600) % 24;

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
    hour12: false,
  }).format(now);

  // Check Overlap London & New York (19:00 - 23:00 WIB)
  const isOverlapActive = wibDecimalHour >= 19 && wibDecimalHour < 23;

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
                WIB & UTC
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Pantau sesi pasar yang sedang aktif untuk menentukan momen volatilitas & likuiditas terbaik
            </p>
          </div>
        </div>

        {/* Clocks */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-right">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Waktu Jakarta (WIB)</div>
            <div className="text-sm font-bold text-emerald-400 font-mono">{wibTimeString} WIB</div>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-right hidden sm:block">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Waktu Global (UTC)</div>
            <div className="text-sm font-bold text-slate-300 font-mono">{utcTimeString} UTC</div>
          </div>
        </div>
      </div>

      {/* London-NY Overlap Special Golden Banner */}
      {isOverlapActive && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-red-500/15 border border-amber-500/40 flex items-center justify-between gap-4 animate-in fade-in shadow-xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0 animate-bounce">
              <Flame className="h-5 w-5 fill-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white">London – New York Overlap Sedang Berlangsung!</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black uppercase tracking-wider">
                  Golden Hours
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Volatilitas dan volume trading tertinggi hari ini (19:00 - 23:00 WIB). Spread paling tipis untuk pair EUR/USD, GBP/USD, dan XAU/USD.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="hidden md:flex border-amber-500/50 text-amber-300 font-mono text-xs">
            Berakhir dlm {getTimeRemainingString(23, wibDecimalHour)}
          </Badge>
        </div>
      )}

      {/* 4 Major Sessions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SESSIONS.map((session) => {
          const isOpen = isSessionOpen(session.startHourWIB, session.endHourWIB, wibDecimalHour);
          const progress = getSessionProgress(session.startHourWIB, session.endHourWIB, wibDecimalHour);
          const timeRemaining = getTimeRemainingString(session.endHourWIB, wibDecimalHour);
          const timeUntilOpen = getTimeUntilOpenString(session.startHourWIB, wibDecimalHour);

          const timeFormatted = `${String(session.startHourWIB).padStart(2, "0")}:00 - ${String(
            session.endHourWIB
          ).padStart(2, "0")}:00 WIB`;

          return (
            <div
              key={session.id}
              className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-4 shadow-lg ${
                isOpen
                  ? "border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 via-slate-900/80 to-slate-950"
                  : "border-slate-800/80 bg-slate-950/60 opacity-80 hover:opacity-100"
              }`}
            >
              {/* Header: Flag, City, Status */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{session.flag}</span>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">{session.name}</h3>
                    <p className="text-[10px] text-slate-400">{session.country}</p>
                  </div>
                </div>

                <Badge
                  variant={isOpen ? "profit" : "secondary"}
                  className={`text-[10px] font-bold ${
                    isOpen ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {isOpen ? (
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                      BUKA
                    </span>
                  ) : (
                    "TUTUP"
                  )}
                </Badge>
              </div>

              {/* Hours & Status Details */}
              <div className="space-y-2">
                <div className="text-xs font-mono text-slate-300 font-semibold flex items-center justify-between">
                  <span>{timeFormatted}</span>
                  <span className="text-[10px] text-slate-400 font-normal">Vol: {session.volumeShare}</span>
                </div>

                {/* Progress Bar (if open) or Countdown (if closed) */}
                {isOpen ? (
                  <div className="space-y-1">
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Progres: {Math.round(progress)}%</span>
                      <span className="text-emerald-400 font-mono">Sisa: {timeRemaining}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
                    <span>Buka dalam:</span>
                    <span className="font-mono font-bold text-slate-300">{timeUntilOpen}</span>
                  </div>
                )}
              </div>

              {/* Major Pairs Tag */}
              <div className="pt-2 border-t border-slate-800/60 flex flex-wrap gap-1">
                {session.pairs.map((pair) => (
                  <span
                    key={pair}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-slate-300"
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
