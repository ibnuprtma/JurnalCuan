"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Calendar, ListOrdered, LineChart, Newspaper, Settings } from "lucide-react";

const MOBILE_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Kalender", href: "/calendar", icon: Calendar },
  { label: "Trades", href: "/trades", icon: ListOrdered },
  { label: "Analytics", href: "/analytics", icon: LineChart },
  { label: "Berita", href: "/news", icon: Newspaper },
  { label: "Pengaturan", href: "/settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080c16]/95 border-t border-slate-800/80 backdrop-blur-lg px-2 py-1.5 flex items-center justify-around">
      {MOBILE_ITEMS.map((item) => {
        const isActive =
          pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200",
              isActive ? "text-emerald-400 font-bold" : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Icon className={cn("h-5 w-5 mb-0.5", isActive ? "text-emerald-400" : "text-slate-400")} />
            <span className="text-[10px]">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
