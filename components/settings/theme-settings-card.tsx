"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeSettingsCard() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="p-6 rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl shadow-xl space-y-4 animate-pulse">
        <div className="h-5 w-48 bg-slate-800 rounded" />
        <div className="h-4 w-72 bg-slate-800/60 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="h-28 bg-slate-800/40 rounded-2xl" />
          <div className="h-28 bg-slate-800/40 rounded-2xl" />
          <div className="h-28 bg-slate-800/40 rounded-2xl" />
        </div>
      </div>
    );
  }

  const themes = [
    {
      id: "dark",
      name: "Mode Gelap (Dark)",
      desc: "Latar hitam estetik & neon glow. Nyaman untuk sesi trading malam hari.",
      icon: Moon,
      color: "text-indigo-400",
      bg: "bg-slate-950",
      accent: "border-indigo-500/50",
      preview: "bg-[#080b11] border-slate-800 text-slate-100",
    },
    {
      id: "light",
      name: "Mode Terang (Light)",
      desc: "Latar putih bersih & kontras tinggi. Jelas dan optimal untuk siang hari.",
      icon: Sun,
      color: "text-amber-400",
      bg: "bg-white text-slate-900",
      accent: "border-amber-500/50",
      preview: "bg-slate-50 border-slate-200 text-slate-800",
    },
    {
      id: "system",
      name: "Otomatis (Sistem)",
      desc: "Menyesuaikan otomatis dengan tema perangkat laptop atau HP kamu.",
      icon: Monitor,
      color: "text-blue-400",
      bg: "bg-slate-900",
      accent: "border-blue-500/50",
      preview: "bg-gradient-to-r from-slate-950 via-slate-800 to-slate-200",
    },
  ];

  return (
    <div className="p-6 rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl shadow-xl space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sun className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Tampilan & Tema Aplikasi</h2>
            <p className="text-xs text-slate-400">Pilih mode tampilan terang atau gelap sesuai kenyamanan mata kamu</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium font-mono bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="capitalize">{theme === "system" ? "Sistem OS" : theme === "light" ? "Mode Terang" : "Mode Gelap"}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {themes.map((t) => {
          const isSelected = theme === t.id;
          const Icon = t.icon;

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTheme(t.id)}
              className={cn(
                "p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between space-y-3 cursor-pointer relative group",
                isSelected
                  ? "bg-slate-900/90 border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/30"
                  : "bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50"
              )}
            >
              <div className="flex items-start justify-between">
                <div
                  className={cn(
                    "h-9 w-9 rounded-xl flex items-center justify-center border",
                    isSelected
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                      : "bg-slate-900 border-slate-800 text-slate-400 group-hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>

                {isSelected && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                    <CheckCircle2 className="h-3 w-3" />
                    Aktif
                  </span>
                )}
              </div>

              <div>
                <div className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
                  <span>{t.name}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {t.desc}
                </p>
              </div>

              {/* Visual preview swatch */}
              <div className="pt-2 border-t border-slate-800/60 w-full">
                <div className="h-3 w-full rounded-full border border-slate-700/60 overflow-hidden flex">
                  {t.id === "dark" ? (
                    <div className="h-full w-full bg-[#080b11]" />
                  ) : t.id === "light" ? (
                    <div className="h-full w-full bg-white" />
                  ) : (
                    <>
                      <div className="h-full w-1/2 bg-[#080b11]" />
                      <div className="h-full w-1/2 bg-white" />
                    </>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
