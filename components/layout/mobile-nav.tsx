"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Calendar, ListOrdered, Settings } from "lucide-react";

const MOBILE_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Kalender", href: "/calendar", icon: Calendar },
  { label: "Transaksi", href: "/trades", icon: ListOrdered },
  { label: "Pengaturan", href: "/settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#080c16]/95 border-t border-slate-200 dark:border-slate-800/80 backdrop-blur-xl px-3 pt-3 pb-8 sm:pb-5 flex items-center justify-around shadow-2xl transition-colors duration-200">
      {MOBILE_ITEMS.map((item) => {
        const isActive =
          pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 group relative min-w-[68px]",
              isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <div
              className={cn(
                "h-10 w-10 rounded-2xl flex items-center justify-center transition-all duration-200",
                isActive
                  ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-500/20 dark:border-emerald-500/30"
                  : "text-slate-400 group-hover:bg-slate-100 dark:group-hover:bg-slate-800/50 group-hover:text-slate-700 dark:group-hover:text-slate-200"
              )}
            >
              <Icon className={cn("h-6 w-6", isActive ? "stroke-[2.3]" : "stroke-[1.8]")} />
            </div>
            <span
              className={cn(
                "text-[11px] mt-1 tracking-tight transition-colors",
                isActive ? "text-emerald-600 dark:text-emerald-400 font-extrabold" : "text-slate-500 dark:text-slate-400 font-medium"
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
