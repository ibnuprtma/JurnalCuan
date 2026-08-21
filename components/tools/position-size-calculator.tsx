"use client";

import * as React from "react";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { POPULAR_PAIRS } from "@/lib/forex-utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator, ShieldCheck, AlertCircle } from "lucide-react";

export function PositionSizeCalculator() {
  const [accountBalance, setAccountBalance] = React.useState<string>("5000");
  const [riskPercent, setRiskPercent] = React.useState<string>("1.0");
  const [stopLossPips, setStopLossPips] = React.useState<string>("20");
  const [pair, setPair] = React.useState<string>("XAUUSD");

  const calculation = React.useMemo(() => {
    const balance = parseFloat(accountBalance) || 0;
    const riskPct = parseFloat(riskPercent) || 0;
    const slPips = parseFloat(stopLossPips) || 0;

    const riskAmountUSD = (balance * riskPct) / 100;

    if (balance > 0 && riskAmountUSD > 0 && slPips > 0) {
      // Pip value per 1.0 standard lot
      const pipValuePerLot = pair.includes("XAU") ? 10.0 : pair.includes("JPY") ? 6.5 : 10.0;
      const recommendedLot = riskAmountUSD / (slPips * pipValuePerLot);

      return {
        riskAmountUSD,
        recommendedLot: Number(recommendedLot.toFixed(2)),
        pipValuePerLot,
      };
    }

    return {
      riskAmountUSD: 0,
      recommendedLot: 0,
      pipValuePerLot: 10,
    };
  }, [accountBalance, riskPercent, stopLossPips, pair]);

  return (
    <div className="max-w-2xl mx-auto rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl p-6 shadow-2xl space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800/80">
        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Calculator className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Forex Lot Size & Risk Calculator</h2>
          <p className="text-xs text-slate-400">Hitung volume lot yang aman sebelum melakukan eksekusi order</p>
        </div>
      </div>

      {/* Result Display Box */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-950/90 to-slate-950 border border-emerald-500/30 text-center space-y-2">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Rekomendasi Ukuran Lot
        </div>
        <div className="text-4xl font-extrabold text-emerald-400 font-mono tracking-tight">
          {calculation.recommendedLot > 0 ? `${calculation.recommendedLot} LOT` : "0.00 LOT"}
        </div>
        <div className="flex items-center justify-center gap-4 text-xs text-slate-300 font-mono pt-1">
          <span>Risiko: <strong>{formatCurrency(calculation.riskAmountUSD)}</strong></span>
          <span>•</span>
          <span>SL: <strong>{stopLossPips} Pips</strong></span>
        </div>
      </div>

      {/* Input Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">Pair Forex</label>
          <select
            value={pair}
            onChange={(e) => setPair(e.target.value)}
            className="w-full h-10 rounded-xl border border-slate-800 bg-slate-900 px-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono"
          >
            {POPULAR_PAIRS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">Saldo Modal Akun ($)</label>
          <Input
            type="number"
            value={accountBalance}
            onChange={(e) => setAccountBalance(e.target.value)}
            placeholder="5000"
            className="font-mono text-xs"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">Toleransi Risiko (%)</label>
          <Input
            type="number"
            step="0.1"
            value={riskPercent}
            onChange={(e) => setRiskPercent(e.target.value)}
            placeholder="1.0"
            className="font-mono text-xs"
          />
          <div className="flex gap-1.5 mt-1.5">
            {["0.5", "1.0", "1.5", "2.0"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRiskPercent(r)}
                className={`text-[10px] px-2 py-0.5 rounded-md font-mono transition-colors ${
                  riskPercent === r
                    ? "bg-emerald-500 text-slate-950 font-bold"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {r}%
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">Jarak Stop Loss (Pips)</label>
          <Input
            type="number"
            value={stopLossPips}
            onChange={(e) => setStopLossPips(e.target.value)}
            placeholder="20"
            className="font-mono text-xs"
          />
          <div className="flex gap-1.5 mt-1.5">
            {["10", "15", "20", "30", "50"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStopLossPips(s)}
                className={`text-[10px] px-2 py-0.5 rounded-md font-mono transition-colors ${
                  stopLossPips === s
                    ? "bg-emerald-500 text-slate-950 font-bold"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {s}p
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
        <ShieldCheck className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-200">Aturan Manajemen Risiko:</strong> Jangan pernah merisikokan lebih dari 1–2% total saldo akun per transaksi untuk menjaga modal dari drawdown beruntun.
        </div>
      </div>
    </div>
  );
}
