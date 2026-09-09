"use client";

import * as React from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogCloseButton,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatSignedCurrency, getCurrencySymbol, cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Calendar, Wallet, FileText, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface TradeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTrade: (tradeData: any) => Promise<void> | void;
  selectedAccountId?: string;
  accounts?: Array<{ id: string; name: string; broker?: string | null; currency?: string; accountType?: string | null }>;
}

export function TradeFormModal({
  isOpen,
  onClose,
  onSaveTrade,
  selectedAccountId,
  accounts = [],
}: TradeFormModalProps) {
  const [transactionType, setTransactionType] = React.useState<"PROFIT" | "LOSS">("PROFIT");
  const [amount, setAmount] = React.useState<string>("");
  const [notes, setNotes] = React.useState<string>("");
  const [targetAccountId, setTargetAccountId] = React.useState<string>("");
  const [dateTime, setDateTime] = React.useState<string>("");

  // Initialize date to current local datetime
  React.useEffect(() => {
    if (isOpen) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setDateTime(now.toISOString().slice(0, 16));
      setAmount("");
      setNotes("");
      setTransactionType("PROFIT");
    }
  }, [isOpen]);

  // Sync target account
  React.useEffect(() => {
    if (selectedAccountId && selectedAccountId !== "all") {
      setTargetAccountId(selectedAccountId);
    } else if (accounts.length > 0) {
      setTargetAccountId(accounts[0].id);
    }
  }, [selectedAccountId, accounts, isOpen]);

  const currentAccount =
    accounts.find((a) => a.id === targetAccountId) ||
    accounts.find((a) => a.id === selectedAccountId) ||
    accounts[0];
  const accountCurrency = currentAccount?.currency || "USD";
  const symbol = getCurrencySymbol(accountCurrency);

  const presets =
    accountCurrency === "IDR"
      ? [
          { val: 50000, label: "Rp 50rb" },
          { val: 100000, label: "Rp 100rb" },
          { val: 250000, label: "Rp 250rb" },
          { val: 500000, label: "Rp 500rb" },
          { val: 1000000, label: "Rp 1jt" },
        ]
      : [
          { val: 25, label: `${symbol}25` },
          { val: 50, label: `${symbol}50` },
          { val: 100, label: `${symbol}100` },
          { val: 250, label: `${symbol}250` },
          { val: 500, label: `${symbol}500` },
        ];

  const numericAmount = parseFloat(amount) || 0;
  const calculatedPnL = transactionType === "PROFIT" ? numericAmount : -numericAmount;

  const handleQuickAmount = (val: number) => {
    setAmount(val.toString());
  };

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numericAmount <= 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSaveTrade({
        netPnL: calculatedPnL,
        notes: notes.trim() || undefined,
        openTime: dateTime ? new Date(dateTime).toISOString() : new Date().toISOString(),
        accountId: targetAccountId || undefined,
      });

      toast.success(
        transactionType === "PROFIT"
          ? `Cuan ${formatSignedCurrency(calculatedPnL, accountCurrency)} berhasil dicatat! 🎉`
          : `Catatan pengeluaran ${formatSignedCurrency(calculatedPnL, accountCurrency)} disimpan.`
      );
      onClose();
    } catch (err) {
      toast.error("Gagal menyimpan transaksi, silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogCloseButton onClose={onClose} />
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <span>Catat Transaksi Sederhana</span>
        </DialogTitle>
        <DialogDescription>
          Catat hasil cuan (pemasukan) atau boncos (pengeluaran) transaksi harian kamu secara cepat
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Account Selection */}
        {accounts.length > 1 && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Pilih Akun Portofolio</label>
            <select
              value={targetAccountId}
              onChange={(e) => setTargetAccountId(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-800 bg-slate-950/60 px-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {accounts
                .filter((a) => a.id !== "all")
                .map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} — {acc.broker && acc.broker !== "-" ? acc.broker : "Forex"} — {acc.accountType || "Real"} ({acc.currency || "USD"})
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Transaction Type: PROFIT / LOSS Toggle */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTransactionType("PROFIT")}
            className={cn(
              "h-12 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all border",
              transactionType === "PROFIT"
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-lg shadow-emerald-500/10"
                : "text-slate-400 hover:text-white hover:bg-slate-900 border-slate-800"
            )}
          >
            <TrendingUp className="h-4 w-4" />
            <span>🟢 Cuan (Profit / +)</span>
          </button>

          <button
            type="button"
            onClick={() => setTransactionType("LOSS")}
            className={cn(
              "h-12 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all border",
              transactionType === "LOSS"
                ? "bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-lg shadow-rose-500/10"
                : "text-slate-400 hover:text-white hover:bg-slate-900 border-slate-800"
            )}
          >
            <TrendingDown className="h-4 w-4" />
            <span>🔴 Boncos (Loss / -)</span>
          </button>
        </div>

        {/* Amount Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">Nominal ({symbol})</label>
          <div className="relative">
            <span
              className={cn(
                "absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold select-none",
                symbol.length > 1 ? "text-sm" : "text-lg",
                transactionType === "PROFIT" ? "text-emerald-400" : "text-rose-400"
              )}
            >
              {transactionType === "PROFIT" ? `+${symbol}` : `-${symbol}`}
            </span>
            <Input
              type="number"
              step="any"
              min="0"
              required
              autoFocus
              placeholder={accountCurrency === "IDR" ? "100000" : "0.00"}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={cn(
                "text-xl font-mono font-bold h-12 rounded-xl border-slate-800 bg-slate-950/60 focus:ring-2",
                symbol.length > 1 ? "pl-14" : "pl-11",
                transactionType === "PROFIT"
                  ? "focus:ring-emerald-500/50 text-emerald-400"
                  : "focus:ring-rose-500/50 text-rose-400"
              )}
            />
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-slate-500">Preset:</span>
            {presets.map((p) => (
              <button
                key={p.val}
                type="button"
                onClick={() => handleQuickAmount(p.val)}
                className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date & Time */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>Tanggal & Waktu</span>
          </label>
          <Input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            className="text-xs h-10 rounded-xl border-slate-800 bg-slate-950/60 text-slate-200"
          />
        </div>

        {/* Account Selector (if multiple accounts) */}
        {accounts.length > 1 && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5 text-slate-400" />
              <span>Akun Portofolio</span>
            </label>
            <select
              value={targetAccountId}
              onChange={(e) => setTargetAccountId(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-800 bg-slate-950/60 px-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.broker || "Forex"})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Notes / Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-slate-400" />
            <span>Deskripsi / Catatan</span>
          </label>
          <Textarea
            rows={2}
            placeholder="Contoh: Scalping Gold sesi London, Profit EURUSD, atau Fee penarikan..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="text-xs rounded-xl border-slate-800 bg-slate-950/60 resize-none"
          />
        </div>

        {/* Summary Card */}
        {numericAmount > 0 && (
          <div
            className={cn(
              "p-3 rounded-xl border text-xs flex items-center justify-between",
              transactionType === "PROFIT"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/20 text-rose-300"
            )}
          >
            <span>Akan dicatat sebagai:</span>
            <span className="font-mono font-bold text-sm">
              {formatSignedCurrency(calculatedPnL, accountCurrency)}
            </span>
          </div>
        )}

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs text-slate-400 hover:text-white"
          >
            Batal
          </Button>

          <Button
            type="submit"
            disabled={numericAmount <= 0 || isSubmitting}
            className={cn(
              "text-xs font-bold shadow-lg transition-all min-w-[140px]",
              transactionType === "PROFIT"
                ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20"
                : "bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20"
            )}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Menyimpan Catatan...</span>
              </span>
            ) : (
              <span>Simpan Catatan</span>
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
