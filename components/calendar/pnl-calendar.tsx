"use client";

import * as React from "react";
import { formatCurrency, formatSignedCurrency, cn } from "@/lib/utils";
import { SampleTrade } from "@/lib/sample-data";
import { useAppShell } from "@/components/layout/app-shell";
import { DayTradesDrawer } from "./day-trades-drawer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Calendar as CalendarIcon, Zap } from "lucide-react";

interface PnLCalendarProps {
  trades: SampleTrade[];
  onOpenNewTrade?: () => void;
  currency?: string;
}

export function PnLCalendar({ trades, onOpenNewTrade, currency: propCurrency }: PnLCalendarProps) {
  const { accounts, selectedAccountId } = useAppShell();
  const activeAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];
  const currency = propCurrency || activeAccount?.currency || "USD";

  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = React.useState<Date | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Month navigation
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const monthName = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(currentDate);

  // Group trades by date string YYYY-MM-DD
  const tradesByDate = React.useMemo(() => {
    const map = new Map<string, SampleTrade[]>();
    trades.forEach((trade) => {
      const tradeDate = new Date(trade.openTime);
      const dateKey = `${tradeDate.getFullYear()}-${String(tradeDate.getMonth() + 1).padStart(2, "0")}-${String(
        tradeDate.getDate()
      ).padStart(2, "0")}`;
      
      const existing = map.get(dateKey) || [];
      map.set(dateKey, [...existing, trade]);
    });
    return map;
  }, [trades]);

  // Generate calendar days for month
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  // Let's align grid starting on Monday (1) to Sunday (0 -> 7)
  let startingDayOfWeek = firstDayOfMonth.getDay();
  if (startingDayOfWeek === 0) startingDayOfWeek = 7; // Sunday as 7th day

  // Calculate monthly stats
  const monthlyTrades = React.useMemo(() => {
    return trades.filter((t) => {
      const d = new Date(t.openTime);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [trades, year, month]);

  const totalMonthlyPnL = monthlyTrades.reduce((acc, t) => acc + t.netPnL, 0);
  const winningTrades = monthlyTrades.filter((t) => t.netPnL > 0);
  const losingTrades = monthlyTrades.filter((t) => t.netPnL < 0);
  const monthlyProfit = winningTrades.reduce((acc, t) => acc + t.netPnL, 0);
  const monthlyLoss = Math.abs(losingTrades.reduce((acc, t) => acc + t.netPnL, 0));
  const totalClosed = monthlyTrades.length;

  // Best Day and Worst Day calculation
  const { bestDay, worstDay, profitDaysCount, lossDaysCount } = React.useMemo(() => {
    let best = { date: "", pnl: -Infinity };
    let worst = { date: "", pnl: Infinity };
    let profitDays = 0;
    let lossDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayTrades = tradesByDate.get(dateKey) || [];
      if (dayTrades.length > 0) {
        const dayPnL = dayTrades.reduce((acc, t) => acc + t.netPnL, 0);
        if (dayPnL > 0) profitDays++;
        else if (dayPnL < 0) lossDays++;

        if (dayPnL > best.pnl) best = { date: `${day} ${monthName.split(" ")[0]}`, pnl: dayPnL };
        if (dayPnL < worst.pnl) worst = { date: `${day} ${monthName.split(" ")[0]}`, pnl: dayPnL };
      }
    }

    return {
      bestDay: best.pnl > -Infinity ? best : null,
      worstDay: worst.pnl < Infinity ? worst : null,
      profitDaysCount: profitDays,
      lossDaysCount: lossDays,
    };
  }, [tradesByDate, year, month, daysInMonth, monthName]);

  // Build weeks matrix
  const weeks: Array<Array<{ date: Date | null; dateKey: string; trades: SampleTrade[] }>> = [];
  let currentWeek: Array<{ date: Date | null; dateKey: string; trades: SampleTrade[] }> = [];

  // Padding days from previous month
  for (let i = 1; i < startingDayOfWeek; i++) {
    currentWeek.push({ date: null, dateKey: `prev-${i}`, trades: [] });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayDate = new Date(year, month, day);
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayTrades = tradesByDate.get(dateKey) || [];

    currentWeek.push({ date: dayDate, dateKey, trades: dayTrades });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Padding days for end of month
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: null, dateKey: `next-${currentWeek.length}`, trades: [] });
    }
    weeks.push(currentWeek);
  }

  const handleCellClick = (dayDate: Date | null, dayTrades: SampleTrade[]) => {
    if (!dayDate) return;
    setSelectedDay(dayDate);
    setIsDrawerOpen(true);
  };

  const selectedDayTrades = selectedDay
    ? tradesByDate.get(
        `${selectedDay.getFullYear()}-${String(selectedDay.getMonth() + 1).padStart(2, "0")}-${String(
          selectedDay.getDate()
        ).padStart(2, "0")}`
      ) || []
    : [];

  return (
    <div className="space-y-6">
      {/* Top Monthly Header KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Net Monthly PnL */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Net Cuan Bulan Ini</div>
          <div
            className={cn(
              "text-2xl font-extrabold font-mono mt-1",
              totalMonthlyPnL > 0 ? "text-emerald-400" : totalMonthlyPnL < 0 ? "text-rose-400" : "text-white"
            )}
          >
            {formatSignedCurrency(totalMonthlyPnL, currency)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
            <span>{profitDaysCount} Hari Profit</span>
            <span>•</span>
            <span>{lossDaysCount} Hari Loss</span>
          </div>
        </div>

        {/* Total Catatan Bulanan */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Catatan Bulan Ini</div>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">{totalClosed} Catatan</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
            <span className="text-emerald-400 font-bold">
              {monthlyProfit > 0 ? `+${formatCurrency(monthlyProfit, currency)}` : formatCurrency(0, currency)}
            </span>
            <span>•</span>
            <span className="text-rose-400 font-bold">
              {monthlyLoss > 0 ? `-${formatCurrency(monthlyLoss, currency)}` : formatCurrency(0, currency)}
            </span>
          </div>
        </div>

        {/* Best Day */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 text-emerald-400">
            <TrendingUp className="h-3 w-3" /> Best Day
          </div>
          <div className="text-lg font-bold text-emerald-400 font-mono mt-1">
            {bestDay ? formatSignedCurrency(bestDay.pnl, currency) : formatCurrency(0, currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{bestDay?.date || "Belum ada"}</div>
        </div>

        {/* Worst Day */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 text-rose-400">
            <TrendingDown className="h-3 w-3" /> Worst Day
          </div>
          <div className="text-lg font-bold text-rose-400 font-mono mt-1">
            {worstDay ? formatSignedCurrency(worstDay.pnl, currency) : formatCurrency(0, currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{worstDay?.date || "Belum ada"}</div>
        </div>
      </div>

      {/* Calendar Card Shell */}
      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl p-4 sm:p-6 shadow-2xl space-y-4">
        {/* Calendar Nav Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CalendarIcon className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white capitalize">{monthName}</h2>
              <p className="text-xs text-slate-400">Klik pada tanggal untuk melihat detail trade</p>
            </div>
          </div>

          {/* Month Switcher Controls */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday} className="text-xs">
              Bulan Ini
            </Button>
            <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
              <Button variant="ghost" size="icon" onClick={prevMonth} className="h-7 w-7 rounded-lg">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={nextMonth} className="h-7 w-7 rounded-lg">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Days Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Header: Mon - Sun + Weekly Summary */}
            <div className="grid grid-cols-8 gap-2 mb-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
              <div>Senin</div>
              <div>Selasa</div>
              <div>Rabu</div>
              <div>Kamis</div>
              <div>Jumat</div>
              <div>Sabtu</div>
              <div>Minggu</div>
              <div className="text-emerald-400">Mingguan</div>
            </div>

            {/* Weeks Rows */}
            <div className="space-y-2">
              {weeks.map((week, weekIndex) => {
                // Calculate weekly PnL
                const weeklyTrades = week.flatMap((day) => day.trades);
                const weeklyPnL = weeklyTrades.reduce((acc, t) => acc + t.netPnL, 0);

                return (
                  <div key={`week-${weekIndex}`} className="grid grid-cols-8 gap-2">
                    {/* 7 Days in Week */}
                    {week.map((dayItem) => {
                      if (!dayItem.date) {
                        return (
                          <div
                            key={dayItem.dateKey}
                            className="h-24 rounded-2xl bg-slate-950/20 border border-slate-800/20 opacity-30"
                          />
                        );
                      }

                      const dayTrades = dayItem.trades;
                      const hasTrades = dayTrades.length > 0;
                      const dayPnL = dayTrades.reduce((acc, t) => acc + t.netPnL, 0);
                      const isProfit = dayPnL > 0;
                      const isLoss = dayPnL < 0;
                      const isToday =
                        dayItem.date.toDateString() === new Date().toDateString();

                      return (
                        <button
                          key={dayItem.dateKey}
                          onClick={() => handleCellClick(dayItem.date, dayTrades)}
                          className={cn(
                            "h-24 p-2 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between group cursor-pointer relative overflow-hidden",
                            isToday && "ring-2 ring-emerald-400/50",
                            hasTrades
                              ? isProfit
                                ? "bg-gradient-to-b from-emerald-950/40 to-slate-950/90 border-emerald-500/30 hover:border-emerald-400/70 hover:shadow-lg hover:shadow-emerald-500/10"
                                : isLoss
                                ? "bg-gradient-to-b from-rose-950/40 to-slate-950/90 border-rose-500/30 hover:border-rose-400/70 hover:shadow-lg hover:shadow-rose-500/10"
                                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                              : "bg-slate-950/40 border-slate-800/50 hover:bg-slate-900/40 hover:border-slate-700"
                          )}
                        >
                          {/* Top: Date Number & Trade Count Badge */}
                          <div className="flex items-center justify-between w-full">
                            <span
                              className={cn(
                                "text-xs font-bold font-mono",
                                isToday ? "text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded-md" : "text-slate-400"
                              )}
                            >
                              {dayItem.date.getDate()}
                            </span>

                            {hasTrades && (
                              <span
                                className={cn(
                                  "text-[9px] px-1.5 py-0.5 rounded-md font-bold",
                                  isProfit
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                )}
                              >
                                {dayTrades.length} Trade
                              </span>
                            )}
                          </div>

                          {/* Bottom: P&L Value */}
                          <div className="w-full">
                            {hasTrades ? (
                              <div
                                className={cn(
                                  "font-mono font-extrabold text-xs sm:text-sm tracking-tight truncate",
                                  isProfit ? "text-emerald-400" : isLoss ? "text-rose-400" : "text-slate-400"
                                )}
                              >
                                {formatSignedCurrency(dayPnL, currency)}
                              </div>
                            ) : (
                              <div className="text-[10px] text-slate-600 font-mono">—</div>
                            )}
                          </div>
                        </button>
                      );
                    })}

                    {/* 8th Column: Weekly Summary Card */}
                    <div
                      className={cn(
                        "h-24 p-2.5 rounded-2xl border flex flex-col justify-between text-right",
                        weeklyTrades.length > 0
                          ? weeklyPnL > 0
                            ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400"
                            : weeklyPnL < 0
                            ? "bg-rose-950/20 border-rose-500/30 text-rose-400"
                            : "bg-slate-900/60 border-slate-800 text-slate-400"
                          : "bg-slate-950/20 border-slate-800/40 text-slate-600"
                      )}
                    >
                      <div className="text-[10px] uppercase font-bold text-slate-400">Week {weekIndex + 1}</div>
                      <div className="font-mono font-extrabold text-xs sm:text-sm">
                        {weeklyTrades.length > 0 ? formatSignedCurrency(weeklyPnL, currency) : "—"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Day Trades Drawer Modal */}
      <DayTradesDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        date={selectedDay}
        trades={selectedDayTrades}
        currency={currency}
      />
    </div>
  );
}
