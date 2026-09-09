"use client";

import * as React from "react";
import { formatCurrency, formatSignedCurrency, cn } from "@/lib/utils";
import { SampleTrade } from "@/lib/sample-data";
import { TrendingUp, TrendingDown, Wallet, ArrowDownLeft, ArrowUpRight, ReceiptText, Pencil } from "lucide-react";

interface KPISummaryCardsProps {
  trades: SampleTrade[];
  initialBalance?: number;
  currency?: string;
  onOpenEditBalance?: () => void;
}

export function KPISummaryCards({
  trades,
  initialBalance = 10000,
  currency = "USD",
  onOpenEditBalance,
}: KPISummaryCardsProps) {
  const stats = React.useMemo(() => {
    const totalTrades = trades.length;
    const winningTrades = trades.filter((t) => t.netPnL > 0);
    const losingTrades = trades.filter((t) => t.netPnL < 0);

    const netPnL = trades.reduce((acc, t) => acc + t.netPnL, 0);
    const grossProfit = winningTrades.reduce((acc, t) => acc + t.netPnL, 0);
    const grossLoss = Math.abs(losingTrades.reduce((acc, t) => acc + t.netPnL, 0));

    const pctGain = initialBalance > 0 ? ((netPnL / initialBalance) * 100).toFixed(2) : "0.00";

    return {
      netPnL,
      grossProfit,
      grossLoss,
      pctGain,
      totalTrades,
      winningCount: winningTrades.length,
      losingCount: losingTrades.length,
    };
  }, [trades, initialBalance]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Saldo Bersih / Net Cuan */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold text-slate-400">Saldo Bersih (Net Cuan)</span>
          <div
            className={cn(
              "h-8 w-8 rounded-xl flex items-center justify-center",
              stats.netPnL >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
            )}
          >
            {stats.netPnL >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          </div>
        </div>
        <div className="mt-3">
          <div
            className={cn(
              "text-2xl font-extrabold font-mono truncate",
              stats.netPnL >= 0 ? "text-emerald-400" : "text-rose-400"
            )}
          >
            {formatSignedCurrency(stats.netPnL, currency)}
          </div>
          <div className="flex items-center justify-between gap-1.5 mt-1.5">
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "text-[10px] font-bold font-mono px-2 py-0.5 rounded border",
                  stats.netPnL >= 0
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                    : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                )}
              >
                {stats.netPnL >= 0 ? `+${stats.pctGain}%` : `${stats.pctGain}%`}
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
                <span>Modal: {formatCurrency(initialBalance, currency)}</span>
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
            {stats.grossProfit > 0 ? `+${formatCurrency(stats.grossProfit, currency)}` : formatCurrency(0, currency)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1.5 font-medium">
            {stats.winningCount} transaksi profit
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
            {stats.grossLoss > 0 ? `-${formatCurrency(stats.grossLoss, currency)}` : formatCurrency(0, currency)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1.5 font-medium">
            {stats.losingCount} transaksi loss
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
            {stats.totalTrades}
          </div>
          <div className="text-[10px] text-slate-400 mt-1.5 font-medium">
            Riwayat transaksi tercatat
          </div>
        </div>
      </div>
    </div>
  );
}
