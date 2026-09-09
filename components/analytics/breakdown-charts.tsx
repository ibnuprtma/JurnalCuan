"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  Legend,
} from "recharts";
import { formatCurrency, formatSignedCurrency, getCurrencySymbol } from "@/lib/utils";
import { SampleTrade } from "@/lib/sample-data";

interface BreakdownChartsProps {
  trades: SampleTrade[];
  currency?: string;
}

const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export function BreakdownCharts({ trades, currency = "USD" }: BreakdownChartsProps) {
  // 1. Day of Week Breakdown
  const dayOfWeekData = React.useMemo(() => {
    const dayMap = new Map<number, { dayIndex: number; name: string; pnl: number; count: number }>();
    for (let i = 0; i < 7; i++) {
      dayMap.set(i, { dayIndex: i, name: DAY_NAMES[i], pnl: 0, count: 0 });
    }

    trades.forEach((t) => {
      const d = new Date(t.openTime);
      const dayIdx = d.getDay();
      const cur = dayMap.get(dayIdx)!;
      cur.pnl += t.netPnL;
      cur.count += 1;
    });

    // Reorder starting Monday (Senin) to Sunday (Minggu)
    const reorderedDays = [1, 2, 3, 4, 5, 6, 0];
    return reorderedDays.map((idx) => {
      const item = dayMap.get(idx)!;
      return {
        name: item.name,
        pnl: Number(item.pnl.toFixed(2)),
        count: item.count,
      };
    });
  }, [trades]);

  // 2. Cashflow Comparison (Pemasukan vs Pengeluaran)
  const cashflowComparisonData = React.useMemo(() => {
    const totalProfit = trades.filter((t) => t.netPnL > 0).reduce((acc, t) => acc + t.netPnL, 0);
    const totalLoss = Math.abs(trades.filter((t) => t.netPnL < 0).reduce((acc, t) => acc + t.netPnL, 0));

    return [
      {
        kategori: "Pemasukan (Cuan)",
        nominal: Number(totalProfit.toFixed(2)),
        fill: "#10b981",
      },
      {
        kategori: "Pengeluaran (Boncos)",
        nominal: Number(totalLoss.toFixed(2)),
        fill: "#ef4444",
      },
    ];
  }, [trades]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Day of Week Chart */}
      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl p-5 shadow-2xl space-y-3">
        <div>
          <h3 className="text-base font-bold text-white">Performa per Hari</h3>
          <p className="text-xs text-slate-400">Akumulasi net cuan berdasarkan hari transaksi (Senin s/d Minggu)</p>
        </div>

        <div className="h-[220px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dayOfWeekData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => {
                  const sym = getCurrencySymbol(currency);
                  if (currency === "IDR") {
                    return v >= 1000000 ? `Rp${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `Rp${(v / 1000).toFixed(0)}k` : `Rp${v}`;
                  }
                  return `${sym}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`;
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-2.5 shadow-xl text-xs font-mono">
                        <div className="text-slate-200 font-bold font-sans">{data.name}</div>
                        <div className="text-slate-400 font-sans">{data.count} Transaksi</div>
                        <div className={`font-bold mt-1 ${data.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          Net: {formatSignedCurrency(data.pnl, currency)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
                {dayOfWeekData.map((entry, index) => (
                  <Cell key={`cell-day-${index}`} fill={entry.pnl >= 0 ? "#10b981" : "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Total Cashflow Comparison */}
      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl p-5 shadow-2xl space-y-3">
        <div>
          <h3 className="text-base font-bold text-white">Perbandingan Arus Kas</h3>
          <p className="text-xs text-slate-400">Perbandingan total uang masuk (cuan) vs total uang keluar (boncos)</p>
        </div>

        <div className="h-[220px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cashflowComparisonData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="kategori" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => {
                  const sym = getCurrencySymbol(currency);
                  if (currency === "IDR") {
                    return v >= 1000000 ? `Rp${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `Rp${(v / 1000).toFixed(0)}k` : `Rp${v}`;
                  }
                  return `${sym}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`;
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-2.5 shadow-xl text-xs font-mono">
                        <div className="text-slate-200 font-bold font-sans">{data.kategori}</div>
                        <div className="font-bold mt-1 text-white">
                          {formatCurrency(data.nominal, currency)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="nominal" radius={[6, 6, 0, 0]}>
                {cashflowComparisonData.map((entry, index) => (
                  <Cell key={`cell-cf-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
