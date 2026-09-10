"use client";

import * as React from "react";
import { formatCurrency, formatSignedCurrency, cn } from "@/lib/utils";
import { SampleTrade } from "@/lib/sample-data";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogCloseButton } from "@/components/ui/dialog";
import { useAppShell } from "@/components/layout/app-shell";
import { Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DayTradesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  trades: SampleTrade[];
  currency?: string;
  accounts?: any[];
  onOpenNewTradeForDate?: (date: Date) => void;
}

export function DayTradesDrawer({
  isOpen,
  onClose,
  date,
  trades,
  currency = "USD",
  accounts = [],
}: DayTradesDrawerProps) {
  const { handleDeleteTrade } = useAppShell();

  // All Hooks MUST be called at top-level before any conditional return
  const tradesByCurrency = React.useMemo(() => {
    const map = new Map<string, SampleTrade[]>();
    trades.forEach((t) => {
      const acc = accounts.find((a) => a.id === t.accountId);
      const curr = (acc?.currency || currency || "USD").toUpperCase();
      const list = map.get(curr) || [];
      list.push(t);
      map.set(curr, list);
    });
    return map;
  }, [trades, accounts, currency]);

  const currencyList = React.useMemo(() => Array.from(tradesByCurrency.keys()), [tradesByCurrency]);
  const isMultiCurrency = currencyList.length > 1;

  const onDelete = async (tradeId: string) => {
    if (confirm("Hapus catatan transaksi ini?")) {
      await handleDeleteTrade(tradeId);
    }
  };

  // Safe early return only AFTER all hooks have been executed
  if (!date || !isOpen) return null;

  const dateString = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogCloseButton onClose={onClose} />
      <DialogHeader>
        <DialogTitle>
          <div className="flex items-center gap-2">
            <span>Rekap Catatan Harian</span>
          </div>
        </DialogTitle>
        <DialogDescription>{dateString}</DialogDescription>
      </DialogHeader>

      {/* Day Summary Cards */}
      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 mb-5 space-y-2 transition-colors">
        {currencyList.map((curr) => {
          const currTrades = tradesByCurrency.get(curr) || [];
          const currPnL = currTrades.reduce((acc, t) => acc + t.netPnL, 0);
          const currProfit = currTrades.filter((t) => t.netPnL > 0).reduce((acc, t) => acc + t.netPnL, 0);
          const currLoss = Math.abs(currTrades.filter((t) => t.netPnL < 0).reduce((acc, t) => acc + t.netPnL, 0));

          return (
            <div
              key={curr}
              className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60 shadow-xs"
            >
              <div className="text-center">
                <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                  Net Cuan {isMultiCurrency && `(${curr})`}
                </div>
                <div
                  className={cn(
                    "text-sm font-extrabold font-mono mt-0.5",
                    currPnL > 0 ? "text-emerald-600 dark:text-emerald-400" : currPnL < 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-700 dark:text-slate-300"
                  )}
                >
                  {formatSignedCurrency(currPnL, curr)}
                </div>
              </div>

              <div className="text-center">
                <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Pemasukan (+)</div>
                <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
                  {currProfit > 0 ? `+${formatCurrency(currProfit, curr)}` : formatCurrency(0, curr)}
                </div>
              </div>

              <div className="text-center">
                <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Pengeluaran (-)</div>
                <div className="text-sm font-extrabold text-rose-600 dark:text-rose-400 mt-0.5 font-mono">
                  {currLoss > 0 ? `-${formatCurrency(currLoss, curr)}` : formatCurrency(0, curr)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* List of Trades */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Daftar Catatan Transaksi ({trades.length})
          </h4>
        </div>

        {trades.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            Tidak ada transaksi pada tanggal ini (Hari Istirahat / No Trade).
          </div>
        ) : (
          trades.map((trade) => {
            const timeString = new Intl.DateTimeFormat("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Asia/Jakarta",
            }).format(new Date(trade.openTime));

            const isProfit = trade.netPnL >= 0;
            const displayNotes = trade.notes || trade.strategyName || "Catatan Transaksi";
            const acc = accounts.find((a) => a.id === trade.accountId);
            const tradeCurrency = acc?.currency || currency || "USD";
            const accType = acc?.accountType || "Real";

            return (
              <div
                key={trade.id}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-950/70 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs transition-all flex items-center justify-between gap-3 group"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {timeString} WIB
                    </span>

                    {acc && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {acc.name} ({accType})
                      </span>
                    )}

                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border",
                        isProfit
                          ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30"
                          : "bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30"
                      )}
                    >
                      {isProfit ? "Cuan" : "Boncos"}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-2">
                    {displayNotes}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right font-mono">
                    <div
                      className={cn(
                        "font-bold text-sm",
                        isProfit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      )}
                    >
                      {formatSignedCurrency(trade.netPnL, tradeCurrency)}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(trade.id)}
                    className="h-7 w-7 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg opacity-60 group-hover:opacity-100 transition-all cursor-pointer"
                    title="Hapus Catatan"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Dialog>
  );
}
