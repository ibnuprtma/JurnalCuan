"use client";

import * as React from "react";
import { useAppShell } from "@/components/layout/app-shell";
import { TradesTable } from "@/components/trades/trades-table";

export default function TradesPage() {
  const { trades, openNewTradeModal, openImportModal } = useAppShell();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Catatan Transaksi (Trade Log)</h1>
        <p className="text-xs text-slate-400">
          Riwayat lengkap eksekusi trade, analisis pips, evaluasi R:R, dan tagging emosi psikologi
        </p>
      </div>

      <TradesTable
        trades={trades}
        onOpenNewTrade={openNewTradeModal}
        onOpenImportModal={openImportModal}
      />
    </div>
  );
}
