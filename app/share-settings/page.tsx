"use client";

import * as React from "react";
import Link from "next/link";
import { useAppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Share2, Globe, Lock, Eye, Copy, Check, ExternalLink, Shield } from "lucide-react";

export default function ShareSettingsPage() {
  const { accounts } = useAppShell();
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const username = "cuanmaster";

  const handleCopyLink = (slug: string, id: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const fullUrl = `${origin}/share/${username}/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Live Shareable Portfolio</h1>
        <p className="text-xs text-slate-400">
          Kelola link publik portofolio trading kamu untuk dibagikan secara transparan kepada investor atau komunitas
        </p>
      </div>

      {/* Info Card */}
      <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Tautan Live Akun Publik</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Setiap akun yang diatur menjadi <strong>Publik</strong> akan memiliki tautan khusus (*read-only*) yang dapat dibuka oleh siapa saja tanpa perlu login. Kamu dapat menyembunyikan nominal saldo uang asli demi privasi.
        </p>
      </div>

      {/* Accounts List */}
      <div className="space-y-4">
        {accounts.filter((a) => a.id !== "all").map((account) => {
          const isPublic = account.isPublic !== false;
          const slug = account.publicSlug || "main-account";
          const publicUrl = `/share/${username}/${slug}`;

          return (
            <div
              key={account.id}
              className="p-5 rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-white">{account.name}</h4>
                  <Badge variant={isPublic ? "profit" : "secondary"}>
                    {isPublic ? "🌐 Publik" : "🔒 Privat"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">
                  Broker: <span className="text-slate-200 font-mono">{account.broker || "Forex"}</span> • Tautan:{" "}
                  <code className="text-emerald-400 font-mono text-[11px]">{publicUrl}</code>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyLink(slug, account.id)}
                  className="gap-1.5 text-xs"
                >
                  {copiedId === account.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedId === account.id ? "Tersalin!" : "Salin Link"}</span>
                </Button>

                <Link href={publicUrl} target="_blank">
                  <Button size="sm" className="gap-1.5 text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold">
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Buka Tampilan Publik</span>
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
