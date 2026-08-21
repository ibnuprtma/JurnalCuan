"use client";

import * as React from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogCloseButton, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatSignedCurrency } from "@/lib/utils";
import { SampleTrade } from "@/lib/sample-data";
import { Download, Sparkles, TrendingUp, TrendingDown, Share2, Copy, Check } from "lucide-react";

interface CuanCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  trades: SampleTrade[];
  accountName?: string;
}

export function CuanCardModal({ isOpen, onClose, trades, accountName = "Personal Account" }: CuanCardModalProps) {
  const [copied, setCopied] = React.useState(false);
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
  const winRate = trades.length > 0 ? (winCount / trades.length) * 100 : 0;
  const topTrade = [...trades].sort((a, b) => b.netPnL - a.netPnL)[0];

  const handleDownload = () => {
    // In browser, create canvas screenshot or direct prompt
    alert("Cuan Card siap diunduh! Screenshot gambar atau bagikan langsung ke media sosial kamu.");
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
              <div
                className={`text-4xl font-extrabold font-mono tracking-tight drop-shadow-lg ${
                  netPnL >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {formatSignedCurrency(netPnL)}
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-200">
                <span className="text-emerald-400 font-bold font-mono">{winRate.toFixed(0)}% Win Rate</span>
                <span>•</span>
                <span>{trades.length} Trades</span>
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
                  <span className="text-slate-400">Best Trade:</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {topTrade.pair} ({formatSignedCurrency(topTrade.netPnL)})
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
        <Button onClick={handleDownload} className="gap-1.5 text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold">
          <Download className="h-4 w-4 stroke-[2.5]" />
          <span>Download Cuan Card</span>
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
