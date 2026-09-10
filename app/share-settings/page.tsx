"use client";

import * as React from "react";
import Link from "next/link";
import { useAppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Share2,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Loader2,
  AlertCircle,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

export default function ShareSettingsPage() {
  const { accounts, refreshAccounts } = useAppShell();
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [loadingAccountId, setLoadingAccountId] = React.useState<string | null>(null);
  const [username, setUsername] = React.useState("trader");
  const [notification, setNotification] = React.useState<{ id: string; message: string; type: "success" | "error" } | null>(null);

  // Load user profile username
  React.useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user?.username) {
            setUsername(data.user.username);
          }
        }
      } catch (e) {
        // Fallback
      }
    }
    loadUser();
  }, []);

  const handleToggleShare = async (account: any, nextStatus: boolean) => {
    setLoadingAccountId(account.id);
    setNotification(null);

    try {
      const res = await fetch("/api/accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: account.id,
          isPublic: nextStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setNotification({
          id: account.id,
          message: data.error || "Gagal mengubah status share",
          type: "error",
        });
        return;
      }

      // Refresh accounts list
      if (typeof refreshAccounts === "function") {
        refreshAccounts();
      }

      setNotification({
        id: account.id,
        message: nextStatus
          ? `🌐 Live Share AKTIF! Tautan akun "${account.name}" sekarang bisa dilihat publik tanpa login.`
          : `🔒 Live Share NONAKTIF! Akun "${account.name}" sekarang privat dan terkunci dari publik.`,
        type: "success",
      });

      setTimeout(() => setNotification(null), 5000);
    } catch (e) {
      setNotification({
        id: account.id,
        message: "Koneksi gagal saat mengubah status share",
        type: "error",
      });
    } finally {
      setLoadingAccountId(null);
    }
  };

  const handleCopyLink = (slug: string, id: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const fullUrl = `${origin}/share/${username}/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const accountList = accounts.filter((a) => a.id !== "all");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/settings" className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Pengaturan Live Shareable Portfolio</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Atur apakah portofolio trading kamu bisa dilihat secara publik atau dikunci privat
          </p>
        </div>

        <Link href="/settings">
          <Button variant="outline" size="sm" className="text-xs gap-1.5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-200">
            <span>Kembali ke Pengaturan</span>
          </Button>
        </Link>
      </div>

      {/* Guide Banner */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl space-y-3 shadow-xs dark:shadow-xl transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Globe className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cara Kerja Tautan Live Share (ON / OFF)</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Kontrol penuh privasi portofolio per akun</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
          <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20 space-y-1 transition-colors">
            <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              <span>Jika Live Share: ON (Publik)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              Tautan dapat dibuka oleh <strong>siapa saja tanpa perlu login</strong> (investor, teman, atau komunitas) dalam mode *read-only*.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1 transition-colors">
            <div className="font-bold text-slate-700 dark:text-slate-400 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" />
              <span>Jika Live Share: OFF (Privat)</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Tautan <strong>terkunci total</strong>. Jika ada orang yang membuka tautan, halaman akan menampilkan peringatan <em>&quot;Portofolio Ini Bersifat Privat&quot;</em>.
            </p>
          </div>
        </div>
      </div>

      {/* Accounts List */}
      <div className="space-y-4">
        {accountList.length === 0 && (
          <div className="p-8 text-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 rounded-3xl text-slate-500 text-sm">
            Belum ada akun trading. Silakan buat akun di halaman Pengaturan terlebih dahulu.
          </div>
        )}

        {accountList.map((account) => {
          const isPublic = account.isPublic === true;
          const slug = account.publicSlug || `account-${account.id.slice(0, 8)}`;
          const publicUrl = `/share/${username}/${slug}`;
          const isLoading = loadingAccountId === account.id;

          return (
            <div
              key={account.id}
              className={`p-6 rounded-3xl border transition-all shadow-xs dark:shadow-xl space-y-4 ${
                isPublic
                  ? "border-emerald-300 dark:border-emerald-500/30 bg-emerald-50/30 dark:bg-gradient-to-b dark:from-slate-900/90 dark:to-slate-950/80"
                  : "border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60"
              }`}
            >
              {/* Top Row: Account Name & Live Toggle Switch */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">{account.name}</h4>
                    <Badge variant={isPublic ? "profit" : "secondary"} className="gap-1 text-[11px]">
                      {isPublic ? (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
                          <Globe className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                          <span>Publik (Aktif)</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                          <span>Privat (Terkunci)</span>
                        </>
                      )}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tipe: <span className="text-slate-800 dark:text-slate-200 font-semibold">{account.accountType || "Real"}</span> • Broker:{" "}
                    <span className="text-slate-800 dark:text-slate-200 font-mono">{account.broker || "-"}</span>
                  </p>
                </div>

                {/* ON / OFF Toggle Switch Button */}
                <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl transition-colors">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 pl-2">
                    Live Share:
                  </span>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleToggleShare(account, !isPublic)}
                    className={`relative inline-flex h-8 w-16 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isPublic
                        ? "bg-emerald-600 dark:bg-emerald-500"
                        : "bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center text-[10px] font-bold ${
                        isPublic ? "translate-x-8 text-emerald-700 font-extrabold" : "translate-x-0 text-slate-600"
                      }`}
                    >
                      {isLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-600" />
                      ) : isPublic ? (
                        "ON"
                      ) : (
                        "OFF"
                      )}
                    </span>
                  </button>
                </div>
              </div>

              {/* URL & Action Row */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 max-w-full overflow-hidden">
                  <span className="text-xs text-slate-500 font-medium flex-shrink-0">Tautan:</span>
                  <code className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-emerald-700 dark:text-emerald-400 font-mono text-xs truncate max-w-xs sm:max-w-md">
                    {publicUrl}
                  </code>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyLink(slug, account.id)}
                    className="gap-1.5 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    {copiedId === account.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-slate-500" />
                    )}
                    <span>{copiedId === account.id ? "Tersalin!" : "Salin Link"}</span>
                  </Button>

                  {isPublic ? (
                    <Link href={publicUrl} target="_blank">
                      <Button
                        size="sm"
                        className="gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Buka Tampilan Publik</span>
                      </Button>
                    </Link>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700/60 select-none cursor-not-allowed">
                      <Lock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                      <span>Terkunci (OFF)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Feedback Alert for this specific card */}
              {notification && notification.id === account.id && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
                    notification.type === "success"
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                      : "bg-red-500/10 border border-red-500/30 text-red-400"
                  }`}
                >
                  {notification.type === "success" ? (
                    <Check className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  )}
                  <span>{notification.message}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
