"use client";

import * as React from "react";
import { formatCurrency, formatSignedCurrency, cn } from "@/lib/utils";
import { SampleTrade } from "@/lib/sample-data";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogCloseButton } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Clock, Tag, MessageSquare, AlertCircle } from "lucide-react";

interface DayTradesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  trades: SampleTrade[];
  onOpenNewTradeForDate?: (date: Date) => void;
}

export function DayTradesDrawer({ isOpen, onClose, date, trades }: DayTradesDrawerProps) {
  if (!date) return null;

  const dateString = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);

  const totalPnL = trades.reduce((acc, t) => acc + t.netPnL, 0);
  const totalPips = trades.reduce((acc, t) => acc + t.netPips, 0);
  const winCount = trades.filter((t) => t.status === "WIN").length;
  const winRate = trades.length > 0 ? (winCount / trades.length) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogCloseButton onClose={onClose} />
      <DialogHeader>
        <DialogTitle>
          <div className="flex items-center gap-2">
            <span>Rekap Harian</span>
          </div>
        </DialogTitle>
        <DialogDescription>{dateString}</DialogDescription>
      </DialogHeader>

      {/* Day Summary Cards */}
      <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 mb-5">
        <div className="text-center p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
          <div className="text-[10px] uppercase font-bold text-slate-400">Net Cuan</div>
          <div
            className={cn(
              "text-sm font-extrabold font-mono mt-0.5",
              totalPnL > 0 ? "text-emerald-400" : totalPnL < 0 ? "text-rose-400" : "text-slate-300"
            )}
          >
            {formatSignedCurrency(totalPnL)}
          </div>
        </div>

        <div className="text-center p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
          <div className="text-[10px] uppercase font-bold text-slate-400">Win Rate</div>
          <div className="text-sm font-extrabold text-white mt-0.5 font-mono">
            {winRate.toFixed(0)}%
          </div>
        </div>

        <div className="text-center p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Pips</div>
          <div
            className={cn(
              "text-sm font-extrabold font-mono mt-0.5",
              totalPips >= 0 ? "text-emerald-400" : "text-rose-400"
            )}
          >
            {totalPips > 0 ? `+${totalPips.toFixed(1)}` : totalPips.toFixed(1)} pips
          </div>
        </div>
      </div>

      {/* List of Trades */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Daftar Transaksi ({trades.length})
          </h4>
        </div>

        {trades.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
            Tidak ada transaksi pada tanggal ini (Hari Istirahat / No Trade).
          </div>
        ) : (
          trades.map((trade) => (
            <div
              key={trade.id}
              className="p-3.5 rounded-2xl border border-slate-800/90 bg-slate-950/70 hover:border-slate-700 transition-all space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={trade.direction === "BUY" ? "buy" : "sell"}>
                    {trade.direction}
                  </Badge>
                  <span className="font-bold text-sm text-white font-mono">{trade.pair}</span>
                  <span className="text-xs text-slate-400">{trade.lotSize} Lot</span>
                </div>

                <div
                  className={cn(
                    "font-bold text-sm font-mono flex items-center gap-1",
                    trade.netPnL > 0 ? "text-emerald-400" : trade.netPnL < 0 ? "text-rose-400" : "text-slate-300"
                  )}
                >
                  {trade.netPnL > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : trade.netPnL < 0 ? <TrendingDown className="h-3.5 w-3.5" /> : null}
                  {formatSignedCurrency(trade.netPnL)}
                </div>
              </div>

              {/* Trade Details Bar */}
              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
                <div>
                  <span className="text-slate-500">Entry: </span>
                  <span className="text-slate-200">{trade.entryPrice}</span>
                </div>
                <div>
                  <span className="text-slate-500">Exit: </span>
                  <span className="text-slate-200">{trade.exitPrice}</span>
                </div>
                <div>
                  <span className="text-slate-500">R:R: </span>
                  <span className="text-slate-200">1:{trade.riskRewardRatio.toFixed(1)}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {trade.strategyName && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    {trade.strategyName}
                  </span>
                )}
                {trade.emotionTag && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    {trade.emotionTag}
                  </span>
                )}
                {trade.mistakeTag && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 flex items-center gap-1">
                    <AlertCircle className="h-2.5 w-2.5" />
                    {trade.mistakeTag}
                  </span>
                )}
                {trade.session && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                    {trade.session}
                  </span>
                )}
              </div>

              {trade.notes && (
                <p className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80 italic">
                  &quot;{trade.notes}&quot;
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </Dialog>
  );
}
