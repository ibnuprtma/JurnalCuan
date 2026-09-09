"use client";

import * as React from "react";
import Link from "next/link";
import {
  Plus,
  ChevronDown,
  Clock,
  Shield,
  User,
  Check,
  Layers,
  LogIn,
  LogOut,
  Settings as SettingsIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface TradingAccountOption {
  id: string;
  name: string;
  broker?: string | null;
  accountType?: string | null;
  currentBalance: number;
  currency: string;
}

interface HeaderProps {
  accounts?: TradingAccountOption[];
  selectedAccountId?: string;
  onSelectAccount?: (accountId: string) => void;
  onOpenNewTradeModal?: () => void;
}

export function Header({
  accounts = [],
  selectedAccountId = "",
  onSelectAccount,
  onOpenNewTradeModal,
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState<string>("");
  const [authUser, setAuthUser] = React.useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = React.useState(true);

  // Fetch Auth0 current user profile
  React.useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setAuthUser(data.user);
          } else {
            setAuthUser(null);
          }
        }
      } catch (e) {
        console.warn("Auth check info:", e);
      } finally {
        setIsAuthLoading(false);
      }
    }
    checkAuth();
  }, []);

  React.useEffect(() => {
    const updateWIBTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      setCurrentTime(new Intl.DateTimeFormat("id-ID", options).format(now) + " WIB");
    };

    updateWIBTime();
    const timer = setInterval(updateWIBTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const isAllSelected = selectedAccountId === "all";
  const selectedAccount = isAllSelected
    ? {
        id: "all",
        name: "Semua Portofolio",
        broker: `${accounts.length} Akun Aktif`,
        accountType: "Gabungan",
        currency: "Multi",
      }
    : accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  const selectedAccountType = selectedAccount?.accountType || "Real";

  return (
    <header className="min-h-16 sm:h-18 py-2 sm:py-0 border-b border-slate-800/80 bg-[#080c16]/80 backdrop-blur-xl sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Account Selector Dropdown (3 Rows: 1. Nama Akun, 2. Nama Broker, 3. Real / Demo dsb) */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          aria-label="Pilih Portofolio Akun Trading"
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 hover:border-slate-700 transition-all duration-200 text-left cursor-pointer group shadow-md"
        >
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Layers className="h-4 w-4" />
          </div>
          <div className="min-w-0 pr-1">
            {/* Row 1: Nama Akun */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate max-w-[130px] sm:max-w-[170px]">
                {selectedAccount?.name || "Pilih Akun"}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-white transition-transform shrink-0" />
            </div>

            {/* Row 2: Nama Broker */}
            <div className="text-[10px] text-slate-400 truncate max-w-[130px] sm:max-w-[170px] leading-tight">
              {selectedAccount?.broker && selectedAccount.broker !== "-"
                ? selectedAccount.broker
                : "Broker: -"}
            </div>

            {/* Row 3: Tipe Akun (Real, Demo, Prop Firm, Gabungan) */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={cn(
                  "text-[9px] font-bold px-1.5 py-0.2 rounded font-mono border",
                  isAllSelected
                    ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
                    : selectedAccountType.toLowerCase() === "real"
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                    : selectedAccountType.toLowerCase().includes("prop")
                    ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                    : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                )}
              >
                {selectedAccountType}
              </span>
              {!isAllSelected && selectedAccount?.currency && (
                <span className="text-[9px] text-slate-400 font-mono">
                  • {selectedAccount.currency}
                </span>
              )}
            </div>
          </div>
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
            <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 rounded-2xl border border-slate-800 bg-[#0c101c] p-2 shadow-2xl z-50 animate-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/60 mb-1 flex items-center justify-between">
                <span>Pilih Portofolio Trading</span>
                <span className="text-[9px] font-mono text-slate-400">{accounts.length} Akun</span>
              </div>
              <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-0.5">
                {accounts.length > 1 && (
                  <button
                    onClick={() => {
                      onSelectAccount?.("all");
                      setDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer border",
                      isAllSelected
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold"
                        : "border-transparent text-slate-300 hover:bg-slate-800/60 hover:border-slate-700"
                    )}
                  >
                    <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                      {/* Row 1: Nama Akun */}
                      <div className="font-bold text-xs text-white truncate">
                        Semua Portofolio (Gabungan)
                      </div>
                      {/* Row 2: Nama Broker */}
                      <div className="text-[10px] text-slate-400 truncate">
                        Semua Broker Terdaftar
                      </div>
                      {/* Row 3: Tipe Akun */}
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded font-mono border bg-blue-500/15 text-blue-300 border-blue-500/30">
                          Gabungan Multi-Akun
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {accounts.length} Akun Aktif
                        </span>
                      </div>
                    </div>
                    {isAllSelected && <Check className="h-4 w-4 text-emerald-400 shrink-0" />}
                  </button>
                )}

                {accounts.map((acc) => {
                  const isSelected = acc.id === selectedAccountId;
                  const accType = acc.accountType || "Real";

                  return (
                    <button
                      key={acc.id}
                      onClick={() => {
                        onSelectAccount?.(acc.id);
                        setDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer border",
                        isSelected
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold"
                          : "border-transparent text-slate-300 hover:bg-slate-800/60 hover:border-slate-700"
                      )}
                    >
                      <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                        {/* Row 1: Nama Akun */}
                        <div className="font-bold text-xs text-white truncate">
                          {acc.name}
                        </div>
                        {/* Row 2: Nama Broker */}
                        <div className="text-[10px] text-slate-400 truncate">
                          {acc.broker && acc.broker !== "-" ? acc.broker : "Broker: -"}
                        </div>
                        {/* Row 3: Real / Demo / Prop Firm */}
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={cn(
                              "text-[9px] font-bold px-1.5 py-0.2 rounded font-mono border",
                              accType.toLowerCase() === "real"
                                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                : accType.toLowerCase().includes("prop")
                                ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                                : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                            )}
                          >
                            {accType}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            • {acc.currency || "USD"}
                          </span>
                        </div>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
              <div className="pt-2 mt-2 border-t border-slate-800/60">
                <Link
                  href="/settings?action=new-account#accounts-section"
                  onClick={() => setDropdownOpen(false)}
                  className="w-full block text-center py-1.5 text-[11px] font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  + Tambah Akun Baru
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right: Timezone Indicator, Quick Action Button & Profile */}
      <div className="flex items-center gap-3">
        {/* Live WIB Clock */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 font-mono">
          <Clock className="h-3 w-3 text-emerald-400" />
          <span>{currentTime || "Loading WIB..."}</span>
        </div>



        {/* Auth0 Login / User Profile Menu */}
        {!isAuthLoading && (
          <div className="relative">
            {authUser ? (
              <>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-label="Buka Menu Pengguna"
                  className="flex items-center gap-2 p-1 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition-colors cursor-pointer"
                >
                  {authUser.avatarUrl ? (
                    <img
                      src={authUser.avatarUrl}
                      alt={authUser.name || "Avatar"}
                      className="h-7 w-7 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      {authUser.name?.slice(0, 1) || "T"}
                    </div>
                  )}
                  <span className="text-xs font-bold text-slate-200 hidden lg:inline max-w-[100px] truncate">
                    {authUser.name}
                  </span>
                  <ChevronDown className="h-3 w-3 text-slate-400 hidden lg:inline" />
                </button>

                {userDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-800 bg-[#0c101c] p-2 shadow-2xl z-50 animate-in zoom-in-95 duration-150">
                      <div className="p-2 border-b border-slate-800/60 mb-1">
                        <div className="font-bold text-xs text-white truncate">{authUser.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{authUser.email}</div>
                      </div>
                      <div className="space-y-1">
                        <Link
                          href="/settings"
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full flex items-center gap-2 p-2 rounded-xl text-left text-xs text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors"
                        >
                          <SettingsIcon className="h-4 w-4 text-slate-400" />
                          <span>Pengaturan Akun</span>
                        </Link>
                        <a
                          href="/auth/logout"
                          className="w-full flex items-center gap-2 p-2 rounded-xl text-left text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Keluar (Logout)</span>
                        </a>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <a
                href="/auth/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800 text-xs font-bold text-emerald-400 transition-colors"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Masuk (Auth0)</span>
              </a>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
