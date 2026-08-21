"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  ListOrdered,
  LineChart,
  Newspaper,
  Calculator,
  Share2,
  Settings,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Kalender Cuan",
    href: "/calendar",
    icon: Calendar,
    badge: "Utama",
  },
  {
    label: "Catatan Trade",
    href: "/trades",
    icon: ListOrdered,
  },
  {
    label: "Statistik & Analytics",
    href: "/analytics",
    icon: LineChart,
  },
  {
    label: "Berita Ekonomi",
    href: "/news",
    icon: Newspaper,
  },
  {
    label: "Kalkulator Lot",
    href: "/calculator",
    icon: Calculator,
  },
  {
    label: "Live Share Portfolio",
    href: "/share-settings",
    icon: Share2,
  },
  {
    label: "Pengaturan Akun",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-slate-800/80 bg-[#080c16]/95 backdrop-blur-xl h-screen sticky top-0 z-40 p-4 justify-between">
      {/* Brand Header */}
      <div className="space-y-6">
        <Link href="/dashboard" className="flex items-center gap-3 px-2 pt-2 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
            <TrendingUp className="h-5 w-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">JURNAL</span>
              <span className="font-extrabold text-base tracking-tight text-emerald-400">CUAN</span>
            </div>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Forex Journal Pro</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group relative",
                  isActive
                    ? "bg-slate-800/90 text-emerald-400 border border-emerald-500/30 shadow-md shadow-emerald-500/5 font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider",
                      isActive
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Pro Discipline Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/90 relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-200">Discipline First</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          &quot;Plan your trade, and trade your plan.&quot; Jaga Risk per trade max 1–2%.
        </p>
      </div>
    </aside>
  );
}
