"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { KPISummaryCards } from "@/components/dashboard/kpi-summary-cards";
import { PnLCalendar } from "@/components/calendar/pnl-calendar";
import { EquityCurveChart } from "@/components/analytics/equity-curve-chart";
import { TradesTable } from "@/components/trades/trades-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SampleTrade } from "@/lib/sample-data";
import {
  Globe,
  Lock,
  Eye,
  EyeOff,
  TrendingUp,
  ArrowLeft,
  Shield,
  Loader2,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";

export default function PublicSharePage() {
  const params = useParams();
  const username = params?.username as string;
  const accountSlug = params?.accountSlug as string;

  const [loading, setLoading] = React.useState(true);
  const [shareData, setShareData] = React.useState<any>(null);
  const [hideDollars, setHideDollars] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadShareData() {
      if (!username || !accountSlug) return;
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/share/${username}/${accountSlug}`, { cache: "no-store" });
        const data = await res.json();

        if (!res.ok && data.notFound) {
          setError("Portofolio trading tidak ditemukan atau telah dihapus.");
          setShareData(null);
          return;
        }

        setShareData(data);
      } catch (err: any) {
        setError("Gagal memuat data portofolio publik");
      } finally {
        setLoading(false);
      }
    }

    loadShareData();
  }, [username, accountSlug]);

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
        <p className="text-sm text-slate-400">Memeriksa status live share portofolio...</p>
      </div>
    );
  }

  // 2. Not Found or Error State
  if (error || !shareData) {
    return (
      <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col items-center justify-center p-6 max-w-md mx-auto text-center space-y-5">
        <div className="h-16 w-16 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-white">Portofolio Tidak Ditemukan</h1>
          <p className="text-xs text-slate-400 mt-1">{error || "Tautan yang Anda tuju salah atau akun sudah tidak aktif."}</p>
        </div>
        <Link href="/">
          <Button size="sm" className="bg-slate-800 hover:bg-slate-700 text-white gap-2 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Beranda</span>
          </Button>
        </Link>
      </div>
    );
  }

  // 3. PRIVATE / LOCKED STATE (Live Share: OFF)
  if (shareData.isPublic === false) {
    return (
      <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col items-center justify-center p-6 max-w-lg mx-auto text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Glowing Lock Container */}
        <div className="relative">
          <div className="absolute -inset-3 rounded-full bg-slate-700/20 blur-xl animate-pulse" />
          <div className="relative h-20 w-20 rounded-3xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 shadow-2xl mx-auto">
            <Lock className="h-10 w-10 text-slate-300" />
          </div>
        </div>

        <div className="space-y-2">
          <Badge variant="secondary" className="gap-1.5 text-xs py-1 px-3 bg-slate-900 border-slate-800 text-slate-400">
            <Lock className="h-3.5 w-3.5" />
            <span>Status: Portofolio Privat</span>
          </Badge>
          <h1 className="text-2xl font-black text-white tracking-tight">Portofolio Ini Bersifat Privat</h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
            Pemilik akun <strong className="text-slate-200">@{shareData.user?.username || username}</strong> telah menonaktifkan fitur <strong>Live Share</strong> untuk portofolio ini. Data transaksi dan analitik saat ini terkunci dan tidak dapat diakses publik.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-left text-xs space-y-1.5 w-full">
          <div className="text-slate-400">
            Nama Akun: <span className="text-slate-200 font-semibold">{shareData.accountName || "Portofolio Trading"}</span>
          </div>
          {shareData.broker && (
            <div className="text-slate-400">
              Broker: <span className="text-slate-200 font-mono">{shareData.broker}</span>
            </div>
          )}
        </div>

        <Link href="/">
          <Button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold gap-2 text-xs h-11 px-6 shadow-xl shadow-emerald-500/20">
            <ArrowLeft className="h-4 w-4" />
            <span>Buka Jurnal Cuan</span>
          </Button>
        </Link>
      </div>
    );
  }

  // 4. PUBLIC LIVE VERIFIED STATE (Live Share: ON)
  const trades: SampleTrade[] = shareData.trades || [];
  const account = shareData.account;
  const user = shareData.user;

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Public Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-emerald-500/20">
            JC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">{account.name}</h1>
              <Badge variant="profit" className="gap-1 text-[10px]">
                <Globe className="h-3 w-3 text-emerald-400" /> Live Verified
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Trader: <strong className="text-slate-200">@{user.username || username}</strong>
              {user.name && <span> ({user.name})</span>} • Broker:{" "}
              <span className="text-slate-200 font-mono">{account.broker || "-"}</span> • Tipe:{" "}
              <span className="text-slate-200 font-semibold">{account.accountType || "Real"}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Privacy Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setHideDollars(!hideDollars)}
            className="gap-1.5 text-xs bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300"
          >
            {hideDollars ? <EyeOff className="h-3.5 w-3.5 text-amber-400" /> : <Eye className="h-3.5 w-3.5 text-emerald-400" />}
            <span>{hideDollars ? "Tampilkan $" : "Sembunyikan $"}</span>
          </Button>

          <Link href="/">
            <Button size="sm" className="gap-1.5 text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Buka Jurnal Cuan</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main KPI Stat Cards */}
      <KPISummaryCards trades={trades} />

      {/* Interactive Calendar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Kalender Performa Cuan Bulanan</h2>
          <span className="text-xs text-slate-400 font-mono">Data live tersinkronisasi</span>
        </div>
        <PnLCalendar trades={trades} />
      </div>

      {/* Equity Curve */}
      <EquityCurveChart trades={trades} initialBalance={account.initialBalance || 10000} />

      {/* Public Trades History Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Riwayat Transaksi Terbuka & Selesai</h2>
          <span className="text-xs text-slate-400">{trades.length} Transaksi Tercatat</span>
        </div>
        <TradesTable trades={trades} />
      </div>

      {/* Public Footer Disclaimer */}
      <div className="text-center py-8 text-xs text-slate-500 border-t border-slate-800/80 space-y-1">
        <p className="font-semibold text-slate-400">Jurnal Cuan — Platform Jurnal & Analytics Forex Terverifikasi.</p>
        <p className="text-[10px]">Seluruh data di halaman ini dipublikasikan secara sukarela oleh pemilik akun (@{user.username || username}).</p>
      </div>
    </div>
  );
}
