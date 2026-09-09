"use client";

import * as React from "react";
import Link from "next/link";
import { useAppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  User,
  Layers,
  Key,
  Plus,
  Trash2,
  CheckCircle2,
  Shield,
  Globe,
  Calculator,
  Newspaper,
  Share2,
  ArrowRight,
  Sparkles,
  Loader2,
  X,
  ChevronDown,
  LayoutDashboard,
  TrendingUp,
  FlaskConical,
  Building2,
  Check,
  Pencil,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { EditBalanceModal } from "@/components/tools/edit-balance-modal";

const ACCOUNT_TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; color: string; border: string; bg: string; desc: string }
> = {
  Demo: {
    label: "Demo",
    icon: <FlaskConical className="h-4 w-4" />,
    color: "text-yellow-400",
    border: "border-yellow-500/40",
    bg: "bg-yellow-500/10",
    desc: "Akun latihan tanpa risiko uang nyata",
  },
  Real: {
    label: "Real",
    icon: <TrendingUp className="h-4 w-4" />,
    color: "text-emerald-400",
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/10",
    desc: "Akun live trading dengan uang nyata",
  },
  PropFirm: {
    label: "Prop Firm",
    icon: <Shield className="h-4 w-4" />,
    color: "text-purple-400",
    border: "border-purple-500/40",
    bg: "bg-purple-500/10",
    desc: "Akun challenge / funded dari prop firm",
  },
};

const POPULAR_BROKERS = [
  "Exness",
  "HFM (HotForex)",
  "FBS",
  "IC Markets",
  "XM",
  "OctaFX",
  "Vantage",
  "Tickmill",
  "Pepperstone",
  "FXTM",
  "RoboForex",
  "MIFX",
  "FTMO",
  "FundedNext",
  "Funding Pips",
  "The Funded Trader",
  "MyForexFunds",
  "Alpha Capital Group",
  "MetaTrader 5 (MT5)",
  "MetaTrader 4 (MT4)",
  "cTrader",
];

const QUICK_CHIPS = ["Exness", "HFM", "FBS", "IC Markets", "XM", "FTMO", "OctaFX"];

interface NewAccountForm {
  name: string;
  broker: string;
  accountNumber: string;
  accountType: "Demo" | "Real" | "PropFirm";
  initialBalance: string;
  currency: string;
}

const INITIAL_FORM: NewAccountForm = {
  name: "",
  broker: "",
  accountNumber: "",
  accountType: "Real",
  initialBalance: "",
  currency: "USD",
};

