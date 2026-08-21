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
import { formatCurrency, formatSignedCurrency } from "@/lib/utils";
import { SampleTrade } from "@/lib/sample-data";
import { TrendingUp } from "lucide-react";

interface EquityCurveChartProps {
  trades: SampleTrade[];
  initialBalance?: number;
}

export function EquityCurveChart({ trades, initialBalance = 5000 }: EquityCurveChartProps) {
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

    sorted.forEach((t, index) => {
      runningPnL += t.netPnL;
      runningBalance += t.netPnL;
      const d = new Date(t.openTime);
      const dateLabel = `${d.getDate()}/${d.getMonth() + 1}`;

      dataPoints.push({
        date: dateLabel,
        balance: Number(runningBalance.toFixed(2)),
        cumPnL: Number(runningPnL.toFixed(2)),
        tradeName: `${t.pair} (${t.direction})`,
      });
    });

    return dataPoints;
  }, [trades, initialBalance]);

  const latestBalance = chartData[chartData.length - 1]?.balance || initialBalance;
  const totalGain = latestBalance - initialBalance;
  const percentageGain = ((totalGain / initialBalance) * 100).toFixed(1);

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl p-5 shadow-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">Pertumbuhan Saldo (Equity Curve)</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
              +{percentageGain}% ROI
            </span>
          </div>
          <p className="text-xs text-slate-400">Akumulasi modal dan profit/loss dari waktu ke waktu</p>
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold text-slate-400">Saldo Terkini</div>
          <div className="text-xl font-extrabold text-white font-mono">{formatCurrency(latestBalance)}</div>
        </div>
      </div>

      <div className="h-[280px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="cuanEquityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
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
              tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              domain={["auto", "auto"]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-3 shadow-xl backdrop-blur-md text-xs font-mono">
                      <div className="text-slate-400 font-sans">{data.tradeName}</div>
                      <div className="text-white font-bold mt-1">
                        Saldo: {formatCurrency(data.balance)}
                      </div>
                      <div className="text-emerald-400 font-bold">
                        Net Profit: {formatSignedCurrency(data.cumPnL)}
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
              stroke="#10b981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#cuanEquityGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
