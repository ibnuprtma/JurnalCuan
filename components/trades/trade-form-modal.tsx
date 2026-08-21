"use client";

import * as React from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogCloseButton, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { POPULAR_PAIRS, EMOTION_TAGS, MISTAKE_TAGS, DEFAULT_STRATEGIES, calculatePips, calculateRiskReward } from "@/lib/forex-utils";
import { formatSignedCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Sparkles, Check, AlertTriangle } from "lucide-react";

interface TradeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTrade: (tradeData: any) => void;
  selectedAccountId?: string;
}

export function TradeFormModal({ isOpen, onClose, onSaveTrade, selectedAccountId }: TradeFormModalProps) {
  const [pair, setPair] = React.useState<string>("XAUUSD");
  const [direction, setDirection] = React.useState<"BUY" | "SELL">("BUY");
  const [lotSize, setLotSize] = React.useState<string>("0.5");
  const [entryPrice, setEntryPrice] = React.useState<string>("2480.00");
  const [exitPrice, setExitPrice] = React.useState<string>("2492.50");
  const [stopLoss, setStopLoss] = React.useState<string>("2474.00");
  const [takeProfit, setTakeProfit] = React.useState<string>("2495.00");
  const [strategy, setStrategy] = React.useState<string>("SMC / Order Block");
  const [emotion, setEmotion] = React.useState<string>("Disciplined");
  const [mistake, setMistake] = React.useState<string>("");
  const [isNewsTrade, setIsNewsTrade] = React.useState<boolean>(false);
  const [notes, setNotes] = React.useState<string>("");

  // Live Calculated metrics
  const calculatedMetrics = React.useMemo(() => {
    const entry = parseFloat(entryPrice) || 0;
    const exit = parseFloat(exitPrice) || 0;
    const sl = parseFloat(stopLoss) || 0;
    const tp = parseFloat(takeProfit) || 0;
    const lot = parseFloat(lotSize) || 0;

    if (entry > 0 && exit > 0 && lot > 0) {
      const pips = calculatePips(pair, entry, exit, direction);
      const pipMultiplier = pair.includes("XAU") ? 1.0 : pair.includes("JPY") ? 6.5 : 10.0;
      const netPnL = Number((pips * lot * pipMultiplier).toFixed(2));
      const { plannedRR, realizedRR } = calculateRiskReward(entry, exit, sl, tp, direction);

      return { pips, netPnL, plannedRR, realizedRR };
    }
    return { pips: 0, netPnL: 0, plannedRR: null, realizedRR: null };
  }, [pair, direction, lotSize, entryPrice, exitPrice, stopLoss, takeProfit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pair || !entryPrice || !lotSize) return;

    onSaveTrade({
      accountId: selectedAccountId === "all" ? "demo-account-1" : selectedAccountId,
      pair: pair.toUpperCase(),
      direction,
      lotSize: parseFloat(lotSize) || 0.1,
      entryPrice: parseFloat(entryPrice),
      exitPrice: parseFloat(exitPrice) || parseFloat(entryPrice),
      stopLoss: parseFloat(stopLoss) || 0,
      takeProfit: parseFloat(takeProfit) || 0,
      strategyName: strategy,
      emotionTag: emotion,
      mistakeTag: mistake || undefined,
      isNewsTrade,
      notes: notes || undefined,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogCloseButton onClose={onClose} />
      <DialogHeader>
        <DialogTitle>Catat Transaksi Baru</DialogTitle>
        <DialogDescription>Input data eksekusi forex dan evaluasi psikologi trading kamu</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Live Calculation Preview Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Estimasi Hasil Cuan</div>
            <div
              className={`text-xl font-extrabold font-mono flex items-center gap-1.5 ${
                calculatedMetrics.netPnL > 0
                  ? "text-emerald-400"
                  : calculatedMetrics.netPnL < 0
                  ? "text-rose-400"
                  : "text-slate-300"
              }`}
            >
              {calculatedMetrics.netPnL > 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : calculatedMetrics.netPnL < 0 ? (
                <TrendingDown className="h-4 w-4" />
              ) : null}
              {formatSignedCurrency(calculatedMetrics.netPnL)}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Pips & Risk:Reward</div>
            <div className="text-xs font-bold text-slate-200 font-mono">
              {calculatedMetrics.pips > 0 ? `+${calculatedMetrics.pips}` : calculatedMetrics.pips} Pips • R:R 1:
              {calculatedMetrics.realizedRR || calculatedMetrics.plannedRR || "1.0"}
            </div>
          </div>
        </div>

        {/* Pair & Direction Toggle */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Pair Forex</label>
            <div className="flex flex-wrap gap-1 mb-1.5">
              {POPULAR_PAIRS.slice(0, 4).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPair(p)}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-mono transition-colors ${
                    pair === p
                      ? "bg-emerald-500 text-slate-950 font-bold"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <Input
              value={pair}
              onChange={(e) => setPair(e.target.value.toUpperCase())}
              placeholder="e.g. XAUUSD, EURUSD"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Posisi (Direction)</label>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                type="button"
                onClick={() => setDirection("BUY")}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  direction === "BUY"
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                BUY (Long)
              </button>
              <button
                type="button"
                onClick={() => setDirection("SELL")}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  direction === "SELL"
                    ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                SELL (Short)
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Inputs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Lot Size</label>
            <Input
              type="number"
              step="0.01"
              value={lotSize}
              onChange={(e) => setLotSize(e.target.value)}
              placeholder="0.5"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Entry Price</label>
            <Input
              type="number"
              step="any"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              placeholder="2480.00"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Exit Price</label>
            <Input
              type="number"
              step="any"
              value={exitPrice}
              onChange={(e) => setExitPrice(e.target.value)}
              placeholder="2492.50"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Stop Loss (SL)</label>
            <Input
              type="number"
              step="any"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              placeholder="2474.00"
            />
          </div>
        </div>

        {/* Strategy & Psychology Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Strategi / Setup</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-800 bg-slate-900 px-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {DEFAULT_STRATEGIES.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Kondisi Emosi (Psikologi)</label>
            <select
              value={emotion}
              onChange={(e) => setEmotion(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-800 bg-slate-900 px-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {EMOTION_TAGS.map((em) => (
                <option key={em.label} value={em.label}>
                  {em.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mistake Tagging & News */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Tag Kesalahan (Jika ada)</label>
            <select
              value={mistake}
              onChange={(e) => setMistake(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-800 bg-slate-900 px-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            >
              <option value="">Tidak ada (Disiplin)</option>
              {MISTAKE_TAGS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="newsTrade"
              checked={isNewsTrade}
              onChange={(e) => setIsNewsTrade(e.target.checked)}
              className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500"
            />
            <label htmlFor="newsTrade" className="text-xs font-medium text-slate-300 cursor-pointer">
              Trading saat High Impact News (CPI / NFP / FOMC)
            </label>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">Catatan & Evaluasi Trade</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Alasan entry, konfirmasi timeframe besar, atau evaluasi penutupan..."
            rows={2}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="default" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold">
            Simpan ke Jurnal
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
