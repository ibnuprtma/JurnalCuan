"use client";

import * as React from "react";
import { useAppShell } from "@/components/layout/app-shell";
import { KPISummaryCards } from "@/components/dashboard/kpi-summary-cards";
import { EquityCurveChart } from "@/components/analytics/equity-curve-chart";
import { BreakdownCharts } from "@/components/analytics/breakdown-charts";

export default function AnalyticsPage() {
  const { trades, accounts, selectedAccountId } = useAppShell();
  const activeAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];
  const initialBaseBalance = activeAccount?.initialBalance || activeAccount?.currentBalance || 10000;
  const accountCurrency = activeAccount?.currency || "USD";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Statistik & Analisis Performa</h1>
        <p className="text-xs text-slate-400">
          Evaluasi mendalam mengenai pertumbuhan saldo, arus kas per hari, serta perbandingan pemasukan vs pengeluaran
        </p>
      </div>

      {/* KPI Cards */}
      <KPISummaryCards trades={trades} initialBalance={initialBaseBalance} currency={accountCurrency} />

      {/* Equity Curve */}
      <EquityCurveChart trades={trades} initialBalance={initialBaseBalance} currency={accountCurrency} />

      {/* Pair and Session Breakdown */}
      <BreakdownCharts trades={trades} currency={accountCurrency} />
    </div>
  );
}
