"use client";

import * as React from "react";
import { useAppShell } from "@/components/layout/app-shell";
import { KPISummaryCards } from "@/components/dashboard/kpi-summary-cards";
import { EquityCurveChart } from "@/components/analytics/equity-curve-chart";
import { BreakdownCharts } from "@/components/analytics/breakdown-charts";

export default function AnalyticsPage() {
  const { trades } = useAppShell();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Statistik & Analisis Performa</h1>
        <p className="text-xs text-slate-400">
          Evaluasi mendalam mengenai rasio kemenangan, instrumen paling cuan, dan sesi trading paling optimal
        </p>
      </div>

      {/* KPI Cards */}
      <KPISummaryCards trades={trades} />

      {/* Equity Curve */}
      <EquityCurveChart trades={trades} initialBalance={5000} />

      {/* Pair and Session Breakdown */}
      <BreakdownCharts trades={trades} />
    </div>
  );
}
