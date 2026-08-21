"use client";

import * as React from "react";
import { useAppShell } from "@/components/layout/app-shell";
import { PnLCalendar } from "@/components/calendar/pnl-calendar";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Share2 } from "lucide-react";

export default function CalendarPage() {
  const { trades, openNewTradeModal, openImportModal, openCuanCardModal } = useAppShell();

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Kalender Cuan Harian</h1>
          <p className="text-xs text-slate-400">
            Visualisasi performa profit dan loss harian dalam matriks kalender interaktif
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={openCuanCardModal}
            className="text-xs gap-1.5"
          >
            <Share2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Bagikan Cuan Card</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={openImportModal}
            className="text-xs gap-1.5"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Import MT5</span>
          </Button>

          <Button
            size="sm"
            onClick={openNewTradeModal}
            className="text-xs gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
          >
            <Plus className="h-3.5 w-3.5 stroke-[3]" />
            <span>Catat Trade</span>
          </Button>
        </div>
      </div>

      {/* Calendar Component */}
      <PnLCalendar trades={trades} onOpenNewTrade={openNewTradeModal} />
    </div>
  );
}
