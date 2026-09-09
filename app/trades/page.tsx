"use client";

import * as React from "react";
import { useAppShell } from "@/components/layout/app-shell";
import { TradesTable } from "@/components/trades/trades-table";

export default function TradesPage() {
  const { trades, openNewTradeModal } = useAppShell();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Catatan Transaksi</h1>
        <p className="text-xs text-slate-400">
          Riwayat lengkap catatan transaksi cuan (pemasukan) dan boncos (pengeluaran) kamu
        </p>
      </div>

      <TradesTable
        trades={trades}
        onOpenNewTrade={openNewTradeModal}
      />
    </div>
  );
}
