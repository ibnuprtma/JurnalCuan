"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-8 w-8 rounded-xl bg-slate-800/40 animate-pulse" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="h-8 w-8 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
      title={isDark ? "Beralih ke Mode Terang (Light)" : "Beralih ke Mode Gelap (Dark)"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-indigo-500 transition-transform duration-200 hover:-rotate-12" />
      )}
      <span className="sr-only">Toggle Theme</span>
    </Button>
  );
}
