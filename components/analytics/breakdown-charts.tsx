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
} from "recharts";
import { formatCurrency, formatSignedCurrency } from "@/lib/utils";
import { SampleTrade } from "@/lib/sample-data";

interface BreakdownChartsProps {
  trades: SampleTrade[];
}

export function BreakdownCharts({ trades }: BreakdownChartsProps) {
  // Breakdown by Pair
  const pairData = React.useMemo(() => {
    const map = new Map<string, { pair: string; pnl: number; trades: number }>();
    trades.forEach((t) => {
      const cur = map.get(t.pair) || { pair: t.pair, pnl: 0, trades: 0 };
      cur.pnl += t.netPnL;
      cur.trades += 1;
      map.set(t.pair, cur);
    });

    return Array.from(map.values())
      .sort((a, b) => b.pnl - a.pnl)
      .map((item) => ({
        ...item,
        pnl: Number(item.pnl.toFixed(2)),
      }));
  }, [trades]);

  // Breakdown by Session
  const sessionData = React.useMemo(() => {
    const map = new Map<string, { session: string; pnl: number; trades: number }>();
    trades.forEach((t) => {
      const sessionLabel =
        t.session === "OVERLAP"
          ? "London-NY Overlap"
          : t.session === "LONDON"
          ? "London Session"
          : t.session === "NEW_YORK"
          ? "New York Session"
          : "Asian Session";

      const cur = map.get(sessionLabel) || { session: sessionLabel, pnl: 0, trades: 0 };
      cur.pnl += t.netPnL;
      cur.trades += 1;
      map.set(sessionLabel, cur);
    });

    return Array.from(map.values()).map((item) => ({
      ...item,
      pnl: Number(item.pnl.toFixed(2)),
    }));
  }, [trades]);

  // Breakdown by Strategy
  const strategyData = React.useMemo(() => {
    const map = new Map<string, { strategy: string; pnl: number; trades: number }>();
    trades.forEach((t) => {
      const cur = map.get(t.strategyName) || { strategy: t.strategyName, pnl: 0, trades: 0 };
      cur.pnl += t.netPnL;
      cur.trades += 1;
      map.set(t.strategyName, cur);
    });

    return Array.from(map.values())
      .sort((a, b) => b.pnl - a.pnl)
      .map((item) => ({
        ...item,
        pnl: Number(item.pnl.toFixed(2)),
      }));
  }, [trades]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Pair Breakdown */}
      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl p-5 shadow-2xl space-y-3">
        <div>
          <h3 className="text-base font-bold text-white">Performa per Pair Forex</h3>
          <p className="text-xs text-slate-400">Total profit/loss yang dihasilkan dari setiap instrumen</p>
        </div>

        <div className="h-[220px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pairData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="pair" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-2.5 shadow-xl text-xs font-mono">
                        <div className="text-slate-200 font-bold font-sans">{data.pair}</div>
                        <div className="text-slate-400 font-sans">{data.trades} Transaksi</div>
                        <div className={`font-bold mt-1 ${data.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          Net: {formatSignedCurrency(data.pnl)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
                {pairData.map((entry, index) => (
                  <Cell key={`cell-pair-${index}`} fill={entry.pnl >= 0 ? "#10b981" : "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Session Breakdown */}
      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl p-5 shadow-2xl space-y-3">
        <div>
          <h3 className="text-base font-bold text-white">Performa per Sesi Trading</h3>
          <p className="text-xs text-slate-400">Efektivitas hasil cuan pada jam market yang berbeda</p>
        </div>

        <div className="h-[220px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sessionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="session" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-2.5 shadow-xl text-xs font-mono">
                        <div className="text-slate-200 font-bold font-sans">{data.session}</div>
                        <div className="text-slate-400 font-sans">{data.trades} Transaksi</div>
                        <div className={`font-bold mt-1 ${data.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          Net: {formatSignedCurrency(data.pnl)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
                {sessionData.map((entry, index) => (
                  <Cell key={`cell-session-${index}`} fill={entry.pnl >= 0 ? "#10b981" : "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
