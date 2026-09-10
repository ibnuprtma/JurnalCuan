"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Search,
  RefreshCw,
  Flame,
  Globe2,
  CalendarDays,
  ExternalLink,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveEconomicEvent {
  id: string;
  title: string;
  currency: string;
  date: string;
  impact: "HIGH" | "MEDIUM" | "LOW" | "HOLIDAY";
  forecast: string;
  previous: string;
  actual: string;
}

const POPULAR_CURRENCIES = ["ALL", "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "NZD"];
const IMPACT_OPTIONS = [
  { label: "Semua Dampak", value: "ALL" },
  { label: "🔴 High Impact", value: "HIGH" },
  { label: "🟠 Medium Impact", value: "MEDIUM" },
  { label: "🟡 Low Impact", value: "LOW" },
];

const PAGE_SIZE_OPTIONS = [5, 10, 15, 25, 50];

export default function NewsPage() {
  const [events, setEvents] = React.useState<LiveEconomicEvent[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = React.useState<string>("");

  // Filters
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCurrency, setSelectedCurrency] = React.useState("ALL");
  const [selectedImpact, setSelectedImpact] = React.useState("ALL");
  const [onlyToday, setOnlyToday] = React.useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);

  const fetchNews = async (showLoadingState = true) => {
    if (showLoadingState) setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/news", { cache: "no-store" });
      const data = await res.json();

      if (res.ok && data.success && Array.isArray(data.events) && data.events.length > 0) {
        setEvents(data.events);
        setLastUpdated(
          new Date().toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" }) + " WIB"
        );
      } else {
        setErrorMessage(
          data.message ||
            "Server Forex Factory sedang membatasi permintaan akses (Rate Limit). Silakan tunggu sekitar 5 menit lalu klik Perbarui Data."
        );
        setEvents([]);
      }
    } catch (err: any) {
      console.warn("Fetch news warning:", err);
      setErrorMessage(
        "Koneksi ke server Forex Factory terputus atau dibatasi. Silakan tunggu sekitar 5 menit lalu coba lagi."
      );
      setEvents([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  React.useEffect(() => {
    fetchNews();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchNews(false);
  };

  // Reset page when filters change
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleCurrencyChange = (curr: string) => {
    setSelectedCurrency(curr);
    setCurrentPage(1);
  };

  const handleImpactChange = (imp: string) => {
    setSelectedImpact(imp);
    setCurrentPage(1);
  };

  const handleTodayToggle = () => {
    setOnlyToday((prev) => !prev);
    setCurrentPage(1);
  };

  // Filter logic
  const filteredEvents = React.useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];

    return events.filter((item) => {
      // Search
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.currency.toLowerCase().includes(searchQuery.toLowerCase());

      // Currency
      const matchesCurrency =
        selectedCurrency === "ALL" || item.currency === selectedCurrency;

      // Impact
      const matchesImpact =
        selectedImpact === "ALL" || item.impact === selectedImpact;

      // Today only
      const itemDateStr = item.date ? item.date.split("T")[0] : "";
      const matchesToday = !onlyToday || itemDateStr === todayStr;

      return matchesSearch && matchesCurrency && matchesImpact && matchesToday;
    });
  }, [events, searchQuery, selectedCurrency, selectedImpact, onlyToday]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredEvents.length / pageSize) || 1;
  const paginatedEvents = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, currentPage, pageSize]);

  const highImpactCount = events.filter((e) => e.impact === "HIGH").length;

  return (
    <div className="space-y-6">
      {/* Header & Live Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Kalender Berita Ekonomi (Forex Factory Live)
            </h1>
            <Badge variant="profit" className="gap-1 text-[10px] animate-pulse-subtle">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live Feed
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Data peristiwa ekonomi global langsung dari Forex Factory dengan konversi otomatis ke Waktu Indonesia Barat (WIB)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              Update: {lastUpdated}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="gap-1.5 text-xs bg-slate-900 border-slate-800 hover:border-emerald-500/40 text-slate-200"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin text-emerald-400")} />
            <span>{isRefreshing ? "Menyinkronkan..." : "Perbarui Data"}</span>
          </Button>
        </div>
      </div>

      {/* Rate Limit / Error Warning Banner */}
      {errorMessage && (
        <div className="p-6 rounded-3xl bg-amber-950/30 border border-amber-500/30 backdrop-blur-xl space-y-3 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Clock className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-200">
                Peringatan Batas Akses Server (Rate Limit)
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">{errorMessage}</p>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <Button
              size="sm"
              onClick={() => fetchNews(true)}
              disabled={isLoading || isRefreshing}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs gap-1.5 shadow-md shadow-amber-500/20"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", (isLoading || isRefreshing) && "animate-spin")} />
              <span>Coba Segarkan Sekarang</span>
            </Button>
            <span className="text-[11px] text-slate-400">
              Disarankan menunggu 5 menit agar kuota permintaan di-reset oleh Forex Factory.
            </span>
          </div>
        </div>
      )}

      {/* High Impact Alert Highlight (Only if data loaded) */}
      {highImpactCount > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900/80 to-slate-900 border border-rose-500/30 flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <AlertTriangle className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-200">
                Peringatan Volatilitas Tinggi ({highImpactCount} Berita High Impact Terdeteksi)
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Hindari entry tanpa Stop Loss ketat saat rilis berita bertanda merah (🔴 High Impact) karena potensi lonjakan spread dan slippage.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              handleImpactChange("HIGH");
              handleCurrencyChange("ALL");
            }}
            className="text-xs border-rose-500/40 text-rose-300 hover:bg-rose-500/10"
          >
            <Flame className="h-3.5 w-3.5 mr-1" />
            Lihat Berita High Impact
          </Button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
        {/* Top Controls: Search & Dropdowns */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Cari event (CPI, NFP, Fed, PMI)..."
              className="pl-9 text-xs"
            />
          </div>

          {/* Impact Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedImpact}
              onChange={(e) => handleImpactChange(e.target.value)}
              className="h-10 rounded-xl border border-slate-800 bg-slate-900 px-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {IMPACT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Today Filter Toggle */}
            <Button
              type="button"
              variant={onlyToday ? "default" : "outline"}
              size="sm"
              onClick={handleTodayToggle}
              className={cn(
                "h-10 text-xs gap-1.5",
                onlyToday
                  ? "bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400"
                  : "bg-slate-900 border-slate-800 text-slate-300"
              )}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              <span>Hari Ini Saja</span>
            </Button>
          </div>
        </div>

        {/* Currency Filter Tabs / Pills */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
            <Globe2 className="h-3.5 w-3.5 text-slate-400" />
            <span>Filter Mata Uang:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {POPULAR_CURRENCIES.map((curr) => {
              const isSelected = selectedCurrency === curr;
              return (
                <button
                  key={curr}
                  type="button"
                  onClick={() => handleCurrencyChange(curr)}
                  className={cn(
                    "px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer",
                    isSelected
                      ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-105"
                      : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60"
                  )}
                >
                  {curr}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live News Table */}
      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800/90 bg-slate-950/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                <th className="p-4 whitespace-nowrap">Waktu Rilis (WIB)</th>
                <th className="p-4">Mata Uang</th>
                <th className="p-4">Dampak (Impact)</th>
                <th className="p-4">Peristiwa Ekonomi</th>
                <th className="p-4">Forecast</th>
                <th className="p-4">Previous</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 space-y-2">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-emerald-400" />
                    <div>Menghubungkan ke live stream Forex Factory...</div>
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-500">
                    {errorMessage
                      ? "Data berita saat ini belum tersedia karena pembatasan akses server. Silakan coba kembali dalam 5 menit."
                      : `Tidak ada berita ekonomi yang sesuai dengan filter (${selectedCurrency} • ${selectedImpact}).`}
                  </td>
                </tr>
              ) : (
                paginatedEvents.map((item) => {
                  let dateFormatted = item.date;
                  let timeFormatted = "";
                  let statusBadge = null;

                  try {
                    const parsedDate = new Date(item.date);
                    if (!isNaN(parsedDate.getTime())) {
                      dateFormatted = new Intl.DateTimeFormat("id-ID", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        timeZone: "Asia/Jakarta",
                      }).format(parsedDate);

                      timeFormatted =
                        new Intl.DateTimeFormat("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                          timeZone: "Asia/Jakarta",
                        }).format(parsedDate) + " WIB";

                      // Calculate Status relative to current time
                      const now = Date.now();
                      const eventTime = parsedDate.getTime();
                      const diffMinutes = (eventTime - now) / (1000 * 60);

                      if (diffMinutes > 0) {
                        const isSoon = diffMinutes <= 120; // Within 2 hours
                        statusBadge = (
                          <span
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-[10px] font-bold inline-flex items-center gap-1",
                              isSoon
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                                : "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                            )}
                          >
                            {isSoon ? "⏳ Segera Rilis" : "⏳ Mendatang"}
                          </span>
                        );
                      } else {
                        statusBadge = (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300/90 border border-emerald-500/20 text-[10px] font-bold inline-flex items-center gap-1">
                            ✓ Selesai Rilis
                          </span>
                        );
                      }
                    }
                  } catch (e) {
                    // Fallback
                  }

                  return (
                    <tr
                      key={item.id}
                      className={cn(
                        "hover:bg-slate-800/40 transition-colors font-mono group",
                        item.impact === "HIGH" && "bg-rose-950/5"
                      )}
                    >
                      {/* Date & Time (WIB) */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-bold text-slate-200">{timeFormatted || "All Day"}</div>
                        <div className="text-[10px] text-slate-400 font-sans">{dateFormatted}</div>
                      </td>

                      {/* Currency Flag / Badge */}
                      <td className="p-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-white font-extrabold border border-slate-700 text-xs">
                          {item.currency}
                        </span>
                      </td>

                      {/* Impact Badge */}
                      <td className="p-4 whitespace-nowrap">
                        {item.impact === "HIGH" ? (
                          <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold inline-flex items-center gap-1 shadow-sm shadow-rose-500/20">
                            🔴 High
                          </span>
                        ) : item.impact === "MEDIUM" ? (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold inline-flex items-center gap-1">
                            🟠 Medium
                          </span>
                        ) : item.impact === "LOW" ? (
                          <span className="px-2.5 py-1 rounded-lg bg-yellow-500/10 text-yellow-300/80 border border-yellow-500/20 text-[10px] font-bold inline-flex items-center gap-1">
                            🟡 Low
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold">
                            ⚪ Holiday
                          </span>
                        )}
                      </td>

                      {/* Title / Event Name */}
                      <td className="p-4 font-sans font-semibold text-slate-100 min-w-[200px]">
                        <div className="text-xs group-hover:text-emerald-400 transition-colors">
                          {item.title}
                        </div>
                      </td>

                      {/* Forecast */}
                      <td className="p-4 whitespace-nowrap text-slate-300 font-medium">
                        {item.forecast}
                      </td>

                      {/* Previous */}
                      <td className="p-4 whitespace-nowrap text-slate-400">
                        {item.previous}
                      </td>

                      {/* Status Badge */}
                      <td className="p-4 whitespace-nowrap">
                        {statusBadge || (
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Footer Bar */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 font-sans">
          {/* Info range */}
          <div className="flex items-center gap-3">
            <div>
              Menampilkan{" "}
              <strong>
                {filteredEvents.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–
                {Math.min(currentPage * pageSize, filteredEvents.length)}
              </strong>{" "}
              dari total <strong>{filteredEvents.length}</strong> peristiwa
            </div>

            {/* Page Size Selector */}
            <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-slate-800">
              <span className="text-[11px] text-slate-500">Tampilkan:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-7 rounded-lg border border-slate-800 bg-slate-900 px-2 text-[11px] text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size} per hal
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pagination Controls */}
          {filteredEvents.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="h-8 px-2.5 text-xs bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <span className="font-mono text-slate-300 px-1 text-xs">
                Halaman {currentPage} dari {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="h-8 px-2.5 text-xs bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
