"use client";

import * as React from "react";
import { formatCurrency, formatSignedCurrency, cn } from "@/lib/utils";
import { SampleTrade } from "@/lib/sample-data";
import { useAppShell } from "@/components/layout/app-shell";
import { DayTradesDrawer } from "./day-trades-drawer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Calendar as CalendarIcon, Layers } from "lucide-react";
import { formatCompactCurrency } from "@/lib/portfolio-utils";

interface PnLCalendarProps {
  trades: SampleTrade[];
  onOpenNewTrade?: () => void;
  currency?: string;
  accounts?: any[];
  selectedAccountId?: string;
}

export function PnLCalendar({
  trades,
  onOpenNewTrade,
  currency: propCurrency,
  accounts: propAccounts,
  selectedAccountId: propSelectedAccountId,
}: PnLCalendarProps) {
  const shell = useAppShell();
  const accounts = propAccounts || shell.accounts || [];
  const selectedAccountId = propSelectedAccountId || shell.selectedAccountId;

  const isAllSelected = !selectedAccountId || selectedAccountId === "all";
  const activeAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];
  const defaultCurrency = propCurrency || activeAccount?.currency || "USD";

  const distinctCurrencies = React.useMemo(() => {
    if (!accounts || accounts.length === 0) return [defaultCurrency];
    const set = new Set(accounts.map((a) => (a.currency || "USD").toUpperCase()));
    return Array.from(set);
  }, [accounts, defaultCurrency]);

  const isMultiCurrency = isAllSelected && distinctCurrencies.length > 1;

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

  let startingDayOfWeek = firstDayOfMonth.getDay();
  if (startingDayOfWeek === 0) startingDayOfWeek = 7; // Sunday as 7th day

  // Calculate monthly stats
  const monthlyTrades = React.useMemo(() => {
    return trades.filter((t) => {
      const d = new Date(t.openTime);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [trades, year, month]);

  // Monthly breakdown by currency
  const monthlyCurrencyStats = React.useMemo(() => {
    return distinctCurrencies.map((curr) => {
      const currAccounts = accounts.filter((a) => (a.currency || "USD").toUpperCase() === curr);
      const currAccountIds = new Set(currAccounts.map((a) => a.id));
      const currTrades = isAllSelected
        ? monthlyTrades.filter((t) => currAccountIds.has(t.accountId))
        : monthlyTrades;

      const netPnL = currTrades.reduce((acc, t) => acc + t.netPnL, 0);
      const winning = currTrades.filter((t) => t.netPnL > 0);
      const losing = currTrades.filter((t) => t.netPnL < 0);
      const profit = winning.reduce((acc, t) => acc + t.netPnL, 0);
      const loss = Math.abs(losing.reduce((acc, t) => acc + t.netPnL, 0));

      return {
        currency: curr,
        netPnL,
        profit,
        loss,
        tradeCount: currTrades.length,
      };
    });
  }, [distinctCurrencies, accounts, monthlyTrades, isAllSelected]);

  const totalMonthlyPnL = monthlyTrades.reduce((acc, t) => acc + t.netPnL, 0);
  const totalClosed = monthlyTrades.length;

  // Best Day and Worst Day calculation
  const { bestDay, worstDay, profitDaysCount, lossDaysCount } = React.useMemo(() => {
    let best = { date: "", pnl: -Infinity, tradeSummary: "" };
    let worst = { date: "", pnl: Infinity, tradeSummary: "" };
    let profitDays = 0;
    let lossDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayTrades = tradesByDate.get(dateKey) || [];
      if (dayTrades.length > 0) {
        // Count day outcome
        const dayPnL = dayTrades.reduce((acc, t) => acc + t.netPnL, 0);
        if (dayPnL > 0) profitDays++;
        else if (dayPnL < 0) lossDays++;

        // For best/worst calculation
        if (dayPnL > best.pnl) {
          best = {
            date: `${day} ${monthName.split(" ")[0]}`,
            pnl: dayPnL,
            tradeSummary: `${dayTrades.length} Trade`,
          };
        }
        if (dayPnL < worst.pnl) {
          worst = {
            date: `${day} ${monthName.split(" ")[0]}`,
            pnl: dayPnL,
            tradeSummary: `${dayTrades.length} Trade`,
          };
        }
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

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: null, dateKey: `next-${currentWeek.length}`, trades: [] });
    }
    weeks.push(currentWeek);
  }

  const handleCellClick = (dayDate: Date | null) => {
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
        {/* 1. Net Monthly PnL */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              {isMultiCurrency && <Layers className="h-3 w-3 text-emerald-400" />}
              <span>Net Cuan Bulan Ini</span>
            </div>

            {!isMultiCurrency ? (
              <div
                className={cn(
                  "text-2xl font-extrabold font-mono mt-1",
                  totalMonthlyPnL > 0 ? "text-emerald-400" : totalMonthlyPnL < 0 ? "text-rose-400" : "text-white"
                )}
              >
                {formatSignedCurrency(totalMonthlyPnL, defaultCurrency)}
              </div>
            ) : (
              <div className="mt-1.5 space-y-1">
                {monthlyCurrencyStats.map((stat) => (
                  <div key={stat.currency} className="flex items-center justify-between text-xs font-mono font-bold">
                    <span className="text-slate-400">{stat.currency}:</span>
                    <span className={stat.netPnL >= 0 ? "text-emerald-400" : "text-rose-400"}>
                      {formatSignedCurrency(stat.netPnL, stat.currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2 pt-1.5 border-t border-slate-800/60">
            <span>{profitDaysCount} Hari Profit</span>
            <span>•</span>
            <span>{lossDaysCount} Hari Loss</span>
          </div>
        </div>

        {/* 2. Total Catatan Bulanan */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Catatan Bulan Ini</div>
            <div className="text-2xl font-extrabold text-white font-mono mt-1">{totalClosed} Catatan</div>
          </div>

          {!isMultiCurrency ? (
            <div className="text-[11px] text-slate-400 mt-2 pt-1.5 border-t border-slate-800/60 flex items-center gap-1 font-mono">
              <span className="text-emerald-400 font-bold">
                +{formatCurrency(monthlyCurrencyStats[0]?.profit || 0, defaultCurrency)}
              </span>
              <span>•</span>
              <span className="text-rose-400 font-bold">
                -{formatCurrency(monthlyCurrencyStats[0]?.loss || 0, defaultCurrency)}
              </span>
            </div>
          ) : (
            <div className="text-[10px] text-slate-400 mt-2 pt-1.5 border-t border-slate-800/60 font-mono space-y-0.5">
              {monthlyCurrencyStats.map((s) => (
                <div key={s.currency} className="flex items-center justify-between">
                  <span>{s.currency}:</span>
                  <span className="text-emerald-400 font-bold">+{formatCompactCurrency(s.profit, s.currency, false)}</span>
                  <span>/</span>
                  <span className="text-rose-400 font-bold">-{formatCompactCurrency(s.loss, s.currency, false)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Best Day */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 text-emerald-400">
              <TrendingUp className="h-3 w-3" /> Best Day
            </div>
            <div className="text-lg font-bold text-emerald-400 font-mono mt-1">
              {bestDay?.date || "Belum ada"}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 pt-1.5 border-t border-slate-800/60 font-mono">
            {bestDay ? (isMultiCurrency ? bestDay.tradeSummary : formatSignedCurrency(bestDay.pnl, defaultCurrency)) : "—"}
          </div>
        </div>

        {/* 4. Worst Day */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 text-rose-400">
              <TrendingDown className="h-3 w-3" /> Worst Day
            </div>
            <div className="text-lg font-bold text-rose-400 font-mono mt-1">
              {worstDay?.date || "Belum ada"}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 pt-1.5 border-t border-slate-800/60 font-mono">
            {worstDay ? (isMultiCurrency ? worstDay.tradeSummary : formatSignedCurrency(worstDay.pnl, defaultCurrency)) : "—"}
          </div>
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
                // Calculate weekly multi-currency breakdown
                const weeklyTrades = week.flatMap((day) => day.trades);
                const weeklyCurrencies = distinctCurrencies.map((curr) => {
                  const currAccounts = accounts.filter((a) => (a.currency || "USD").toUpperCase() === curr);
                  const currAccountIds = new Set(currAccounts.map((a) => a.id));
                  const currTrades = isAllSelected
                    ? weeklyTrades.filter((t) => currAccountIds.has(t.accountId))
                    : weeklyTrades;
                  const pnl = currTrades.reduce((acc, t) => acc + t.netPnL, 0);
                  return { curr, pnl, count: currTrades.length };
                }).filter((item) => item.count > 0);

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
                      const isToday = dayItem.date.toDateString() === new Date().toDateString();

                      // Group day trades by currency
                      const dayCurrencies = distinctCurrencies.map((curr) => {
                        const currAccounts = accounts.filter((a) => (a.currency || "USD").toUpperCase() === curr);
                        const currAccountIds = new Set(currAccounts.map((a) => a.id));
                        const currTrades = isAllSelected
                          ? dayTrades.filter((t) => currAccountIds.has(t.accountId))
                          : dayTrades;
                        const pnl = currTrades.reduce((acc, t) => acc + t.netPnL, 0);
                        return { curr, pnl, count: currTrades.length };
                      }).filter((item) => item.count > 0);

                      const dayTotalPnL = dayTrades.reduce((acc, t) => acc + t.netPnL, 0);
                      const isProfit = dayTotalPnL > 0;
                      const isLoss = dayTotalPnL < 0;

                      return (
                        <button
                          key={dayItem.dateKey}
                          onClick={() => handleCellClick(dayItem.date)}
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

                          {/* Bottom: P&L Value (Single or Multi-Currency Lines) */}
                          <div className="w-full">
                            {hasTrades ? (
                              dayCurrencies.length === 1 ? (
                                <div
                                  className={cn(
                                    "font-mono font-extrabold text-xs sm:text-sm tracking-tight truncate",
                                    dayCurrencies[0].pnl > 0
                                      ? "text-emerald-400"
                                      : dayCurrencies[0].pnl < 0
                                      ? "text-rose-400"
                                      : "text-slate-400"
                                  )}
                                >
                                  {formatCompactCurrency(dayCurrencies[0].pnl, dayCurrencies[0].curr)}
                                </div>
                              ) : (
                                <div className="space-y-0.5">
                                  {dayCurrencies.map((item) => (
                                    <div
                                      key={item.curr}
                                      className={cn(
                                        "font-mono font-bold text-[10px] tracking-tight truncate",
                                        item.pnl > 0 ? "text-emerald-400" : item.pnl < 0 ? "text-rose-400" : "text-slate-400"
                                      )}
                                    >
                                      {formatCompactCurrency(item.pnl, item.curr)}
                                    </div>
                                  ))}
                                </div>
                              )
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
                          ? "bg-slate-900/60 border-slate-800 text-slate-300"
                          : "bg-slate-950/20 border-slate-800/40 text-slate-600"
                      )}
                    >
                      <div className="text-[10px] uppercase font-bold text-slate-400">Week {weekIndex + 1}</div>
                      
                      <div className="w-full">
                        {weeklyTrades.length === 0 ? (
                          <div className="font-mono font-extrabold text-xs text-slate-600">—</div>
                        ) : weeklyCurrencies.length === 1 ? (
                          <div
                            className={cn(
                              "font-mono font-extrabold text-xs sm:text-sm",
                              weeklyCurrencies[0].pnl > 0
                                ? "text-emerald-400"
                                : weeklyCurrencies[0].pnl < 0
                                ? "text-rose-400"
                                : "text-slate-400"
                            )}
                          >
                            {formatCompactCurrency(weeklyCurrencies[0].pnl, weeklyCurrencies[0].curr)}
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            {weeklyCurrencies.map((item) => (
                              <div
                                key={item.curr}
                                className={cn(
                                  "font-mono font-bold text-[10px]",
                                  item.pnl > 0 ? "text-emerald-400" : item.pnl < 0 ? "text-rose-400" : "text-slate-400"
                                )}
                              >
                                {formatCompactCurrency(item.pnl, item.curr)}
                              </div>
                            ))}
                          </div>
                        )}
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
        currency={defaultCurrency}
        accounts={accounts}
      />
    </div>
  );
}
