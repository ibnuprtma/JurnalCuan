"use client";

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAppShell } from "@/components/layout/app-shell";
import { KPISummaryCards } from "@/components/dashboard/kpi-summary-cards";
import { PnLCalendar } from "@/components/calendar/pnl-calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatSignedCurrency, cn } from "@/lib/utils";
import {
  Plus,
  Upload,
  Share2,
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Sparkles,
} from "lucide-react";

// Dynamic import heavy Recharts component to avoid initial render-blocking & forced reflow
const EquityCurveChart = dynamic(
  () => import("@/components/analytics/equity-curve-chart").then((m) => m.EquityCurveChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[360px] rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 flex flex-col justify-between animate-pulse">
        <div className="space-y-2">
          <div className="h-4 w-36 bg-slate-800 rounded" />
          <div className="h-3 w-48 bg-slate-800/60 rounded" />
        </div>
        <div className="h-[200px] w-full bg-slate-800/30 rounded-2xl flex items-center justify-center text-xs text-slate-500">
          Memuat visual grafik performa...
        </div>
      </div>
    ),
  }
);

// Dynamic import MarketSessionsClock
const MarketSessionsClock = dynamic(
  () => import("@/components/market/market-sessions-clock").then((m) => m.MarketSessionsClock),
  {
    ssr: false,
    loading: () => (
      <div className="h-[240px] rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 flex items-center justify-center animate-pulse text-xs text-slate-500">
        Sinkronisasi jam pasar forex global...
      </div>
    ),
  }
);

export default function DashboardPage() {
  const { trades, openNewTradeModal, openImportModal, openCuanCardModal } = useAppShell();

  const recentTrades = React.useMemo(() => {
    return [...trades]
      .sort((a, b) => new Date(b.openTime).getTime() - new Date(a.openTime).getTime())
      .slice(0, 5);
  }, [trades]);

  return (
    <div className="space-y-6">
      {/* Top Welcome Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-[#0d1424] via-[#090d18] to-[#05070d] border border-slate-800/80 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-white">Selamat Datang di Jurnal Cuan! 📈</span>
          </div>
          <p className="text-xs text-slate-400">
            Disiplin pada strategi, kendalikan emosi, dan pantau konsistensi profit harian kamu.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-2">
          <Link href="/share-settings">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs bg-slate-900/80 border-slate-700 hover:border-emerald-500/40 text-emerald-400"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Live Share Link</span>
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={openCuanCardModal}
            className="gap-1.5 text-xs bg-slate-900/80 border-slate-700 hover:border-emerald-500/40"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Cuan Card</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={openImportModal}
            className="gap-1.5 text-xs bg-slate-900/80 border-slate-700 hover:border-emerald-500/40"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Import MT5</span>
          </Button>

          <Button
            size="sm"
            onClick={openNewTradeModal}
            className="gap-1.5 text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
          >
            <Plus className="h-3.5 w-3.5 stroke-[3]" />
            <span>Catat Trade</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <KPISummaryCards trades={trades} />

      {/* Main Grid: Calendar & Equity Curve */}
      <div className="space-y-6">
        {/* Interactive P&L Calendar (Core Focus) */}
        <PnLCalendar trades={trades} onOpenNewTrade={openNewTradeModal} />

        {/* Bottom Split: Equity Curve & Recent Trades */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Equity Curve (2 Cols) */}
          <div className="lg:col-span-2">
            <EquityCurveChart trades={trades} initialBalance={5000} />
          </div>

          {/* Recent Trades Widget (1 Col) */}
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl p-5 shadow-2xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <h3 className="text-base font-bold text-white">Transaksi Terakhir</h3>
                <Link
                  href="/trades"
                  className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
                >
                  Lihat Semua <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="space-y-2 mt-3">
                {recentTrades.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    Belum ada data trade. Mulai dengan mencatat trade pertama kamu!
                  </div>
                ) : (
                  recentTrades.map((trade) => {
                    const isWin = trade.netPnL > 0;
                    const isLoss = trade.netPnL < 0;

                    return (
                      <div
                        key={trade.id}
                        className="p-3 rounded-2xl border border-slate-800/60 bg-slate-950/50 flex items-center justify-between hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={cn(
                              "h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs",
                              trade.direction === "BUY"
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                                : "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                            )}
                          >
                            {trade.direction}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-white">{trade.pair}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{trade.lotSize} Lot</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div
                            className={cn(
                              "font-extrabold text-xs font-mono",
                              isWin ? "text-emerald-400" : isLoss ? "text-red-400" : "text-slate-400"
                            )}
                          >
                            {formatSignedCurrency(trade.netPnL)}
                          </div>
                          <div
                            className={cn(
                              "text-[10px] font-mono",
                              trade.netPips >= 0 ? "text-emerald-400" : "text-red-400"
                            )}
                          >
                            {trade.netPips >= 0 ? `+${trade.netPips}` : trade.netPips} pips
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={openNewTradeModal}
              className="w-full text-xs gap-1.5 border-dashed border-slate-700 hover:border-emerald-500/50 text-slate-300"
            >
              <Plus className="h-3 w-3" />
              <span>Tambah Transaksi Baru</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Visual Forex Market Sessions Clock */}
      <MarketSessionsClock />
    </div>
  );
}
