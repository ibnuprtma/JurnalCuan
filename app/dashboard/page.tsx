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
  Wallet,
} from "lucide-react";
import { EditBalanceModal } from "@/components/tools/edit-balance-modal";

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

// Dynamic import BreakdownCharts
const BreakdownCharts = dynamic(
  () => import("@/components/analytics/breakdown-charts").then((m) => m.BreakdownCharts),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-pulse">
        <div className="h-[280px] rounded-3xl border border-slate-800/80 bg-slate-900/60 p-5" />
        <div className="h-[280px] rounded-3xl border border-slate-800/80 bg-slate-900/60 p-5" />
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
  const { trades, accounts, selectedAccountId, openNewTradeModal, openCuanCardModal, refreshAccounts, isLoading } = useAppShell();
  const [isEditBalanceOpen, setIsEditBalanceOpen] = React.useState(false);

  const recentTrades = React.useMemo(() => {
    return [...trades]
      .sort((a, b) => new Date(b.openTime).getTime() - new Date(a.openTime).getTime())
      .slice(0, 5);
  }, [trades]);

  // Determine base initial balance and currency for calculations
  const activeAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];
  const initialBaseBalance = activeAccount?.initialBalance || activeAccount?.currentBalance || 10000;
  const accountCurrency = activeAccount?.currency || "USD";

  if (isLoading && accounts.length === 0) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Top bar skeleton */}
        <div className="h-24 rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-5 w-52 bg-slate-800 rounded-lg" />
            <div className="h-3.5 w-80 bg-slate-800/60 rounded-lg" />
          </div>
          <div className="h-9 w-32 bg-slate-800 rounded-xl" />
        </div>

        {/* 4 KPI cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-3xl border border-slate-800/80 bg-slate-900/60 p-5 space-y-3">
              <div className="h-3 w-28 bg-slate-800 rounded" />
              <div className="h-6 w-36 bg-slate-800/80 rounded" />
            </div>
          ))}
        </div>

        {/* Calendar skeleton */}
        <div className="h-96 rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 flex flex-col justify-center items-center gap-3 text-slate-500">
          <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <span className="text-xs font-medium">Memuat data portofolio trading kamu...</span>
        </div>
      </div>
    );
  }

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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditBalanceOpen(true)}
            className="gap-1.5 text-xs bg-slate-900/80 border-slate-700 hover:border-emerald-500/40 text-slate-200"
          >
            <Wallet className="h-3.5 w-3.5 text-emerald-400" />
            <span>Ubah Modal Awal</span>
          </Button>

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
            size="sm"
            onClick={openNewTradeModal}
            className="gap-1.5 text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
          >
            <Plus className="h-3.5 w-3.5 stroke-[3]" />
            <span>Catat Transaksi</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards (with % gain calculation & edit modal trigger) */}
      <KPISummaryCards
        trades={trades}
        initialBalance={initialBaseBalance}
        currency={accountCurrency}
        onOpenEditBalance={() => setIsEditBalanceOpen(true)}
      />

      {/* 1. Interactive P&L Calendar (Full Width) */}
      <PnLCalendar trades={trades} currency={accountCurrency} onOpenNewTrade={openNewTradeModal} />

      {/* 2. Split Row: Equity Curve (2 Cols) & Recent Trades (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Curve Chart */}
        <div className="lg:col-span-2">
          <EquityCurveChart trades={trades} initialBalance={initialBaseBalance} currency={accountCurrency} />
        </div>

        {/* Recent Trades Box */}
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl p-5 shadow-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Catatan Transaksi Terkini</span>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {recentTrades.length}
                </Badge>
              </h3>
              <Link
                href="/trades"
                className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
              >
                Lihat Semua <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-2 mt-3">
              {recentTrades.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs rounded-2xl border border-dashed border-slate-800">
                  Belum ada transaksi. Klik &quot;Catat Transaksi&quot; untuk memulai.
                </div>
              ) : (
                recentTrades.map((trade) => {
                  const isWin = trade.netPnL > 0;
                  const isLoss = trade.netPnL < 0;
                  const dateObj = new Date(trade.openTime);
                  const timeFormatted = new Intl.DateTimeFormat("id-ID", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Asia/Jakarta",
                  }).format(dateObj);

                  const notes = trade.notes || trade.strategyName || "Catatan Transaksi";

                  return (
                    <div
                      key={trade.id}
                      className="p-3 rounded-2xl border border-slate-800/60 bg-slate-950/50 flex items-center justify-between hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                        <div
                          className={cn(
                            "h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0",
                            isWin
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                          )}
                        >
                          {isWin ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-xs text-white truncate">{notes}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{timeFormatted}</div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={cn(
                            "font-bold text-xs font-mono",
                            isWin ? "text-emerald-400" : isLoss ? "text-rose-400" : "text-slate-400"
                          )}
                        >
                          {formatSignedCurrency(trade.netPnL, accountCurrency)}
                        </span>
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

      {/* 3. Breakdown Charts (Performa per Hari & Arus Kas Pemasukan vs Pengeluaran) */}
      <BreakdownCharts trades={trades} currency={accountCurrency} />

      {/* 4. Visual Forex Market Sessions Clock (Full Width at Bottom) */}
      <MarketSessionsClock />

      {/* Edit Initial Balance Modal */}
      <EditBalanceModal
        isOpen={isEditBalanceOpen}
        onClose={() => setIsEditBalanceOpen(false)}
        accounts={accounts}
        currentAccountId={selectedAccountId}
        onBalanceUpdated={refreshAccounts}
      />
    </div>
  );
}
