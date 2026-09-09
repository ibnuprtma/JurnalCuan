"use client";

import * as React from "react";
import { formatSignedCurrency, cn } from "@/lib/utils";
import { SampleTrade } from "@/lib/sample-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppShell } from "@/components/layout/app-shell";
import {
  Search,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface TradesTableProps {
  trades: SampleTrade[];
  onOpenNewTrade?: () => void;
  onOpenImportModal?: () => void; // Deprecated / hidden
}

export function TradesTable({ trades, onOpenNewTrade }: TradesTableProps) {
  const { handleDeleteTrade, accounts, selectedAccountId } = useAppShell();
  const activeAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];
  const currency = activeAccount?.currency || "USD";

  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [typeFilter, setTypeFilter] = React.useState<string>("ALL");
  const [sortField, setSortField] = React.useState<string>("openTime");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const itemsPerPage = 10;

  // Filter logic
  const filteredTrades = React.useMemo(() => {
    return trades.filter((t) => {
      const notesText = (t.notes || t.strategyName || t.pair || "").toLowerCase();
      const matchesSearch = notesText.includes(searchQuery.toLowerCase()) || t.ticketId.includes(searchQuery);

      const matchesType =
        typeFilter === "ALL" ||
        (typeFilter === "PROFIT" && t.netPnL > 0) ||
        (typeFilter === "LOSS" && t.netPnL < 0);

      return matchesSearch && matchesType;
    });
  }, [trades, searchQuery, typeFilter]);

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

  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const onDeleteClick = async (tradeId: string) => {
    if (confirm("Hapus catatan transaksi ini?")) {
      setDeletingId(tradeId);
      try {
        await handleDeleteTrade(tradeId);
        toast.success("Catatan transaksi berhasil dihapus.");
      } catch (err) {
        toast.error("Gagal menghapus transaksi.");
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Bar: Search, Filters & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari deskripsi atau catatan..."
            className="pl-9 text-xs"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 rounded-xl border border-slate-800 bg-slate-900 px-3 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="ALL">Semua Transaksi</option>
            <option value="PROFIT">🟢 Hanya Cuan (Profit)</option>
            <option value="LOSS">🔴 Hanya Boncos (Loss)</option>
          </select>

          {/* New Entry Action Button */}
          {onOpenNewTrade && (
            <Button
              size="sm"
              onClick={onOpenNewTrade}
              className="gap-1.5 text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
            >
              <Plus className="h-3.5 w-3.5 stroke-[3]" />
              <span>Catat Transaksi</span>
            </Button>
          )}
        </div>
      </div>

      {/* Simplified Clean Table */}
      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800/90 bg-slate-950/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                <th
                  onClick={() => handleSort("openTime")}
                  className="p-4 cursor-pointer hover:text-white transition-colors w-48"
                >
                  <div className="flex items-center gap-1">
                    <span>Waktu & Tanggal</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="p-4">Deskripsi / Catatan</th>
                <th className="p-4 w-32">Tipe</th>
                <th
                  onClick={() => handleSort("netPnL")}
                  className="p-4 cursor-pointer hover:text-white transition-colors w-36 text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Nominal Cuan</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="p-4 w-16 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedTrades.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Tidak ada catatan transaksi yang sesuai filter.
                  </td>
                </tr>
              ) : (
                paginatedTrades.map((trade) => {
                  const tradeDate = new Date(trade.openTime);
                  const formattedDate = new Intl.DateTimeFormat("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Asia/Jakarta",
                  }).format(tradeDate);

                  const isProfit = trade.netPnL >= 0;
                  const displayNotes = trade.notes || trade.strategyName || "Catatan Transaksi";

                  return (
                    <tr
                      key={trade.id}
                      className="hover:bg-slate-800/40 transition-colors group text-slate-300"
                    >
                      {/* Waktu */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-200">{formattedDate}</div>
                        <div className="text-[10px] text-slate-500 font-mono">#{trade.ticketId}</div>
                      </td>

                      {/* Deskripsi / Catatan */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                          <span className="text-slate-200 font-medium line-clamp-1">{displayNotes}</span>
                        </div>
                      </td>

                      {/* Tipe */}
                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border",
                            isProfit
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                              : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                          )}
                        >
                          {isProfit ? (
                            <>
                              <TrendingUp className="h-3 w-3" />
                              <span>Cuan (Pemasukan)</span>
                            </>
                          ) : (
                            <>
                              <TrendingDown className="h-3 w-3" />
                              <span>Boncos (Pengeluaran)</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Nominal Net P&L */}
                      <td className="p-4 whitespace-nowrap text-right font-mono font-bold text-sm">
                        <span className={isProfit ? "text-emerald-400" : "text-rose-400"}>
                          {formatSignedCurrency(trade.netPnL, currency)}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="p-4 whitespace-nowrap text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={deletingId === trade.id}
                          onClick={() => onDeleteClick(trade.id)}
                          className="h-7 w-7 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg opacity-80 group-hover:opacity-100 transition-all cursor-pointer"
                          title="Hapus Catatan"
                        >
                          {deletingId === trade.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-400" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800/80 text-xs text-slate-400">
            <div>
              Halaman <span className="font-bold text-white">{currentPage}</span> dari{" "}
              <span className="font-bold text-white">{totalPages}</span> ({filteredTrades.length} Catatan)
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 px-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 px-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