export default function SettingsPage() {
  const { accounts, refreshAccounts } = useAppShell();
  const [userName, setUserName] = React.useState("Trader");
  const [email, setEmail] = React.useState("");
  const [timezone] = React.useState("Asia/Jakarta (WIB)");
  const [currency] = React.useState("USD ($)");
  const [savedStatus, setSavedStatus] = React.useState(false);
  const [isAuth, setIsAuth] = React.useState(false);
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);
  const [profileError, setProfileError] = React.useState<string | null>(null);

  // Form buat akun baru
  const [showAddAccount, setShowAddAccount] = React.useState(false);
  const [form, setForm] = React.useState<NewAccountForm>(INITIAL_FORM);
  const [creating, setCreating] = React.useState(false);
  const [createError, setCreateError] = React.useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = React.useState(false);

  // Edit Saldo Awal Modal state
  const [isEditBalanceOpen, setIsEditBalanceOpen] = React.useState(false);
  const [selectedEditAccountId, setSelectedEditAccountId] = React.useState<string | undefined>(undefined);

  // Autocomplete state untuk Broker
  const [brokerDropdownOpen, setBrokerDropdownOpen] = React.useState(false);
  const brokerInputRef = React.useRef<HTMLInputElement>(null);
  const brokerContainerRef = React.useRef<HTMLDivElement>(null);

  // Filter autocomplete suggestions based on what user types
  const filteredBrokers = React.useMemo(() => {
    const query = form.broker.trim().toLowerCase();
    if (!query) return POPULAR_BROKERS;
    return POPULAR_BROKERS.filter((b) => b.toLowerCase().includes(query));
  }, [form.broker]);

  // Close broker dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (brokerContainerRef.current && !brokerContainerRef.current.contains(event.target as Node)) {
        setBrokerDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle direct navigation to add account from dashboard warning
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("action") === "new-account") {
        setShowAddAccount(true);
        const typeParam = urlParams.get("type");
        if (typeParam?.toLowerCase() === "real") {
          setForm((f) => ({ ...f, accountType: "Real" }));
        }
        setTimeout(() => {
          const el = document.getElementById("accounts-section");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 250);
      }
    }
  }, []);

  React.useEffect(() => {
    async function loadAuth() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUserName(data.user.name || "Trader");
            setEmail(data.user.email || "");
            setIsAuth(true);
          }
        }
      } catch (e) {
        // Fallback
      }
    }
    loadAuth();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setIsSavingProfile(true);

    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: userName }),
      });

      const data = await res.json();
      if (!res.ok) {
        setProfileError(data.error || "Gagal menyimpan profil");
        return;
      }

      if (data.user?.name) {
        setUserName(data.user.name);
      }

      setSavedStatus(true);
      setTimeout(() => setSavedStatus(false), 3500);
    } catch (err) {
      setProfileError("Koneksi gagal saat menyimpan profil");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreating(true);

    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          broker: form.broker.trim() || "-",
          accountNumber: form.accountNumber || undefined,
          accountType: form.accountType,
          initialBalance: parseFloat(form.initialBalance) || 0,
          currency: form.currency,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCreateError(data.error || "Gagal membuat akun, coba lagi");
        return;
      }

      setCreateSuccess(true);
      setForm(INITIAL_FORM);
      setShowAddAccount(false);
      // Refresh daftar akun di app shell
      if (typeof refreshAccounts === "function") refreshAccounts();
      setTimeout(() => setCreateSuccess(false), 4000);
    } catch (err: any) {
      setCreateError("Koneksi error, pastikan kamu terhubung ke server");
    } finally {
      setCreating(false);
    }
  };

  const accountList = accounts.filter((a) => a.id !== "all");

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Pengaturan & Fitur Tambahan</h1>
        <p className="text-xs text-slate-400">
          Kelola profil trader, multi-akun portofolio, kalkulator lot size, dan tautan live share publik
        </p>
      </div>

      {/* Quick Tools Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/calculator"
          className="p-5 rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl hover:border-emerald-500/40 transition-all group flex flex-col justify-between space-y-4 shadow-xl"
        >
          <div className="flex items-start justify-between">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Calculator className="h-6 w-6" />
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>Buka Alat</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
              Kalkulator Lot Size & Risiko
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Hitung volume lot yang aman sebelum entry berdasarkan toleransi risiko modal (%) dan jarak Stop Loss (pips).
            </p>
          </div>
        </Link>

        <Link
          href="/news"
          className="p-5 rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl hover:border-amber-500/40 transition-all group flex flex-col justify-between space-y-4 shadow-xl"
        >
          <div className="flex items-start justify-between">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Newspaper className="h-6 w-6" />
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Buka Berita</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
              Kalender Berita Ekonomi
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Pantau jadwal rilis berita berdampak tinggi/sedang (High/Medium Impact) dari Forex Factory secara live.
            </p>
          </div>
        </Link>

        <Link
          href="/share-settings"
          className="p-5 rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl hover:border-blue-500/40 transition-all group flex flex-col justify-between space-y-4 shadow-xl"
        >
          <div className="flex items-start justify-between">
            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Globe className="h-6 w-6" />
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-blue-400 group-hover:translate-x-1 transition-transform">
              <span>Kelola Link</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
              Live Share Portfolio Publik
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Kelola tautan publik read-only portofolio trading kamu untuk dibagikan secara transparan kepada investor atau komunitas.
            </p>
          </div>
        </Link>
      </div>

      {/* Profile Settings Card */}
      <div className="p-6 rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl shadow-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800/80">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Profil Pengguna</h2>
            <p className="text-xs text-slate-400">Pengaturan identitas dan zona waktu pelaporan</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Nama Trader</label>
              <Input value={userName} onChange={(e) => setUserName(e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Email Terdaftar</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} disabled className="opacity-70" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Zona Waktu Pelaporan</label>
              <Input value={timezone} disabled className="opacity-70 font-mono text-xs" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Mata Uang Dasar</label>
              <Input value={currency} disabled className="opacity-70 font-mono text-xs" />
            </div>
          </div>

          {profileError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              <X className="h-3.5 w-3.5 flex-shrink-0" />
              {profileError}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            {savedStatus ? (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4" /> Profil berhasil disimpan ke database!
              </span>
            ) : (
              <span />
            )}
            <Button
              type="submit"
              size="sm"
              disabled={isSavingProfile || !userName.trim()}
              className="ml-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold gap-1.5"
            >
              {isSavingProfile ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Menyimpan...
                </>
              ) : (
                "Simpan Profil"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Multi-Accounts Manager */}
      <div id="accounts-section" className="p-6 rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Daftar Akun Trading (Multi-Portofolio)</h2>
              <p className="text-xs text-slate-400">Kelola akun personal, akun prop firm, atau akun demo kamu</p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => { setShowAddAccount((p) => !p); setCreateError(null); }}
            className="gap-1.5 bg-purple-500 hover:bg-purple-400 text-white font-bold"
          >
            {showAddAccount ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {showAddAccount ? "Batal" : "Tambah Akun"}
          </Button>
        </div>

        {/* Success Banner */}
        {createSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>Akun berhasil dibuat! Silakan pilih dari menu dropdown di header atas.</span>
          </div>
        )}

        {/* Add Account Form */}
        {showAddAccount && (
          <div className="p-5 rounded-2xl border border-purple-500/20 bg-purple-500/5 space-y-5 animate-in fade-in slide-in-from-top-3">
            <div>
              <h3 className="text-sm font-bold text-white mb-0.5">Buat Akun Trading Baru</h3>
              <p className="text-xs text-slate-400">Mulai dari Demo, lanjut ke Real atau Prop Firm kapan saja</p>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-5">
              {/* Pilih tipe akun */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">Tipe Akun *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Demo", "Real", "PropFirm"] as const).map((type) => {
                    const cfg = ACCOUNT_TYPE_CONFIG[type];
                    const selected = form.accountType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, accountType: type }))}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          selected
                            ? `${cfg.bg} ${cfg.border} ${cfg.color}`
                            : "border-slate-700/60 bg-slate-900/40 text-slate-400 hover:border-slate-600"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-sm mb-1">
                          {cfg.icon}
                          {cfg.label}
                        </div>
                        <p className={`text-[10px] leading-snug ${selected ? "opacity-80" : "text-slate-500"}`}>
                          {cfg.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Info akun */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Nama Akun <span className="text-red-400">*</span>
                  </label>
                  <Input
                    placeholder={
                      form.accountType === "Demo"
                        ? "contoh: Demo XAUUSD Scalping"
                        : form.accountType === "PropFirm"
                        ? "contoh: FTMO 100K Challenge"
                        : "contoh: Exness Real USD"
                    }
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required
                    minLength={3}
                  />
                </div>

                {/* Broker / Platform Autocomplete Input */}
                <div className="relative" ref={brokerContainerRef}>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Broker / Platform
                  </label>
                  <div className="relative">
                    <Input
                      ref={brokerInputRef}
                      placeholder="Ketik atau pilih broker (Exness, HFM, FBS, IC Markets, dll)"
                      value={form.broker}
                      onFocus={() => setBrokerDropdownOpen(true)}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, broker: e.target.value }));
                        setBrokerDropdownOpen(true);
                      }}
                      className="pr-8"
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => setBrokerDropdownOpen((p) => !p)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${brokerDropdownOpen ? "rotate-180 text-purple-400" : ""}`} />
                    </button>
                  </div>

                  {/* Quick-select chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[10px] text-slate-500 self-center mr-0.5">Saran:</span>
                    {QUICK_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => {
                          setForm((f) => ({ ...f, broker: chip }));
                          setBrokerDropdownOpen(false);
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                          form.broker.toLowerCase() === chip.toLowerCase()
                            ? "bg-purple-500/20 border-purple-500/50 text-purple-300 font-semibold"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                        }`}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  {/* Autocomplete Dropdown Menu */}
                  {brokerDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-56 overflow-y-auto rounded-xl border border-slate-800 bg-[#0d1322] shadow-2xl p-1.5 space-y-0.5 backdrop-blur-xl animate-in fade-in slide-in-from-top-1">
                      <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-800/80 mb-1">
                        Pilih Rekomendasi atau Ketik Sendiri
                      </div>

                      {filteredBrokers.length > 0 ? (
                        filteredBrokers.map((brokerOption) => {
                          const isSelected = form.broker.toLowerCase() === brokerOption.toLowerCase();
                          return (
                            <button
                              key={brokerOption}
                              type="button"
                              onClick={() => {
                                setForm((f) => ({ ...f, broker: brokerOption }));
                                setBrokerDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                                isSelected
                                  ? "bg-purple-500/20 text-purple-300 font-bold"
                                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Building2 className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
                                <span>{brokerOption}</span>
                              </div>
                              {isSelected && <Check className="h-3.5 w-3.5 text-purple-400" />}
                            </button>
                          );
                        })
                      ) : (
                        <div className="p-3 text-center text-xs text-slate-400">
                          <span>Gunakan nama kustom: </span>
                          <strong className="text-purple-300 font-bold">&quot;{form.broker}&quot;</strong>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Nomor Akun MT5/MT4 (Opsional)</label>
                  <Input
                    placeholder="contoh: 1234567890"
                    value={form.accountNumber}
                    onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Modal Awal ({form.currency})
                  </label>
                  <Input
                    type="number"
                    placeholder="contoh: 10000"
                    min={0}
                    step={0.01}
                    value={form.initialBalance}
                    onChange={(e) => setForm((f) => ({ ...f, initialBalance: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Mata Uang</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                    className="w-full h-10 rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="USD">USD — US Dollar</option>
                    <option value="EUR">EUR — Euro</option>
                    <option value="GBP">GBP — British Pound</option>
                    <option value="JPY">JPY — Japanese Yen</option>
                    <option value="IDR">IDR — Rupiah</option>
                    <option value="SGD">SGD — Singapore Dollar</option>
                    <option value="AUD">AUD — Australian Dollar</option>
                  </select>
                </div>
              </div>

              {createError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                  <X className="h-3.5 w-3.5 flex-shrink-0" />
                  {createError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => { setShowAddAccount(false); setForm(INITIAL_FORM); setCreateError(null); }}
                  className="text-slate-400 hover:text-white"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={creating || form.name.trim().length < 3}
                  className="bg-purple-500 hover:bg-purple-400 text-white font-bold gap-1.5"
                >
                  {creating ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Membuat...</>
                  ) : (
                    <><Plus className="h-3.5 w-3.5" /> Buat Akun</>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Existing Accounts List */}
        <div className="space-y-3">
          {accountList.length === 0 && (
            <div className="py-8 text-center text-slate-500 text-sm">
              Belum ada akun trading. Klik &quot;Tambah Akun&quot; untuk mulai.
            </div>
          )}
          {accountList.map((account, idx) => {
            const type = (account.accountType as string) || "Real";
            const cfg = ACCOUNT_TYPE_CONFIG[type] || ACCOUNT_TYPE_CONFIG["Real"];
            const isFirst = idx === 0;
            const brokerDisplay = account.broker && account.broker !== "-" ? account.broker : "-";
            return (
              <div
                key={account.id}
                className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center ${cfg.color}`}>
                    {cfg.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{account.name}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                        {cfg.label}
                      </span>
                      {isFirst && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-300 border border-slate-600/40">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Broker: <span className="text-slate-200 font-mono">{brokerDisplay}</span> • Saldo:{" "}
                      <strong className="text-emerald-400 font-mono">
                        {formatCurrency(account.currentBalance, account.currency)}
                      </strong>
                      {" • Modal Awal: "}
                      <strong className="text-slate-300 font-mono">
                        {formatCurrency(account.initialBalance || account.currentBalance || 0, account.currency)}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedEditAccountId(account.id);
                      setIsEditBalanceOpen(true);
                    }}
                    className="h-7 text-xs px-2.5 gap-1.5 border-slate-700 hover:border-emerald-500/50 hover:text-emerald-400 text-slate-300"
                  >
                    <Pencil className="h-3 w-3 text-emerald-400" />
                    <span>Ubah Modal Awal</span>
                  </Button>
                  <Badge variant="outline" className="font-mono text-[10px] gap-1">
                    <Key className="h-2.5 w-2.5" /> API: <code>jc_{account.id.slice(0, 6)}…</code>
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Initial Balance Modal */}
      <EditBalanceModal
        isOpen={isEditBalanceOpen}
        onClose={() => setIsEditBalanceOpen(false)}
        accounts={accounts}
        currentAccountId={selectedEditAccountId}
        onBalanceUpdated={() => {
          if (typeof refreshAccounts === "function") refreshAccounts();
        }}
      />
    </div>
  );
}
