"use client";

import * as React from "react";
import Link from "next/link";
import { generateSampleTrades, SampleTrade } from "@/lib/sample-data";
import { KPISummaryCards } from "@/components/dashboard/kpi-summary-cards";
import { PnLCalendar } from "@/components/calendar/pnl-calendar";
import { EquityCurveChart } from "@/components/analytics/equity-curve-chart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatSignedCurrency, cn } from "@/lib/utils";
import { Globe, ShieldCheck, Eye, EyeOff, TrendingUp, TrendingDown, ArrowLeft, Layers } from "lucide-react";

export default function PublicSharePage() {
  const [hideDollars, setHideDollars] = React.useState(false);
  const trades: SampleTrade[] = React.useMemo(() => generateSampleTrades(), []);

  const totalPnL = trades.reduce((acc, t) => acc + t.netPnL, 0);
  const winCount = trades.filter((t) => t.netPnL > 0).length;
  const winRate = trades.length > 0 ? (winCount / trades.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto space-y-8">
      {/* Top Public Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-emerald-500/20">
            JC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">Live Portfolio Publik</h1>
              <Badge variant="profit" className="gap-1 text-[10px]">
                <Globe className="h-3 w-3" /> Live Verified
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Trader: <strong className="text-slate-200">@cuanmaster</strong> • Akun: Personal Real (Exness MT5)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Privacy Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setHideDollars(!hideDollars)}
            className="gap-1.5 text-xs bg-slate-900 border-slate-800"
          >
            {hideDollars ? <EyeOff className="h-3.5 w-3.5 text-amber-400" /> : <Eye className="h-3.5 w-3.5 text-emerald-400" />}
            <span>{hideDollars ? "Tampilkan Nominal $" : "Sembunyikan Nominal $"}</span>
          </Button>

          <Link href="/dashboard">
            <Button size="sm" className="gap-1.5 text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Buka Jurnal Cuan</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main KPI Stat Cards */}
      <KPISummaryCards trades={trades} />

      {/* Interactive Calendar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Kalender Performa Cuan Bulanan</h2>
          <span className="text-xs text-slate-400">Data live tersinkronisasi</span>
        </div>
        <PnLCalendar trades={trades} />
      </div>

      {/* Equity Curve */}
      <EquityCurveChart trades={trades} initialBalance={5000} />

      {/* Public Footer Disclaimer */}
      <div className="text-center py-6 text-xs text-slate-500 border-t border-slate-800/80 space-y-1">
        <p>Jurnal Cuan — Platform Jurnal & Analytics Forex Terverifikasi.</p>
        <p className="text-[10px]">Seluruh data di halaman ini dipublikasikan secara sukarela oleh pemilik akun.</p>
      </div>
    </div>
  );
}
