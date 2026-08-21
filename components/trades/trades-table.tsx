"use client";

import * as React from "react";
import { formatCurrency, formatSignedCurrency, formatNumber, cn } from "@/lib/utils";
import { SampleTrade } from "@/lib/sample-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Upload,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface TradesTableProps {
  trades: SampleTrade[];
  onOpenNewTrade?: () => void;
  onOpenImportModal?: () => void;
}

export function TradesTable({ trades, onOpenNewTrade, onOpenImportModal }: TradesTableProps) {
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [directionFilter, setDirectionFilter] = React.useState<string>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [sessionFilter, setSessionFilter] = React.useState<string>("ALL");
  const [sortField, setSortField] = React.useState<string>("openTime");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const itemsPerPage = 8;

  // Filter logic
  const filteredTrades = React.useMemo(() => {
    return trades.filter((t) => {
      const matchesSearch =
        t.pair.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.strategyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.emotionTag?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.ticketId.includes(searchQuery);

      const matchesDirection = directionFilter === "ALL" || t.direction === directionFilter;
      const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
      const matchesSession = sessionFilter === "ALL" || t.session === sessionFilter;

      return matchesSearch && matchesDirection && matchesStatus && matchesSession;
    });
  }, [trades, searchQuery, directionFilter, statusFilter, sessionFilter]);

  // Sorting logic
  const sortedTrades = React.useMemo(() => {
    return [...filteredTrades].sort((a, b) => {
      let valA: any = a[sortField as keyof SampleTrade];
      let valB: any = b[sortField as keyof SampleTrade];

      if (sortField === "openTime") {
        valA = new Date(a.openTime).getTime();
        valB = new Date(b.openTime).getTime();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredTrades, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedTrades.length / itemsPerPage) || 1;
  const paginatedTrades = sortedTrades.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Bar: Search, Filters & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari pair, strategi, tiket..."
            className="pl-9 text-xs"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Posisi Filter */}
          <select
            value={directionFilter}
            onChange={(e) => {
              setDirectionFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 rounded-xl border border-slate-800 bg-slate-900 px-3 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="ALL">Semua Posisi</option>
            <option value="BUY">BUY Only</option>
            <option value="SELL">SELL Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 rounded-xl border border-slate-800 bg-slate-900 px-3 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="ALL">Semua Status</option>
            <option value="WIN">WIN</option>
            <option value="LOSS">LOSS</option>
            <option value="BREAK_EVEN">Break Even</option>
          </select>

          {/* Sesi Filter */}
          <select
            value={sessionFilter}
            onChange={(e) => {
              setSessionFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 rounded-xl border border-slate-800 bg-slate-900 px-3 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 hidden md:block"
          >
            <option value="ALL">Semua Sesi</option>
            <option value="LONDON">London</option>
            <option value="NEW_YORK">New York</option>
            <option value="OVERLAP">London-NY Overlap</option>
            <option value="ASIAN">Asian</option>
          </select>
        </div>

        {/* Action Buttons */}
        {(onOpenImportModal || onOpenNewTrade) && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onOpenImportModal && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenImportModal}
                className="gap-1.5 text-xs flex-1 sm:flex-initial"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Import MT5</span>
              </Button>
            )}

            {onOpenNewTrade && (
              <Button
                size="sm"
                onClick={onOpenNewTrade}
                className="gap-1.5 text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex-1 sm:flex-initial"
              >
                <Plus className="h-3.5 w-3.5 stroke-[3]" />
                <span>Catat Trade</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* TanStack-style Table */}
      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800/90 bg-slate-950/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                <th
                  onClick={() => handleSort("openTime")}
                  className="p-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Waktu Eksekusi</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="p-4">Pair & Posisi</th>
                <th className="p-4">Lot</th>
                <th className="p-4">Entry / Exit</th>
                <th
                  onClick={() => handleSort("netPips")}
                  className="p-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Pips</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("netPnL")}
                  className="p-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Net Cuan ($)</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="p-4">R:R</th>
                <th className="p-4">Strategi & Psikologi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedTrades.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Tidak ada data transaksi yang sesuai filter.
                  </td>
                </tr>
              ) : (
                paginatedTrades.map((trade) => {
                  const tradeDate = new Date(trade.openTime);
                  const formattedDate = new Intl.DateTimeFormat("id-ID", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Asia/Jakarta",
                  }).format(tradeDate);

                  return (
                    <tr
                      key={trade.id}
                      className="hover:bg-slate-800/40 transition-colors group font-mono text-slate-300"
                    >
                      {/* Waktu */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-200">{formattedDate}</div>
                        <div className="text-[10px] text-slate-500">#{trade.ticketId}</div>
                      </td>

                      {/* Pair & Posisi */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{trade.pair}</span>
                          <Badge variant={trade.direction === "BUY" ? "buy" : "sell"}>
                            {trade.direction}
                          </Badge>
                        </div>
                        <span className="text-[10px] text-slate-500 font-sans">{trade.session} Session</span>
                      </td>

                      {/* Lot */}
                      <td className="p-4 whitespace-nowrap font-bold text-slate-200">
                        {trade.lotSize}
                      </td>

                      {/* Entry / Exit */}
                      <td className="p-4 whitespace-nowrap text-[11px]">
                        <div>
                          <span className="text-slate-500">In: </span>
                          <span className="text-slate-200">{trade.entryPrice}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Out: </span>
                          <span className="text-slate-200">{trade.exitPrice}</span>
                        </div>
                      </td>

                      {/* Pips */}
                      <td className="p-4 whitespace-nowrap font-bold">
                        <span
                          className={trade.netPips > 0 ? "text-emerald-400" : trade.netPips < 0 ? "text-rose-400" : "text-slate-400"}
                        >
                          {trade.netPips > 0 ? `+${trade.netPips}` : trade.netPips}
                        </span>
                      </td>

                      {/* Net PnL & % Gain/Loss */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={cn(
                              "font-extrabold text-sm flex items-center gap-1",
                              trade.netPnL > 0 ? "text-emerald-400" : trade.netPnL < 0 ? "text-rose-400" : "text-slate-400"
                            )}
                          >
                            {trade.netPnL > 0 ? (
                              <TrendingUp className="h-3.5 w-3.5" />
                            ) : trade.netPnL < 0 ? (
                              <TrendingDown className="h-3.5 w-3.5" />
                            ) : null}
                            {formatSignedCurrency(trade.netPnL)}
                          </div>
                          <span
                            className={cn(
                              "text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border",
                              trade.netPnL > 0
                                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                : trade.netPnL < 0
                                ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                                : "bg-slate-800 text-slate-400 border-slate-700"
                            )}
                          >
                            {trade.netPnL >= 0
                              ? `+${((trade.netPnL / 10000) * 100).toFixed(2)}%`
                              : `${((trade.netPnL / 10000) * 100).toFixed(2)}%`}
                          </span>
                        </div>
                      </td>

                      {/* RR */}
                      <td className="p-4 whitespace-nowrap text-slate-300 text-xs">
                        1:{trade.riskRewardRatio.toFixed(1)}
                      </td>

                      {/* Strategy & Tags */}
                      <td className="p-4 font-sans">
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 whitespace-nowrap">
                            {trade.strategyName}
                          </span>
                          {trade.emotionTag && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 whitespace-nowrap">
                              {trade.emotionTag}
                            </span>
                          )}
                          {trade.mistakeTag && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 whitespace-nowrap">
                              {trade.mistakeTag}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Menampilkan{" "}
            <strong>
              {sortedTrades.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–
              {Math.min(currentPage * itemsPerPage, sortedTrades.length)}
            </strong>{" "}
            dari <strong>{sortedTrades.length}</strong> total trade
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 px-2.5 text-xs"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            <span className="font-mono text-slate-300">
              Halaman {currentPage} dari {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="h-8 px-2.5 text-xs"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
