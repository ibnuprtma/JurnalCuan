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
  Share2,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Sparkles,
  Wallet,
  Filter,
  Layers,
  AlertTriangle,
  X,
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

  const isAllSelected = !selectedAccountId || selectedAccountId === "all";

  // Portfolio filters when "Semua Portofolio" is selected
  const [typeFilter, setTypeFilter] = React.useState<string>("ALL");
  const [currencyFilter, setCurrencyFilter] = React.useState<string>("ALL");

  // Check if user has at least one Real trading account
  const hasRealAccount = React.useMemo(() => {
    return accounts.some((a) => (a.accountType || "").toLowerCase() === "real");
  }, [accounts]);

  const [isRealAlertDismissed, setIsRealAlertDismissed] = React.useState(false);

  // Distinct currencies across accounts
  const availableCurrencies = React.useMemo(() => {
    const set = new Set(accounts.map((a) => (a.currency || "USD").toUpperCase()));
    return Array.from(set);
  }, [accounts]);

  // Distinct account types across accounts
  const availableAccountTypes = React.useMemo(() => {
    const set = new Set(accounts.map((a) => a.accountType || "Real"));
    return Array.from(set);
  }, [accounts]);

  // Filtered accounts based on user selections
  const filteredAccounts = React.useMemo(() => {
    if (!isAllSelected) {
      const single = accounts.find((a) => a.id === selectedAccountId);
      return single ? [single] : accounts;
    }

    return accounts.filter((acc) => {
      const matchesType =
        typeFilter === "ALL" || (acc.accountType || "Real").toLowerCase() === typeFilter.toLowerCase();
      const matchesCurrency =
        currencyFilter === "ALL" || (acc.currency || "USD").toUpperCase() === currencyFilter.toUpperCase();
      return matchesType && matchesCurrency;
    });
  }, [accounts, isAllSelected, selectedAccountId, typeFilter, currencyFilter]);

  // Filtered trades matching the filtered accounts
  const filteredTrades = React.useMemo(() => {
    if (!isAllSelected) return trades;
    const allowedAccountIds = new Set(filteredAccounts.map((a) => a.id));
    return trades.filter((t) => allowedAccountIds.has(t.accountId));
  }, [trades, isAllSelected, filteredAccounts]);

  const recentTrades = React.useMemo(() => {
    return [...filteredTrades]
      .sort((a, b) => new Date(b.openTime).getTime() - new Date(a.openTime).getTime())
      .slice(0, 5);
  }, [filteredTrades]);

  // Determine base initial balance and currency for single account calculations
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
            <Wallet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Ubah Modal Awal</span>
          </Button>

          <Link href="/share-settings">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-700 hover:border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Live Share Link</span>
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={openCuanCardModal}
            className="gap-1.5 text-xs bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-700 hover:border-emerald-500/40 text-slate-700 dark:text-slate-300"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
            <span>Cuan Card</span>
          </Button>

          <Button
            size="sm"
            onClick={openNewTradeModal}
            className="gap-1.5 text-xs bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold shadow-md shadow-emerald-600/20 dark:shadow-emerald-500/20"
          >
            <Plus className="h-3.5 w-3.5 stroke-[3]" />
            <span>Catat Transaksi</span>
          </Button>
        </div>
      </div>

      {/* Warning Alert: Belum Membuat Akun Real */}
      {!isLoading && accounts.length > 0 && !hasRealAccount && !isRealAlertDismissed && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-50/90 dark:bg-gradient-to-r dark:from-amber-950/40 dark:via-[#111624] dark:to-[#0a0d16] border border-amber-300 dark:border-amber-500/40 shadow-sm dark:shadow-2xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
          {/* Ambient Amber Glow */}
          <div className="absolute -left-6 -top-6 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start gap-3.5 relative z-10">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 dark:text-amber-400 shrink-0 mt-0.5 shadow-xs">
              <AlertTriangle className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Peringatan: Kamu Belum Memiliki Akun Trading Real!
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
                  Mode Demo Aktif
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300/90 max-w-2xl leading-relaxed">
                Saat ini catatan transaksi kamu hanya berada di akun Demo/Latihan. Untuk mulai mengukur pertumbuhan modal uang sungguhan dan membangun psikologi trading yang disiplin, buat akun Real kamu sekarang.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10 shrink-0 self-end sm:self-center">
            <Link href="/settings?action=new-account&type=real#accounts-section">
              <Button
                size="sm"
                className="gap-1.5 text-xs bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 stroke-[3]" />
                <span>Buat Akun Real</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsRealAlertDismissed(true)}
              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl cursor-pointer"
              title="Tutup Peringatan"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Quick Filter Bar when "Semua Portofolio" is selected */}
      {isAllSelected && accounts.length > 1 && (
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Filter Portofolio Gabungan:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Tipe Akun Filters */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <button
                onClick={() => setTypeFilter("ALL")}
                className={cn(
                  "px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer",
                  typeFilter === "ALL"
                    ? "bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                Semua Tipe
              </button>
              {availableAccountTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer",
                    typeFilter.toLowerCase() === type.toLowerCase()
                      ? "bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Mata Uang Filters (if multiple currencies exist) */}
            {availableCurrencies.length > 1 && (
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <button
                  onClick={() => setCurrencyFilter("ALL")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer",
                    currencyFilter === "ALL"
                      ? "bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  Semua Currency
                </button>
                {availableCurrencies.map((curr) => (
                  <button
                    key={curr}
                    onClick={() => setCurrencyFilter(curr)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer",
                      currencyFilter.toUpperCase() === curr.toUpperCase()
                        ? "bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* KPI Cards (Multi-Currency & % ROI aware) */}
      <KPISummaryCards
        trades={filteredTrades}
        initialBalance={initialBaseBalance}
        currency={accountCurrency}
        accounts={filteredAccounts}
        selectedAccountId={selectedAccountId}
        typeFilter={typeFilter}
        currencyFilter={currencyFilter}
        onOpenEditBalance={() => setIsEditBalanceOpen(true)}
      />

      {/* 1. Interactive P&L Calendar (Full Width) */}
      <PnLCalendar
        trades={filteredTrades}
        currency={accountCurrency}
        accounts={filteredAccounts}
        selectedAccountId={selectedAccountId}
        onOpenNewTrade={openNewTradeModal}
      />

      {/* 2. Split Row: Equity Curve (2 Cols) & Recent Trades (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Curve Chart */}
        <div className="lg:col-span-2">
          <EquityCurveChart
            trades={filteredTrades}
            initialBalance={initialBaseBalance}
            currency={accountCurrency}
            accounts={filteredAccounts}
            selectedAccountId={selectedAccountId}
          />
        </div>

        {/* Recent Trades Box */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 backdrop-blur-xl p-5 shadow-xs dark:shadow-2xl flex flex-col justify-between space-y-4 transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/80">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Catatan Transaksi Terkini</span>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {recentTrades.length}
                </Badge>
              </h3>
              <Link
                href="/trades"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                Lihat Semua <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-2 mt-3">
              {recentTrades.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
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
                  const tradeAccount = accounts.find((a) => a.id === trade.accountId);
                  const tradeCurrency = tradeAccount?.currency || accountCurrency;
                  const accType = tradeAccount?.accountType || "Real";

                  return (
                    <div
                      key={trade.id}
                      className="p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/60 bg-slate-50/70 dark:bg-slate-950/50 flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                        <div
                          className={cn(
                            "h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0",
                            isWin
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                          )}
                        >
                          {isWin ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">{notes}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1.5">
                            <span>{timeFormatted}</span>
                            {isAllSelected && tradeAccount && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                                {tradeAccount.name} ({accType})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={cn(
                            "font-bold text-xs font-mono",
                            isWin ? "text-emerald-600 dark:text-emerald-400" : isLoss ? "text-rose-600 dark:text-rose-400" : "text-slate-500 dark:text-slate-400"
                          )}
                        >
                          {formatSignedCurrency(trade.netPnL, tradeCurrency)}
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
            className="w-full text-xs gap-1.5 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500/50 text-slate-700 dark:text-slate-300 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60"
          >
            <Plus className="h-3 w-3" />
            <span>Tambah Transaksi Baru</span>
          </Button>
        </div>
      </div>

      {/* 3. Breakdown Charts (Performa per Hari & Arus Kas Pemasukan vs Pengeluaran) */}
      <BreakdownCharts
        trades={filteredTrades}
        currency={accountCurrency}
        accounts={filteredAccounts}
        selectedAccountId={selectedAccountId}
      />

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
