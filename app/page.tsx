"use client";

import * as React from "react";
import Link from "next/link";
import {
  TrendingUp,
  LogIn,
  Shield,
  Zap,
  Calendar,
  BarChart3,
  Globe,
  Lock,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Clock,
  User,
} from "lucide-react";

export default function WelcomeLandingPage() {
  const [showSplash, setShowSplash] = React.useState(true);
  const [splashProgress, setSplashProgress] = React.useState(0);
  const [isFadingSplash, setIsFadingSplash] = React.useState(false);
  const [authUser, setAuthUser] = React.useState<any>(null);
  const [currentTime, setCurrentTime] = React.useState<string>("");

  // Live WIB Clock
  React.useEffect(() => {
    const updateTime = () => {
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
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check auth status
  React.useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setAuthUser(data.user);
          }
        }
      } catch (e) {
        // Unauthenticated
      }
    }
    checkAuth();
  }, []);

  // Splash Screen Animation Timer
  React.useEffect(() => {
    const progressInterval = setInterval(() => {
      setSplashProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 5;
      });
    }, 45);

    const fadeTimeout = setTimeout(() => {
      setIsFadingSplash(true);
    }, 1300);

    const closeTimeout = setTimeout(() => {
      setShowSplash(false);
    }, 1700);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(fadeTimeout);
      clearTimeout(closeTimeout);
    };
  }, []);

  const handleSkipSplash = () => {
    setIsFadingSplash(true);
    setTimeout(() => setShowSplash(false), 200);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#06080e] text-slate-100 flex flex-col justify-between overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* ========================================================================= */}
      {/* 1. ANIMATED SPLASH SCREEN OVERLAY */}
      {/* ========================================================================= */}
      {showSplash && (
        <div
          onClick={handleSkipSplash}
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#06080e] cursor-pointer transition-all duration-500 ${
            isFadingSplash ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
          }`}
        >
          {/* Ambient Glows */}
          <div className="absolute w-96 h-96 rounded-full bg-emerald-500/15 blur-[120px] animate-pulse pointer-events-none" />
          <div className="absolute w-80 h-80 rounded-full bg-teal-500/10 blur-[100px] pointer-events-none" />

          {/* Center Logo & Animation */}
          <div className="relative flex flex-col items-center space-y-6 z-10 px-4 text-center">
            {/* Glowing Candlestick Icon Container */}
            <div className="relative group">
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-400 opacity-60 blur-xl animate-pulse" />
              <div className="relative h-24 w-24 rounded-3xl bg-slate-900 border border-emerald-500/50 flex items-center justify-center shadow-2xl">
                {/* Stylized Candlestick Logo SVG */}
                <svg className="w-14 h-14" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Candlestick 1 - Red */}
                  <rect x="20" y="45" width="12" height="30" rx="3" fill="#ef4444" opacity="0.8" />
                  <line x1="26" y1="35" x2="26" y2="45" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="26" y1="75" x2="26" y2="85" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Candlestick 2 - Green */}
                  <rect x="42" y="30" width="14" height="42" rx="3" fill="#10b981" />
                  <line x1="49" y1="18" x2="49" y2="30" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                  <line x1="49" y1="72" x2="49" y2="82" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />

                  {/* Candlestick 3 - Green Hero */}
                  <rect x="66" y="20" width="14" height="50" rx="3" fill="#34d399" />
                  <line x1="73" y1="10" x2="73" y2="20" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
                  <line x1="73" y1="70" x2="73" y2="78" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                JURNAL CUAN
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-400 tracking-widest uppercase">
                Forex Trading Journal & Analytics
              </p>
            </div>

            {/* Progress Line */}
            <div className="w-48 h-1.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-75"
                style={{ width: `${splashProgress}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-500 animate-pulse">
              Memuat sistem jurnal trading...
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. BACKGROUND VISUALS */}
      {/* ========================================================================= */}
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370f_1px,transparent_1px),linear-gradient(to_bottom,#1f29370f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Radiant Glowing Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* ========================================================================= */}
      {/* 3. TOP NAVBAR (MINIMALIST) */}
      {/* ========================================================================= */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-lg text-white tracking-tight">Jurnal<span className="text-emerald-400">Cuan</span></span>
          </div>
        </div>

        {/* Live WIB Clock */}
        {currentTime && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-800/80 bg-slate-900/60 backdrop-blur-md text-xs text-slate-300 font-mono">
            <Clock className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span>{currentTime}</span>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 4. MAIN HERO SECTION (EXCLUSIVE FOCUS: TOMBOL LOGIN) */}
      {/* ========================================================================= */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 text-center max-w-4xl mx-auto">
        {/* Top Floating Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-xl text-xs font-semibold text-emerald-400 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500 shadow-lg shadow-emerald-500/10">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Platform Jurnal & Analitik Forex Modern</span>
        </div>

        {/* Big Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1] mb-5">
          Tingkatkan Disiplin. <br />
          Raih <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Cuan Konsisten</span>.
        </h1>

        {/* Subtitle Description */}
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
          Jurnal trading otomatis dengan Kalender Cuan interaktif, integrasi MetaTrader 5, analitik win-rate mendalam, dan live economic news calendar untuk trader cerdas.
        </p>

        {/* ===================================================================== */}
        {/* EXCLUSIVE LOGIN ACTION BUTTON */}
        {/* ===================================================================== */}
        <div className="w-full max-w-sm flex flex-col items-center space-y-4">
          {authUser ? (
            // If already logged in, provide direct access to Dashboard
            <div className="w-full space-y-3">
              <Link
                href="/dashboard"
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-base flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <span>Buka Dashboard ({authUser.name || "Trader"})</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <div className="text-xs text-slate-500 flex items-center justify-center gap-2">
                <span>Login sebagai <strong className="text-slate-300">{authUser.email}</strong></span>
                <span>•</span>
                <a href="/auth/logout" className="text-emerald-400 hover:underline">Ganti Akun</a>
              </div>
            </div>
          ) : (
            // Primary Auth0 Login Button
            <div className="w-full space-y-3">
              <a
                href="/auth/login"
                className="relative group w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 bg-[length:200%_auto] hover:bg-[position:right_center] text-slate-950 font-black text-base flex items-center justify-center gap-3 shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                <LogIn className="h-5 w-5 flex-shrink-0" />
                <span>Masuk Sekarang</span>
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </a>

              <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-emerald-400" />
                <span>Autentikasi Aman & Cepat via Auth0</span>
              </p>
            </div>
          )}
        </div>

        {/* Feature Highlights Pills */}
        <div className="mt-14 pt-8 border-t border-slate-800/80 w-full grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
          <div className="p-3.5 rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-sm">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-2">
              <Calendar className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-bold text-white">Kalender Cuan</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Heatmap P&L trading harian</p>
          </div>

          <div className="p-3.5 rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-sm">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mb-2">
              <Zap className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-bold text-white">MT5 Import & Sync</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Import riwayat otomatis</p>
          </div>

          <div className="p-3.5 rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-sm">
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-2">
              <BarChart3 className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-bold text-white">Win Rate Analytics</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Evaluasi psikologi & strategi</p>
          </div>

          <div className="p-3.5 rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-sm">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 mb-2">
              <Globe className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-bold text-white">Live News Feed</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Jadwal Forex Factory live</p>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 5. MINIMALIST FOOTER */}
      {/* ========================================================================= */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-900">
        <p>© 2026 Jurnal Cuan. Disiplin adalah kunci cuan konsisten.</p>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            Sistem Aktif
          </span>
          <span>v1.0.0</span>
        </div>
      </footer>
    </div>
  );
}
