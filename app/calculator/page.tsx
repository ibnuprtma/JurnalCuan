"use client";

import * as React from "react";
import { PositionSizeCalculator } from "@/components/tools/position-size-calculator";

export default function CalculatorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Kalkulator Manajemen Risiko</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Hitung ukuran lot ideal berdasarkan persentase risiko modal dan jarak Stop Loss
        </p>
      </div>

      <PositionSizeCalculator />
    </div>
  );
}
