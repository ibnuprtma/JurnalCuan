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
  accounts?: any[];
  selectedAccountId?: string;
}

export function EquityCurveChart({
  trades,
  initialBalance = 5000,
  currency = "USD",
  accounts = [],
  selectedAccountId = "",
}: EquityCurveChartProps) {
  const isAllSelected = !selectedAccountId || selectedAccountId === "all";

  // Determine available currencies
  const distinctCurrencies = React.useMemo(() => {
    if (!accounts || accounts.length === 0) return [currency];
    const set = new Set(accounts.map((a) => (a.currency || "USD").toUpperCase()));
    return Array.from(set);
  }, [accounts, currency]);

  const isMultiCurrency = isAllSelected && distinctCurrencies.length > 1;

  // Active view tab: "ROI_PCT" | specific currency like "IDR" | "USD"
  const [activeTab, setActiveTab] = React.useState<string>("ROI_PCT");

  // Reset tab if single currency or specific account selected
  React.useEffect(() => {
    if (!isMultiCurrency) {
      setActiveTab("NOMINAL");
    } else if (activeTab === "NOMINAL") {
      setActiveTab("ROI_PCT");
    }
  }, [isMultiCurrency]);

  // Chart calculation
  const { chartData, isRoiMode, activeDisplayCurrency, totalGainPct, latestBalance, startBalance } =
    React.useMemo(() => {
      const isRoi = isMultiCurrency && activeTab === "ROI_PCT";
      const filterCurrency = isMultiCurrency && activeTab !== "ROI_PCT" ? activeTab : null;

      // Filter trades if a specific currency tab is clicked
      let relevantTrades = trades;
      let relevantInitialBalance = initialBalance;
      let curr = currency;

      if (filterCurrency) {
        const currAccounts = accounts.filter(
          (a) => (a.currency || "USD").toUpperCase() === filterCurrency
        );
        const currAccountIds = new Set(currAccounts.map((a) => a.id));
        relevantTrades = trades.filter((t) => currAccountIds.has(t.accountId));
        relevantInitialBalance = currAccounts.reduce(
          (sum, a) => sum + (Number(a.initialBalance || a.currentBalance) || 0),
          0
        );
        curr = filterCurrency;
      }

      // Sort chronologically
      const sorted = [...relevantTrades].sort(
        (a, b) => new Date(a.openTime).getTime() - new Date(b.openTime).getTime()
      );

      const seenLabels = new Map<string, number>();

      if (isRoi) {
        // Unified Percentage Return (% ROI) calculation
        let runningRoi = 0;
        const totalAccountsCount = Math.max(1, accounts.length);

        const dataPoints = [
          {
            date: "Start",
            balance: 0,
            roiPct: 0,
            cumPnL: 0,
            tradeName: "Titik Awal Portofolio",
            accountName: "Semua Akun",
            accountType: "Gabungan",
            tradeCurrency: "",
            rawPnL: 0,
          },
        ];

        sorted.forEach((t, index) => {
          const acc = accounts.find((a) => a.id === t.accountId);
          const accInitial = Number(acc?.initialBalance || acc?.currentBalance) || 10000;
          const tradePct = accInitial > 0 ? (t.netPnL / accInitial) * 100 : 0;
          // Weighted return contribution
          runningRoi += tradePct / totalAccountsCount;

          const d = new Date(t.openTime);
          const timeStr = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
          const baseLabel = `${d.getDate()}/${d.getMonth() + 1}`;
          const count = (seenLabels.get(baseLabel) || 0) + 1;
          seenLabels.set(baseLabel, count);

          const dateLabel = count > 1 ? `${baseLabel} (${timeStr})` : baseLabel;

          dataPoints.push({
            date: dateLabel,
            balance: Number(runningRoi.toFixed(2)),
            roiPct: Number(runningRoi.toFixed(2)),
            cumPnL: 0,
            tradeName: t.notes || (t.pair && t.pair !== "CATATAN" ? `${t.pair} (${t.direction})` : `Catatan #${index + 1}`),
            accountName: acc?.name || "Akun",
            accountType: acc?.accountType || "Real",
            tradeCurrency: acc?.currency || "USD",
            rawPnL: t.netPnL,
          });
        });

        if (sorted.length === 0) {
          dataPoints.push({
            date: "Saat Ini",
            balance: 0,
            roiPct: 0,
            cumPnL: 0,
            tradeName: "Belum ada transaksi",
            accountName: "Semua Akun",
            accountType: "Gabungan",
            tradeCurrency: "",
            rawPnL: 0,
          });
        }

        const finalRoi = dataPoints[dataPoints.length - 1]?.roiPct ?? 0;

        return {
          chartData: dataPoints,
          isRoiMode: true,
          activeDisplayCurrency: "%",
          totalGainPct: finalRoi,
          latestBalance: finalRoi,
          startBalance: 0,
        };
      }

      // Pure Nominal curve calculation (single account or single currency view)
      let runningBalance = relevantInitialBalance;
      let runningPnL = 0;

      const dataPoints = [
        {
          date: "Start",
          balance: relevantInitialBalance,
          roiPct: 0,
          cumPnL: 0,
          tradeName: "Saldo Awal",
          accountName: "",
          accountType: "",
          tradeCurrency: curr,
          rawPnL: 0,
        },
      ];

      sorted.forEach((t, index) => {
        runningPnL += t.netPnL;
        runningBalance += t.netPnL;
        const d = new Date(t.openTime);
        const timeStr = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
        const baseLabel = `${d.getDate()}/${d.getMonth() + 1}`;
        const count = (seenLabels.get(baseLabel) || 0) + 1;
        seenLabels.set(baseLabel, count);

        const dateLabel = count > 1 ? `${baseLabel} (${timeStr})` : baseLabel;
        const acc = accounts.find((a) => a.id === t.accountId);

        dataPoints.push({
          date: dateLabel,
          balance: Number(runningBalance.toFixed(2)),
          roiPct: relevantInitialBalance > 0 ? Number(((runningPnL / relevantInitialBalance) * 100).toFixed(2)) : 0,
          cumPnL: Number(runningPnL.toFixed(2)),
          tradeName: t.notes || (t.pair && t.pair !== "CATATAN" ? `${t.pair} (${t.direction})` : `Catatan #${index + 1}`),
          accountName: acc?.name || "",
          accountType: acc?.accountType || "",
          tradeCurrency: curr,
          rawPnL: t.netPnL,
        });
      });

      if (sorted.length === 0) {
        dataPoints.push({
          date: "Saat Ini",
          balance: relevantInitialBalance,
          roiPct: 0,
          cumPnL: 0,
          tradeName: "Belum ada transaksi",
          accountName: "",
          accountType: "",
          tradeCurrency: curr,
          rawPnL: 0,
        });
      }

      const finalBal = dataPoints[dataPoints.length - 1]?.balance ?? relevantInitialBalance;
      const gain = finalBal - relevantInitialBalance;
      const pct = relevantInitialBalance > 0 ? (gain / relevantInitialBalance) * 100 : 0;

      return {
        chartData: dataPoints,
        isRoiMode: false,
        activeDisplayCurrency: curr,
        totalGainPct: pct,
        latestBalance: finalBal,
        startBalance: relevantInitialBalance,
      };
    }, [trades, initialBalance, currency, accounts, isMultiCurrency, activeTab]);

  const isPositiveGain = totalGainPct >= 0;

  // Dynamic Y Domain
  const yDomain = React.useMemo(() => {
    const balances = chartData.map((d) => d.balance);
    const min = Math.min(...balances);
    const max = Math.max(...balances);
    const delta = max - min;

    if (isRoiMode) {
      const padding = delta === 0 ? 2 : Math.max(delta * 0.25, 1);
      return [Number((min - padding).toFixed(1)), Number((max + padding).toFixed(1))];
    }

    const padding = delta === 0 ? Math.max(min * 0.05, 100) : Math.max(delta * 0.25, 50);
    const low = Math.max(0, Math.floor(min - padding));
    const high = Math.ceil(max + padding);
    return [low, high];
  }, [chartData, isRoiMode]);

  const strokeColor = isPositiveGain ? "#10b981" : "#f43f5e";
  const gradId = isPositiveGain ? "cuanEquityGrad" : "lossEquityGrad";

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl p-5 shadow-2xl space-y-4">
      {/* Header Bar with Currency / Mode Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">Pertumbuhan Saldo (Equity Curve)</h3>
            <span
              className={cn(
                "text-[10px] px-2 py-0.5 rounded-md font-bold border font-mono",
                isPositiveGain
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-300 border-rose-500/20"
              )}
            >
              {isPositiveGain ? `+${totalGainPct.toFixed(1)}%` : `${totalGainPct.toFixed(1)}%`} ROI
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {isRoiMode
              ? "Akumulasi persentase return gabungan (% ROI) lintas portofolio"
              : "Akumulasi modal dan profit/loss dari waktu ke waktu"}
          </p>
        </div>

        {/* Currency / Percentage Switcher for Multi-Currency Portfolios */}
        {isMultiCurrency && (
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("ROI_PCT")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                activeTab === "ROI_PCT"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "text-slate-400 hover:text-white"
              )}
            >
              % ROI Gabungan
            </button>
            {distinctCurrencies.map((curr) => (
              <button
                key={curr}
                onClick={() => setActiveTab(curr)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer",
                  activeTab === curr
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "text-slate-400 hover:text-white"
                )}
              >
                {curr}
              </button>
            ))}
          </div>
        )}

        {!isMultiCurrency && (
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-400">Saldo Terkini</div>
            <div className="text-xl font-extrabold text-white font-mono">
              {formatCurrency(latestBalance, activeDisplayCurrency)}
            </div>
          </div>
        )}
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
            <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={yDomain}
              tickFormatter={(v) => {
                if (isRoiMode) {
                  return `${v >= 0 ? "+" : ""}${v}%`;
                }
                const sym = getCurrencySymbol(activeDisplayCurrency);
                if (activeDisplayCurrency === "IDR") {
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
                    <div className="rounded-xl border border-slate-800 bg-slate-950/95 p-3 shadow-xl backdrop-blur-md text-xs font-mono space-y-1">
                      <div className="text-slate-400 font-sans font-semibold">{data.tradeName}</div>
                      {data.accountName && (
                        <div className="text-[10px] text-slate-500 font-sans">
                          Akun: <span className="text-slate-300 font-bold">{data.accountName}</span>
                          {data.accountType && ` (${data.accountType})`}
                        </div>
                      )}
                      {isRoiMode ? (
                        <>
                          <div className="text-white font-bold">
                            Total Return: {data.balance >= 0 ? `+${data.balance}%` : `${data.balance}%`}
                          </div>
                          {data.rawPnL !== 0 && (
                            <div
                              className={cn(
                                "font-bold text-[11px]",
                                data.rawPnL > 0 ? "text-emerald-400" : "text-rose-400"
                              )}
                            >
                              Hasil Trade: {formatSignedCurrency(data.rawPnL, data.tradeCurrency)}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="text-white font-bold mt-1">
                            Saldo: {formatCurrency(data.balance, activeDisplayCurrency)}
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
                            Net Profit: {formatSignedCurrency(data.cumPnL, activeDisplayCurrency)}
                          </div>
                        </>
                      )}
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
