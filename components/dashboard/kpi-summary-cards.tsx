"use client";

import * as React from "react";
import { formatCurrency, formatSignedCurrency, formatPercent, cn } from "@/lib/utils";
import { SampleTrade } from "@/lib/sample-data";
import { TrendingUp, TrendingDown, Target, Zap, ShieldAlert, Award, Flame } from "lucide-react";

interface KPISummaryCardsProps {
  trades: SampleTrade[];
}

export function KPISummaryCards({ trades }: KPISummaryCardsProps) {
  const stats = React.useMemo(() => {
    const totalTrades = trades.length;
    const winningTrades = trades.filter((t) => t.netPnL > 0);
    const losingTrades = trades.filter((t) => t.netPnL < 0);

    const netPnL = trades.reduce((acc, t) => acc + t.netPnL, 0);
    const grossProfit = winningTrades.reduce((acc, t) => acc + t.netPnL, 0);
    const grossLoss = Math.abs(losingTrades.reduce((acc, t) => acc + t.netPnL, 0));

    const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99.0 : 0;

    const avgRR =
      totalTrades > 0
        ? trades.reduce((acc, t) => acc + t.riskRewardRatio, 0) / totalTrades
        : 0;

    // Consecutive wins / losses streak
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    let currentWinStreak = 0;
    let currentLossStreak = 0;

    // Ordered chronologically
    const chronological = [...trades].sort(
      (a, b) => new Date(a.openTime).getTime() - new Date(b.openTime).getTime()
    );

    chronological.forEach((t) => {
      if (t.netPnL > 0) {
        currentWinStreak++;
        currentLossStreak = 0;
        if (currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak;
      } else if (t.netPnL < 0) {
        currentLossStreak++;
        currentWinStreak = 0;
        if (currentLossStreak > maxLossStreak) maxLossStreak = currentLossStreak;
      }
    });

    return {
      netPnL,
      totalTrades,
      winRate,
      profitFactor,
      avgRR,
      maxWinStreak,
      maxLossStreak,
      winningCount: winningTrades.length,
      losingCount: losingTrades.length,
    };
  }, [trades]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Total Net P&L */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Net Cuan</span>
          <div
            className={cn(
              "h-6 w-6 rounded-lg flex items-center justify-center",
              stats.netPnL >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
            )}
          >
            {stats.netPnL >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          </div>
        </div>
        <div
          className={cn(
            "text-xl font-extrabold font-mono mt-2 truncate",
            stats.netPnL >= 0 ? "text-emerald-400" : "text-rose-400"
          )}
        >
          {formatSignedCurrency(stats.netPnL)}
        </div>
        <div className="text-[10px] text-slate-400 mt-1">{stats.totalTrades} Total Eksekusi</div>
      </div>

      {/* 2. Win Rate */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400">Win Rate</span>
          <div className="h-6 w-6 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Target className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="text-xl font-extrabold text-white font-mono mt-2">
          {stats.winRate.toFixed(1)}%
        </div>
        <div className="text-[10px] text-slate-400 mt-1">
          {stats.winningCount}W • {stats.losingCount}L
        </div>
      </div>

      {/* 3. Profit Factor */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400">Profit Factor</span>
          <div className="h-6 w-6 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Zap className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="text-xl font-extrabold text-white font-mono mt-2">
          {stats.profitFactor.toFixed(2)}
        </div>
        <div className="text-[10px] text-slate-400 mt-1">
          {stats.profitFactor >= 2.0 ? "🔥 Sangat Kuat" : stats.profitFactor >= 1.5 ? "✅ Sehat" : "⚠️ Perbaiki Setup"}
        </div>
      </div>

      {/* 4. Avg Risk:Reward */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400">Avg Risk:Reward</span>
          <div className="h-6 w-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Award className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="text-xl font-extrabold text-white font-mono mt-2">
          1:{stats.avgRR.toFixed(1)}
        </div>
        <div className="text-[10px] text-slate-400 mt-1">Realisasi R-Multiple</div>
      </div>

      {/* 5. Max Win Streak */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400">Best Streak</span>
          <div className="h-6 w-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Flame className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="text-xl font-extrabold text-emerald-400 font-mono mt-2">
          {stats.maxWinStreak} Win
        </div>
        <div className="text-[10px] text-slate-400 mt-1">Kemenangan Beruntun</div>
      </div>

      {/* 6. Max Loss Streak */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400">Max Loss Streak</span>
          <div className="h-6 w-6 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <ShieldAlert className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="text-xl font-extrabold text-rose-400 font-mono mt-2">
          {stats.maxLossStreak} Loss
        </div>
        <div className="text-[10px] text-slate-400 mt-1">Disiplin Stop Trading</div>
      </div>
    </div>
  );
}
