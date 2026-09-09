"use client";

import * as React from "react";
import { formatCurrency, formatSignedCurrency, cn } from "@/lib/utils";
import { SampleTrade } from "@/lib/sample-data";
import { TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight, ReceiptText, Pencil, Layers } from "lucide-react";
import { computePortfolioStats, PortfolioStats } from "@/lib/portfolio-utils";

interface KPISummaryCardsProps {
  trades: SampleTrade[];
  initialBalance?: number;
  currency?: string;
  onOpenEditBalance?: () => void;
  accounts?: any[];
  selectedAccountId?: string;
  typeFilter?: string;
  currencyFilter?: string;
}

export function KPISummaryCards({
  trades,
  initialBalance = 10000,
  currency = "USD",
  onOpenEditBalance,
  accounts = [],
  selectedAccountId = "",
  typeFilter = "ALL",
  currencyFilter = "ALL",
}: KPISummaryCardsProps) {
  const portfolioStats = React.useMemo(() => {
    if (!accounts || accounts.length === 0) {
      // Fallback if accounts not yet loaded
      const winningTrades = trades.filter((t) => t.netPnL > 0);
      const losingTrades = trades.filter((t) => t.netPnL < 0);
      const netPnL = trades.reduce((acc, t) => acc + t.netPnL, 0);
      const grossProfit = winningTrades.reduce((acc, t) => acc + t.netPnL, 0);
      const grossLoss = Math.abs(losingTrades.reduce((acc, t) => acc + t.netPnL, 0));
      const pctGain = initialBalance > 0 ? (netPnL / initialBalance) * 100 : 0;

      return {
        isAllSelected: false,
        isMultiCurrency: false,
        currencies: [currency],
        currencyGroups: [],
        accountTypeGroups: [],
        totalTradesCount: trades.length,
        overallWeightedROI: pctGain,
        singleCurrencyStats: {
          netPnL,
          grossProfit,
          grossLoss,
          pctGain,
          initialBalance,
          currentBalance: initialBalance + netPnL,
          currency,
          totalTrades: trades.length,
          winningCount: winningTrades.length,
          losingCount: losingTrades.length,
        },
      } as PortfolioStats;
    }

    return computePortfolioStats(accounts, trades, selectedAccountId, typeFilter, currencyFilter);
  }, [accounts, trades, selectedAccountId, initialBalance, currency, typeFilter, currencyFilter]);

  // SINGLE CURRENCY RENDERING
  if (!portfolioStats.isMultiCurrency) {
    const single = portfolioStats.singleCurrencyStats || {
      netPnL: 0,
      grossProfit: 0,
      grossLoss: 0,
      pctGain: 0,
      initialBalance: initialBalance,
      currency: currency,
      totalTrades: trades.length,
      winningCount: 0,
      losingCount: 0,
    };

    const isPositive = single.netPnL >= 0;
    const formattedPct = single.pctGain.toFixed(2);

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Saldo Bersih / Net Cuan */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400">Saldo Bersih (Net Cuan)</span>
            <div
              className={cn(
                "h-8 w-8 rounded-xl flex items-center justify-center",
                isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
              )}
            >
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            </div>
          </div>
          <div className="mt-3">
            <div
              className={cn(
                "text-2xl font-extrabold font-mono truncate",
                isPositive ? "text-emerald-400" : "text-rose-400"
              )}
            >
              {formatSignedCurrency(single.netPnL, single.currency)}
            </div>
            <div className="flex items-center justify-between gap-1.5 mt-1.5">
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "text-[10px] font-bold font-mono px-2 py-0.5 rounded border",
                    isPositive
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                      : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                  )}
                >
                  {isPositive ? `+${formattedPct}%` : `${formattedPct}%`}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Return</span>
              </div>

              {onOpenEditBalance && (
                <button
                  type="button"
                  onClick={onOpenEditBalance}
                  title="Klik untuk ubah modal saldo awal"
                  className="text-[10px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 font-mono transition-colors cursor-pointer bg-slate-950/60 hover:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-800"
                >
                  <span>Modal: {formatCurrency(single.initialBalance, single.currency)}</span>
                  <Pencil className="h-2.5 w-2.5 text-emerald-400" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. Total Pemasukan / Cuan */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400">Total Pemasukan (Cuan)</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold font-mono text-emerald-400 truncate">
              {single.grossProfit > 0
                ? `+${formatCurrency(single.grossProfit, single.currency)}`
                : formatCurrency(0, single.currency)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1.5 font-medium">
              {single.winningCount} transaksi profit
            </div>
          </div>
        </div>

        {/* 3. Total Pengeluaran / Boncos */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400">Total Pengeluaran (Boncos)</span>
            <div className="h-8 w-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold font-mono text-rose-400 truncate">
              {single.grossLoss > 0
                ? `-${formatCurrency(single.grossLoss, single.currency)}`
                : formatCurrency(0, single.currency)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1.5 font-medium">
              {single.losingCount} transaksi loss
            </div>
          </div>
        </div>

        {/* 4. Total Transaksi Catatan */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400">Total Catatan</span>
            <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ReceiptText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold font-mono text-white">
              {single.totalTrades}
            </div>
            <div className="text-[10px] text-slate-400 mt-1.5 font-medium">
              Riwayat transaksi tercatat
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MULTI-CURRENCY RENDERING (Pendekatan 1)
  const isOverallPositive = portfolioStats.overallWeightedROI >= 0;
  const totalWinning = portfolioStats.currencyGroups.reduce((s, g) => s + g.winningCount, 0);
  const totalLosing = portfolioStats.currencyGroups.reduce((s, g) => s + g.losingCount, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Saldo Bersih Gabungan & Breakdown per Currency */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs uppercase font-bold text-slate-400">Net Cuan Gabungan</span>
          </div>
          <span
            className={cn(
              "text-[10px] font-bold font-mono px-2 py-0.5 rounded border",
              isOverallPositive
                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                : "bg-rose-500/15 text-rose-300 border-rose-500/30"
            )}
          >
            {isOverallPositive ? `+${portfolioStats.overallWeightedROI.toFixed(1)}%` : `${portfolioStats.overallWeightedROI.toFixed(1)}%`} ROI
          </span>
        </div>

        <div className="mt-3 space-y-1.5">
          {portfolioStats.currencyGroups.map((cg) => (
            <div key={cg.currency} className="flex items-center justify-between text-xs font-mono bg-slate-950/50 px-2.5 py-1 rounded-xl border border-slate-800/60">
              <span className="text-slate-400 font-bold">{cg.currency}</span>
              <div className="flex items-center gap-1.5">
                <span className={cn("font-bold", cg.netPnL >= 0 ? "text-emerald-400" : "text-rose-400")}>
                  {formatSignedCurrency(cg.netPnL, cg.currency)}
                </span>
                <span className="text-[10px] text-slate-500">
                  ({cg.pctGain >= 0 ? `+${cg.pctGain.toFixed(1)}%` : `${cg.pctGain.toFixed(1)}%`})
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
          <span>{portfolioStats.currencies.length} Mata Uang Aktif</span>
          {onOpenEditBalance && (
            <button
              type="button"
              onClick={onOpenEditBalance}
              className="text-emerald-400 hover:underline flex items-center gap-1"
            >
              Ubah Modal <Pencil className="h-2.5 w-2.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Total Pemasukan (Cuan) Breakdown */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold text-slate-400">Total Pemasukan (Cuan)</span>
          <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <ArrowDownLeft className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-3 space-y-1.5">
          {portfolioStats.currencyGroups.map((cg) => (
            <div key={cg.currency} className="flex items-center justify-between text-xs font-mono bg-slate-950/50 px-2.5 py-1 rounded-xl border border-slate-800/60">
              <span className="text-slate-400 font-bold">{cg.currency}</span>
              <span className="font-bold text-emerald-400">
                +{formatCurrency(cg.grossProfit, cg.currency)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 font-medium">
          {totalWinning} transaksi profit tercatat
        </div>
      </div>

      {/* 3. Total Pengeluaran (Boncos) Breakdown */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold text-slate-400">Total Pengeluaran (Boncos)</span>
          <div className="h-8 w-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-3 space-y-1.5">
          {portfolioStats.currencyGroups.map((cg) => (
            <div key={cg.currency} className="flex items-center justify-between text-xs font-mono bg-slate-950/50 px-2.5 py-1 rounded-xl border border-slate-800/60">
              <span className="text-slate-400 font-bold">{cg.currency}</span>
              <span className="font-bold text-rose-400">
                -{formatCurrency(cg.grossLoss, cg.currency)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 font-medium">
          {totalLosing} transaksi loss tercatat
        </div>
      </div>

      {/* 4. Total Catatan & Sebaran Akun */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold text-slate-400">Total Catatan & Akun</span>
          <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <ReceiptText className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-2">
          <div className="text-2xl font-extrabold font-mono text-white">
            {portfolioStats.totalTradesCount} <span className="text-xs font-sans text-slate-400 font-normal">Transaksi</span>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {portfolioStats.accountTypeGroups.map((tg) => (
              <span
                key={tg.type}
                className={cn(
                  "text-[9px] font-bold px-2 py-0.5 rounded-md border font-mono",
                  tg.type.toLowerCase() === "real"
                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                    : tg.type.toLowerCase().includes("prop")
                    ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                    : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                )}
              >
                {tg.type}: {tg.count} akun ({tg.tradeCount})
              </span>
            ))}
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 font-medium truncate">
          Semua portofolio trading gabungan
        </div>
      </div>
    </div>
  );
}
