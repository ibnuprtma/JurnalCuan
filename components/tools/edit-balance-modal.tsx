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
import { formatCurrency, getCurrencySymbol, cn } from "@/lib/utils";
import { Wallet, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface EditBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: any[];
  currentAccountId?: string;
  onBalanceUpdated?: () => void;
}

export function EditBalanceModal({
  isOpen,
  onClose,
  accounts = [],
  currentAccountId,
  onBalanceUpdated,
}: EditBalanceModalProps) {
  const [selectedId, setSelectedId] = React.useState<string>("");
  const [balanceInput, setBalanceInput] = React.useState<string>("");
  const [currencyInput, setCurrencyInput] = React.useState<string>("USD");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const realAccounts = React.useMemo(() => {
    return accounts.filter((a) => a.id !== "all");
  }, [accounts]);

  const activeAccount = React.useMemo(() => {
    return realAccounts.find((a) => a.id === selectedId) || realAccounts[0];
  }, [realAccounts, selectedId]);

  // Set initial state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
      const initialId = currentAccountId && currentAccountId !== "all" ? currentAccountId : realAccounts[0]?.id || "";
      setSelectedId(initialId);
      const acc = realAccounts.find((a) => a.id === initialId) || realAccounts[0];
      if (acc) {
        const bal = acc.initialBalance || acc.currentBalance || 10000;
        setBalanceInput(bal.toString());
        setCurrencyInput(acc.currency || "USD");
      }
    }
  }, [isOpen, currentAccountId, realAccounts]);

  // When selected account changes
  const handleAccountChange = (id: string) => {
    setSelectedId(id);
    const acc = realAccounts.find((a) => a.id === id);
    if (acc) {
      const bal = acc.initialBalance || acc.currentBalance || 10000;
      setBalanceInput(bal.toString());
      setCurrencyInput(acc.currency || "USD");
    }
  };

  const handleQuickPreset = (val: number) => {
    setBalanceInput(val.toString());
  };

  const symbol = getCurrencySymbol(currencyInput);

  const presets =
    currencyInput === "IDR"
      ? [
          { val: 500000, label: "Rp 500rb" },
          { val: 1000000, label: "Rp 1jt" },
          { val: 2500000, label: "Rp 2.5jt" },
          { val: 5000000, label: "Rp 5jt" },
          { val: 10000000, label: "Rp 10jt" },
          { val: 25000000, label: "Rp 25jt" },
          { val: 50000000, label: "Rp 50jt" },
        ]
      : [
          { val: 1000, label: `${symbol}1k` },
          { val: 5000, label: `${symbol}5k` },
          { val: 10000, label: `${symbol}10k` },
          { val: 25000, label: `${symbol}25k` },
          { val: 50000, label: `${symbol}50k` },
          { val: 100000, label: `${symbol}100k` },
        ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(balanceInput);
    if (isNaN(num) || num < 0) {
      setErrorMessage("Nominal saldo awal harus berupa angka positif.");
      return;
    }

    if (!activeAccount) {
      setErrorMessage("Akun tidak ditemukan.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: activeAccount.id,
          initialBalance: num,
          currency: currencyInput,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Gagal memperbarui saldo awal.");
        return;
      }

      setSuccessMessage(`Saldo awal berhasil diubah menjadi ${formatCurrency(num, currencyInput)}!`);
      onBalanceUpdated?.();
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      setErrorMessage("Terjadi kesalahan jaringan, silakan coba lagi.");
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
            <Wallet className="h-4 w-4" />
          </div>
          <span>Ubah Modal Saldo Awal</span>
        </DialogTitle>
        <DialogDescription>
          Atur modal saldo awal dan mata uang akun untuk baseline perhitungan persentase cuan dan grafik modal
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Account Selector */}
        {realAccounts.length > 1 && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Pilih Akun Portofolio</label>
            <select
              value={selectedId}
              onChange={(e) => handleAccountChange(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-800 bg-slate-950/60 px-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {realAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.broker || "Forex"}) — {acc.currency || "USD"}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Currency Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">Mata Uang Akun</label>
          <select
            value={currencyInput}
            onChange={(e) => setCurrencyInput(e.target.value)}
            className="w-full h-10 rounded-xl border border-slate-800 bg-slate-950/60 px-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="IDR">IDR — Rupiah Indonesia (Rp)</option>
            <option value="USD">USD — US Dollar ($)</option>
            <option value="EUR">EUR — Euro (€)</option>
            <option value="GBP">GBP — British Pound (£)</option>
            <option value="JPY">JPY — Japanese Yen (¥)</option>
            <option value="SGD">SGD — Singapore Dollar (S$)</option>
            <option value="AUD">AUD — Australian Dollar (A$)</option>
          </select>
        </div>

        {/* Balance Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300">
              Modal Saldo Awal ({currencyInput})
            </label>
            {activeAccount && (
              <span className="text-[10px] text-slate-400 font-mono">
                Saat ini:{" "}
                {formatCurrency(
                  activeAccount.initialBalance || activeAccount.currentBalance || 0,
                  activeAccount.currency || currencyInput
                )}
              </span>
            )}
          </div>

          <div className="relative">
            <span
              className={cn(
                "absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-emerald-400 select-none",
                symbol.length > 1 ? "text-sm" : "text-lg"
              )}
            >
              {symbol}
            </span>
            <Input
              type="number"
              step="any"
              min="0"
              required
              autoFocus
              placeholder={currencyInput === "IDR" ? "800000" : "10000"}
              value={balanceInput}
              onChange={(e) => setBalanceInput(e.target.value)}
              className={cn(
                "text-xl font-mono font-bold h-12 rounded-xl border-slate-800 bg-slate-950/60 text-emerald-400 focus:ring-2 focus:ring-emerald-500/50",
                symbol.length > 1 ? "pl-12" : "pl-9"
              )}
            />
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-slate-500">Preset:</span>
            {presets.map((preset) => (
              <button
                key={preset.val}
                type="button"
                onClick={() => handleQuickPreset(preset.val)}
                className="text-[10px] font-mono px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error / Success feedback */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
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
            disabled={isSubmitting || !balanceInput}
            className="text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <span>Simpan Perubahan</span>
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
