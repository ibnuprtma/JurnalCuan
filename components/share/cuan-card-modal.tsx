"use client";

import * as React from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogCloseButton, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency, formatSignedCurrency } from "@/lib/utils";
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
        <DialogTitle>
          <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Bagikan Cuan Card</span>
        </DialogTitle>
        <DialogDescription>
          Kartu visual estetik siap dibagikan ke Instagram Story, X, atau Discord
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Ratio Selector */}
        <div className="flex justify-center gap-2">
          <Button
            type="button"
            variant={aspectRatio === "story" ? "default" : "outline"}
            size="sm"
            onClick={() => setAspectRatio("story")}
            className={cn(
              "text-xs transition-all",
              aspectRatio === "story"
                ? "bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 font-bold hover:bg-emerald-700 dark:hover:bg-emerald-400 shadow-sm"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            Instagram Story (9:16)
          </Button>
          <Button
            type="button"
            variant={aspectRatio === "square" ? "default" : "outline"}
            size="sm"
            onClick={() => setAspectRatio("square")}
            className={cn(
              "text-xs transition-all",
              aspectRatio === "square"
                ? "bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 font-bold hover:bg-emerald-700 dark:hover:bg-emerald-400 shadow-sm"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            Square / Feed (1:1)
          </Button>
        </div>

        {/* Live Visual Card Preview */}
        <div className="flex justify-center py-2">
          <div
            ref={cardRef}
            className={cn(
              "cuan-card-canvas w-full max-w-sm rounded-3xl p-6 border-2 border-emerald-500/40 shadow-2xl relative overflow-hidden flex flex-col justify-between select-none",
              aspectRatio === "story" ? "min-h-[460px]" : "min-h-[360px]"
            )}
            style={{
              background: "linear-gradient(180deg, #0e1628 0%, #090d18 50%, #05070d 100%)",
              borderColor: "rgba(16, 185, 129, 0.4)",
              color: "#ffffff",
            }}
          >
            {/* Top Brand Header */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-7 w-7 rounded-lg flex items-center justify-center font-black text-xs shadow-md shadow-emerald-500/20"
                  style={{ backgroundColor: "#10b981", color: "#020617" }}
                >
                  JC
                </div>
                <span
                  className="cuan-card-title font-extrabold text-sm tracking-tight"
                  style={{ color: "#ffffff" }}
                >
                  JURNAL<span className="cuan-card-profit" style={{ color: "#34d399" }}>CUAN</span>
                </span>
              </div>
              <span
                className="cuan-card-subtext text-[11px] font-mono font-medium"
                style={{ color: "#cbd5e1" }}
              >
                {dateFormatted}
              </span>
            </div>

            {/* Middle Main P&L Callout */}
            <div className="relative z-10 text-center my-auto py-6 space-y-2">
              <div
                className="cuan-card-subtext text-[11px] uppercase font-bold tracking-widest"
                style={{ color: "#94a3b8" }}
              >
                Daily Performance
              </div>

              {!isMultiCurrency ? (
                <div
                  className={cn(
                    "text-4xl font-extrabold font-mono tracking-tight drop-shadow-lg",
                    netPnL >= 0 ? "cuan-card-profit" : "cuan-card-loss"
                  )}
                  style={{ color: netPnL >= 0 ? "#34d399" : "#fb7185" }}
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
                        <span
                          className="cuan-card-subtext text-xs font-bold font-mono"
                          style={{ color: "#94a3b8" }}
                        >
                          {curr}:
                        </span>
                        <span
                          className="text-2xl font-extrabold font-mono"
                          style={{ color: currPnL >= 0 ? "#34d399" : "#fb7185" }}
                        >
                          {formatSignedCurrency(currPnL, curr)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div
                className="cuan-card-pill inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs"
                style={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  borderColor: "rgba(51, 65, 85, 0.8)",
                  color: "#e2e8f0",
                }}
              >
                <span className="cuan-card-profit font-bold font-mono" style={{ color: "#34d399" }}>
                  +{winCount} Cuan
                </span>
                <span style={{ color: "#64748b" }}>•</span>
                <span className="cuan-card-loss font-bold font-mono" style={{ color: "#fb7185" }}>
                  -{trades.length - winCount} Boncos
                </span>
                <span style={{ color: "#64748b" }}>•</span>
                <span className="cuan-card-pill-text" style={{ color: "#e2e8f0" }}>
                  {trades.length} Catatan
                </span>
              </div>
            </div>

            {/* Bottom Card Footer */}
            <div
              className="cuan-card-panel relative z-10 p-3.5 rounded-2xl border backdrop-blur-md space-y-1.5 shadow-lg"
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.85)",
                borderColor: "rgba(51, 65, 85, 0.8)",
              }}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="cuan-card-subtext" style={{ color: "#94a3b8" }}>
                  Akun:
                </span>
                <span className="cuan-card-val font-bold font-mono" style={{ color: "#ffffff" }}>
                  {accountName}
                </span>
              </div>
              {topTrade && (
                <div className="flex items-center justify-between text-xs">
                  <span className="cuan-card-subtext" style={{ color: "#94a3b8" }}>
                    Paling Cuan:
                  </span>
                  <span className="cuan-card-profit font-bold font-mono" style={{ color: "#34d399" }}>
                    {topTrade.notes || topTrade.pair} ({formatSignedCurrency(topTrade.netPnL, topTradeCurrency)})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <DialogFooter className="flex items-center justify-between sm:justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="gap-1.5 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-4 w-4" />}
          <span>{copied ? "Tersalin!" : "Salin Link"}</span>
        </Button>
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          className="gap-1.5 text-xs bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold shadow-md shadow-emerald-500/20"
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
