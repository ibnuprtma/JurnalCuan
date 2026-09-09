"use client";

import * as React from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogCloseButton, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatSignedCurrency } from "@/lib/utils";
import { SampleTrade } from "@/lib/sample-data";
import { useAppShell } from "@/components/layout/app-shell";
import { Download, Sparkles, Copy, Check, Loader2 } from "lucide-react";
import { toPng } from "html-to-image";

interface CuanCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  trades: SampleTrade[];
  accountName?: string;
}

export function CuanCardModal({ isOpen, onClose, trades, accountName = "Personal Account" }: CuanCardModalProps) {
  const { accounts, selectedAccountId } = useAppShell();
  const isAllSelected = !selectedAccountId || selectedAccountId === "all";
  const activeAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];
  const currency = activeAccount?.currency || "USD";

  const distinctCurrencies = React.useMemo(() => {
    if (!accounts || accounts.length === 0) return [currency];
    const set = new Set(accounts.map((a) => (a.currency || "USD").toUpperCase()));
    return Array.from(set);
  }, [accounts, currency]);

  const isMultiCurrency = isAllSelected && distinctCurrencies.length > 1;

  const [copied, setCopied] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [aspectRatio, setAspectRatio] = React.useState<"story" | "square">("story");
  const cardRef = React.useRef<HTMLDivElement>(null);

  const today = new Date();
  const dateFormatted = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(today);

  const netPnL = trades.reduce((acc, t) => acc + t.netPnL, 0);
  const winCount = trades.filter((t) => t.netPnL > 0).length;
  const topTrade = [...trades].sort((a, b) => b.netPnL - a.netPnL)[0];
  const topTradeAcc = topTrade ? accounts.find((a) => a.id === topTrade.accountId) : null;
  const topTradeCurrency = topTradeAcc?.currency || currency;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        cacheBust: true,
      });

      const slug = accountName.toLowerCase().replace(/\s+/g, "-");
      const dateStr = new Date().toISOString().slice(0, 10);
      const link = document.createElement("a");
      link.download = `cuan-card-${slug}-${dateStr}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Gagal men-generate gambar Cuan Card:", error);
      alert("Gagal mengunduh Cuan Card. Silakan coba beberapa saat lagi.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogCloseButton onClose={onClose} />
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-400" />
          <span>Bagikan Cuan Card</span>
        </DialogTitle>
        <DialogDescription>Kartu visual estetik siap dibagikan ke Instagram Story, X, atau Discord</DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Ratio Selector */}
        <div className="flex justify-center gap-2">
          <Button
            type="button"
            variant={aspectRatio === "story" ? "default" : "outline"}
            size="sm"
            onClick={() => setAspectRatio("story")}
            className="text-xs"
          >
            Instagram Story (9:16)
          </Button>
          <Button
            type="button"
            variant={aspectRatio === "square" ? "default" : "outline"}
            size="sm"
            onClick={() => setAspectRatio("square")}
            className="text-xs"
          >
            Square / Feed (1:1)
          </Button>
        </div>

        {/* Live Visual Card Preview */}
        <div className="flex justify-center py-2">
          <div
            ref={cardRef}
            className={`w-full max-w-sm rounded-3xl p-6 bg-gradient-to-b from-[#0e1628] via-[#090d18] to-[#05070d] border-2 border-emerald-500/40 shadow-2xl relative overflow-hidden flex flex-col justify-between ${
              aspectRatio === "story" ? "min-h-[460px]" : "min-h-[360px]"
            }`}
          >
            {/* Background Neon Glows */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Top Brand Header */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-xs">
                  JC
                </div>
                <span className="font-extrabold text-sm tracking-tight text-white">
                  JURNAL<span className="text-emerald-400">CUAN</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">{dateFormatted}</span>
            </div>

            {/* Middle Main P&L Callout */}
            <div className="relative z-10 text-center my-auto py-6 space-y-2">
              <div className="text-[11px] uppercase font-bold text-slate-400 tracking-widest">
                Daily Performance
              </div>

              {!isMultiCurrency ? (
                <div
                  className={`text-4xl font-extrabold font-mono tracking-tight drop-shadow-lg ${
                    netPnL >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {formatSignedCurrency(netPnL, currency)}
                </div>
              ) : (
                <div className="space-y-1 py-1">
                  {distinctCurrencies.map((curr) => {
                    const currTrades = trades.filter((t) => {
                      const a = accounts.find((acc) => acc.id === t.accountId);
                      return (a?.currency || "USD").toUpperCase() === curr;
                    });
                    const currPnL = currTrades.reduce((sum, t) => sum + t.netPnL, 0);

                    return (
                      <div key={curr} className="flex items-center justify-center gap-2">
                        <span className="text-xs text-slate-400 font-bold font-mono">{curr}:</span>
                        <span
                          className={`text-2xl font-extrabold font-mono ${
                            currPnL >= 0 ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {formatSignedCurrency(currPnL, curr)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-200">
                <span className="text-emerald-400 font-bold font-mono">+{winCount} Cuan</span>
                <span>•</span>
                <span className="text-rose-400 font-bold font-mono">-{trades.length - winCount} Boncos</span>
                <span>•</span>
                <span>{trades.length} Catatan</span>
              </div>
            </div>

            {/* Bottom Card Footer */}
            <div className="relative z-10 p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Akun:</span>
                <span className="font-bold text-white font-mono">{accountName}</span>
              </div>
              {topTrade && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Paling Cuan:</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {topTrade.notes || topTrade.pair} ({formatSignedCurrency(topTrade.netPnL, topTradeCurrency)})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <DialogFooter className="flex items-center justify-between sm:justify-between">
        <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-1.5 text-xs">
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          <span>{copied ? "Tersalin!" : "Salin Link"}</span>
        </Button>
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          className="gap-1.5 text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin stroke-[2.5]" />
          ) : (
            <Download className="h-4 w-4 stroke-[2.5]" />
          )}
          <span>{isDownloading ? "Men-generate PNG..." : "Download Cuan Card"}</span>
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
