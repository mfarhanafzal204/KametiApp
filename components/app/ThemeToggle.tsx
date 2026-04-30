"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — only render after mount
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative w-9 h-9 rounded-xl flex items-center justify-center
        bg-gray-100 hover:bg-gray-200
        dark:bg-gray-800 dark:hover:bg-gray-700
        border border-gray-200 dark:border-gray-700
        transition-all duration-200 active:scale-95 overflow-hidden"
    >
      {/* Sun icon — visible in dark mode (click to go light) */}
      <Sun
        className={`absolute w-4 h-4 text-amber-500 transition-all duration-300 ${
          isDark
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 rotate-90 scale-50"
        }`}
      />
      {/* Moon icon — visible in light mode (click to go dark) */}
      <Moon
        className={`absolute w-4 h-4 text-slate-600 dark:text-slate-300 transition-all duration-300 ${
          isDark
            ? "opacity-0 -rotate-90 scale-50"
            : "opacity-100 rotate-0 scale-100"
        }`}
      />
    </button>
  );
}
