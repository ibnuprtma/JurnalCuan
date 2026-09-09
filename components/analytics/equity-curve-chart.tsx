"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatCurrency, formatSignedCurrency, getCurrencySymbol, cn } from "@/lib/utils";
import { SampleTrade } from "@/lib/sample-data";

interface EquityCurveChartProps {
  trades: SampleTrade[];
  initialBalance?: number;
  currency?: string;
}

export function EquityCurveChart({
  trades,
  initialBalance = 5000,
  currency = "USD",
}: EquityCurveChartProps) {
  const chartData = React.useMemo(() => {
    // Sort chronologically
    const sorted = [...trades].sort(
      (a, b) => new Date(a.openTime).getTime() - new Date(b.openTime).getTime()
    );

    let runningBalance = initialBalance;
    let runningPnL = 0;

    const dataPoints = [
      {
        date: "Start",
        balance: initialBalance,
        cumPnL: 0,
        tradeName: "Saldo Awal",
      },
    ];

    const seenLabels = new Map<string, number>();

    sorted.forEach((t, index) => {
      runningPnL += t.netPnL;
      runningBalance += t.netPnL;
      const d = new Date(t.openTime);
      const timeStr = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      const baseLabel = `${d.getDate()}/${d.getMonth() + 1}`;
      const count = (seenLabels.get(baseLabel) || 0) + 1;
      seenLabels.set(baseLabel, count);

      const dateLabel = count > 1 ? `${baseLabel} (${timeStr})` : baseLabel;

      dataPoints.push({
        date: dateLabel,
        balance: Number(runningBalance.toFixed(2)),
        cumPnL: Number(runningPnL.toFixed(2)),
        tradeName: t.notes || (t.pair && t.pair !== "CATATAN" ? `${t.pair} (${t.direction})` : `Catatan #${index + 1}`),
      });
    });

    if (sorted.length === 0) {
      dataPoints.push({
        date: "Saat Ini",
        balance: initialBalance,
        cumPnL: 0,
        tradeName: "Belum ada transaksi",
      });
    }

    return dataPoints;
  }, [trades, initialBalance]);

  const latestBalance = chartData[chartData.length - 1]?.balance ?? initialBalance;
  const totalGain = latestBalance - initialBalance;
  const percentageGain = initialBalance > 0 ? ((totalGain / initialBalance) * 100).toFixed(1) : "0.0";
  const isPositiveGain = totalGain >= 0;

  // Calculate dynamic Y domain with padding so movements are visible and not squashed to 0
  const yDomain = React.useMemo(() => {
    const balances = chartData.map((d) => d.balance);
    const min = Math.min(...balances);
    const max = Math.max(...balances);
    const delta = max - min;
    const padding = delta === 0 ? Math.max(min * 0.05, 100) : Math.max(delta * 0.25, 50);
    const low = Math.max(0, Math.floor(min - padding));
    const high = Math.ceil(max + padding);
    return [low, high];
  }, [chartData]);

  const strokeColor = isPositiveGain ? "#10b981" : "#f43f5e";
  const gradId = isPositiveGain ? "cuanEquityGrad" : "lossEquityGrad";

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl p-5 shadow-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">Pertumbuhan Saldo (Equity Curve)</h3>
            <span
              className={cn(
                "text-[10px] px-2 py-0.5 rounded-md font-bold border",
                isPositiveGain
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-300 border-rose-500/20"
              )}
            >
              {isPositiveGain ? `+${percentageGain}%` : `${percentageGain}%`} ROI
            </span>
          </div>
          <p className="text-xs text-slate-400">Akumulasi modal dan profit/loss dari waktu ke waktu</p>
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold text-slate-400">Saldo Terkini</div>
          <div className="text-xl font-extrabold text-white font-mono">
            {formatCurrency(latestBalance, currency)}
          </div>
        </div>
      </div>

      <div className="h-[280px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="cuanEquityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="lossEquityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={yDomain}
              tickFormatter={(v) => {
                const sym = getCurrencySymbol(currency);
                if (currency === "IDR") {
                  return v >= 1000000
                    ? `Rp${(v / 1000000).toFixed(1)}M`
                    : v >= 1000
                    ? `Rp${(v / 1000).toFixed(0)}k`
                    : `Rp${v}`;
                }
                return `${sym}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`;
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-3 shadow-xl backdrop-blur-md text-xs font-mono">
                      <div className="text-slate-400 font-sans">{data.tradeName}</div>
                      <div className="text-white font-bold mt-1">
                        Saldo: {formatCurrency(data.balance, currency)}
                      </div>
                      <div
                        className={cn(
                          "font-bold mt-0.5",
                          data.cumPnL > 0
                            ? "text-emerald-400"
                            : data.cumPnL < 0
                            ? "text-rose-400"
                            : "text-slate-400"
                        )}
                      >
                        Net Profit: {formatSignedCurrency(data.cumPnL, currency)}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke={strokeColor}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#${gradId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
